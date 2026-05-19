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
      : [
          {
            role: "bot",
            text: "안녕하세요! 계약서를 이해하기 쉽게 도와드릴게요 🙂",
            typing: undefined,
          },
        ];
  });

  const [sessionId, setSessionId] = useState<string | null>(() => {
    return localStorage.getItem(SESSION_STORAGE_KEY);
  });

  const [input, setInput] = useState("");
  const [panelVisible, setPanelVisible] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => setPanelVisible(true));
  }, []);

  useEffect(() => {
    if (initialQuestion) {
      send(initialQuestion);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.typing);
        return [
          ...filtered,
          {
            role: "bot",
            text: result.answer,
            typing: undefined,
          },
        ];
      });
    } catch (error) {
      console.error("챗봇 응답 실패:", error);

      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.typing);
        return [
          ...filtered,
          {
            role: "bot",
            text: "죄송합니다. 응답을 생성하는데 실패했습니다. 다시 시도해주세요.",
            typing: undefined,
          },
        ];
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        zIndex: 40,
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          height: "70%",
          background: "#FAFAF9",
          borderRadius: "20px 20px 0 0",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          transform: panelVisible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s ease-out",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 4 }}>
          AI 계약 도우미
        </div>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
          계약서 내용을 바탕으로 궁금한 점을 질문해보세요.
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {messages.map((m, i) => (
            <ChatBubble
              key={i}
              role={m.role}
              text={m.text}
              typing={m.typing}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ display: "flex", gap: 6, margin: "10px 0" }}>
          {[
            "이 계약서 위험한가요?",
            "보증금 돌려받을 수 있나요?",
            "임차인에게 불리한 조항은?",
          ].map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              disabled={isSending}
              style={{
                flex: 1,
                fontSize: 12,
                padding: "6px 8px",
                borderRadius: 10,
                border: "1px solid #ccc",
                background: "#fff",
                opacity: isSending ? 0.6 : 1,
              }}
            >
              {q}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                send(input);
              }
            }}
            disabled={isSending}
            placeholder="질문을 입력하세요"
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid #d1d5db",
              fontSize: 13,
            }}
          />
          <button
            onClick={() => send(input)}
            disabled={isSending}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "none",
              background: "#111",
              color: "#fff",
              fontSize: 13,
              opacity: isSending ? 0.6 : 1,
            }}
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({
  role,
  text,
  typing,
}: {
  role: "user" | "bot";
  text: string;
  typing: boolean | undefined;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      style={{
        alignSelf: role === "user" ? "flex-end" : "flex-start",
        background: role === "user" ? "#5865B9" : "#e5e7eb",
        color: role === "user" ? "#fff" : "#111",
        padding: "8px 12px",
        borderRadius: 14,
        maxWidth: "80%",
        fontSize: 13,
        fontStyle: typing ? "italic" : "normal",
        opacity: typing ? 0.6 : 1,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        transition: "all 0.25s ease-out",
      }}
    >
      {text}
    </div>
  );
}

export default ChatbotPanel;