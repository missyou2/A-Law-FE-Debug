import { getKakaoAccessToken } from '../services/kakaoAuth.js';

// Chat endpoint lives at /api/chat (no /v1 prefix), so derive the origin from the contract base URL
const _contractBase = import.meta.env.VITE_API_BASE_URL || 'https://api.a-law.site/api/v1';
const CHAT_BASE_URL = _contractBase.replace(/\/api\/v1$/, '/api');

// ============================================
// 타입 정의
// ============================================

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSSECallbacks {
  /** 토큰(청크)이 도착할 때마다 호출 */
  onChunk: (chunk: string) => void;
  /** 스트림 완료 시 호출 */
  onDone: () => void;
  /** 에러 발생 시 호출 */
  onError: (error: Error) => void;
}

// ============================================
// SSE 챗봇 API
// ============================================

/**
 * SSE 기반 챗봇 메시지 전송
 * POST /api/chat/{contractId}  (Accept: text/event-stream)
 *
 * 서버가 토큰 단위로 스트리밍 응답을 보내면,
 * onChunk 콜백으로 실시간 전달합니다.
 *
 * @returns AbortController — 호출측에서 abort()로 스트림을 중단할 수 있음
 */
export const sendChatMessageSSE = (
  contractId: string,
  message: string,
  history: ChatMessage[],
  callbacks: ChatSSECallbacks,
): AbortController => {
  const controller = new AbortController();

  const token = getKakaoAccessToken();

  fetch(`${CHAT_BASE_URL}/chat/${contractId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify({ message, history }),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Chat API 오류: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('ReadableStream을 사용할 수 없습니다.');
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });

        // SSE 형식 파싱: "data: ..." 라인 단위 처리
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              callbacks.onDone();
              return;
            }

            callbacks.onChunk(data);
          }
        }
      }

      callbacks.onDone();
    })
    .catch((error) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      callbacks.onError(error);
    });

  return controller;
};
