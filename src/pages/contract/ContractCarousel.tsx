import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { SummaryResultEvent, AnalysisResultEvent } from "../../types/contract.js";
import { subscribeAnalysisSSE } from "../../api/contractApi.js";

import "./contractCarousel.css";
import ContractOriginalPage from "./ContractOriginalPage.js";
import ClauseSummaryPage from "./ClauseSummaryPage.js";
import RiskAnalysisPage from "./RiskAnalysisPage.js";
import ContractOverlay from "../../components/ContractOverlay.js";
import ConfirmDialog from "../../components/ConfirmDialog.js";

import ChatbotFloatingButton from "./ChatbotFloatingButton.js";
import ChatbotPanel from "./ChatbotPanel.js";

const pages = [
  { id: 0, label: "원문 보기" },
  { id: 1, label: "요약 보기" },
  { id: 2, label: "안전 분석" }
];

const isIOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

function ContractCarousel() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as {
    contractId?: number;
    capturedImageData?: string;
    ocrText?: string;
    jobId?: string;
  } | undefined;
  const contractId = locationState?.contractId != null ? String(locationState.contractId) : undefined;

  const [summaryData, setSummaryData] = useState<SummaryResultEvent | null>(null);
  const [riskData, setRiskData] = useState<AnalysisResultEvent | null>(null);
  const [riskAnalysisDone, setRiskAnalysisDone] = useState(false);

  // SSE 구독 — OCR 완료 직후 페이지 진입 시 요약/위험 분석을 백그라운드로 수신
  const analysisResultReceivedRef = useRef(false);

  useEffect(() => {
    const jobId = locationState?.jobId;
    if (!jobId) return;

    analysisResultReceivedRef.current = false;

    console.log('📡 SSE 구독 시작, jobId:', jobId);
    const eventSource = subscribeAnalysisSSE(jobId, {
      onSummaryResult: (data) => {
        console.log('📋 SSE summary_result 수신');
        setSummaryData(data);
      },
      onAnalysisResult: (data) => {
        analysisResultReceivedRef.current = true;
        console.log('🔍 SSE analysis_result 수신', data);
        setRiskData(data);
      },
      onComplete: (data) => {
        console.log(
          '✅ SSE analysis_complete',
          data,
          '| analysis_result 수신 여부:', analysisResultReceivedRef.current,
        );
        if (!analysisResultReceivedRef.current) {
          console.warn('⚠️ analysis_result 이벤트가 수신되지 않았습니다. 백엔드가 해당 이벤트를 전송하는지 확인하세요.');
        }
        // Fallback: some backends embed the analysis payload inside the complete event
        const maybeRisk = data as unknown as Partial<AnalysisResultEvent>;
        if (maybeRisk.clauseResults) {
          setRiskData(maybeRisk as AnalysisResultEvent);
        }
        setRiskAnalysisDone(true);
      },
      onError: (err) => console.warn('❌ SSE 오류', err),
    });

    return () => eventSource.close();
  }, [locationState?.jobId]);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showSaveWarning, setShowSaveWarning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [chatbotOpen, setChatbotOpen] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);
  const dragOffsetRef = useRef(0);
  const swipeConfirmedRef = useRef(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 390;

  const carouselViewportRef = useRef<HTMLDivElement | null>(null);

  // React state를 거치지 않고 DOM에 직접 transform 적용 → 드래그 중 re-render 없음
  const applyTransform = (offset: number, withTransition: boolean) => {
    dragOffsetRef.current = offset;
    const el = wrapperRef.current;
    if (!el) return;
    el.style.transition = withTransition
      ? "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      : "none";
    el.style.transform = `translateX(calc(-${currentIndex * 100}% + ${offset}px))`;
  };

  const haptic = () => {
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const isTextSelectingRef = useRef(false);
  const selectingRef = useRef(false);
  const openTimerRef = useRef<number | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const longPressActivatedRef = useRef(false);
  const longPressTouchStartRef = useRef<{ x: number; y: number } | null>(null);

  const selectionStartRangeRef = useRef<Range | null>(null);
  const selectionEndRangeRef = useRef<Range | null>(null);
  const highlightContainerRef = useRef<HTMLDivElement | null>(null);

  const clearOpenTimer = () => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  };

  const isInSelectableTextArea = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return !!target.closest(".doc-box") || !!target.closest(".text-selectable");
  };

  const getCaretRangeFromPoint = (x: number, y: number): Range | null => {
    const docAny = document as any;
    if (docAny.caretRangeFromPoint) return docAny.caretRangeFromPoint(x, y) as Range;

    const caretPositionFromPoint = (document as any).caretPositionFromPoint;
    if (caretPositionFromPoint) {
      const pos = caretPositionFromPoint.call(document, x, y);
      if (!pos) return null;
      const r = document.createRange();
      r.setStart(pos.offsetNode, pos.offset);
      r.setEnd(pos.offsetNode, pos.offset);
      return r;
    }
    return null;
  };

  const setSelectionRange = (start: Range, end: Range) => {
    const sel = window.getSelection();
    if (!sel) return;

    const r = document.createRange();
    try {
      r.setStart(start.startContainer, start.startOffset);
      r.setEnd(end.startContainer, end.startOffset);
    } catch {
      // end가 start보다 앞에 있을 때 (역방향 드래그) → 방향 반전
      try {
        r.setStart(end.startContainer, end.startOffset);
        r.setEnd(start.startContainer, start.startOffset);
      } catch {
        return;
      }
    }

    sel.removeAllRanges();
    sel.addRange(r);
  };

  const selectionIsInsideViewport = (sel: Selection) => {
    if (!carouselViewportRef.current) return false;
    if (sel.rangeCount === 0) return false;

    const anchorNode = sel.anchorNode;
    const focusNode = sel.focusNode;
    if (!anchorNode || !focusNode) return false;

    const anchorEl =
      anchorNode.nodeType === 1 ? (anchorNode as Element) : anchorNode.parentElement;
    const focusEl =
      focusNode.nodeType === 1 ? (focusNode as Element) : focusNode.parentElement;
    if (!anchorEl || !focusEl) return false;

    return (
      carouselViewportRef.current.contains(anchorEl) &&
      carouselViewportRef.current.contains(focusEl)
    );
  };

  const clearPersistentHighlight = () => {
    const sel = window.getSelection();
    sel?.removeAllRanges();
  };

  const captureSelectionText = () => {
    const start = selectionStartRangeRef.current;
    const end = selectionEndRangeRef.current;

    // 우리가 직접 추적한 start/end 범위로 텍스트 추출 (OS 선택 범위 무시)
    if (start && end) {
      const r = document.createRange();
      try {
        r.setStart(start.startContainer, start.startOffset);
        r.setEnd(end.startContainer, end.startOffset);
        const text = r.toString().trim();
        if (text.length >= 2) return text;
      } catch {
        // 역방향 드래그 시도
        try {
          r.setStart(end.startContainer, end.startOffset);
          r.setEnd(start.startContainer, start.startOffset);
          const text = r.toString().trim();
          if (text.length >= 2) return text;
        } catch {
          // fallthrough
        }
      }
    }

    // fallback: 브라우저 selection
    const sel = window.getSelection();
    if (!sel || !selectionIsInsideViewport(sel)) return null;
    const text = sel.toString().trim();
    return text.length >= 2 ? text : null;
  };

  // iOS custom highlight: draw yellow rects directly on the DOM to avoid
  // ::selection (which requires user-select:text, re-enabling iOS blue handles).
  // Semi-transparent yellow (no mix-blend-mode) — multiply on a transparent fixed
  // backdrop composites against nothing, making the rects invisible.
  const updateSelectionHighlight = () => {
    const container = highlightContainerRef.current;
    if (!container) return;
    container.innerHTML = "";

    const start = selectionStartRangeRef.current;
    const end = selectionEndRangeRef.current;
    if (!start || !end) return;

    let rects: DOMRectList | null = null;
    try {
      const r = document.createRange();
      r.setStart(start.startContainer, start.startOffset);
      r.setEnd(end.startContainer, end.startOffset);
      rects = r.getClientRects();
    } catch {
      try {
        const r = document.createRange();
        r.setStart(end.startContainer, end.startOffset);
        r.setEnd(start.startContainer, start.startOffset);
        rects = r.getClientRects();
      } catch {
        return;
      }
    }

    Array.from(rects).forEach((rect) => {
      if (rect.width < 2) return;
      const div = document.createElement("div");
      div.style.cssText = `position:absolute;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;background:rgba(255,245,157,0.75);border-radius:2px;pointer-events:none;`;
      container.appendChild(div);
    });
  };

  const clearSelectionHighlight = () => {
    const container = highlightContainerRef.current;
    if (container) container.innerHTML = "";
  };

  const getSelectionTextIfInsideViewport = () => {
    if (sheetOpen) return null;
    if (chatbotOpen) return null;
    if (!carouselViewportRef.current) return null;

    const sel = window.getSelection();
    if (!sel) return null;
    if (!selectionIsInsideViewport(sel)) return null;

    const anchorEl =
      sel.anchorNode?.nodeType === 1
        ? (sel.anchorNode as Element)
        : sel.anchorNode?.parentElement;
    if (!anchorEl || (!anchorEl.closest(".doc-box") && !anchorEl.closest(".text-selectable"))) return null;

    const text = sel.toString().trim();
    if (text.length < 2) return null;

    return text;
  };

  const openOverlayNow = () => {
    if (Math.abs(dragOffsetRef.current) > 3) return;
    if (sheetOpen) return;
    if (chatbotOpen) return;

    const picked = getSelectionTextIfInsideViewport();
    if (!picked) return;

    setSelectedText(picked);
    setSheetOpen(true);
  };

  const scheduleOpenOverlay = (delayMs: number) => {
    clearOpenTimer();
    openTimerRef.current = window.setTimeout(() => {
      openOverlayNow();
    }, delayMs);
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const inText = isInSelectableTextArea(e.target);
    swipeConfirmedRef.current = false;

    if (inText) {
      clearOpenTimer();
      longPressActivatedRef.current = false;

      const touch = e.touches[0] ?? e.changedTouches[0] ?? null;
      if (!touch) return;

      longPressTouchStartRef.current = { x: touch.clientX, y: touch.clientY };

      longPressTimerRef.current = window.setTimeout(() => {
        longPressActivatedRef.current = true;
        isTextSelectingRef.current = true;
        selectingRef.current = true;
        if (navigator.vibrate) navigator.vibrate(30);

        const startRange = getCaretRangeFromPoint(touch.clientX, touch.clientY);
        selectionStartRangeRef.current = startRange;

        swipeConfirmedRef.current = false;
        touchStartX.current = null;
        touchStartTime.current = null;
        applyTransform(0, false);
      }, 1000);

      touchStartX.current = touch.clientX;
      touchStartTime.current = Date.now();
      swipeConfirmedRef.current = true;
      applyTransform(0, false);
      return;
    }

    const touch = e.touches[0]!;
    touchStartX.current = touch.clientX;
    touchStartTime.current = Date.now();
    swipeConfirmedRef.current = true;
    applyTransform(0, false);
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isTextSelectingRef.current && selectingRef.current) {
      const start = selectionStartRangeRef.current;
      if (!start) return;

      const touch = e.touches[0] ?? e.changedTouches[0] ?? null;
      if (!touch) return;

      const end = getCaretRangeFromPoint(touch.clientX, touch.clientY);
      if (!end) return;

      selectionEndRangeRef.current = end;
      if (isIOS) updateSelectionHighlight();
      else setSelectionRange(start, end);
      return;
    }

    // 롱프레스 대기 중 → 방향 판별
    if (longPressTimerRef.current !== null && !longPressActivatedRef.current) {
      const touch = e.touches[0];
      const start = longPressTouchStartRef.current;
      if (touch && start) {
        const dx = Math.abs(touch.clientX - start.x);
        const dy = Math.abs(touch.clientY - start.y);
        const elapsedMs = Date.now() - (touchStartTime.current ?? Date.now());

        if (dx > dy && dx > 5) {
          if (elapsedMs < 600) {
            // 초반 가로 이동 → 스와이프 의도 → 타이머 취소
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
          } else {
            // 홀드 중 손가락 드리프트 → 타이머 유지, 시각 피드백만 차단
            swipeConfirmedRef.current = false;
            applyTransform(0, false);
          }
        } else if (dy > dx && dy > 10) {
          // 세로 스크롤 → 타이머 취소
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
          swipeConfirmedRef.current = false;
          touchStartX.current = null;
          applyTransform(0, false);
        }
      }
    }

    if (!swipeConfirmedRef.current || touchStartX.current === null) return;

    const touch = e.touches[0]!;
    const delta = touch.clientX - touchStartX.current;
    let adjusted = delta;

    if (currentIndex === 0 && delta > 0) adjusted = delta * 0.35;
    else if (currentIndex === pages.length - 1 && delta < 0) adjusted = delta * 0.35;

    applyTransform(adjusted, false); // state 아닌 DOM 직접 업데이트
  };

  const onTouchEnd = () => {
    if (longPressTimerRef.current !== null) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressTouchStartRef.current = null;
    swipeConfirmedRef.current = false;

    if (isTextSelectingRef.current) {
      const capturedText = captureSelectionText();

      isTextSelectingRef.current = false;
      selectingRef.current = false;
      longPressActivatedRef.current = false;
      selectionStartRangeRef.current = null;
      selectionEndRangeRef.current = null;
      applyTransform(0, false);

      if (capturedText && capturedText.length >= 2 && !sheetOpen && !chatbotOpen) {
        clearOpenTimer();
        openTimerRef.current = window.setTimeout(() => {
          window.getSelection()?.removeAllRanges();
          setSelectedText(capturedText);
          setSheetOpen(true);
          // keep highlight visible while overlay is open; cleared in handleOverlayClose
        }, 150);
      } else {
        clearSelectionHighlight();
      }
      return;
    }

    if (touchStartX.current === null || touchStartTime.current === null) {
      applyTransform(0, true);
      return;
    }

    const distance = dragOffsetRef.current;
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

    // DOM에 직접 스냅 애니메이션 적용 후 React state 동기화
    const el = wrapperRef.current;
    if (el) {
      el.style.transition = "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      el.style.transform = `translateX(-${next * 100}%)`;
    }
    dragOffsetRef.current = 0;
    touchStartX.current = null;
    touchStartTime.current = null;

    if (next !== currentIndex) setCurrentIndex(next);
  };

  const handleHighlightClick = (text: string) => {
    clearPersistentHighlight();
    setSelectedText(text);
    setSheetOpen(true);
  };

  const pageStyle = {
    width: "100%",
    height: "100%",
  } as const;

  const goToPage = (index: number) => {
    if (index === currentIndex) return;
    const el = wrapperRef.current;
    if (el) {
      el.style.transition = "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      el.style.transform = `translateX(-${index * 100}%)`;
    }
    setCurrentIndex(index);
  };

  const getIndicator = () => {
    return (
      <div className="indicator">
        <button
          className="carousel-arrow-btn"
          onClick={() => goToPage(currentIndex - 1)}
          disabled={currentIndex === 0}
          aria-label="이전 페이지"
        >
          ‹
        </button>
        {pages.map((page, i) =>
          i === currentIndex ? (
            <span key={i} className="indicator-pill">{page.label}</span>
          ) : (
            <span
              key={i}
              className="dot"
              style={{ cursor: "pointer" }}
              onClick={() => goToPage(i)}
            />
          )
        )}
        <button
          className="carousel-arrow-btn"
          onClick={() => goToPage(currentIndex + 1)}
          disabled={currentIndex === pages.length - 1}
          aria-label="다음 페이지"
        >
          ›
        </button>
      </div>
    );
  };

  // 비passive touchmove: 텍스트 선택 드래그 중에만 스크롤 차단
  // 스와이프 중에는 preventDefault를 호출하지 않음
  // → touch-action: pan-y 영역에서 첫 touchmove에 preventDefault 하면 브라우저가 전체 터치 시퀀스를 취소함
  useEffect(() => {
    const el = carouselViewportRef.current;
    if (!el) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (isTextSelectingRef.current && selectingRef.current && e.cancelable) {
        e.preventDefault();
      }
    };

    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", handleTouchMove);
  }, []);

  useEffect(() => {
    const onMouseUp = () => openOverlayNow();
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      clearOpenTimer();
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [sheetOpen, chatbotOpen]);

  const handleOverlayClose = () => {
    clearPersistentHighlight();
    clearSelectionHighlight();
    const sel = window.getSelection();
    sel?.removeAllRanges();
    setSheetOpen(false);
  };

  return (
    <div className="container">
      <div className="" />

      <div className="header">
        <span
          className="back-btn"
          onClick={() => riskAnalysisDone ? navigate("/") : setShowConfirm(true)}
        >
          ← 이전으로 돌아가기
        </span>

        <span
          className="button-press"
          style={{ fontSize: 15, color: "#111", cursor: "pointer" }}
          onClick={() => {
            haptic();
            if (!riskAnalysisDone) {
              setShowSaveWarning(true);
              return;
            }
            navigate("/contract/save", {
              state: {
                contractId: locationState?.contractId,
                capturedImageData: locationState?.capturedImageData,
              },
            });
          }}
        >
          다음 →
        </span>
      </div>

      <div
        className="carousel-viewport"
        ref={carouselViewportRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="carousel-wrapper"
          ref={wrapperRef}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          <div className="carousel-page">
            <div style={pageStyle}>
              <ContractOriginalPage onSelect={handleHighlightClick} />
            </div>
          </div>

          <div className="carousel-page">
            <div style={pageStyle}>
              <ClauseSummaryPage onSelect={handleHighlightClick} summaryData={summaryData} />
            </div>
          </div>

          <div className="carousel-page">
            <div style={pageStyle}>
              <RiskAnalysisPage riskData={riskData} analysisDone={riskAnalysisDone} />
            </div>
          </div>
        </div>
      </div>

      {getIndicator()}

      {/* iOS custom selection highlight — position:fixed so getClientRects() coords map directly */}
      <div
        ref={highlightContainerRef}
        style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 8 }}
      />

      {sheetOpen && (
        <ContractOverlay
          selectedText={selectedText}
          onClose={handleOverlayClose}
          {...(contractId ? { contractId } : {})}
        />
      )}

      {!chatbotOpen && (
        <ChatbotFloatingButton onClick={() => setChatbotOpen(true)} />
      )}

      {chatbotOpen && (
        <ChatbotPanel onClose={() => setChatbotOpen(false)} {...(contractId ? { contractId } : {})} />
      )}

      {showConfirm && (
        <ConfirmDialog
          message="분석이 아직 진행중이에요, 정말로 돌아가시겠습니까?"
          onConfirm={() => navigate("/")}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {showSaveWarning && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
          onClick={() => setShowSaveWarning(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            style={{ background: "#fff", borderRadius: "16px", padding: "28px 24px 20px", width: "min(320px, 88vw)", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
            onClick={e => e.stopPropagation()}
          >
            <p style={{ margin: "0 0 24px", fontSize: "15px", fontWeight: 600, color: "#111", lineHeight: "1.55", textAlign: "center" }}>
              계약서 분석이 아직 진행 중이에요.<br />분석 완료 후 저장할 수 있어요.
            </p>
            <button
              onClick={() => setShowSaveWarning(false)}
              style={{ width: "100%", padding: "12px 0", borderRadius: "10px", border: "none", background: "#e0e0e0", color: "#555", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContractCarousel;
