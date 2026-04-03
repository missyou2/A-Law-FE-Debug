import '../../App.css'
import './scan.css'
import './ScanLoading.css'

import { useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import LoadingIcon from '../../assets/icons/loading.png'
import LoadingTips from './LoadingTips.js'
import { uploadContractImage, subscribeAnalysisSSE } from '../../api/contractApi.js';
import type { AnalysisSummaryEvent, AnalysisRiskEvent } from '../../types/contract.js';

const getRandomTip = () => LoadingTips[Math.floor(Math.random() * LoadingTips.length)];

const ScanLoading = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const capturedImageData = location.state?.capturedImageData;
  const tip = useMemo(() => getRandomTip(), []);

  useEffect(() => {
    if (!capturedImageData) return;

    let cancelled = false;

    let eventSource: EventSource | null = null;

    let summaryData: AnalysisSummaryEvent | null = null;
    let riskData: AnalysisRiskEvent | null = null;

    const goToView = (ocrResult: Awaited<ReturnType<typeof uploadContractImage>>) => {
      navigate('/contract/view', {
        state: {
          capturedImageData,
          taskId: ocrResult.task_id,
          contractId: ocrResult.contract_id,
          ocrText: ocrResult.ocr_data?.full_text ?? '',
          ocrWords: ocrResult.ocr_data?.words ?? [],
          summaryData,
          riskData,
        },
        replace: true,
      });
    };

    const processOCR = async () => {
      try {
        const ocrResult = await uploadContractImage(capturedImageData);

        if (cancelled) return;

        if (ocrResult.status !== 'ocr_complete') {
          navigate('/scan/failed', { state: { errorReason: 'ocr_error' }, replace: true });
          return;
        }

        // s3_key가 있으면 SSE 구독(4번)으로 분석 완료 대기, 없으면 바로 이동
        if (ocrResult.s3_key) {
          eventSource = subscribeAnalysisSSE(ocrResult.s3_key, {
            onSummaryComplete: (data) => { summaryData = data; },
            onRiskComplete: (data) => { riskData = data; },
            onComplete: () => {
              if (!cancelled) goToView(ocrResult);
            },
            onSummaryFailed: () => {
              if (!cancelled) goToView(ocrResult); // 요약 실패 시 OCR 결과만으로 이동
            },
            onRiskFailed: () => {
              if (!cancelled) goToView(ocrResult); // 위험 분석 실패 시 OCR 결과만으로 이동
            },
            onError: () => {
              if (!cancelled) goToView(ocrResult); // SSE 연결 실패 시 fallback
            },
          });
        } else {
          goToView(ocrResult);
        }
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
            }
          }
          navigate('/scan/failed', { state: { errorReason }, replace: true });
        }
      }
    };

    processOCR();

    return () => {
      cancelled = true;
      eventSource?.close();
    };
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
