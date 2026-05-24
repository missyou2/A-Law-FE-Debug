import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import type { ContractDetail, SummaryResultEvent, AnalysisResultEvent } from "../../types/contract.js";
import { getContractById } from "../../api/contractApi.js";

import "./contractCarousel.css";
import ContractOriginalPage from "./ContractOriginalPage.js";
import ClauseSummaryPage from "./ClauseSummaryPage.js";
import RiskAnalysisPage from "./RiskAnalysisPage.js";
import ContractOverlay from "../../components/ContractOverlay.js";
import ChatbotFloatingButton from "./ChatbotFloatingButton.js";
import ChatbotPanel from "./ChatbotPanel.js";

const isIOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

function ContractViewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { contractId: contractIdParam } = useParams<{ contractId: string }>();
  const locationState = location.state as { contract?: ContractDetail; capturedImageData?: string } | undefined;

  const [contract, setContract] = useState<ContractDetail | null>(locationState?.contract ?? null);
  const [fetchError, setFetchError] = useState<403 | 'error' | null>(null);

  const contractId = contractIdParam ?? (contract?.contractId != null ? String(contract.contractId) : undefined);

  useEffect(() => {
    if (contract || !contractId) return;
    getContractById(Number(contractId))
      .then(res => setContract(res.data))
      .catch(err => {
        const status = err?.response?.status;
        setFetchError(status === 403 ? 403 : 'error');
      });
  }, [contractId]);

  const [summaryData, setSummaryData] = useState<SummaryResultEvent | null>(null);
  const [riskData, setRiskData] = useState<AnalysisResultEvent | null>(null);
  const [analysisDone, setAnalysisDone] = useState(false);

  useEffect(() => {
    if (!contract) return;
    if (contract.summary) setSummaryData(contract.summary);
    if (contract.riskAnalysis) {
      setRiskData({
        totalClauses: contract.riskAnalysis.totalClauses,
        riskCount: contract.riskAnalysis.riskCount,
        cautionCount: contract.riskAnalysis.cautionCount,
        safetyCount: contract.riskAnalysis.safetyCount,
        clauseResults: contract.riskAnalysis.clauseResults.map((c, i) => ({
          clauseId: i,
          clauseTitle: c.clauseTitle,
          clauseContent: c.clauseContent,
          riskLevel: c.riskLevel,
          legalReference: c.legalReference,
          reasoningSummary: c.reasoningSummary,
          recommendation: '',
          relatedLaw: '',
          score: 0,
          category: c.category,
        })),
      });
    }
    setAnalysisDone(true);
  }, [contract]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);
  const dragOffsetRef = useRef(0);
  const swipeConfirmedRef = useRef(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const carouselViewportRef = useRef<HTMLDivElement | null>(null);

  const isTextSelectingRef = useRef(false);
  const selectingRef = useRef(false);
  const openTimerRef = useRef<number | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const longPressActivatedRef = useRef(false);
  const longPressTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const selectionStartRangeRef = useRef<Range | null>(null);
  const selectionEndRangeRef = useRef<Range | null>(null);
  const mouseSwipingRef = useRef(false);
  const mouseDraggingRef = useRef(false);
  const touchActiveRef = useRef(false);

  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 390;
  const pages = [
    { id: 0, label: "원문 보기" },
    { id: 1, label: "요약 보기" },
    { id: 2, label: "위험 분석" },
  ];

  const haptic = () => { if (navigator.vibrate) navigator.vibrate(10); };

  const applyTransform = (offset: number, withTransition: boolean) => {
    dragOffsetRef.current = offset;
    const el = wrapperRef.current;
    if (!el) return;
    el.style.transition = withTransition
      ? "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      : "none";
    el.style.transform = `translateX(calc(-${currentIndex * 100}% + ${offset}px))`;
  };

  const isInSelectableTextArea = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return !!target.closest(".doc-box") || !!target.closest(".text-selectable");
  };

  const getCaretRangeFromPoint = (x: number, y: number): Range | null => {
    const docAny = document as any;
    if (docAny.caretRangeFromPoint) return docAny.caretRangeFromPoint(x, y) as Range;
    const pos = (document as any).caretPositionFromPoint?.(x, y);
    if (!pos) return null;
    const r = document.createRange();
    r.setStart(pos.offsetNode, pos.offset);
    r.setEnd(pos.offsetNode, pos.offset);
    return r;
  };

  const setSelectionRange = (start: Range, end: Range) => {
    const sel = window.getSelection();
    if (!sel) return;
    const r = document.createRange();
    try {
      r.setStart(start.startContainer, start.startOffset);
      r.setEnd(end.startContainer, end.startOffset);
    } catch {
      try {
        r.setStart(end.startContainer, end.startOffset);
        r.setEnd(start.startContainer, start.startOffset);
      } catch { return; }
    }
    sel.removeAllRanges();
    sel.addRange(r);
  };

  const selectionIsInsideViewport = (sel: Selection) => {
    if (!carouselViewportRef.current || sel.rangeCount === 0) return false;
    const anchorEl = sel.anchorNode?.nodeType === 1
      ? (sel.anchorNode as Element) : sel.anchorNode?.parentElement;
    const focusEl = sel.focusNode?.nodeType === 1
      ? (sel.focusNode as Element) : sel.focusNode?.parentElement;
    if (!anchorEl || !focusEl) return false;
    return carouselViewportRef.current.contains(anchorEl) && carouselViewportRef.current.contains(focusEl);
  };

  const captureSelectionText = () => {
    const start = selectionStartRangeRef.current;
    const end = selectionEndRangeRef.current;
    if (start && end) {
      const r = document.createRange();
      try {
        r.setStart(start.startContainer, start.startOffset);
        r.setEnd(end.startContainer, end.startOffset);
        const text = r.toString().trim();
        if (text.length >= 2) return text;
      } catch {
        try {
          r.setStart(end.startContainer, end.startOffset);
          r.setEnd(start.startContainer, start.startOffset);
          const text = r.toString().trim();
          if (text.length >= 2) return text;
        } catch { /* fallthrough */ }
      }
    }
    const sel = window.getSelection();
    if (!sel || !selectionIsInsideViewport(sel)) return null;
    const text = sel.toString().trim();
    return text.length >= 2 ? text : null;
  };

  const clearOpenTimer = () => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  };

  const clearPersistentHighlight = () => window.getSelection()?.removeAllRanges();

  const openOverlayNow = () => {
    if (Math.abs(dragOffsetRef.current) > 3 || sheetOpen || chatbotOpen) return;
    const sel = window.getSelection();
    if (!sel || !selectionIsInsideViewport(sel)) return;
    const anchorEl =
      sel.anchorNode?.nodeType === 1
        ? (sel.anchorNode as Element)
        : sel.anchorNode?.parentElement;
    if (!anchorEl || (!anchorEl.closest(".doc-box") && !anchorEl.closest(".text-selectable"))) return;
    const text = sel.toString().trim();
    if (text.length < 2) return;
    setSelectedText(text);
    setSheetOpen(true);
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (touchActiveRef.current) return;
    if (isInSelectableTextArea(e.target)) return;
    mouseSwipingRef.current = true;
    mouseDraggingRef.current = false;
    touchStartX.current = e.clientX;
    touchStartTime.current = Date.now();
    applyTransform(0, false);
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchActiveRef.current = true;
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
        selectionStartRangeRef.current = getCaretRangeFromPoint(touch.clientX, touch.clientY);
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
      if (!isIOS) setSelectionRange(start, end);
      return;
    }

    if (longPressTimerRef.current !== null && !longPressActivatedRef.current) {
      const touch = e.touches[0];
      const start = longPressTouchStartRef.current;
      if (touch && start) {
        const dx = Math.abs(touch.clientX - start.x);
        const dy = Math.abs(touch.clientY - start.y);
        const elapsed = Date.now() - (touchStartTime.current ?? Date.now());
        if (dx > dy && dx > 5) {
          if (elapsed < 600) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
          } else {
            swipeConfirmedRef.current = false;
            applyTransform(0, false);
          }
        } else if (dy > dx && dy > 10) {
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
    let delta = touch.clientX - touchStartX.current;
    if (currentIndex === 0 && delta > 0) delta *= 0.35;
    else if (currentIndex === pages.length - 1 && delta < 0) delta *= 0.35;
    applyTransform(delta, false);
  };

  const onTouchEnd = () => {
    setTimeout(() => { touchActiveRef.current = false; }, 500);
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
        }, 150);
      }
      return;
    }

    if (touchStartX.current === null || touchStartTime.current === null) {
      applyTransform(0, true);
      return;
    }

    const distance = dragOffsetRef.current;
    const velocity = distance / (Date.now() - touchStartTime.current);
    const threshold = viewportWidth * 0.22;
    let next = currentIndex;

    if (velocity < -0.45 && currentIndex < pages.length - 1) next = currentIndex + 1;
    else if (velocity > 0.45 && currentIndex > 0) next = currentIndex - 1;
    else if (Math.abs(distance) > threshold) {
      if (distance < 0 && currentIndex < pages.length - 1) next = currentIndex + 1;
      else if (distance > 0 && currentIndex > 0) next = currentIndex - 1;
    }

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

  useEffect(() => {
    const el = carouselViewportRef.current;
    if (!el) return;
    const handler = (e: TouchEvent) => {
      if (isTextSelectingRef.current && selectingRef.current && e.cancelable) e.preventDefault();
    };
    el.addEventListener("touchmove", handler, { passive: false });
    return () => el.removeEventListener("touchmove", handler);
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!mouseSwipingRef.current || touchStartX.current === null) return;
      let delta = e.clientX - touchStartX.current;
      if (Math.abs(delta) > 5) mouseDraggingRef.current = true;
      if (currentIndex === 0 && delta > 0) delta *= 0.35;
      else if (currentIndex === pages.length - 1 && delta < 0) delta *= 0.35;
      applyTransform(delta, false);
    };
    document.addEventListener("mousemove", onMouseMove);
    return () => document.removeEventListener("mousemove", onMouseMove);
  }, [currentIndex]);

  useEffect(() => {
    const onMouseUp = () => {
      if (touchActiveRef.current) return;
      if (mouseSwipingRef.current) {
        mouseSwipingRef.current = false;
        if (mouseDraggingRef.current) {
          mouseDraggingRef.current = false;
          const distance = dragOffsetRef.current;
          const velocity = touchStartTime.current
            ? distance / (Date.now() - touchStartTime.current)
            : 0;
          const threshold = viewportWidth * 0.22;
          let next = currentIndex;
          if (velocity < -0.45 && currentIndex < pages.length - 1) next = currentIndex + 1;
          else if (velocity > 0.45 && currentIndex > 0) next = currentIndex - 1;
          else if (Math.abs(distance) > threshold) {
            if (distance < 0 && currentIndex < pages.length - 1) next = currentIndex + 1;
            else if (distance > 0 && currentIndex > 0) next = currentIndex - 1;
          }
          const el = wrapperRef.current;
          if (el) {
            el.style.transition = "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            el.style.transform = `translateX(-${next * 100}%)`;
          }
          dragOffsetRef.current = 0;
          touchStartX.current = null;
          touchStartTime.current = null;
          if (next !== currentIndex) setCurrentIndex(next);
          return;
        }
        touchStartX.current = null;
        touchStartTime.current = null;
      }
      openOverlayNow();
    };
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      clearOpenTimer();
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [sheetOpen, chatbotOpen, currentIndex]);

  const goToPage = (index: number) => {
    if (index === currentIndex) return;
    haptic();
    const el = wrapperRef.current;
    if (el) {
      el.style.transition = "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      el.style.transform = `translateX(-${index * 100}%)`;
    }
    setCurrentIndex(index);
  };

  const handleHighlightClick = (text: string) => {
    clearPersistentHighlight();
    setSelectedText(text);
    setSheetOpen(true);
  };

  const handleOverlayClose = () => {
    clearPersistentHighlight();
    window.getSelection()?.removeAllRanges();
    setSheetOpen(false);
  };

  const getIndicator = () => (
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

  if (fetchError) {
    return (
      <div style={{ padding: "40px 24px", textAlign: "center" }}>
        <p style={{ fontSize: "17px", fontWeight: 700, marginBottom: "8px", color: "#111" }}>
          {fetchError === 403 ? "접근 권한이 없습니다" : "계약서를 불러올 수 없습니다"}
        </p>
        <p style={{ fontSize: "14px", color: "#888", marginBottom: "28px" }}>
          {fetchError === 403
            ? "본인의 계약서만 열람할 수 있습니다."
            : "잠시 후 다시 시도해주세요."}
        </p>
        <button
          onClick={() => navigate("/mycontracts")}
          style={{ padding: "12px 28px", borderRadius: "10px", border: "none", background: "#5865B9", color: "#fff", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
        >
          내 계약서 목록으로
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <span className="back-btn" onClick={() => navigate("/mycontracts")}>
          ← 이전으로 돌아가기
        </span>
      </div>

      <div
        className="carousel-viewport"
        ref={carouselViewportRef}
        onMouseDown={onMouseDown}
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
            <div style={{ width: "100%", height: "100%" }}>
              <ContractOriginalPage
                onSelect={handleHighlightClick}
                capturedImageData={contract?.image_url ?? contract?.fileUrl ?? locationState?.capturedImageData}
                ocrText={contract?.rawText ?? contract?.full_text}
                markdown={contract?.markdown}
                ocrWords={contract?.words}
              />
            </div>
          </div>
          <div className="carousel-page">
            <div style={{ width: "100%", height: "100%" }}>
              <ClauseSummaryPage onSelect={handleHighlightClick} summaryData={summaryData} />
            </div>
          </div>
          <div className="carousel-page">
            <div style={{ width: "100%", height: "100%" }}>
              <RiskAnalysisPage riskData={riskData} analysisDone={analysisDone} />
            </div>
          </div>
        </div>
      </div>

      {getIndicator()}

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
    </div>
  );
}

export default ContractViewPage;
