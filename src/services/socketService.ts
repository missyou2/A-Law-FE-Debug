import { Client } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// ============================================
// 타입 정의 (WebSocket 응답)
// ============================================

/** 계약 당사자 정보 */
export interface ContractParty {
  name: string;
  resident_id: string;
  address: string;
  phone: string;
}

/** 특약 사항 */
export interface SpecialTerm {
  index: number;
  content: string;
}

/** 계약 데이터 (summary_complete) */
export interface ContractData {
  contract_type: string;
  lessor: ContractParty;
  lessee: ContractParty;
  terms: Record<string, unknown>;
  special_terms: SpecialTerm[];
}

/** 독소 조항 */
export interface ToxicTerm {
  index: number;
  content: string;
  toxic_level: number;       // 0: 안전, 1: 주의, 2: 위험
  toxic_category: string;    // 위험 분류 (toxic_level 0이면 빈 문자열)
  toxic_reason: string;      // RAG 기반 위험 사유 (toxic_level 0이면 빈 문자열)
}

/** 위험 분석 (risk_complete) */
export interface RiskAnalysis {
  toxic_terms: ToxicTerm[];
  risk_score: number;
}

/** 요약 완료 메시지 */
export interface SummaryCompleteMessage {
  status: 'summary_complete';
  task_id: string;
  contract_data: ContractData;
  completed_at: string;
}

/** 위험 분석 완료 메시지 */
export interface RiskCompleteMessage {
  status: 'risk_complete';
  task_id: string;
  risk_analysis: RiskAnalysis;
}

/** 모든 분석 메시지의 유니온 타입 */
export type AnalysisMessage = SummaryCompleteMessage | RiskCompleteMessage;

/** 콜백 핸들러 */
export interface AnalysisCallbacks {
  onSummaryComplete?: (data: SummaryCompleteMessage) => void;
  onRiskComplete?: (data: RiskCompleteMessage) => void;
  onError?: (error: unknown) => void;
}

// ============================================
// WebSocket 서비스
// ============================================

const WS_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'; // https://api.a-law.site로 교체 필요
const SOCKJS_ENDPOINT = `${WS_BASE_URL}/ws`;

/**
 * 분석 결과 WebSocket 구독
 * SockJS/STOMP를 통해 /topic/analysis/{taskId} 를 구독하고,
 * status에 따라 적절한 콜백을 실행합니다.
 *
 * @param taskId - OCR 업로드 후 받은 task_id
 * @param callbacks - 상태별 콜백 핸들러
 * @returns cleanup 함수 (구독 해제 및 연결 종료)
 */
export const subscribeAnalysis = (
  taskId: string,
  callbacks: AnalysisCallbacks,
): (() => void) => {
  const client = new Client({
    webSocketFactory: () => new SockJS(SOCKJS_ENDPOINT),
    reconnectDelay: 5000,
    onConnect: () => {
      client.subscribe(`/topic/analysis/${taskId}`, (message: IMessage) => {
        try {
          const data: AnalysisMessage = JSON.parse(message.body);

          switch (data.status) {
            case 'summary_complete':
              callbacks.onSummaryComplete?.(data);
              break;
            case 'risk_complete':
              callbacks.onRiskComplete?.(data);
              break;
          }
        } catch (error) {
          callbacks.onError?.(error);
        }
      });
    },
    onStompError: (frame) => {
      callbacks.onError?.(new Error(frame.headers['message'] || 'STOMP 연결 오류'));
    },
  });

  client.activate();

  return () => {
    client.deactivate();
  };
};
