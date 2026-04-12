import React from 'react';
import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import { RecordingProvider, useRecording } from './contexts/RecordingContext.js';
import { FaChevronRight } from 'react-icons/fa';
import { AnimatePresence, motion } from "framer-motion";
import BottomNav from './components/BottomNav.js';
import MainScreen from "./pages/MainScreen.js";
import ScanPage from "./pages/scan/ScanPage.js";
import FailedPage from './pages/scan/ScanFailed.js';
import LoadingPage from './pages/scan/ScanLoading.js';
import SaveComplete from './pages/SaveComplete.js';
import CameraPage from './pages/scan/CameraPage.js';
import CapturedResult from './pages/scan/CapturedResult.js';
import ContractCarousel from './pages/contract/ContractCarousel.js';
import DocumentSavePage from './pages/contract/DocumentSavePage.js';
import DocumentSavedCompletePage from './pages/contract/DocumentSavedCompletePage.js';
import MyContracts from './pages/MyContracts.js';

import MyPage from './pages/mypage/MyPage.js';
import KakaoCallback from './pages/KakaoCallback.js';
import TermsPage from './pages/mypage/TermsPage.js';
import PrivacyPage from './pages/mypage/PrivacyPage.js';
import SupportPage from './pages/mypage/SupportPage.js';
import RecordingsPage from './pages/mypage/RecordingsPage.js';
import TermsAgreePage from './pages/TermsAgreePage.js';

// Debug
import OcrOverlay from './pages/debug/OcrOverlay.js';


const BOTTOM_NAV_ROUTES = ['/', '/mycontracts', '/mypage'];

const pageVariants = {
  initial: { opacity: 0, x: 18 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -18 },
};

const Page = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{
      duration: 0.22,
      ease: [0.16, 1, 0.3, 1] as const,
    }}
    style={{ minHeight: "100vh" }}
  >
    {children}
  </motion.div>
);

const formatDate = (isoString: string): string => {
  const d = new Date(isoString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function RecordingModals() {
  const {
    showSaveModal, showContractModal, finalSeconds, savedContractId,
    handleSaveConfirm, handleSaveCancel, handleContractSelect, handleContractSkip,
    formatSeconds, setSavedContractId,
  } = useRecording();

  const [contracts, setContracts] = React.useState<import('./api/contractApi.js').ContractListItem[]>([]);

  React.useEffect(() => {
    if (showContractModal) {
      import('./api/contractApi.js').then(({ getContractList }) => {
        getContractList().then(setContracts).catch(() => setContracts([]));
      });
    }
  }, [showContractModal]);

  const overlayStyle: React.CSSProperties = {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: "0 24px",
  };
  const modalStyle: React.CSSProperties = {
    background: "#fff", borderRadius: "20px",
    padding: "28px 24px 24px", width: "100%", maxWidth: "360px",
  };

  return (
    <>
      {showSaveModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <p style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 6px", color: "#111" }}>녹음을 저장할까요?</p>
            <p style={{ fontSize: "13px", color: "#888", margin: "0 0 20px" }}>녹음 시간: {formatSeconds(finalSeconds)}</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button style={{ flex: 1, padding: "13px 0", borderRadius: "12px", border: "1px solid #e0e0e0", background: "#f5f5f5", fontSize: "15px", fontWeight: 600, color: "#555", cursor: "pointer" }} onClick={handleSaveCancel}>취소</button>
              <button style={{ flex: 1, padding: "13px 0", borderRadius: "12px", border: "none", background: "#5B4FCF", fontSize: "15px", fontWeight: 600, color: "#fff", cursor: "pointer" }} onClick={handleSaveConfirm}>저장</button>
            </div>
          </div>
        </div>
      )}

      {showContractModal && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, maxHeight: "70vh", display: "flex", flexDirection: "column" }}>
            <p style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 6px", color: "#111" }}>계약서에 연결하기</p>
            <p style={{ fontSize: "13px", color: "#888", margin: "0 0 12px" }}>이 녹음을 연결할 계약서를 선택하세요.</p>
            <div style={{ overflowY: "auto", flex: 1, margin: "0 0 8px" }}>
              {contracts.length === 0 ? (
                <p style={{ textAlign: "center", color: "#aaa", fontSize: "14px", padding: "16px 0" }}>저장된 계약서가 없습니다.</p>
              ) : (
                contracts.map(c => (
                  <div key={c.contractId} onClick={() => handleContractSelect(c.contractId)}
                    style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 4px", borderBottom: "1px solid #f0f0f0", cursor: "pointer" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: 600 }}>{c.title}</div>
                      <div style={{ fontSize: "12px", color: "#aaa", marginTop: "2px" }}>{formatDate(c.createdAt)}</div>
                    </div>
                    <FaChevronRight size={12} color="#ccc" />
                  </div>
                ))
              )}
            </div>
            <button style={{ width: "100%", padding: "13px 0", borderRadius: "12px", border: "1px solid #e0e0e0", background: "#f5f5f5", fontSize: "15px", fontWeight: 600, color: "#555", cursor: "pointer" }} onClick={handleContractSkip}>
              연결 없이 저장
            </button>
            <p style={{ textAlign: "center", fontSize: "11px", color: "#bbb", marginTop: "8px" }}>
              저장한 녹음은 마이페이지 &gt; 녹음 목록에서 확인할 수 있습니다.
            </p>
          </div>
        </div>
      )}

      {savedContractId !== null && (
        <div style={{ position: "fixed", bottom: "90px", left: "50%", transform: "translateX(-50%)", background: "#333", color: "#fff", padding: "10px 20px", borderRadius: "99px", fontSize: "13px", fontWeight: 500, zIndex: 2000, animation: "fadeOut 2.5s forwards" }}
          onAnimationEnd={() => setSavedContractId(null)}>
          계약서에 연결되었습니다.
        </div>
      )}
    </>
  );
}

