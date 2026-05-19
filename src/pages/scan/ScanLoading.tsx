import '../../App.css'
import './scan.css'
import './ScanLoading.css'

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import LoadingIcon from '../../assets/icons/loading.png'
import LoadingTips from './LoadingTips.js'
import { uploadContractImage } from '../../api/contractApi.js';
import ConfirmDialog from '../../components/ConfirmDialog.js';

const getRandomTip = () => LoadingTips[Math.floor(Math.random() * LoadingTips.length)];

const ScanLoading = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const capturedImageData = location.state?.capturedImageData;
  const tip = useMemo(() => getRandomTip(), []);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!capturedImageData) return;

    let cancelled = false;

    const processOCR = async () => {
      try {
        const ocrResult = await uploadContractImage(capturedImageData);
        console.log('📄 OCR 응답:', ocrResult);

        if (cancelled) return;

        if (ocrResult.status !== 'ocr_complete') {
          navigate('/scan/failed', { state: { errorReason: 'ocr_error' }, replace: true });
          return;
        }

        // OCR 완료 즉시 계약서 뷰로 이동 — SSE(요약/위험 분석)는 ContractCarousel에서 구독
        navigate('/contract/view', {
          state: {
            capturedImageData,
            contractId: ocrResult.contract_id,
            ocrText: ocrResult.ocr_data?.full_text,
            ocrWords: ocrResult.ocr_data?.words ?? [],
            jobId: ocrResult.jobId,
          },
          replace: true,
        });
      } catch (error: unknown) {
        console.error('OCR 업로드 실패:', error);
        if (!cancelled) {
          let errorReason = 'server_error';
          if (
            error &&
            typeof error === 'object' &&
            'response' in error &&
            (error as { response?: { status?: number } }).response?.status !== undefined
          ) {
            const status = (error as { response: { status: number } }).response.status;
            if (status === 400 || status === 415) {
              errorReason = 'invalid_format';
            } else if (status === 401) {
              errorReason = 'unauthorized';
            }
          }
          navigate('/scan/failed', { state: { errorReason }, replace: true });
        }
      }
    };

    processOCR();

    return () => {
      cancelled = true;
    };
  }, [navigate, capturedImageData]);

  return (
    <div className="scan-container">
      <h1 className="scan-title">
        계약서를<br/>읽고 있습니다.
      </h1>

      <div className="loading-area">
        <img src={LoadingIcon} className="spinner-img" alt="loading" />
        <p className="loading-text">
            {tip}
        </p>
      </div>

      <div
        className="back-link"
        onClick={() => setShowConfirm(true)}
      >
        <FaArrowLeft size={10} />
        이전으로 돌아가기
      </div>

      {showConfirm && (
        <ConfirmDialog
          message="분석이 아직 진행중이에요, 정말로 돌아가시겠습니까?"
          onConfirm={() => navigate('/scan')}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};

export default ScanLoading;
