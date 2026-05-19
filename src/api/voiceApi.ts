import axios from 'axios';
import { getKakaoAccessToken } from '../services/kakaoAuth.js';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

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

export type VoiceRecordStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface VoiceRecordResponse {
  voiceRecordId: number;
  contractId: number | null;
  title: string | null;
  jobId: string;
  fileUrl: string;
  status: VoiceRecordStatus;
  transcript: string | null;
  createdAt: string;
}

// 업로드 응답과 목록 조회 응답이 동일한 구조
export type VoiceRecordUploadResponse = VoiceRecordResponse;
export type VoiceRecordListItem = VoiceRecordResponse;

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
 * POST /api/v1/voice-records
 * - contractId 있으면 계약서 연동, 없으면 voice-only
 */
export const uploadVoiceRecord = async (
  audioBlob: Blob,
  contractId?: number,
  title?: string,
): Promise<VoiceRecordUploadResponse> => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.mp3');

  const params: Record<string, string | number> = {};
  if (contractId !== undefined) params.contractId = contractId;
  if (title) params.title = title;

  const response = await apiClient.post<{ success: boolean; data: VoiceRecordUploadResponse }>(
    '/voice-records',
    formData,
    { params },
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
 * 음성 STT 변환
 * POST /api/v1/voice-records/{voiceRecordId}/transcribe
 */
export const transcribeVoiceRecord = async (
  voiceRecordId: number,
): Promise<{ voiceRecordId: number; transcript: string }> => {
  const response = await apiClient.post<{ success: boolean; data: { voiceRecordId: number; transcript: string } }>(
    `/voice-records/${voiceRecordId}/transcribe`,
  );
  return response.data.data;
};

/**
 * 음성 분석 결과 조회
 * GET /api/v1/voice-records/{voiceRecordId}/fact-check
 */
export const getVoiceAnalysisResult = async (
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
 * 음성 분석 SSE 구독
 * GET /api/v1/voice-records/analysis/{jobId}/stream
 *
 * 이벤트:
 *   analysis_complete - 분석 완료 → 자동 종료
 *   error             - 실패 → 자동 종료
 *
 * @returns EventSource — 호출측에서 .close()로 구독 종료 가능
 */
export interface VoiceAnalysisSSECallbacks {
  onComplete: (data: VoiceFactCheckResponse) => void;
  onError: (error: Event) => void;
}

export const subscribeVoiceAnalysisSSE = (
  jobId: string,
  callbacks: VoiceAnalysisSSECallbacks,
): EventSource => {
  const token = getKakaoAccessToken();
  const url = `${BASE_URL}/voice-records/analysis/${encodeURIComponent(jobId)}/stream${token ? `?token=${token}` : ''}`;
  const eventSource = new EventSource(url, { withCredentials: true });

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
): Promise<VoiceRecordListItem> => {
  const response = await apiClient.get<{ success: boolean; data: VoiceRecordListItem }>(
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
