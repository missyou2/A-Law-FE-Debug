import React, { useRef, useState } from "react";
import ChatbotIcon from "../../assets/icons/chatbot.png";

interface Props {
  onClick: () => void;
}

function ChatbotFloatingButton({ onClick }: Props) {
  const [pos, setPos] = useState({
    x: window.innerWidth - 80,
    y: window.innerHeight - 160,
  });

  const offset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();

    offset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };

    isDragging.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
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

    if (!isDragging.current) return;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const snappedX =
      pos.x + 28 < screenW / 2 ? 16 : screenW - 72;

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
