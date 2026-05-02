import axios from 'axios';
import { getKakaoAccessToken } from '../services/kakaoAuth.js';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.a-law.site/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getKakaoAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Voice API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  },
);

// ============================================
// 타입 정의
// ============================================

export type VoiceRecordStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface VoiceRecordUploadResponse {
  voiceRecordId: number;
  contractId: number | null;
  title: string | null;
  jobId: string;
  fileUrl: string;
  status: VoiceRecordStatus;
  createdAt: string;
}

export interface VoiceRecordListItem {
  voiceRecordId: number;
  contractId: number | null;
  contractTitle: string | null;
  duration: number;
  createdAt: string;
}

export interface FactCheckItem {
  claim: string;
  contractContent: string;
  isMatch: boolean;
  severity: string;
}

export interface VoiceFactCheckResponse {
  voiceRecordId: number;
  transcript: string;
  factCheckItems: FactCheckItem[];
  status: VoiceRecordStatus;
  createdAt: string;
}

// ============================================
// API 함수들
// ============================================

/**
 * 녹음 파일 저장
 * - 계약서 연결: POST /api/v1/contracts/{contractId}/voice-records
 * - 단순 저장:   POST /api/v1/voice-records
 */
export const uploadVoiceRecord = async (
  audioBlob: Blob,
  duration: number,
  contractId?: number,
): Promise<VoiceRecordUploadResponse> => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.mp3');
  formData.append('duration', String(duration));

  const url = contractId !== undefined
    ? `/contracts/${contractId}/voice-records`
    : '/voice-records';

  const response = await apiClient.post<{ success: boolean; data: VoiceRecordUploadResponse }>(
    url,
    formData,
  );
  return response.data.data;
};

/**
 * 음성 분석 시작
 * POST /api/v1/voice-records/{voiceRecordId}/analyze
 * contractId가 있으면 계약서 내용과 팩트체크, 없으면 단순 리스크 분석
 */
export const startVoiceAnalysis = async (
  voiceRecordId: number,
  contractId?: number,
): Promise<void> => {
  const params = contractId !== undefined ? { contractId } : {};
  await apiClient.post(`/voice-records/${voiceRecordId}/analyze`, null, { params });
};

/**
 * 음성 분석 결과 조회
 * GET /api/v1/voice-records/{voiceRecordId}/fact-check
 */
export const getVoiceFactCheck = async (
  voiceRecordId: number,
  contractId?: number,
): Promise<VoiceFactCheckResponse> => {
  const params = contractId !== undefined ? { contractId } : {};
  const response = await apiClient.get<{ success: boolean; data: VoiceFactCheckResponse }>(
    `/voice-records/${voiceRecordId}/fact-check`,
    { params },
  );
  return response.data.data;
};

/**
 * 전체 녹음 목록 조회 (마이페이지 → 녹음목록)
 * GET /api/v1/voice-records
 */
export const getVoiceRecords = async (): Promise<VoiceRecordListItem[]> => {
  const response = await apiClient.get<{ success: boolean; data: VoiceRecordListItem[] }>(
    '/voice-records',
  );
  return response.data.data;
};

/**
 * 특정 계약서의 녹음 목록 조회
 * GET /api/v1/contracts/{id}/voice-record
 */
export const getVoiceRecordsByContract = async (
  contractId: number,
): Promise<VoiceRecordListItem[]> => {
  const response = await apiClient.get<{ success: boolean; data: VoiceRecordListItem[] }>(
    `/contracts/${contractId}/voice-record`,
  );
  return response.data.data;
};

/**
 * 녹음 파일 삭제
 * DELETE /api/v1/voice-records/{id}
 */
export const deleteVoiceRecord = async (voiceRecordId: number): Promise<void> => {
  await apiClient.delete(`/voice-records/${voiceRecordId}`);
};
