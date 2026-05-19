import React, { useEffect, useRef, useState } from "react";
import ChatbotIcon from "../../assets/icons/chatbot.png";

interface Props {
  onClick: () => void;
}

const MOBILE_WIDTH = 430;
const BTN_SIZE = 56;
const SNAP_MARGIN = 16;
const Y_MIN = 80;
const Y_MARGIN = 16;

function getContainerRect(w = window.innerWidth, h = window.innerHeight) {
  const left = Math.max(0, (w - MOBILE_WIDTH) / 2);
  const width = Math.min(w, MOBILE_WIDTH);
  return { left, width, height: h };
}

type Side = "left" | "right";

function ChatbotFloatingButton({ onClick }: Props) {
  // Stable state: which edge + proportional Y
  const [side, setSide] = useState<Side>("right");
  const [relY, setRelY] = useState(() => (window.innerHeight - 160) / window.innerHeight);

  // Window size state drives re-render on resize
  const [winSize, setWinSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  // Temporary absolute position during drag (null = use snapped position)
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);

  const offsetRef = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const isPointerDown = useRef(false);

  useEffect(() => {
    const onResize = () => setWinSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Compute snapped absolute position from relative state
  const getSnappedPos = (s: Side, ry: number, w: number, h: number) => {
    const { left, width } = getContainerRect(w, h);
    const absY = Math.min(Math.max(ry * h, Y_MIN), h - BTN_SIZE - Y_MARGIN);
    const absX = s === "right"
      ? left + width - BTN_SIZE - SNAP_MARGIN
      : left + SNAP_MARGIN;
    return { x: absX, y: absY };
  };

  const pos = dragPos ?? getSnappedPos(side, relY, winSize.w, winSize.h);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    offsetRef.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    isDragging.current = false;
    isPointerDown.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDown.current) return;
    e.stopPropagation();
    e.preventDefault();

    const nextX = e.clientX - offsetRef.current.x;
    const nextY = e.clientY - offsetRef.current.y;

    if (!isDragging.current) {
      const dx = Math.abs(nextX - pos.x);
      const dy = Math.abs(nextY - pos.y);
      if (dx < 3 && dy < 3) return;
      isDragging.current = true;
    }

    setDragPos({ x: nextX, y: nextY });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.releasePointerCapture(e.pointerId);
    isPointerDown.current = false;

    if (!isDragging.current) {
      setDragPos(null);
      return;
    }

    const w = window.innerWidth;
    const h = window.innerHeight;
    const { left, width } = getContainerRect(w, h);
    const containerMid = left + width / 2;

    const newSide: Side = pos.x + BTN_SIZE / 2 < containerMid ? "left" : "right";
    const newRelY = Math.min(Math.max(pos.y / h, Y_MIN / h), (h - BTN_SIZE - Y_MARGIN) / h);

    setSide(newSide);
    setRelY(newRelY);
    setDragPos(null);
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (!isDragging.current) onClick();
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: BTN_SIZE,
        height: BTN_SIZE,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #21D8FC, #5865B9)",
        boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        zIndex: 9999,
        userSelect: "none",
        touchAction: "none",
      }}
    >
      <img src={ChatbotIcon} alt="chatbot" style={{ width: 32, height: 32 }} />
    </div>
  );
}

export default ChatbotFloatingButton;
