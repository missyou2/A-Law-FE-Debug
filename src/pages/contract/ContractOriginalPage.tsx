import React, { useState } from "react";
import { useLocation } from 'react-router-dom';

interface LocationState {
    capturedImageData?: string;
    taskId?: string;
    contractId?: number;
    ocrText?: string;
}

interface Props {
  onSelect: (text: string) => void;
}

const styles = {
    imageContainer: {
        width: '100%',
        maxWidth: '600px',
        border: '3px solid #007bff',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
        marginTop: '20px'
    } as const,
    image: {
        width: '100%',
        align: '0 auto',
        display: 'block',
    } as const,
}

function ContractOriginalPage({ onSelect }: Props) {
  const [mode, setMode] = useState<"image" | "text">("image");

  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const capturedImageData = state?.capturedImageData || null;
  const ocrText = state?.ocrText || null;

  return (
    <div className="page-container">

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "10px"
        }}
      >
        <button
          className="switch-btn"
          onClick={() => setMode(mode === "image" ? "text" : "image")}
        >
          {mode === "image" ? "텍스트로 보기" : "이미지로 보기"}
        </button>
      </div>

      {mode === "image" && (
    // capturedImageData가 존재하면 실제 이미지와 완료 메시지를 표시
    capturedImageData ? (
        <>
            <div style={styles.imageContainer}>
                <img
                    src={capturedImageData}
                    alt="Captured Document"
                    style={styles.image}
                />
            </div>
        </>
    ) : (
        <div
            style={{
                width: "100%",
                height: "480px",
                borderRadius: "14px",
                background: "#e1e1e1",
                border: "1px solid #ccc",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#777",
                fontSize: "15px",
                userSelect: "none"
            }}
        >
            (이미지 캡쳐 대기 또는 안내 메시지 영역)
        </div>
    )
)}

      {mode === "text" && (
        <>
          <h2 className="page-title">계약서 원문</h2>
          <p className="page-caption">OCR로 추출된 계약서 본문입니다.</p>

          <div className="doc-box">
            {ocrText ? (
              ocrText
                .split("\n\n")
                .map((paragraph: string, i: number) => (
                  <p
                    key={i}
                    onClick={() => onSelect(paragraph)}
                    style={{ cursor: "pointer" }}
                  >
                    {paragraph}
                  </p>
                ))
            ) : (
              <p style={{ color: "#999" }}>OCR 결과가 없습니다.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ContractOriginalPage;
