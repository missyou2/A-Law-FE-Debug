import axios from 'axios';
import { getKakaoAccessToken } from '../services/kakaoAuth.js';
import type {
  ContractOCRResponse,
  ContractUploadResponse,
  OCRResultResponse,
  ExportImageRequest,
  ExportImageResponse,
  ContractSummaryResponse,
  EasyExplanationRequest,
  EasyExplanationResponse,
  ContractRiskResponse,
} from '../types/contract.js';

// Re-export types for external use
export type {
  ContractOCRResponse,
  ContractUploadResponse,
  OCRResultResponse,
  ExportImageRequest,
  ExportImageResponse,
  ContractSummaryResponse,
  EasyExplanationRequest,
  EasyExplanationResponse,
  ContractRiskResponse,
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

// ============================================
// Mock 설정 — 백엔드 연동 시 USE_MOCK = false 로 변경
// ============================================
const USE_MOCK = true;

const mockOCRResponse: ContractOCRResponse = {
  status: 'ocr_complete',
  task_id: 'JOB-20260213-001',
  user_id: 7,
  contract_id: 102,
  ocr_data: {
    full_text:
      '제 1조 (목적)\n임차인은 본 계약 체결과 동시에 임대인에게 보증금 50,000,000원을 지급하며...\n\n제 2조 (월 차임)\n임차인은 매월 1일에 월 차임 1,200,000원을 지급하여야 하며...',
  },
  message: '원문 추출이 완료되었습니다. 심층 분석 결과는 웹소켓으로 전송됩니다.',
};

// ============================================
// API 함수들
// ============================================

/**
 * 1-a. 카메라 촬영 이미지 → OCR 업로드
 * POST /api/v1/contracts  (multipart/form-data)
 * 동기 응답: OCR 결과 + task_id (이후 비동기 분석은 WebSocket 수신)
 */
export const uploadContractImage = async (
  capturedImageData: string,
): Promise<ContractOCRResponse> => {
  if (USE_MOCK) {
    // Mock: 2초 지연 후 가짜 응답 반환
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('[MOCK] uploadContractImage 호출됨');
    return mockOCRResponse;
  }

  const blob = dataURLtoBlob(capturedImageData);
  const formData = new FormData();
  formData.append('contract_image', blob, 'contract_capture.png');

  const response = await apiClient.post<ContractOCRResponse>('/contracts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

/**
 * 1-b. 계약서 파일 업로드 및 분석 요청
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
 * 2. 계약서 간단 요약 생성 (on-demand)
 * POST /api/v1/contracts/{id}/summaries
 */
export const generateSummary = async (
  contractId: string
): Promise<ContractSummaryResponse> => {
  const response = await apiClient.post(`/contracts/${contractId}/summaries`);
  return response.data;
};

/**
 * 3. 특정 문장 쉬운 말로 설명
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
 * 4. OCR 결과 조회
 * GET /api/v1/contracts/{id}/image
 */
export const getOCRResult = async (
  contractId: string
): Promise<OCRResultResponse> => {
  const response = await apiClient.get(`/contracts/${contractId}/image`);
  return response.data;
};

/**
 * 5. 이미지/PDF 내보내기
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
 * 6. PDF/이미지 → 텍스트 변환 (업로드)
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
 * 7. 위험 요소 분석
 * GET /api/v1/contracts/{id}/risks
 */
const mockRiskResponse: ContractRiskResponse = {
  contract_id: 102,
  risk_analysis_id: 1,
  total_risk_score: 75,
  risk_level: "DANGER",
  risk_items: [
    {
      clause_no: "제2조",
      title: "임차인에게 불리한 조항",
      description: "퇴실 시 청소비를 임차인에게 일방적으로 부담시키는 조항은 공정거래위원회의 불공정약관 기준에 해당할 수 있습니다.",
      severity: "HIGH",
      sources: "임차인은 퇴실시 청소비 20만원 있음.",
      alternative_text: "퇴실 시 청소비는 임대인과 임차인이 협의하여 결정한다.",
    },
    {
      clause_no: "제5조",
      title: "보증금 반환 지연 위험",
      description: "주택임대차보호법상 보증금은 임차인이 주택을 인도한 날에 반환하는 것이 원칙이며, 30일 유예는 임차인에게 불리할 수 있습니다.",
      severity: "MEDIUM",
      sources: "보증금은 퇴실 후 30일 이내 반환한다.",
      alternative_text: "보증금은 임차인이 주택을 인도한 날에 반환한다.",
    },
    {
      clause_no: "제7조",
      title: "생활 규칙",
      description: "애완동물 사육 금지 및 건물 내 금연 조항은 일반적인 생활 규칙으로 법적 위험이 낮습니다.",
      severity: "LOW",
      sources: "애완동물사육금지 및 건물내 금연",
      alternative_text: "",
    },
  ],
  analyzed_at: new Date().toISOString(),
};

export const getRiskAnalysis = async (
  contractId: string
): Promise<ContractRiskResponse> => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('[MOCK] getRiskAnalysis 호출됨, contractId:', contractId);
    return mockRiskResponse;
  }

  const response = await apiClient.get(`/contracts/${contractId}/risks`);
  return response.data;
};

