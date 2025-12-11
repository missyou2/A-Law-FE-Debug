import { useRef, useState, useEffect } from "react";
import "../pages/contract/contractCarousel.css";

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

        <h4 className="sheet-label">LLM API Key</h4>
        <input className="sheet-input" placeholder="API Key를 입력하세요" />

        <div className="sheet-divider" />

        <p className="sheet-placeholder">
          선택한 문장, 단어의 llm 설명이 나옴
        </p>
      </div>
    </>
  );
}

export default ContractOverlay;