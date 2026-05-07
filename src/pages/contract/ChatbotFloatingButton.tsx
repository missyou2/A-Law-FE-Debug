import React, { useEffect, useRef, useState } from "react";
import ChatbotIcon from "../../assets/icons/chatbot.png";

interface Props {
  onClick: () => void;
}

const MOBILE_WIDTH = 430;

function getContainerLeft() {
  return Math.max(0, (window.innerWidth - MOBILE_WIDTH) / 2);
}

function getContainerWidth() {
  return Math.min(window.innerWidth, MOBILE_WIDTH);
}

function ChatbotFloatingButton({ onClick }: Props) {
  const [pos, setPos] = useState(() => {
    const left = getContainerLeft();
    const w = getContainerWidth();
    return {
      x: left + w - 80,
      y: window.innerHeight - 160,
    };
  });

  const offset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const isPointerDown = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      const left = getContainerLeft();
      const w = getContainerWidth();
      setPos((prev) => ({
        x: Math.min(Math.max(prev.x, left), left + w - 56),
        y: Math.min(Math.max(prev.y, 80), window.innerHeight - 120),
      }));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();

    offset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };

    isDragging.current = false;
    isPointerDown.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDown.current) return;
    e.stopPropagation();
    e.preventDefault();

    const nextX = e.clientX - offset.current.x;
    const nextY = e.clientY - offset.current.y;

    const dx = Math.abs(nextX - pos.x);
    const dy = Math.abs(nextY - pos.y);

    if (dx < 3 && dy < 3) return;

    isDragging.current = true;
    setPos({ x: nextX, y: nextY });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();

    e.currentTarget.releasePointerCapture(e.pointerId);
    isPointerDown.current = false;

    if (!isDragging.current) return;

    const containerLeft = getContainerLeft();
    const containerW = getContainerWidth();
    const screenH = window.innerHeight;
    const containerMid = containerLeft + containerW / 2;

    const snappedX =
      pos.x + 28 < containerMid
        ? containerLeft + 16
        : containerLeft + containerW - 72;

    const snappedY = Math.min(
      Math.max(pos.y, 80),
      screenH - 120
    );

    setPos({ x: snappedX, y: snappedY });
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (!isDragging.current) {
          onClick();
        }
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: 56,
        height: 56,
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
