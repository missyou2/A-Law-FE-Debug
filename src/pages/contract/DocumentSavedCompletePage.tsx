import React from "react";

interface Props {
  onBackHome: () => void;
}

export default function DocumentSavedCompletePage({ onBackHome }: Props) {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        background: "linear-gradient(to bottom, #ffffff 60%, #f3f4f7)",
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      <h2 style={{ fontSize: "24px", fontWeight: 700, marginTop: "80px" }}>
        저장 완료!
      </h2>

      <p style={{ fontSize: "15px", color: "#666", marginTop: "12px" }}>
        문서가 성공적으로 저장되었습니다.
      </p>

      <button
        className="button-press"
        style={{
          width: "100%",
          padding: "14px 0",
          borderRadius: "12px",
          marginTop: "50px",
          border: "none",
          background: "linear-gradient(to right, #6bc7ff, #5b6bff)",
          color: "white",
          fontSize: "15px",
          fontWeight: 600,
        }}
        onClick={onBackHome}
      >
        홈으로 돌아가기
      </button>
    </div>
  );
}
