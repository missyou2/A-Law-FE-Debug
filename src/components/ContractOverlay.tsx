import { useRef, useState, useEffect } from "react";
import "../pages/contract/contractCarousel.css";
import { generateEasyExplanation } from "../services/contractApi.js";
import type { EasyExplanationResponse } from "../types/contract.js";

type Props = {
  selectedText: string | null;
  onClose: () => void;
  contractId?: string; // 계약서 ID (선택적)
};

function ContractOverlay({ selectedText, onClose, contractId }: Props) {
  const minHeight = 180;
  const midHeight = 360;
  const maxHeight = 600;

  const [height, setHeight] = useState(minHeight);
  const [openAnim, setOpenAnim] = useState(false);

  const startY = useRef(0);
  const startHeight = useRef(minHeight);

  const [isDragging, setIsDragging] = useState(false);
  const [explanationData, setExplanationData] = useState<EasyExplanationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

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

  // API 호출: 선택된 문구 쉬운 말로 설명
  useEffect(() => {
    const fetchExplanation = async () => {
      if (!selectedText || !contractId) return;

      setIsLoading(true);
      setError("");
      setExplanationData(null);

      try {
        const result = await generateEasyExplanation(contractId, selectedText);
        setExplanationData(result);
      } catch (err) {
        console.error("설명 생성 실패:", err);
        setError("설명을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExplanation();
  }, [selectedText, contractId]);

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

        {!contractId ? (
          <p className="sheet-placeholder" style={{ color: "#999", fontStyle: "italic" }}>
            계약서 ID가 필요합니다.
          </p>
        ) : isLoading ? (
          <p className="sheet-placeholder">설명을 불러오는 중...</p>
        ) : error ? (
          <p className="sheet-placeholder" style={{ color: "#e74c3c" }}>{error}</p>
        ) : explanationData ? (
          <div className="sheet-explanation">
            <p className="sheet-easy-translation">{explanationData.easy_translation}</p>

            {explanationData.legal_term_guide && explanationData.legal_term_guide.length > 0 && (
              <div className="sheet-legal-terms" style={{ marginTop: "16px" }}>
                <h4 style={{ fontSize: "14px", marginBottom: "8px", color: "#666" }}>법률 용어 설명</h4>
                {explanationData.legal_term_guide.map((term, index) => (
                  <div key={index} style={{ marginBottom: "8px", paddingLeft: "8px", borderLeft: "2px solid #3498db" }}>
                    <strong style={{ color: "#2c3e50" }}>{term.term}</strong>: {term.meaning}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="sheet-placeholder">선택한 문구에 대한 설명이 여기에 표시됩니다.</p>
        )}
      </div>
    </>
  );
}

export default ContractOverlay;