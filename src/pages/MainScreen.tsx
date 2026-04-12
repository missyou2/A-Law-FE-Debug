import React, { type FC, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import './MainScreen.css';

// Icon (imported)
import ScanIcon from '../assets/icons/scan-icon.png';
import MicIcon from '../assets/icons/mic.png';
import ChatbotIcon from '../assets/icons/chatbot.png';

// Icon (react icon)
import { FaChevronRight } from 'react-icons/fa';

// Chatbot
import ChatbotPanel from './contract/ChatbotPanel.js';

import { getContractList } from '../api/contractApi.js';
import type { ContractListItem } from '../api/contractApi.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const MOCK_CONTRACTS: ContractListItem[] = [
  { contractId: 1, title: '원룸 전세 계약서', bookmark: true,  contractType: '임대차계약서', status: '분석 완료', createdAt: '2024-03-15T10:00:00.000Z' },
  { contractId: 2, title: '투룸 월세 계약서', bookmark: false, contractType: '임대차계약서', status: '분석 완료', createdAt: '2024-05-20T14:30:00.000Z' },
  { contractId: 3, title: '오피스텔 임대차 계약서', bookmark: false, contractType: '임대차계약서', status: '분석 완료', createdAt: '2024-07-10T09:15:00.000Z' },
];

