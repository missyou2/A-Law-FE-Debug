import React, { type FC, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
import './MainScreen.css';

// Icon (imported)
import ScanIcon from '../assets/icons/scan-icon.png';
import MicIcon from '../assets/icons/mic.png';
import ChatbotIcon from '../assets/icons/chatbot.png';
import DocsNormalIcon from '../assets/icons/docs-normal.png';
import DocsImportantIcon from '../assets/icons/docs-important.png';

// Icon (react icon)
import { FaChevronRight } from 'react-icons/fa';

// Chatbot
import ChatbotPanel from './contract/ChatbotPanel.js';

interface Contract {
    id: number;
    title: string;
    date: string;
    isImportant: boolean;
}

const API_URL = "http://localhost:4000/contracts";

interface RecentContractItemProps {
    title: string;
    date: string;
    isImportant: boolean;
}

const RecentContractItem: FC<RecentContractItemProps> = ({ title, date, isImportant }) => {
  const iconSrc = isImportant ? DocsImportantIcon : DocsNormalIcon;

  return (
    <div className="ms-contract-item">
      <img src={iconSrc} className="ms-contract-icon" />
      <div className="ms-contract-details">
        <div className="ms-contract-title">{title}</div>
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
}

const MainScreen: FC<MainScreenProps> = ({onScanClick}) => {
  const navigate = useNavigate();

  const [contracts, setContracts] = useState<Contract[]>([]);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await axios.get(API_URL);
        setContracts(response.data);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      }
    };
    fetchContracts();
  }, []);

  // 녹음 관련 상태 및 Ref
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 챗봇 패널 표시 상태
  const [showChatbot, setShowChatbot] = useState(false);

  // 녹음 시작 함수
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
        console.log("녹음 완료! 생성된 파일:", audioBlob);
        // 백엔드 서버 전송 — API 차후 작성예정
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      if (navigator.vibrate) navigator.vibrate(50);
    } catch (err) {
      console.error("마이크 접근 권한이 필요합니다:", err);
    }
  };

  // 녹음 종료 함수
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="ms-container">

      {/* Greeting */}
      <div className="ms-greeting">
        안녕하세요!<br />
        <em>계약서</em>를 분석해 드릴게요.
      </div>

      {/* Main Features */}
      <div className="ms-main-features-container">

        {/* 내 계약서 스캔하기 */}
        <div className="hover-scale-effect ms-scan-contract" onClick={onScanClick}>
          <div>
            <div className="ms-scan-title">내 계약서</div>
            <div className="ms-scan-title">스캔하기</div>
            <div className="ms-scan-subtitle">AI가 즉시 분석해 드립니다.</div>
          </div>
          <div className="ms-scan-icon-box">
            <img src={ScanIcon} />
          </div>
        </div>

        {/* 음성 인식 */}
        <div
          className={`ms-voice-chat${isRecording ? ' recording' : ''}`}
          onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
          onTouchEnd={stopRecording}
        >
          <img src={MicIcon} />
        </div>

      </div>

      {/* 챗봇과 대화하기 */}
      <div className="ms-chatbot-button" onClick={() => setShowChatbot(true)}>
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
              key={contract.id}
              title={contract.title}
              date={contract.date}
              isImportant={contract.isImportant}
            />
          ))
        )}
      </div>

      {/* Chatbot Panel */}
      {showChatbot && <ChatbotPanel onClose={() => setShowChatbot(false)} />}

    </div>
  );
};

export default MainScreen;
