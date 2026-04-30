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

export interface VoiceRecordUploadResponse {
  voiceRecordId: number;
  contractId: number | null;
  duration: number;
  createdAt: string;
}

export interface VoiceRecordListItem {
  voiceRecordId: number;
  contractId: number | null;
  contractTitle: string | null;
  duration: number;
  createdAt: string;
}

// ============================================
// API 함수들
// ============================================

/**
 * 녹음 파일 생성 (기존 계약서에 연결)
 * POST /api/v1/contracts/{id}/voice-records
 */
export const uploadVoiceRecordWithContract = async (
  contractId: number,
  audioBlob: Blob,
  duration: number,
): Promise<VoiceRecordUploadResponse> => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.mp3');
  formData.append('duration', String(duration));

  const response = await apiClient.post<{ success: boolean; data: VoiceRecordUploadResponse }>(
    `/contracts/${contractId}/voice-records`,
    formData,
  );
  return response.data.data;
};

/**
 * 녹음 파일 생성 (계약서 연결 없음)
 * POST /api/v1/voice-records
 */
export const uploadVoiceRecord = async (
  audioBlob: Blob,
  duration: number,
): Promise<VoiceRecordUploadResponse> => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.mp3');
  formData.append('duration', String(duration));

  const response = await apiClient.post<{ success: boolean; data: VoiceRecordUploadResponse }>(
    '/voice-records',
    formData,
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
