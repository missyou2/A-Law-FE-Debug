import axios from 'axios';
import { getKakaoAccessToken } from '../services/kakaoAuth.js';
import type {
  ContractOCRResponse,
  OCRResultResponse,
  ExportImageRequest,
  ExportImageResponse,
  EasyExplanationRequest,
  EasyExplanationResponse,
  OcrEasyExplanationResponse,
  AnalysisSSECallbacks,
  ContractListItem,
  OcrWord,
} from '../types/contract.js';

// Re-export types for external use
export type {
  ContractOCRResponse,
  OCRResultResponse,
  ExportImageRequest,
  ExportImageResponse,
  EasyExplanationRequest,
  EasyExplanationResponse,
  OcrEasyExplanationResponse,
  AnalysisSSECallbacks,
  ContractListItem,
};

// API Base URL - 환경변수로 관리하는 것을 권장
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';


// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 자동 전송
});

// 요청 인터셉터 - 쿠키에서 토큰을 가져와 Authorization 헤더에 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = getKakaoAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('📤 API 요청에 토큰 추가:', token.substring(0, 10) + '...');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 핸들링
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ============================================
// 유틸리티
// ============================================

/** data URL (canvas.toDataURL) → Blob 변환 */
const dataURLtoBlob = (dataURL: string): Blob => {
  const parts = dataURL.split(',');
  const mime = parts[0]?.match(/:(.*?);/)?.[1] || 'image/png';
  const binary = atob(parts[1] ?? '');
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
};

/** data URL → 최대 2000px / JPEG 0.85 압축 data URL */
const compressDataURL = (dataURL: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const MAX_PX = 2000;
    const QUALITY = 0.85;
    const img = new Image();
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      const scale = Math.min(1, MAX_PX / Math.max(w, h));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', QUALITY));
    };
    img.onerror = reject;
    img.src = dataURL;
  });

// ============================================
// API 함수들
// ============================================

/**
 * 계약서 목록 조회
 * GET /api/v1/contracts
 */
export const getContractList = async (): Promise<ContractListItem[]> => {
  const response = await apiClient.get<{ success: boolean; data: ContractListItem[] }>('/contracts');
  return response.data.data;
};

/**
 * 북마크 추가 (즐겨찾기)
 * PATCH /api/v1/contracts/{id}/bookmark
 */
export const addBookmark = async (contractId: number): Promise<void> => {
  await apiClient.patch(`/contracts/${contractId}/bookmark`);
};

/**
 * 북마크 삭제 (즐겨찾기 해제)
 * DELETE /api/v1/contracts/{id}/bookmark
 */
export const removeBookmark = async (contractId: number): Promise<void> => {
  await apiClient.delete(`/contracts/${contractId}/bookmark`);
};

/**
 * 1번. 카메라 촬영 이미지 → OCR 업로드
 * POST /api/v1/contracts  (multipart/form-data)
 * 동기 응답: OCR 결과 + s3_key (이후 비동기 분석은 SSE 수신)
 */
export const uploadContractImage = async (
  capturedImageData: string,
): Promise<ContractOCRResponse> => {
  const compressed = await compressDataURL(capturedImageData);
  const blob = dataURLtoBlob(compressed);
  const formData = new FormData();
  formData.append('file', blob, 'contract_capture.jpg');

  // 실제 응답 구조: { code, success, data: { contract_id, full_text, job_id, words, ... } }
  type OcrApiResponse = {
    success: boolean;
    data: {
      contract_id?: number;
      full_text?: string;
      job_id?: string;
      words?: OcrWord[];
      image_url?: string;
    } | null;
  };

  const response = await apiClient.post<OcrApiResponse>('/contracts/ocr', formData, {
    // FormData requires no Content-Type override — browser sets multipart boundary automatically
    transformRequest: (data: FormData, headers: Record<string, string>) => {
      delete headers['Content-Type'];
      return data;
    },
  });

  const raw: OcrApiResponse = response.data;
  const inner = raw.data;

  return {
    status: raw.success ? 'ocr_complete' : 'ocr_failed',
    ...(inner?.contract_id !== undefined && { contract_id: inner.contract_id }),
    ...(inner?.job_id && { jobId: inner.job_id }),
    ocr_data: inner?.full_text
      ? { full_text: inner.full_text, words: inner.words ?? [] }
      : null,
  };
};

/**
 * 2번. 텍스트 → 이미지 전환
 * POST /api/v1/contracts/{id}/image
 */
export const getOCRResult = async (
  contractId: string
): Promise<OCRResultResponse> => {
  const response = await apiClient.post(`/contracts/${contractId}/image`);
  return response.data;
};

/**
 * 3번. 이미지 → 텍스트 전환 (내보내기)
 * POST /api/v1/contracts/{id}/text
 */
export const exportToImage = async (
  contractId: string,
  request: ExportImageRequest
): Promise<ExportImageResponse> => {
  const response = await apiClient.post(`/contracts/${contractId}/text`, request);
  return response.data;
};

/**
 * 5번. 특정 문장 쉬운 말로 설명
 * POST /api/v1/contracts/{id}/easy-explanation
 */
export const generateEasyExplanation = async (
  contractId: string,
  originalSentence: string,
  selectionRange?: { start: number; end: number }
): Promise<EasyExplanationResponse> => {
  const requestBody: EasyExplanationRequest = {
    original_sentence: originalSentence,
    ...(selectionRange && { selection_range: selectionRange }),
  };

  const response = await apiClient.post(`/contracts/${contractId}/easy-explanation`, requestBody);
  return response.data;
};

/**
 * OCR 오버레이 — 선택 문장 쉬운 말로 설명
 * POST /api/v1/contracts/easy-explanation
 */
export const getOcrEasyExplanation = async (
  contractId: number,
  sentence: string,
): Promise<OcrEasyExplanationResponse> => {
  const response = await apiClient.post('/contracts/easy-explanation', { contractId, sentence });
  return response.data;
};

/**
 * 4번. 계약서 분석 SSE 구독
 * GET /api/v1/contracts/analysis/{jobId}/stream
 *
 * 이벤트 순서:
 *   connection        - 연결 확인
 *   summary_result    - 요약 정보
 *   analysis_result   - 리스크 분석
 *   analysis_complete - 완료 신호 → 자동으로 구독 종료
 *   error             - 실패 시 → 자동으로 구독 종료
 *
 * @returns EventSource — 호출측에서 .close()로 구독을 직접 종료할 수 있음
 */
export const subscribeAnalysisSSE = (
  jobId: string,
  callbacks: AnalysisSSECallbacks,
): EventSource => {
  const url = `${BASE_URL}/contracts/analysis/${encodeURIComponent(jobId)}/stream`;
  const eventSource = new EventSource(url, { withCredentials: true });

  eventSource.addEventListener('connection', () => {
    console.log('📡 SSE 연결 확인 (connection event)');
  });

  eventSource.addEventListener('summary_result', (e) => {
    const data = JSON.parse((e as MessageEvent).data);
    callbacks.onSummaryResult(data);
  });

  eventSource.addEventListener('analysis_result', (e) => {
    const data = JSON.parse((e as MessageEvent).data);
    callbacks.onAnalysisResult(data);
  });

  eventSource.addEventListener('analysis_complete', (e) => {
    const data = JSON.parse((e as MessageEvent).data);
    callbacks.onComplete(data);
    eventSource.close();
  });

  eventSource.onerror = (error) => {
    callbacks.onError(error);
    eventSource.close();
  };

  return eventSource;
};
