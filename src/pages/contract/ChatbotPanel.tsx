import React, { useEffect, useRef, useState } from "react";
import { sendChatMessageSSE } from "../../api/chatApi.js";
import type { ChatMessage } from "../../api/chatApi.js";

interface Props {
  onClose: () => void;
  initialQuestion?: string;
  contractId?: string; // 계약서 ID
}

interface Message {
  role: "user" | "bot";
  text: string;
  typing: boolean | undefined;
}

const STORAGE_KEY = "contract_chat_history_v2";

function ChatbotPanel({ onClose, initialQuestion, contractId }: Props) {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved
      ? JSON.parse(saved)
      : [
          {
            role: "bot",
            text: "안녕하세요! 계약서를 이해하기 쉽게 도와드릴게요 🙂",
            typing: undefined
          }
        ];
  });

  const [input, setInput] = useState("");
  const [panelVisible, setPanelVisible] = useState(false);
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const abortRef = useRef<AbortController | null>(null);

  // 컴포넌트 언마운트 시 진행 중인 스트림 중단
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const send = (text: string) => {
    if (!text.trim()) return;

    // 이전 스트림이 있으면 중단
    abortRef.current?.abort();

    setMessages(prev => [
      ...prev,
      { role: "user", text, typing: undefined },
      { role: "bot", text: "", typing: true }
    ]);

    setInput("");

    if (!contractId) {
      setTimeout(() => {
        setMessages(prev => {
          const filtered = prev.filter(m => !m.typing);
          return [...filtered, {
            role: "bot",
            text: "계약서 ID가 필요합니다. 계약서를 먼저 업로드해주세요.",
            typing: undefined
          }];
        });
      }, 500);
      return;
    }

    // 대화 히스토리를 ChatMessage 형식으로 변환
    const history: ChatMessage[] = messages
      .filter(m => !m.typing)
      .map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text
      }));

    // SSE 스트리밍 호출
    abortRef.current = sendChatMessageSSE(contractId, text, history, {
      onChunk: (chunk) => {
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.typing) {
            last.text += chunk;
          }
          return updated;
        });
      },
      onDone: () => {
        setMessages(prev =>
          prev.map(m => m.typing ? { ...m, typing: undefined } : m)
        );
        abortRef.current = null;
      },
      onError: (error) => {
        console.error("챗봇 응답 실패:", error);
        setMessages(prev => {
          const filtered = prev.filter(m => !m.typing);
          return [...filtered, {
            role: "bot",
            text: "죄송합니다. 응답을 생성하는데 실패했습니다. 다시 시도해주세요.",
            typing: undefined
          }];
        });
        abortRef.current = null;
      },
    });
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
        alignItems: "flex-end"
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%",
          height: "70%",
          background: "#FAFAF9",
          borderRadius: "20px 20px 0 0",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          transform: panelVisible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s ease-out"
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 4 }}>
          AI 계약 도우미
        </div>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
          ※ UI 시연용 챗봇 (추후 LLM 연동 예정)
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 8
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
            "임차인에게 불리한 조항은?"
          ].map(q => (
            <button
              key={q}
              onClick={() => send(q)}
              style={{
                flex: 1,
                fontSize: 12,
                padding: "6px 8px",
                borderRadius: 10,
                border: "1px solid #ccc",
                background: "#fff"
              }}
            >
              {q}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="질문을 입력하세요"
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid #d1d5db",
              fontSize: 13
            }}
          />
          <button
            onClick={() => send(input)}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "none",
              background: "#111",
              color: "#fff",
              fontSize: 13
            }}
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
}

// chatbubble & delay
function ChatBubble({
  role,
  text,
  typing
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
        transition: "all 0.25s ease-out"
      }}
    >
      {text}
    </div>
  );
}

export default ChatbotPanel;
