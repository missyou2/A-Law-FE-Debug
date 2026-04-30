import { getKakaoAccessToken } from '../services/kakaoAuth.js';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://api.a-law.site/api/v1';

// ============================================
// 타입 정의
// ============================================

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** POST /api/v1/chat 요청 바디 */
export interface ChatRequest {
  message: string;
  session_id?: string | null;
}

/** POST /api/v1/chat 응답 data */
export interface ChatResponse {
  answer: string;
  session_id: string;
  sources: string[];
  turn_count: number;
}

// ============================================
// 챗봇 API
// ============================================

/**
 * 백엔드 기준 챗봇 메시지 전송
 * POST /api/v1/chat
 *
 * Request:
 * {
 *   message: string,
 *   session_id: string | null
 * }
 *
 * Response:
 * {
 *   data: {
 *     answer: string,
 *     session_id: string,
 *     sources: string[],
 *     turn_count: number
 *   }
 * }
 */
export const sendChatMessage = async (
  message: string,
  sessionId?: string | null,
): Promise<ChatResponse> => {
  const token = getKakaoAccessToken();

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      message,
      session_id: sessionId ?? null,
    } satisfies ChatRequest),
  });

  if (!response.ok) {
    throw new Error(`Chat API 오류: ${response.status}`);
  }

  const result = await response.json();

  return result.data;
};