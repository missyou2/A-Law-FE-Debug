import React from 'react';
import { useNavigate, Routes, Route } from "react-router-dom";

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

function App(){
  const navigate = useNavigate();

  const handleScanClick = () =>{
    navigate('/scan');
  };

  return(
    <Routes>
      {/* Main Page */}
      <Route
        path="/" 
        element={<MainScreen onScanClick={handleScanClick} />} 
      />

      {/* Scan Page */}
      <Route path="/scan" element={<ScanPage />} />

      {/* Camera Page */}
      <Route path="/camera" element={<CameraPage />} />

      {/* (Debug) Captured Result Page */}
      <Route path="/capturedResult" element={<CapturedResult />} />

      {/* Scan Failed Page */}
      <Route path="/fail" element={<FailedPage />} />

      {/* Scan Loading Page */}
      <Route path="/loading" element={<LoadingPage />} />

      {/* Scan Saved Page */}
      <Route path="/saved" element={<SaveComplete />} />

      {/* Contract carousel view page */}
      <Route path="/contract/view" element={<ContractCarousel />} />

      {/* Contract save page */}
      <Route path="/contract/save" element={<DocumentSavePage />} />

      {/* Contract carousel saved page */}
      <Route path="/contract/saved" element={<DocumentSavedCompletePage />} />
    </Routes>
  );
}

export default App;
