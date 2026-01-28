import axios from 'axios';
import { getKakaoAccessToken } from './kakaoAuth.js';
import type {
  ContractUploadResponse,
  AnalysisStatusResponse,
  ContractAnalysisResult,
  OCRResultResponse,
  ExportImageRequest,
  ExportImageResponse,
  ContractSummaryResponse,
  EasyExplanationRequest,
  EasyExplanationResponse,
  ContractRiskResponse,
  ChatMessage,
  ChatRequest,
  ChatResponse,
  ChatHistory,
} from '../types/contract.js';

// Re-export types for external use
export type {
  ContractUploadResponse,
  AnalysisStatusResponse,
  ContractAnalysisResult,
  OCRResultResponse,
  ExportImageRequest,
  ExportImageResponse,
  ContractSummaryResponse,
  EasyExplanationRequest,
  EasyExplanationResponse,
  ContractRiskResponse,
  ChatMessage,
  ChatRequest,
  ChatResponse,
  ChatHistory,
};

// API Base URL - 환경변수로 관리하는 것을 권장
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Axios 인스턴스 생성
const apiClient = axios.create({
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
// API 함수들
// ============================================

/**
 * 1. 계약서 업로드 및 분석 요청
 * POST /api/v1/contracts
 * RabbitMQ를 통한 비동기 처리
 */
export const uploadContract = async (file: File): Promise<ContractUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/contracts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * 2. 분석 상태 조회 (폴링용)
 * GET /api/v1/contracts/{id}/analyses
 */
export const getAnalysisStatus = async (
  contractId: string
): Promise<AnalysisStatusResponse> => {
  const response = await apiClient.get(`/contracts/${contractId}/analyses`);
  return response.data;
};

/**
 * 3. AI 분석 결과 조회
 * GET /api/v1/contracts/{id}/analyses
 * 분석 완료 후 (status === "SUCCESS") 호출
 */
export const getAnalysisResult = async (
  contractId: string
): Promise<ContractAnalysisResult> => {
  const response = await apiClient.get(`/contracts/${contractId}/analyses`);
  return response.data;
};

/**
 * 4. 계약서 간단 요약 생성
 * POST /api/v1/contracts/{id}/summaries
 */
export const generateSummary = async (
  contractId: string
): Promise<ContractSummaryResponse> => {
  const response = await apiClient.post(`/contracts/${contractId}/summaries`);
  return response.data;
};

/**
 * 5. 특정 문장 쉬운 말로 설명
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
 * 6. OCR 결과 조회
 * GET /api/v1/contracts/{id}/image
 */
export const getOCRResult = async (
  contractId: string
): Promise<OCRResultResponse> => {
  const response = await apiClient.get(`/contracts/${contractId}/image`);
  return response.data;
};

/**
 * 7. 이미지/PDF 내보내기
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
 * 8. PDF/이미지 → 텍스트 변환 (업로드)
 * POST /api/v1/contracts/{id}/text
 */
export const convertFileToText = async (
  contractId: string,
  uploadedFile: File
): Promise<{ textContent: string }> => {
  const formData = new FormData();
  formData.append('uploadedFile', uploadedFile);

  const response = await apiClient.post(`/contracts/${contractId}/text`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * 9. 위험 요소 분석
 * GET /api/v1/contracts/{id}/risks
 */
export const getRiskAnalysis = async (
  contractId: string
): Promise<ContractRiskResponse> => {
  const response = await apiClient.get(`/contracts/${contractId}/risks`);
  return response.data;
};

/**
 * 10. 챗봇 질문하기
 * POST /api/chat/{contractId}
 */
export const sendChatMessage = async (
  contractId: string,
  message: string,
  history?: ChatMessage[]
): Promise<ChatResponse> => {
  const requestBody: ChatRequest = {
    message,
    ...(history && { history }),
  };

  const response = await apiClient.post(`/chat/${contractId}`, requestBody);
  return response.data;
};

/**
 * 11. 챗봇 대화 내역 조회
 * GET /api/chat/{contractId}
 */
export const getChatHistory = async (
  contractId: string
): Promise<ChatHistory> => {
  const response = await apiClient.get(`/chat/${contractId}`);
  return response.data;
};

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 폴링 헬퍼 함수 - 분석 완료까지 대기
 * RabbitMQ 비동기 처리 완료를 폴링으로 확인
 */
export const waitForAnalysisComplete = async (
  contractId: string,
  maxAttempts: number = 30,
  interval: number = 2000,
  onProgress?: (progress: number) => void
): Promise<void> => {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await getAnalysisStatus(contractId);

    // 진행률 콜백 호출
    if (onProgress && result.progress !== undefined) {
      onProgress(result.progress);
    }

    // 성공 시 종료
    if (result.status === 'SUCCESS') {
      return;
    }

    // 실패 시 에러 throw
    if (result.status === 'FAILED') {
      throw new Error('계약서 분석에 실패했습니다.');
    }

    // 마지막 시도가 아니면 대기
    if (i < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  throw new Error('분석 시간이 초과되었습니다.');
};
