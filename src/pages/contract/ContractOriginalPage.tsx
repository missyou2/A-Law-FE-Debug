import React, { useState, useRef, useCallback, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import type { OcrWord } from '../../types/contract.js';

interface LocationState {
    capturedImageData?: string;
    taskId?: string;
    contractId?: number;
    ocrText?: string;
    ocrWords?: OcrWord[];
}

interface Props {
  onSelect: (text: string) => void;
}

const PAGE_PADDING = 18; // matches .page-container padding

/** 백엔드 OCR 텍스트는 "| HTML content |\n| --- |\n| text |" 형식의 마크다운 파이프 테이블.
 *  파이프 래퍼와 구분선을 제거하여 내부 HTML만 추출한다. */
const stripMarkdownPipes = (text: string): string =>
  text
    .split('\n')
    .filter(line => !/^\|\s*[-:]+\s*\|/.test(line))   // "| --- |" 구분선 제거
    .map(line => line.replace(/^\|\s*/, '').replace(/\s*\|$/, ''))  // 앞뒤 파이프 제거
    .join('\n');

const styles = {
    imageContainer: {
        position: 'relative' as const,
        // bleed out of page-container's 18px padding to fill full width
        marginLeft: -PAGE_PADDING,
        marginRight: -PAGE_PADDING,
        width: `calc(100% + ${PAGE_PADDING * 2}px)`,
        overflow: 'hidden',
    } as const,
    image: {
        width: '100%',
        display: 'block',
    } as const,
}

function ContractOriginalPage({ onSelect }: Props) {
  const [mode, setMode] = useState<"image" | "text">("image");
  const [debugMode, setDebugMode] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const capturedImageData = state?.capturedImageData || null;
  const ocrText = state?.ocrText?.trim() || null;
  const ocrWords = state?.ocrWords ?? [];

  const handleImageLoad = useCallback(() => {
    if (imgRef.current) {
      setImgSize({
        w: imgRef.current.clientWidth,
        h: imgRef.current.clientHeight,
      });
    }
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (imgRef.current) {
        setImgSize({
          w: imgRef.current.clientWidth,
          h: imgRef.current.clientHeight,
        });
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="page-container">

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "12px",
          marginBottom: "10px"
        }}
      >
        {mode === "image" && (
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              color: "#555",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={debugMode}
              onChange={(e) => setDebugMode(e.target.checked)}
            />
            박스 표시 (디버그)
          </label>
        )}
        <button
          className="switch-btn"
          onClick={() => setMode(mode === "image" ? "text" : "image")}
        >
          {mode === "image" ? "텍스트로 보기" : "이미지로 보기"}
        </button>
      </div>

      {mode === "image" && (
        capturedImageData ? (
          <div style={styles.imageContainer}>
            <img
              ref={imgRef}
              src={capturedImageData}
              alt="Captured Document"
              style={styles.image}
              onLoad={handleImageLoad}
            />

            {/* Word overlays */}
            {ocrWords.length > 0 && imgSize.h > 0 &&
              ocrWords.map((word, i) => {
                const fontSize = Math.max((word.height / 100) * imgSize.h * 0.85, 8);
                return (
                  <span
                    key={i}
                    style={{
                      position: "absolute",
                      left: `${word.x}%`,
                      top: `${word.y}%`,
                      width: `${word.width}%`,
                      height: `${word.height}%`,
                      fontSize,
                      color: "transparent",
                      cursor: "text",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      lineHeight: 1,
                      userSelect: "text",
                      ...(debugMode && {
                        border: "1px solid rgba(255, 0, 0, 0.5)",
                        background: "rgba(255, 255, 0, 0.1)",
                      }),
                    }}
                  >
                    {word.text}
                  </span>
                );
              })}
          </div>
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
              <div
                dangerouslySetInnerHTML={{ __html: stripMarkdownPipes(ocrText) }}
                style={{ fontSize: "13px", lineHeight: "1.7", overflowX: "auto" }}
              />
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
