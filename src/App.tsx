import React from 'react';
import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

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

import MyPage from './pages/mypage/MyPage.js';
import TermsPage from './pages/mypage/TermsPage.js';
import PrivacyPage from './pages/mypage/PrivacyPage.js';
import SupportPage from './pages/mypage/SupportPage.js';

function App(){
  const navigate = useNavigate();
  const location = useLocation();

  const handleScanClick = () =>{
    navigate('/scan');
  };

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

  return(
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Main Page */}
        <Route
          path="/"
          element={
            <Page>
              <MainScreen onScanClick={handleScanClick} />
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
        <Route path="/fail" element={<Page><FailedPage /></Page>} />

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

        {/* Static Page Router */}
        <Route path="/terms" element={<Page><TermsPage /></Page>} />
        <Route path="/privacy" element={<Page><PrivacyPage /></Page>} />
        <Route path="/support" element={<Page><SupportPage /></Page>} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