const formatDate = (isoString: string): string => {
  const d = new Date(isoString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

interface RecentContractItemProps {
    title: string;
    date: string;
    isImportant: boolean;
    contractType: string;
}

const RecentContractItem: FC<RecentContractItemProps> = ({ title, date, isImportant, contractType }) => {
  return (
    <div className="ms-contract-item">
      <div className="ms-contract-details">
        <div className="ms-contract-title">
          {isImportant && <span className="ms-star">★</span>}
          {title}
        </div>
        <div className="ms-contract-meta">
          <span className="ms-contract-type-badge">{contractType}</span>
        </div>
        <div className="ms-contract-date">{date}</div>
      </div>
      <div className="ms-view-button">
        <FaChevronRight size={12} />
      </div>
    </div>
  );
};

interface MainScreenProps {
    onScanClick: () => void;
    onChatbotOpen?: () => void;
    onChatbotClose?: () => void;
}

const MainScreen: FC<MainScreenProps> = ({ onScanClick, onChatbotOpen, onChatbotClose }) => {
  const navigate = useNavigate();

  const [contracts, setContracts] = useState<ContractListItem[]>([]);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        if (USE_MOCK) {
          setContracts(MOCK_CONTRACTS);
        } else {
          const data = await getContractList();
          setContracts(data);
        }
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      }
    };
    fetchContracts();
  }, []);

  // 녹음 관련 상태 및 Ref
  const [isRecording, setIsRecording] = useState(false);
  const [micPermission, setMicPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [finalSeconds, setFinalSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);
  const recordingSecondsRef = useRef(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioBlobRef = useRef<Blob | null>(null);

  // 모달 상태
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [savedContractId, setSavedContractId] = useState<number | null>(null);

  // 챗봇 패널 표시 상태
  const [showChatbot, setShowChatbot] = useState(false);
  const showChatbotRef = useRef(false);
  useEffect(() => { showChatbotRef.current = showChatbot; }, [showChatbot]);
  useEffect(() => {
    return () => {
      if (showChatbotRef.current) onChatbotClose?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 앱 진입 시 마이크 권한 미리 획득
  useEffect(() => {
    const requestMicPermission = async () => {
      try {
        if (navigator.permissions) {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          if (result.state === 'granted') {
            setMicPermission('granted');
            return;
          }
          if (result.state === 'denied') {
            setMicPermission('denied');
            return;
          }
        }
        // 아직 권한을 묻지 않은 상태면 미리 요청
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        setMicPermission('granted');
      } catch {
        setMicPermission('denied');
      }
    };
    requestMicPermission();
  }, []);

  // 녹음 시작 함수
  const startRecording = async () => {
    if (micPermission === 'denied') {
      alert("마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해 주세요.");
      return;
    }
    try {
      // 이전 스트림 정리 후 매번 새로 획득
      micStreamRef.current?.getTracks().forEach(t => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
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

  // 녹음 종료 함수
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

  // 타이머 포맷 (초 → 00:00)
  const formatSeconds = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  // 저장 확인 → 계약서 선택 모달로 이동
  const handleSaveConfirm = () => {
    setShowSaveModal(false);
    setShowContractModal(true);
  };

  // 저장 취소
  const handleSaveCancel = () => {
    audioBlobRef.current = null;
    setShowSaveModal(false);
    setIsRecording(false);
  };

  // 계약서 선택 후 연결
  const handleContractSelect = (contractId: number) => {
    // TODO: API 연동 — 녹음 파일(audioBlobRef.current)을 contractId와 함께 서버에 전송
    console.log("연결할 계약서 ID:", contractId, "녹음 파일:", audioBlobRef.current);
    setSavedContractId(contractId);
    setShowContractModal(false);
    setIsRecording(false);
    audioBlobRef.current = null;
  };

  // 계약서 연결 없이 그냥 닫기
  const handleContractSkip = () => {
    // TODO: API 연동 — 녹음 파일만 단독으로 서버에 전송 (계약서 연결 없음)
    console.log("계약서 연결 없이 저장:", audioBlobRef.current);
    setShowContractModal(false);
    setIsRecording(false);
    audioBlobRef.current = null;
  };

  return (
    <div className="ms-container">

      {/* Greeting */}
      <div className="ms-greeting">
        안녕하세요!<br />
        오늘도 <em>A-Law</em>에 오셨어요.
      </div>

      {/* Main Features */}
      <div className="ms-main-features-container">

        {/* 내 계약서 스캔하기 */}
        <div className="hover-scale-effect ms-scan-contract" onClick={onScanClick}>
          <div>
            <div className="ms-scan-title">내 계약서</div>
            <div className="ms-scan-title">스캔하기</div>
            <div className="ms-scan-subtitle">계약서 사진 하나면 분석 끝</div>
          </div>
          <div className="ms-scan-icon-box">
            <img src={ScanIcon} />
          </div>
        </div>

        {/* 음성 인식 */}
        <div
          className={`ms-voice-chat${isRecording ? ' recording' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
        >
          <img src={MicIcon} />
          {isRecording && (
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff", marginTop: "4px" }}>
              {formatSeconds(recordingSeconds)}
            </span>
          )}
        </div>

      </div>

      {/* 챗봇과 대화하기 */}
      <div className="ms-chatbot-button" onClick={() => { setShowChatbot(true); onChatbotOpen?.(); }}>
        <img src={ChatbotIcon} />
        <div className="ms-chatbot-button-text">
          <span className="ms-chatbot-main-text">챗봇과 대화하기</span>
          <span className="ms-chatbot-subtitle">궁금한 점이 있으신가요?</span>
        </div>
      </div>

      {/* Recent Contracts */}
      <div className="ms-section-header">
        <div className="ms-section-title">이전 계약</div>
        <div className="ms-section-view-all" onClick={() => navigate('/mycontracts')}>
          전체보기 <FaChevronRight size={10} />
        </div>
      </div>
      <div className="ms-recent-contracts-box">
        {contracts.length === 0 ? (
          <div className="ms-empty-state">
            아직 저장된 계약서가 없습니다.<br />
            계약서를 스캔해 보세요.
          </div>
        ) : (
          contracts.map((contract) => (
            <RecentContractItem
              key={contract.contractId}
              title={contract.title}
              date={formatDate(contract.createdAt)}
              isImportant={contract.bookmark}
              contractType={contract.contractType}
            />
          ))
        )}
      </div>

      {/* Chatbot Panel */}
      {showChatbot && <ChatbotPanel onClose={() => { setShowChatbot(false); onChatbotClose?.(); }} />}

      {/* 저장 여부 확인 모달 */}
      {showSaveModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <p style={styles.modalTitle}>녹음을 저장할까요?</p>
            <p style={styles.modalDesc}>녹음 시간: {formatSeconds(finalSeconds)}</p>
            <div style={styles.modalButtons}>
              <button style={styles.cancelBtn} onClick={handleSaveCancel}>취소</button>
              <button style={styles.confirmBtn} onClick={handleSaveConfirm}>저장</button>
            </div>
          </div>
        </div>
      )}

      {/* 계약서 선택 모달 */}
      {showContractModal && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, maxHeight: "70vh", display: "flex", flexDirection: "column", overflowY: "auto" }}>
            <p style={styles.modalTitle}>계약서에 연결하기</p>
            <p style={styles.modalDesc}>이 녹음을 연결할 계약서를 선택하세요.</p>
            <div style={{ overflowY: "auto", flex: 1, margin: "8px 0" }}>
              {contracts.length === 0 ? (
                <p style={{ textAlign: "center", color: "#aaa", fontSize: "14px", padding: "16px 0" }}>
                  저장된 계약서가 없습니다.
                </p>
              ) : (
                contracts.map(c => (
                  <div
                    key={c.contractId}
                    onClick={() => handleContractSelect(c.contractId)}
                    style={styles.contractRow}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: 600 }}>{c.title}</div>
                      <div style={{ fontSize: "12px", color: "#aaa", marginTop: "2px" }}>{formatDate(c.createdAt)}</div>
                    </div>
                    <FaChevronRight size={12} color="#ccc" />
                  </div>
                ))
              )}
            </div>
            <button style={{ ...styles.cancelBtn, width: "100%", marginTop: "4px" }} onClick={handleContractSkip}>
              연결 없이 저장
            </button>
          </div>
        </div>
      )}

      {/* 연결 완료 토스트 */}
      {savedContractId !== null && (
        <div style={styles.toast} onAnimationEnd={() => setSavedContractId(null)}>
          계약서에 연결되었습니다.
        </div>
      )}

    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000,
    padding: "0 24px",
  },
  modal: {
    background: "#fff",
    borderRadius: "20px",
    padding: "28px 24px 24px",
    width: "100%",
    maxWidth: "360px",
  },
  modalTitle: {
    fontSize: "17px", fontWeight: 700, margin: "0 0 6px", color: "#111",
  },
  modalDesc: {
    fontSize: "13px", color: "#888", margin: "0 0 20px",
  },
  modalButtons: {
    display: "flex", gap: "10px",
  },
  cancelBtn: {
    flex: 1, padding: "13px 0", borderRadius: "12px",
    border: "1px solid #e0e0e0", background: "#f5f5f5",
    fontSize: "15px", fontWeight: 600, color: "#555", cursor: "pointer",
  },
  confirmBtn: {
    flex: 1, padding: "13px 0", borderRadius: "12px",
    border: "none", background: "#5B4FCF",
    fontSize: "15px", fontWeight: 600, color: "#fff", cursor: "pointer",
  },
  contractRow: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "14px 4px",
    borderBottom: "1px solid #f0f0f0",
    cursor: "pointer",
  },
  toast: {
    position: "fixed", bottom: "90px", left: "50%",
    transform: "translateX(-50%)",
    background: "#333", color: "#fff",
    padding: "10px 20px", borderRadius: "99px",
    fontSize: "13px", fontWeight: 500,
    zIndex: 2000,
    animation: "fadeOut 2.5s forwards",
  },
};

export default MainScreen;
