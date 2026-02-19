import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./contractCarousel.css";
import ContractOriginalPage from "./ContractOriginalPage.js";
import ClauseSummaryPage from "./ClauseSummaryPage.js";
import RiskAnalysisPage from "./RiskAnalysisPage.js";
import ContractOverlay from "../../components/ContractOverlay.js";

import ChatbotFloatingButton from "./ChatbotFloatingButton.js";
import ChatbotPanel from "./ChatbotPanel.js";

const pages = [
  { id: 0, label: "원문 보기" },
  { id: 1, label: "요약 보기" },
  { id: 2, label: "안전 분석" }
];

function ContractCarousel() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [chatbotOpen, setChatbotOpen] = useState(false);

  // TODO: 실제 계약서 ID를 URL 파라미터나 상태로부터 가져오기
  // 예: const { contractId } = useParams();
  const contractId = "contract_123"; // 임시 하드코딩

  const touchStartX = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 390;

  const carouselViewportRef = useRef<HTMLDivElement | null>(null);

  const haptic = () => {
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const isTextSelectingRef = useRef(false);
  const selectingRef = useRef(false);
  const openTimerRef = useRef<number | null>(null);

  const selectionStartRangeRef = useRef<Range | null>(null);

  const persistMarkAttr = "data-persist-highlight";
  const persistIdRef = useRef(0);

  const clearOpenTimer = () => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  };

  const isInSelectableTextArea = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return !!target.closest(".doc-box");
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
      return;
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
    const root = carouselViewportRef.current;
    if (!root) return;

    const marks = root.querySelectorAll(`span[${persistMarkAttr}="1"]`);
    marks.forEach((span) => {
      const parent = span.parentNode;
      if (!parent) return;

      const textNode = document.createTextNode(span.textContent || "");
      parent.replaceChild(textNode, span);
      parent.normalize();
    });
  };

  const applyPersistentHighlightFromSelection = () => {
    const sel = window.getSelection();
    if (!sel) return null;
    if (!selectionIsInsideViewport(sel)) return null;
    if (sel.rangeCount === 0) return null;

    const range = sel.getRangeAt(0);
    const text = sel.toString().trim();
    if (text.length < 2) return null;

    clearPersistentHighlight();

    // 하이라이트를 위한 CSS 클래스 기반 접근
    const markId = `mark-${++persistIdRef.current}`;

    try {
      // 선택 영역을 개별 텍스트 노드 범위로 분할
      const startContainer = range.startContainer;
      const endContainer = range.endContainer;

      if (startContainer === endContainer && startContainer.nodeType === 3) {
        // 단순한 경우: 같은 텍스트 노드 내
        const span = document.createElement("span");
        span.setAttribute(persistMarkAttr, "1");
        span.setAttribute("data-id", markId);
        span.style.background = "#FFE066";
        span.style.borderRadius = "4px";
        span.style.padding = "0 3px";
        span.style.display = "inline";

        const clonedRange = range.cloneRange();
        clonedRange.surroundContents(span);
      } else {
        // 복잡한 경우: 여러 노드에 걸침
        // 각 텍스트 노드에 개별적으로 span 적용
        const treeWalker = document.createTreeWalker(
          range.commonAncestorContainer,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) => {
              if (range.intersectsNode(node)) {
                return NodeFilter.FILTER_ACCEPT;
              }
              return NodeFilter.FILTER_REJECT;
            }
          }
        );

        const textNodes: Text[] = [];
        let currentNode;
        while ((currentNode = treeWalker.nextNode())) {
          textNodes.push(currentNode as Text);
        }

        textNodes.forEach((textNode, index) => {
          const nodeRange = document.createRange();
          nodeRange.selectNodeContents(textNode);

          // 시작 노드
          if (textNode === startContainer) {
            nodeRange.setStart(startContainer, range.startOffset);
          }
          // 끝 노드
          if (textNode === endContainer) {
            nodeRange.setEnd(endContainer, range.endOffset);
          }

          const span = document.createElement("span");
          span.setAttribute(persistMarkAttr, "1");
          span.setAttribute("data-id", `${markId}-${index}`);
          span.style.background = "#FFE066";
          span.style.borderRadius = "4px";
          span.style.padding = "0 3px";
          span.style.display = "inline";

          try {
            nodeRange.surroundContents(span);
          } catch (e) {
            console.warn("Failed to surround node:", e);
          }
        });
      }
    } catch (err) {
      console.warn("highlight failed:", err);
      return null;
    }

    sel.removeAllRanges();
    return text;
  };

  const getSelectionTextIfInsideViewport = () => {
    if (sheetOpen) return null;
    if (chatbotOpen) return null;
    if (!carouselViewportRef.current) return null;

    const sel = window.getSelection();
    if (!sel) return null;
    if (!selectionIsInsideViewport(sel)) return null;

    const text = sel.toString().trim();
    if (text.length < 2) return null;

    return text;
  };

  const openOverlayNow = () => {
    if (Math.abs(dragOffset) > 3) return;
    if (sheetOpen) return;
    if (chatbotOpen) return;

    const fixedText = applyPersistentHighlightFromSelection();
    const picked = fixedText ?? getSelectionTextIfInsideViewport();
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
    isTextSelectingRef.current = inText;

    if (inText) {
      selectingRef.current = true;
      clearOpenTimer();

      touchStartX.current = null;
      touchStartTime.current = null;
      setDragOffset(0);

      const touch =
        e.touches && e.touches.length > 0
          ? e.touches[0]
          : e.changedTouches && e.changedTouches.length > 0
          ? e.changedTouches[0]
          : null;

      if (!touch) return;

      const startRange = getCaretRangeFromPoint(touch.clientX, touch.clientY);
      selectionStartRangeRef.current = startRange;

      return;
    }

    touchStartX.current = e.touches[0]!.clientX;
    touchStartTime.current = Date.now();
    setDragOffset(0);
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isTextSelectingRef.current && selectingRef.current) {
      e.preventDefault();

      const start = selectionStartRangeRef.current;
      if (!start) return;

      const touch =
        e.touches && e.touches.length > 0
          ? e.touches[0]
          : e.changedTouches && e.changedTouches.length > 0
          ? e.changedTouches[0]
          : null;

      if (!touch) return;

      const end = getCaretRangeFromPoint(touch.clientX, touch.clientY);
      if (!end) return;

      setSelectionRange(start, end);
      return;
    }

    if (touchStartX.current === null) return;
    const delta = e.touches[0]!.clientX - touchStartX.current;
    let adjusted = delta;

    if (currentIndex === 0 && delta > 0) adjusted = delta * 0.35;
    else if (currentIndex === pages.length - 1 && delta < 0) adjusted = delta * 0.35;

    setDragOffset(adjusted);
  };

  const onTouchEnd = () => {
    if (isTextSelectingRef.current) {
      isTextSelectingRef.current = false;
      selectingRef.current = false;
      selectionStartRangeRef.current = null;
      setDragOffset(0);

      scheduleOpenOverlay(250);
      return;
    }

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
    clearPersistentHighlight();
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

  useEffect(() => {
    const onMouseUp = () => openOverlayNow();
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      clearOpenTimer();
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [sheetOpen, chatbotOpen, dragOffset]);

  const handleOverlayClose = () => {
    clearPersistentHighlight();
    const sel = window.getSelection();
    sel?.removeAllRanges();
    setSheetOpen(false);
  };

  return (
    <div className="container">
      <div className="" />

      <div className="header">
        <span className="back-btn" onClick={() => navigate("/")}>
          ← 이전으로 돌아가기
        </span>

        <span
          className="button-press"
          style={{ fontSize: 15, color: "#111", cursor: "pointer" }}
          onClick={() => {
            haptic();
            navigate("/contract/save");
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
              <ClauseSummaryPage onSelect={handleHighlightClick} contractId={contractId} />
            </div>
          </div>

          <div className="carousel-page">
            <div style={pageStyle(2)}>
              <RiskAnalysisPage contractId={contractId} />
            </div>
          </div>
        </div>
      </div>

      {getIndicator()}

      {sheetOpen && (
        <ContractOverlay
          selectedText={selectedText}
          onClose={handleOverlayClose}
          contractId={contractId}
        />
      )}

      {!chatbotOpen && (
        <ChatbotFloatingButton onClick={() => setChatbotOpen(true)} />
      )}

      {chatbotOpen && (
        <ChatbotPanel onClose={() => setChatbotOpen(false)} contractId={contractId} />
      )}
    </div>
  );
}

export default ContractCarousel;
