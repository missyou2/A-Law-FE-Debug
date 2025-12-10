import React from 'react';
import { useNavigate, Routes, Route } from "react-router-dom";

import MainScreen from "./pages/MainScreen.js";
import ScanPage from "./pages/ScanPage.js";
import FailedPage from './pages/ScanFailed.js';
import LoadingPage from './pages/ScanLoading.js';
import SaveComplete from './pages/SaveComplete.js';
import CameraPage from './pages/CameraPage.js';
import CapturedResult from './pages/CapturedResult.js';

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
    </Routes>
  );
}

export default App;