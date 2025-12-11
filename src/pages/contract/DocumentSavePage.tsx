import React, { useState } from "react";

interface Props {
  onBack: () => void;
  onSave: () => void;  
}

function DocumentSavePage({ onBack, onSave }: Props) {
  const [title, setTitle] = useState("2024-11-표준계약서_임대");

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        background: "linear-gradient(to bottom, #ffffff 55%, #f4f6f9 100%)",
        padding: "38px 24px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <h2
        style={{
          fontSize: "24px",
          fontWeight: 700,
          lineHeight: "1.45",
          margin: 0,
        }}
      >
        이 계약서를<br />나의 문서로 저장할까요?
      </h2>

      <div
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "28px",
          marginTop: "10px",
        }}
      >
        <div>
          <label
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#444",
              marginBottom: "10px",
              display: "block"
            }}
          >
            문서 이름
          </label>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 0",
              fontSize: "15px",
              border: "none",
              borderBottom: "1px solid #ccc",
              outline: "none",
              background: "transparent"
            }}
          />
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
            gap: "8px",
            color: "#444"
          }}
        >
          <input type="checkbox" style={{ width: 16, height: 16 }} />
          중요 문서함에 추가하기
        </label>
      </div>

      {/* 저장 버튼 */}
      <button
        style={{
          width: "100%",
          padding: "11px 0",
          borderRadius: "10px",
          border: "none",
          background: "linear-gradient(90deg, #6bc7ff, #5b6bff)",
          color: "#fff",
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer"
        }}
        onClick={onSave} 
      >
        내 문서에 저장하기
      </button>

      {/* 저장하지 않기 버튼 */}
      <button
        style={{
          width: "100%",
          padding: "10px 0",
          borderRadius: "10px",
          border: "1px solid #ddd",
          background: "#ffffff",
          color: "#444",
          fontSize: "13.5px",
          cursor: "pointer"
        }}
      >
        저장하지 않고 나가기
      </button>

      <div
        style={{
          marginTop: "28px",
          fontSize: "14px",
          color: "#666",
          cursor: "pointer",
        }}
        onClick={onBack}
      >
        ← 이전으로 돌아가기
      </div>
    </div>
  );
}

export default DocumentSavePage;
