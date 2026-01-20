import React, { type CSSProperties, type FC, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'

// Icon (imported)
import ScanIcon from '../assets/icons/scan-icon.png';
import MicIcon from '../assets/icons/mic.png';
import ChatbotIcon from '../assets/icons/chatbot.png';
import DocsNormalIcon from '../assets/icons/docs-normal.png';
import DocsImportantIcon from '../assets/icons/docs-important.png';
import MenuIcon from '../assets/icons/menu.png';
import UserIcon from '../assets/icons/user.png';

// Icon (react icon)
import { FaChevronRight } from 'react-icons/fa';

interface Contract {
    id: number;
    title: string;
    date: string;
    isImportant: boolean;
}

// 더미데이터
const recentContracts = [
  { id: 1, title: '2024년 복정동 전세...', date: '2024. 11. 19', isImportant: true },
  { id: 2, title: '논현동 매매계약서', date: '2024. 12. 10', isImportant: false },
  { id: 3, title: '매매계약서 사본', date: '2024. 11. 17', isImportant: false  },
  { id: 4, title: '2023년 월세계약서', date: '2023. 05. 22', isImportant: false  },
];

const styles = {
  container: {
    backgroundColor: '#F1F2F6',
    minHeight: '100vh',
    padding: '24px 20px',
    margin: '0',
  } as const,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    color: '#333',
  } as const,
  mainFeaturesContainer: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
  },
  scanContract: {
    flexGrow: 1,
    backgroundImage: 'linear-gradient(to bottom right, #21D8FC, #5865B9)',
    color: 'white',
    padding: '40px 20px 90px 20px',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    boxShadow: '0 4px 10px rgba(143, 143, 143, 0.8)',
    cursor: 'pointer',
  } as const,
  scanTitle: {
    fontSize: '46px',
    fontWeight: '750',
    textShadow: '0px 2px 3px rgba(0, 0, 0, 0.4)',
    marginBottom: '3px',
    lineHeight: 1.2,
    textAlign: 'left',
    fontFamily: 'Paperlogy, sans-serif',
  } as const,
  scanIconBox: {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.4))',
  } as const,
  voiceChat: {
    width: '100px',
    backgroundColor: 'white',
    borderRadius: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 10px rgba(143, 143, 143, 0.8)',
    fontSize: '40px',
    cursor: 'pointer',
  },
  voiceChatContent: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '160px',
  },
  chatbotButton: {
    backgroundImage: 'linear-gradient(to bottom right, #21D8FC, #5865B9)',
    color: 'white',
    padding: '25px',
    borderRadius: '17px',
    textAlign: 'right',
    fontSize: '30px',
    fontWeight: '600',
    textShadow: '0px 2px 3px rgba(0, 0, 0, 0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '25px',
    marginBottom: '30px',
    height: '140%',
    boxShadow: '0 4px 10px rgba(143, 143, 143, 0.8)',
    cursor: 'pointer',
    fontFamily: 'Paperlogy, sans-serif',
  } as const,
  sectionTitle: {
    fontSize: '26px',
    fontWeight: '750',
    color: '#000000ff',
    marginBottom: '8px',
    textAlign: 'left',
  } as const,
  recentContractsBox: {
    backgroundColor: 'white',
    borderRadius: '15px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    padding: '5px 20px',
    marginTop: '15px',
    overflow: 'hidden',
  },
  contractItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '15px 0',
    
    borderBottom: '2px solid #eee',
    color: '#333',
    cursor: 'pointer',
  },
  contractIcon: {
    fontSize: '24px',
    color: '#3498db',
    marginRight: '6px',
  },
  contractDetails: {
    flexGrow: 1,
  },
  contractTitle: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '3px',
    textAlign: 'left',
  } as const,
  contractDate: {
    fontSize: '16px',
    color: '#888',
    textAlign: 'left',
    fontWeight: '500',
  } as const,
  viewButton: {
    fontSize: '15px',
    color: '#999',
    display: 'flex',
    alignItems: 'center',
    gap: '0px',
  },
};

