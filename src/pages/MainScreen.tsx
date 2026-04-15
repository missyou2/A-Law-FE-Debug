import { type FC, useState, useEffect } from 'react';
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
import { useRecording } from '../contexts/RecordingContext.js';

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
  const { isRecording, recordingSeconds, toggleRecording, formatSeconds } = useRecording();

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
          onClick={toggleRecording}
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

    </div>
  );
};

export default MainScreen;
