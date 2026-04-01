import React, { createContext, useContext, useRef, useState, useEffect } from 'react';

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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioBlobRef = useRef<Blob | null>(null);
  const timerRef = useRef<number | null>(null);
  const recordingSecondsRef = useRef(0);

  // 앱 진입 시 마이크 권한 미리 획득
  useEffect(() => {
    const requestMicPermission = async () => {
      try {
        if (navigator.permissions) {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          if (result.state === 'granted') { setMicPermission('granted'); return; }
          if (result.state === 'denied') { setMicPermission('denied'); return; }
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
        setMicPermission('granted');
      } catch {
        setMicPermission('denied');
      }
    };
    requestMicPermission();

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
    if (micPermission === 'denied') {
      alert("마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해 주세요.");
      return;
    }
    try {
      micStreamRef.current?.getTracks().forEach(t => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
    } catch (err) {
      console.error("녹음 시작 실패:", err);
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

  const handleContractSelect = (contractId: number) => {
    // TODO: API 연동 — 녹음 파일(audioBlobRef.current)을 contractId와 함께 서버에 전송
    console.log("연결할 계약서 ID:", contractId, "녹음 파일:", audioBlobRef.current);
    setSavedContractId(contractId);
    setShowContractModal(false);
    setIsRecording(false);
    audioBlobRef.current = null;
  };

  const handleContractSkip = () => {
    // TODO: API 연동 — 녹음 파일만 단독으로 서버에 전송 (계약서 연결 없음)
    console.log("계약서 연결 없이 저장:", audioBlobRef.current);
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
