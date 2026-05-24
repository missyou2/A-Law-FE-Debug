import React, { useEffect, useRef, useState } from "react";
import { sendChatMessage } from "../../api/chatApi.js";

interface Props {
  onClose: () => void;
  initialQuestion?: string;
  contractId?: string;
}

interface Message {
  role: "user" | "bot";
  text: string;
  typing: boolean | undefined;
}

const STORAGE_KEY = "contract_chat_history_v2";
const SESSION_STORAGE_KEY = "contract_chat_session_id";

function ChatbotPanel({ onClose, initialQuestion }: Props) {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved
      ? JSON.parse(saved)
      : [{ role: "bot", text: "안녕하세요! 계약서를 이해하기 쉽게 도와드릴게요 🙂", typing: undefined }];
  });

  const [sessionId, setSessionId] = useState<string | null>(() =>
    localStorage.getItem(SESSION_STORAGE_KEY)
  );

  const [input, setInput] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  // 열기 애니메이션: double RAF로 초기 렌더와 트랜지션 분리
  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setIsVisible(true))
    );
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (initialQuestion) send(initialQuestion);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (sessionId) localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Prevent background scroll on iOS when panel is open.
  // Backdrop covers inset:0, so we block touchmove there.
  // When the touch is inside the messages list we allow it so messages can scroll.
  useEffect(() => {
    const backdrop = backdropRef.current;
    if (!backdrop) return;
    const prevent = (e: TouchEvent) => {
      if (messagesRef.current?.contains(e.target as Node)) return;
      e.preventDefault();
    };
    backdrop.addEventListener("touchmove", prevent, { passive: false });
    return () => backdrop.removeEventListener("touchmove", prevent);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 340);
  };

  const send = async (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText || isSending) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: trimmedText, typing: undefined },
      { role: "bot", text: "답변을 생성하는 중입니다...", typing: true },
    ]);
    setInput("");
    setIsSending(true);

    try {
      const result = await sendChatMessage(trimmedText, sessionId);
      setSessionId(result.session_id);
      setMessages((prev) => [
        ...prev.filter((m) => !m.typing),
        { role: "bot", text: result.answer, typing: undefined },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev.filter((m) => !m.typing),
        { role: "bot", text: "죄송합니다. 응답을 생성하는데 실패했습니다. 다시 시도해주세요.", typing: undefined },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const open = isVisible && !isClosing;

  return (
    <div
      ref={backdropRef}
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 40,
        display: "flex",
        alignItems: "flex-end",
        // 백드롭 페이드
        opacity: open ? 1 : 0,
        transition: isClosing
          ? "opacity 0.32s ease"
          : "opacity 0.3s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          height: "75%",
          background: "#FAFAF9",
          borderRadius: "24px 24px 0 0",
          padding: "0 16px 16px",
          display: "flex",
          flexDirection: "column",
          // 열기: 스프링 슬라이드업 / 닫기: 빠른 슬라이드다운
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: isClosing
            ? "transform 0.32s cubic-bezier(0.4, 0, 1, 1)"
            : "transform 0.52s cubic-bezier(0.32, 0.72, 0, 1)",
          willChange: "transform",
        }}
      >
        {/* 드래그 핸들 */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "12px 0 8px",
            cursor: "pointer",
            flexShrink: 0,
          }}
          onClick={handleClose}
        >
          <div style={{
            width: 36,
            height: 4,
            background: "#d1d5db",
            borderRadius: 99,
          }} />
        </div>

        {/* 헤더 */}
        <div style={{ paddingBottom: 10, borderBottom: "1px solid #f0f0f0", flexShrink: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>AI 계약 도우미</div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
            계약서 내용을 바탕으로 궁금한 점을 질문해보세요.
          </div>
        </div>

        {/* 메시지 목록 */}
        <div ref={messagesRef} style={{ flex: 1, overflowY: "auto", overscrollBehavior: "contain", display: "flex", flexDirection: "column", gap: 8, paddingTop: 12 }}>
          {messages.map((m, i) => (
            <ChatBubble key={i} role={m.role} text={m.text} typing={m.typing} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 추천 질문 */}
        <div style={{ display: "flex", gap: 6, margin: "10px 0 8px" }}>
          {["이 계약서 위험한가요?", "보증금 돌려받을 수 있나요?", "불리한 조항은?"].map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              disabled={isSending}
              style={{
                flex: 1,
                fontSize: 11,
                padding: "7px 6px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                background: "#fff",
                color: "#374151",
                fontWeight: 600,
                cursor: "pointer",
                opacity: isSending ? 0.5 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* 입력 영역 */}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(input); }}
            disabled={isSending}
            placeholder="질문을 입력하세요"
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 14,
              border: "1.5px solid #e5e7eb",
              fontSize: 13,
              background: "#fff",
              outline: "none",
            }}
          />
          <button
            onClick={() => send(input)}
            disabled={isSending}
            style={{
              padding: "10px 16px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #5865B9, #21D8FC)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              opacity: isSending ? 0.6 : 1,
              transition: "opacity 0.15s",
            }}
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ role, text, typing }: { role: "user" | "bot"; text: string; typing: boolean | undefined }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      style={{
        alignSelf: role === "user" ? "flex-end" : "flex-start",
        background: role === "user" ? "linear-gradient(135deg, #5865B9, #7B86D4)" : "#f0f0f0",
        color: role === "user" ? "#fff" : "#111",
        padding: "9px 14px",
        borderRadius: role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        maxWidth: "80%",
        fontSize: 13,
        lineHeight: 1.5,
        fontStyle: typing ? "italic" : "normal",
        opacity: visible ? (typing ? 0.6 : 1) : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
        boxShadow: role === "user" ? "0 2px 8px rgba(88,101,185,0.25)" : "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {text}
    </div>
  );
}

export default ChatbotPanel;
