// ============================================
// 계약서 API 타입 정의
// 팀원의 API 명세서 기반 (snake_case)
// ============================================

/**
 * 1-a. 계약서 이미지 업로드 → OCR 결과 응답
 * POST /api/v1/contracts
 * 동기 응답: OCR 텍스트 + task_id (이후 비동기 분석은 WebSocket으로 수신)
 */
export interface ContractOCRResponse {
  status: "ocr_complete" | "ocr_failed";
  task_id: string;
  user_id: number;
  contract_id: number;
  ocr_data: {
    full_text: string;
  };
  message: string;
}

/**
 * 1-b. 계약서 업로드 및 분석 요청 (파일 업로드용)
 * POST /api/v1/contracts
 * RabbitMQ 비동기 처리: 파일 업로드 → 백엔드 → RabbitMQ → AI 워커
 */
export interface ContractUploadResponse {
  job_id: string;
  contract_id: number;
  status: "queued" | "processing";
  created_at: string; // ISO 8601 date string
}

/**
 * 2. 분석 상태 조회 (폴링용)
 * GET /api/v1/contracts/{id}/analyses
 */
export interface AnalysisStatusResponse {
  contract_id: number;
  job_id: string;
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
  progress?: number; // 0-100 (선택적)
  updated_at: string; // ISO 8601 date string
}

/**
 * 3. AI 분석 결과 조회
 * GET /api/v1/contracts/{id}/analyses
 * 분석 완료 후 (status === "SUCCESS") 호출
 */
export interface ContractAnalysisResult {
  contract_id: number;
  job_id: string;
  status: "SUCCESS";
  analysis_result: {
    summary?: string;
    risk_score?: number;
    clauses?: Array<{
      clause_no: string;
      content: string;
      risk_level?: string;
    }>;
    metadata?: Record<string, any>;
  };
  completed_at: string; // ISO 8601 date string
}

/**
 * 4. 계약서 요약
 * POST /api/v1/contracts/{id}/summaries
 */
export interface ContractSummaryResponse {
  contract_id: number;
  summary_id: number;
  summary_content: string;
  extracted_keywords: string[];
  created_at: string; // ISO 8601 date string
}

/**
 * 5. 쉬운 말로 설명
 * POST /api/v1/contracts/{id}/easy-explanation
 */
export interface EasyExplanationRequest {
  original_sentence: string;
  selection_range?: {
    start: number;
    end: number;
  };
}

export interface LegalTermGuide {
  term: string;
  meaning: string;
}

export interface EasyExplanationResponse {
  explanation_id: string;
  contract_id: number;
  original_text: string;
  easy_translation: string;
  legal_term_guide: LegalTermGuide[];
}

/**
 * 6. OCR 결과 조회
 * GET /api/v1/contracts/{id}/image
 */
export interface OCRResultResponse {
  contract_id: number;
  status: "pending" | "completed" | "failed";
  transcription_result: {
    raw_text: string;
    confidence_score: number;
    page_count: number;
  };
  updated_at: string; // ISO 8601 date string
}

/**
 * 7. 이미지/PDF 내보내기
 * POST /api/v1/contracts/{id}/text
 */
export interface ExportImageRequest {
  target_resource: "analysis_report" | "summary" | "risk";
  format: "png" | "jpg" | "pdf";
  style_options?: {
    theme?: "dark" | "light";
    include_watermark?: boolean;
  };
}

export interface ExportImageResponse {
  export_id: string;
  contract_id: number;
  target: string;
  file_url: string;
  format: string;
  expires_at: string; // ISO 8601 date string
}

/**
 * 8. PDF/이미지 → 텍스트 변환 (업로드)
 * POST /api/v1/contracts/{id}/text
 * 참고: 응답 타입은 현재 임시 정의 (백엔드 명세 확인 필요)
 */
export interface FileToTextResponse {
  textContent: string;
}

/**
 * 9. 위험 요소 분석
 * GET /api/v1/contracts/{id}/risks
 */
export type RiskLevel = "HIGH" | "MEDIUM" | "LOW";
export type ContractRiskLevel = "DANGER" | "CAUTION" | "SAFE";

export interface RiskItem {
  clause_no: string;
  title: string;
  description: string;
  severity: RiskLevel;
  sources: string; // 출처 [근거 문장]
  alternative_text: string;
}

export interface ContractRiskResponse {
  contract_id: number;
  risk_analysis_id: number;
  total_risk_score: number;
  risk_level: ContractRiskLevel;
  risk_items: RiskItem[];
  analyzed_at: string; // ISO 8601 date string
}

/**
 * 10. 챗봇 질문하기
 * POST /api/chat/{contractId}
 */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

export interface ChatResponse {
  response: string;
  conversationId?: string;
}

/**
 * 11. 챗봇 대화 내역 조회
 * GET /api/chat/{contractId}
 */
export interface ChatHistory {
  messages: ChatMessage[];
  conversationId?: string;
}
