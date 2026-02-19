import '../../App.css'
import './scan.css'

import { useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import LoadingIcon from '../../assets/icons/loading.png'
import LoadingTips from './LoadingTips.js'
import { uploadContractImage } from '../../api/contractApi.js';

const getRandomTip = () => LoadingTips[Math.floor(Math.random() * LoadingTips.length)];

const ScanLoading = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const capturedImageData = location.state?.capturedImageData;
  const tip = useMemo(() => getRandomTip(), []);

  useEffect(() => {
    if (!capturedImageData) return;

    let cancelled = false;

    const processOCR = async () => {
      try {
        const ocrResult = await uploadContractImage(capturedImageData);

        if (cancelled) return;

        if (ocrResult.status === 'ocr_complete') {
          navigate('/contract/view', {
            state: {
              capturedImageData,
              taskId: ocrResult.task_id,
              contractId: ocrResult.contract_id,
              ocrText: ocrResult.ocr_data.full_text,
            },
            replace: true,
          });
        } else {
          navigate('/scan/failed', { replace: true });
        }
      } catch (error) {
        console.error('OCR 업로드 실패:', error);
        if (!cancelled) {
          navigate('/scan/failed', { replace: true });
        }
      }
    };

    processOCR();

    return () => { cancelled = true; };
  }, [navigate, capturedImageData]);

  return (
    <div className="scan-container">
      {/* 1. 상단 문구 */}
      <h1 className="scan-title">
        계약서를<br/>읽고 있습니다.
      </h1>

      <div className="loading-area">
        <img src={LoadingIcon} className="spinner-img" alt="loading" />
        <p className="loading-text">
            {tip}
        </p>
      </div>

      {/* 이전으로 돌아가기 링크 */}
      <div
        className="back-link"
        onClick={() => navigate('/scan')}
      >
        <FaArrowLeft size={10} />
        이전으로 돌아가기
      </div>
    </div>
  );
};

export default ScanLoading;
