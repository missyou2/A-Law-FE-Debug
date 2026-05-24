import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import { uploadVoiceRecord, startVoiceAnalysis, subscribeVoiceAnalysisSSE } from '../api/voiceApi.js';
import type { VoiceFactCheckResponse } from '../api/voiceApi.js';
import { convertBlobToMp3 } from '../utils/audioConverter.js';

interface RecordingContextValue {
  isRecording: boolean;
  recordingSeconds: number;
  finalSeconds: number;
  micPermission: 'unknown' | 'granted' | 'denied';
  showSaveModal: boolean;
  showContractModal: boolean;
  audioBlobRef: React.MutableRefObject<Blob | null>;
  toggleRecording: () => void;
  handleSaveConfirm: () => void;
  handleSaveCancel: () => void;
  handleContractSelect: (contractId: number) => void;
  handleContractSkip: () => void;
  formatSeconds: (sec: number) => string;
  savedContractId: number | null;
  setSavedContractId: (id: number | null) => void;
  analyzingIds: number[];
  toast: string | null;
  clearToast: () => void;
}

const RecordingContext = createContext<RecordingContextValue | null>(null);

export const RecordingProvider = ({ children }: { children: React.ReactNode }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [micPermission, setMicPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [finalSeconds, setFinalSeconds] = useState(0);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [savedContractId, setSavedContractId] = useState<number | null>(null);
  const [analyzingIds, setAnalyzingIds] = useState<number[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const clearToast = () => setToast(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioBlobRef = useRef<Blob | null>(null);
  const timerRef = useRef<number | null>(null);
  const recordingSecondsRef = useRef(0);

  // 앱 진입 시 이미 허용된 권한 상태만 조회 (팝업 없음)
  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        if (navigator.permissions) {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          if (result.state === 'granted') { setMicPermission('granted'); return; }
          if (result.state === 'denied') { setMicPermission('denied'); return; }
        }
        // 'prompt' 상태이면 unknown 유지 — 실제 요청은 녹음 시작 시 수행
      } catch {
        // permissions API 미지원 환경 — unknown 유지
      }
    };
    checkMicPermission();

    return () => {
      micStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const formatSeconds = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const startRecording = async () => {
    try {
      micStreamRef.current?.getTracks().forEach(t => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission('granted');
      micStreamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioBlobRef.current = audioBlob;
        micStreamRef.current?.getTracks().forEach(t => t.stop());
        micStreamRef.current = null;
        setShowSaveModal(true);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingSecondsRef.current = 0;
      timerRef.current = window.setInterval(() => {
        recordingSecondsRef.current += 1;
        setRecordingSeconds(recordingSecondsRef.current);
      }, 1000);
      if (navigator.vibrate) navigator.vibrate(50);
    } catch (err: unknown) {
      const name = err instanceof Error ? err.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setMicPermission('denied');
        setToast('마이크 권한이 필요합니다. 브라우저 설정에서 허용해 주세요.');
      } else {
        console.error("녹음 시작 실패:", err);
      }
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === 'recording') {
      recorder.stop();
      setIsRecording(false);
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setFinalSeconds(recordingSecondsRef.current);
      setRecordingSeconds(0);
      recordingSecondsRef.current = 0;
    }
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const handleSaveConfirm = () => {
    setShowSaveModal(false);
    setShowContractModal(true);
  };

  const handleSaveCancel = () => {
    audioBlobRef.current = null;
    setShowSaveModal(false);
    setIsRecording(false);
  };

  const startAnalysisWithSSE = (jobId: string, voiceRecordId: number, contractId?: number) => {
    setAnalyzingIds(prev => [...prev, voiceRecordId]);

    startVoiceAnalysis(voiceRecordId, contractId).catch((err) =>
      console.error("분석 시작 실패:", err),
    );

    subscribeVoiceAnalysisSSE(jobId, {
      onComplete: (result: VoiceFactCheckResponse) => {
        console.log("✅ 음성 분석 완료:", result);
        setAnalyzingIds(prev => prev.filter(id => id !== voiceRecordId));
        setToast(contractId ? "팩트체크 분석이 완료되었습니다!" : "음성 분석이 완료되었습니다!");
      },
      onError: (err) => {
        console.error("음성 분석 SSE 오류:", err);
        setAnalyzingIds(prev => prev.filter(id => id !== voiceRecordId));
      },
    });
  };

  const handleContractSelect = async (contractId: number) => {
    const blob = audioBlobRef.current;
    if (blob) {
      try {
        const mp3Blob = await convertBlobToMp3(blob);
        const uploaded = await uploadVoiceRecord(mp3Blob, contractId);
        setSavedContractId(contractId);
        startAnalysisWithSSE(uploaded.jobId, uploaded.voiceRecordId, contractId);
      } catch (err) {
        console.error("녹음 업로드 실패:", err);
      }
    }
    setShowContractModal(false);
    setIsRecording(false);
    audioBlobRef.current = null;
  };

  const handleContractSkip = async () => {
    const blob = audioBlobRef.current;
    if (blob) {
      try {
        const mp3Blob = await convertBlobToMp3(blob);
        const uploaded = await uploadVoiceRecord(mp3Blob);
        setToast("녹음이 저장되었습니다. 분석을 시작합니다.");
        startAnalysisWithSSE(uploaded.jobId, uploaded.voiceRecordId);
      } catch (err) {
        console.error("녹음 업로드 실패:", err);
      }
    }
    setShowContractModal(false);
    setIsRecording(false);
    audioBlobRef.current = null;
  };

  return (
    <RecordingContext.Provider value={{
      isRecording, recordingSeconds, finalSeconds, micPermission,
      showSaveModal, showContractModal, audioBlobRef,
      toggleRecording, handleSaveConfirm, handleSaveCancel,
      handleContractSelect, handleContractSkip, formatSeconds,
      savedContractId, setSavedContractId,
      analyzingIds, toast, clearToast,
    }}>
      {children}
    </RecordingContext.Provider>
  );
};

export const useRecording = () => {
  const ctx = useContext(RecordingContext);
  if (!ctx) throw new Error('useRecording must be used within RecordingProvider');
  return ctx;
};