interface RecentContractItemProps {
    title: string;
    date: string;
    isImportant: boolean;
}

const RecentContractItem: FC<RecentContractItemProps> = ({ title, date, isImportant }) => {
  const iconSrc = isImportant ? DocsImportantIcon : DocsNormalIcon;

  return (
  <div style={styles.contractItem}>
    <img src={iconSrc} style={{...styles.contractIcon, width: '40px', height:'40px'}} />
    <div style={styles.contractDetails}>
      <div style={styles.contractTitle}>{title}</div>
      <div style={styles.contractDate}>({date})</div>
    </div>
    <div style={styles.viewButton}>
      보기 <FaChevronRight size={10} style={{ marginLeft: '5px' }} />
    </div>
  </div>
);
};

interface MainScreenProps {
    onScanClick: () => void; 
}

const MainScreen: FC<MainScreenProps> = ({onScanClick}) => {
  const navigate = useNavigate();

  // 녹음 관련 상태 및 Ref
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 2. 녹음 시작 함수
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = []; // 초기화

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // 녹음이 끝나면 조각들을 합쳐서 최종 오디오 Blob 생성
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log("녹음 완료! 생성된 파일:", audioBlob);
        
        // 백엔드 서버 전송
        // 여기에 API 차후 작성예정
        
        // 스트림 종료 (마이크 끄기)
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      if (navigator.vibrate) navigator.vibrate(50);
    } catch (err) {
      console.error("마이크 접근 권한이 필요합니다:", err);
    }
  };

  // 3. 녹음 종료 함수
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <img src={MenuIcon} style={{width:'28px', height:'28px', cursor: 'pointer' }} onClick={()=> navigate('/mycontracts')} />
        <img
          src={UserIcon}
          style={{ width: '36px', height: '36px', cursor: 'pointer' }}
          onClick={() => navigate('/mypage')}
        />
      </div>

      {/*Main Features*/}
      <div style={styles.mainFeaturesContainer}>
        {/*내 계약서 스캔하기*/}
        <div className="hover-scale-effect" style={styles.scanContract} onClick={onScanClick}>
          <div>
            <div style={styles.scanTitle}>내 계약서</div>
            <div style={styles.scanTitle}>스캔하기</div>
          </div>
          <div style={styles.scanIconBox}>
            <img src={ScanIcon} style={{width:'48px', height: '48px'}}/>
          </div>
        </div>

        {/*음성 인식*/}
        <div 
          style={{
            ...styles.voiceChat,
            backgroundColor: isRecording ? '#FF4B4B' : 'white', // 녹음 중일 때 붉은색
            transition: 'all 0.2s ease',
            transform: isRecording ? 'scale(0.95)' : 'scale(1)',
            boxShadow: isRecording ? '0 0 15px rgba(255, 75, 75, 0.5)' : styles.voiceChat.boxShadow,
          }}
          onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
          onTouchEnd={stopRecording}
        >
          <img 
            src={MicIcon} 
            style={{
              width:'52px', 
              height: '52px',
              filter: isRecording ? 'brightness(0) invert(1)' : 'none'
            }}
          />
        </div>
      </div>

      {/*챗봇과 대화하기 버튼*/}
      <div style={styles.chatbotButton} onClick={() => navigate('/chatbot')}>
          <img src={ChatbotIcon} style={{width:'60px', height: '60px', filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.4))'}}/>
        챗봇과 대화하기
      </div>

      {/* Recent Contracts*/}
      <div style={styles.sectionTitle}>이전계약</div>
      <div style={styles.recentContractsBox}>
        {recentContracts.map((contract) => (
          <RecentContractItem
            key={contract.id}
            title={contract.title}
            date={contract.date}
            isImportant={contract.isImportant}
          />
        ))}
      </div>
    </div>
  )
}



export default MainScreen;