function App(){
  const navigate = useNavigate();
  const location = useLocation();
  const [isChatbotOpen, setIsChatbotOpen] = React.useState(false);

  const handleScanClick = () =>{
    navigate('/scan');
  };

  const showNav = BOTTOM_NAV_ROUTES.includes(location.pathname);

  return(
    <RecordingProvider>
    <>
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Main Page */}
        <Route
          path="/"
          element={
            <Page>
              <MainScreen
                onScanClick={handleScanClick}
                onChatbotOpen={() => setIsChatbotOpen(true)}
                onChatbotClose={() => setIsChatbotOpen(false)}
              />
            </Page>
          }
        />

        {/* Scan Page */}
        <Route path="/scan" element={<Page><ScanPage /></Page>} />

        {/* Camera Page */}
        <Route path="/camera" element={<Page><CameraPage /></Page>} />

        {/* (Debug) Captured Result Page */}
        <Route path="/capturedResult" element={<Page><CapturedResult /></Page>} />

        {/* Scan Failed Page */}
        <Route path="/scan/failed" element={<Page><FailedPage /></Page>} />

        {/* Scan Loading Page */}
        <Route path="/loading" element={<Page><LoadingPage /></Page>} />

        {/* Scan Saved Page */}
        <Route path="/saved" element={<Page><SaveComplete /></Page>} />

        {/* Contract carousel view page */}
        <Route path="/contract/view" element={<Page><ContractCarousel /></Page>} />

        {/* Contract save page */}
        <Route path="/contract/save" element={<Page><DocumentSavePage /></Page>} />

        {/* Contract carousel saved page */}
        <Route path="/contract/saved" element={<Page><DocumentSavedCompletePage /></Page>} />

        {/* Mypage */}
        <Route path="/mypage" element={<Page><MyPage /></Page>} />

        {/* Contract carousel saved page */}
        <Route path="/mycontracts" element={<MyContracts />} />

        {/* Kakao OAuth Callback */}
        <Route path="/oauth/callback" element={<KakaoCallback />} />

        {/* 최초 로그인 약관 동의 */}
        <Route path="/terms-agree" element={<Page><TermsAgreePage /></Page>} />

        {/* Recordings Page */}
        <Route path="/recordings" element={<Page><RecordingsPage /></Page>} />

        {/* Static Page Router */}
        <Route path="/terms" element={<Page><TermsPage /></Page>} />
        <Route path="/privacy" element={<Page><PrivacyPage /></Page>} />
        <Route path="/support" element={<Page><SupportPage /></Page>} />

        {/* (Debug) OCR Overlay Test Page — http://localhost:5173/debug/ocr */}
        <Route path="/debug/ocr" element={<OcrOverlay />} />
      </Routes>
    </AnimatePresence>
    {showNav && !isChatbotOpen && <BottomNav />}
    <RecordingModals />
    </>
    </RecordingProvider>
  );
}

export default App;
