import React from 'react';
import { useNavigate, Routes, Route } from "react-router-dom";
import './App.css';

import MainScreen from "./pages/MainScreen";
import ScanPage from "./pages/ScanPage";
import FailedPage from './pages/ScanFailed';
import LoadingPage from './pages/ScanLoading';
import SaveComplete from './pages/SaveComplete';

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