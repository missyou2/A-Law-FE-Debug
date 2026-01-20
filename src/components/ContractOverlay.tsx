import { useRef, useState, useEffect } from "react";
import "../pages/contract/contractCarousel.css";
// import { explainSelectedText } from "../services/llmService.js";  // 서비스 사용 시

type Props = {
  selectedText: string | null;
  onClose: () => void;
};

function ContractOverlay({ selectedText, onClose }: Props) {
  const minHeight = 180;
  const midHeight = 360;
  const maxHeight = 600;

  const [height, setHeight] = useState(minHeight);
  const [openAnim, setOpenAnim] = useState(false);

  const startY = useRef(0);
  const startHeight = useRef(minHeight);

  const [isDragging, setIsDragging] = useState(false);

  const backdropClose = () => {
    setOpenAnim(false);
    setTimeout(onClose, 250);
  };

  useEffect(() => {
    setTimeout(() => setOpenAnim(true), 20);
    setHeight(minHeight);
  }, []);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]; 
    if (!touch) return;

    startY.current = touch.clientY;
    startHeight.current = height;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    if (!touch) return;

    const currentY = touch.clientY;
    const diff = startY.current - currentY;

    let nextHeight = startHeight.current + diff;

    if (nextHeight < minHeight) {
      nextHeight = minHeight - (minHeight - nextHeight) * 0.25;
    } else if (nextHeight > maxHeight) {
      nextHeight = maxHeight + (nextHeight - maxHeight) * 0.25;
    }

    setHeight(nextHeight);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    if (height < minHeight + 60) {
      snapTo(minHeight);
      return;
    }

    const snapRanges = [
      { point: minHeight, dist: Math.abs(height - minHeight) },
      { point: midHeight, dist: Math.abs(height - midHeight) },
      { point: maxHeight, dist: Math.abs(height - maxHeight) },
    ];

    snapRanges.sort((a, b) => a.dist - b.dist);
    snapTo(snapRanges[0]!.point);
  };

  const snapTo = (target: number) => {
    setHeight(target);
  };

  // ============================================
  // 여기에 API 호출 코드 삽입
  // ============================================
  // API: POST /api/v1/contracts/{id}/easy-explanation
  // 설명: 특정 문장에 대한 쉬운 말 요약 생성
  //
  // 필요한 데이터:
  // - contractId: string (계약서 ID)
  // - selectedText: string (선택된 문구)
  //
  // 예시 코드:
  // const handleExplain = async () => {
  //   const API_KEY = "여기에 API 키 입력";
  //   const BASE_URL = "http://localhost:3000/api/v1";
  //   const CONTRACT_ID = "contract_123";  // 실제 계약서 ID로 교체 필요
  //
  //   try {
  //     const response = await fetch(
  //       `${BASE_URL}/contracts/${CONTRACT_ID}/easy-explanation`,
  //       {
  //         method: 'POST',
  //         headers: {
  //           'Authorization': `Bearer ${API_KEY}`,
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({ selectedText }),
  //       }
  //     );
  //
  //     if (!response.ok) throw new Error('설명 생성 실패');
  //     const data = await response.json();
  //
  //     // 설명 결과를 상태에 저장하거나 UI에 표시
  //   } catch (error) {
  //     // 에러 처리
  //   }
  // };
  // ============================================

  return (
    <>
      {/* DIMMED BACKDROP */}
      <div
        className={`sheet-backdrop ${openAnim ? "open" : ""}`}
        onClick={backdropClose}
      />

      <div
        className={`bottom-sheet slide-up ${openAnim ? "open" : ""}`}
        style={{
          height,
          transition: isDragging ? "none" : "transform 0.35s cubic-bezier(0.18,0.89,0.32,1.28)",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="sheet-handle" />

        <h3 className="sheet-title">선택된 문구</h3>
        <p className="sheet-selected-text">{selectedText ?? "선택된 문구가 없습니다."}</p>

        <div className="sheet-divider" />

        <p className="sheet-placeholder">
          선택한 문구에 대한 설명이 여기에 표시됩니다.
        </p>
      </div>
    </>
  );
}

export default ContractOverlay;