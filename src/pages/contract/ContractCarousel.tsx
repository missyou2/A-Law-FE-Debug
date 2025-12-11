import React, { useRef, useState } from "react";
import "./contractCarousel.css";
import ContractOriginalPage from "./ContractOriginalPage.js";
import ClauseSummaryPage from "./ClauseSummaryPage.js";
import RiskAnalysisPage from "./RiskAnalysisPage.js";
import ContractOverlay from "../../components/ContractOverlay.js";
import DocumentSavePage from "./DocumentSavePage.js";
import DocumentSavedCompletePage from "./DocumentSavedCompletePage.js";

const pages = [
  { id: 0, label: "원문 보기" },
  { id: 1, label: "요약 보기" },
  { id: 2, label: "안전 분석" }
];

function ContractCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [showSavePage, setShowSavePage] = useState(false);
  const [showCompletePage, setShowCompletePage] = useState(false);
  const [animOut, setAnimOut] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const viewportWidth =
    typeof window !== "undefined" ? window.innerWidth : 390;

  const haptic = () => {
    if (navigator.vibrate) navigator.vibrate(10);
  };

  /* PAGE5: 저장 완료 화면 */
  if (showCompletePage) {
    return (
      <div className="phone-frame">
        <div className="page-transition-scale-fade">
          <DocumentSavedCompletePage
            onBackHome={() => {
              setShowCompletePage(false);
            }}
          />
        </div>
      </div>
    );
  }

  /* PAGE4: 문서 저장 화면 */
  if (showSavePage) {
    return (
      <div className="phone-frame">
        <div className={animOut ? "page-transition-out" : "page-transition-scale-fade"}>
          <DocumentSavePage
            onBack={() => {
              setAnimOut(true);
              setTimeout(() => {
                setShowSavePage(false);
                setAnimOut(false);
              }, 300);
            }}
            onSave={() => {
              setShowSavePage(false);
              setShowCompletePage(true); 
            }}
          />
        </div>
      </div>
    );
  }

  /* 기본 Carousel 화면 */
  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0]!.clientX;
    touchStartTime.current = Date.now();
    setDragOffset(0);
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const delta = e.touches[0]!.clientX - touchStartX.current;
    let adjusted = delta;

    if (currentIndex === 0 && delta > 0) adjusted = delta * 0.35;
    else if (currentIndex === pages.length - 1 && delta < 0)
      adjusted = delta * 0.35;

    setDragOffset(adjusted);
  };

  const onTouchEnd = () => {
    if (touchStartX.current === null || touchStartTime.current === null) {
      setDragOffset(0);
      return;
    }

    const distance = dragOffset;
    const time = Date.now() - touchStartTime.current;
    const velocity = distance / time;

    const threshold = viewportWidth * 0.22;
    let next = currentIndex;

    if (velocity < -0.45 && currentIndex < pages.length - 1) next = currentIndex + 1;
    else if (velocity > 0.45 && currentIndex > 0) next = currentIndex - 1;
    else if (Math.abs(distance) > threshold) {
      if (distance < 0 && currentIndex < pages.length - 1) next = currentIndex + 1;
      else if (distance > 0 && currentIndex > 0) next = currentIndex - 1;
    }

    setCurrentIndex(next);
    setDragOffset(0);
  };

  const handleHighlightClick = (text: string) => {
    setSelectedText(text);
    setSheetOpen(true);
  };

  const pageStyle = (index: number) => {
    const base = index - currentIndex;
    const progress = dragOffset / viewportWidth;
    const relative = base - progress;
    const abs = Math.abs(relative);

    const scale = 1 - Math.min(abs * 0.12, 0.14);
    const opacity = 1 - Math.min(abs * 0.4, 0.5);
    const translateY = Math.min(abs * 15, 18);

    return {
      width: "100%",
      height: "100%",
      transform: `scale(${scale}) translateY(${translateY}px)`,
      opacity
    };
  };

  const getIndicator = () => {
    return (
      <div className="indicator">
        {currentIndex === 0 ? <span className="indicator-pill">원문 보기</span> : <span className="dot"></span>}
        {currentIndex === 1 ? <span className="indicator-pill">요약 보기</span> : <span className="dot"></span>}
        {currentIndex === 2 ? <span className="indicator-pill">안전 분석</span> : <span className="dot"></span>}
      </div>
    );
  };

  return (
    <div className="phone-frame">
      <div className="phone-notch" />

      <div className="phone-header">
        <span className="back-btn" onClick={() => window.history.back()}>
          ← 이전으로 돌아가기
        </span>

        <span
          className="button-press"
          style={{ marginLeft: "auto", fontSize: 15, color: "#111", cursor: "pointer" }}
          onClick={() => {
            haptic();
            setShowSavePage(true);
          }}
        >
          다음 →
        </span>
      </div>

      <div
        className="carousel-viewport"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="carousel-wrapper"
          style={{
            transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
            transition: dragOffset === 0 ? "transform 0.28s ease-out" : "none"
          }}
        >
          <div className="carousel-page">
            <div style={pageStyle(0)}>
              <ContractOriginalPage onSelect={handleHighlightClick} />
            </div>
          </div>

          <div className="carousel-page">
            <div style={pageStyle(1)}>
              <ClauseSummaryPage onSelect={handleHighlightClick} />
            </div>
          </div>

          <div className="carousel-page">
            <div style={pageStyle(2)}>
              <RiskAnalysisPage onSelect={handleHighlightClick} />
            </div>
          </div>
        </div>
      </div>

      {getIndicator()}

      {sheetOpen && (
        <ContractOverlay
          selectedText={selectedText}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </div>
  );
}

export default ContractCarousel;
