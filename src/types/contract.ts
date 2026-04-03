// ============================================
// 계약서 API 타입 정의
// api.txt 명세서 기반 (snake_case)
// ============================================

/**
 * OCR 단어 단위 바운딩박스 (이미지 오버레이용)
 * x, y, width, height 는 이미지 기준 % 단위
 */
export interface OcrWord {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 1번. 계약서 이미지 업로드 → OCR 결과 응답
 * POST /api/v1/contracts
 */
export interface ContractOCRResponse {
  status: 'ocr_complete' | 'ocr_failed' | 'error' | 'fail';
  task_id?: string;
  user_id?: number;
  contract_id?: number;
  s3_key?: string;
  ocr_data: { full_text: string; words?: OcrWord[] } | null;
  message?: string;
  error_code?: string;
}

/**
 * 2번. 텍스트 → 이미지 전환
 * POST /api/v1/contracts/{id}/image
 */
export interface OCRResultResponse {
  contract_id: number;
  status: 'pending' | 'completed' | 'failed';
  transcription_result: {
    raw_text: string;
    confidence_score: number;
    page_count: number;
  };
  updated_at: string;
}

/**
 * 3번. 이미지 → 텍스트 전환 (내보내기)
 * POST /api/v1/contracts/{id}/text
 */
export interface ExportImageRequest {
  target_resource: 'analysis_report' | 'summary' | 'risk';
  format: 'png' | 'jpg' | 'pdf';
  style_options?: {
    theme?: 'dark' | 'light';
    include_watermark?: boolean;
  };
}

export interface ExportImageResponse {
  export_id: string;
  contract_id: number;
  target: string;
  file_url: string;
  format: string;
  expires_at: string;
}

/**
 * 4번. 계약서 분석 SSE 이벤트 타입
 * GET /api/analysis/subscribe?s3Key={s3Key}
 *
 * 이벤트 종류:
 *   summary_complete  - 요약 분석 완료
 *   risk_complete     - 리스크 분석 완료
 *   analysis_complete - 전체 분석 완료 (구독 종료 시그널)
 *   analysis_failed   - 분석 실패
 */
export interface AnalysisSummaryEvent {
  status: 'summary_complete';
  task_id: string;
  contract_data: {
    contract_type: string;
    lessor: {
      name: string;
      resident_id: string;
      address: string;
      phone: string;
    };
    lessee: {
      name: string;
      resident_id: string;
      address: string;
      phone: string;
    };
    terms: Record<string, unknown>;
    special_terms: Array<{
      index: number;
      content: string;
    }>;
  };
  completed_at: string;
}

export interface AnalysisRiskEvent {
  status: 'risk_complete';
  task_id: string;
  risk_analysis: {
    toxic_terms: Array<{
      index: number;
      content: string;
      toxic_level: 0 | 1 | 2; // 0=안전(하), 1=주의(중), 2=경고(상)
      toxic_category: string;
      toxic_reason: string;
    }>;
    risk_score: number;
  };
}

export interface AnalysisFailedEvent {
  status: 'summary_failed' | 'risk_failed';
  task_id: string;
  error_code: string;
  message: string;
}

export interface AnalysisSSECallbacks {
  onSummaryComplete: (data: AnalysisSummaryEvent) => void;
  onRiskComplete: (data: AnalysisRiskEvent) => void;
  onComplete: () => void;
  onSummaryFailed: (data: AnalysisFailedEvent) => void;
  onRiskFailed: (data: AnalysisFailedEvent) => void;
  onError: (error: Event) => void;
}

/**
 * 계약서 목록 조회
 * GET /api/v1/contracts
 */
export interface ContractListItem {
  contractId: number;
  title: string;
  bookmark: boolean;
  contractType: string;
  status: string;
  createdAt: string; // ISO 8601 (e.g. "2026-03-09T07:09:05.386Z")
}

/**
 * OCR 오버레이 — 선택 문장 쉬운 말로 설명
 * POST /api/v1/contracts/easy-explanation
 */
export interface OcrEasyExplanationRequest {
  contractId: number;
  sentence: string;
}

export interface OcrEasyExplanationResponse {
  sentence: string;
  easy_explanation: string;
  examples: string[];
}

/**
 * 5번. 특정 문장 쉬운 말로 설명
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
