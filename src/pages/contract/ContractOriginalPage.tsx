import React, { useState } from "react";

interface Props {
  onSelect: (text: string) => void;
}

function ContractOriginalPage({ onSelect }: Props) {
  const [mode, setMode] = useState<"image" | "text">("image");

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
          (샘플 이미지 영역)
        </div>
      )}

      {mode === "text" && (
        <>
          <h2 className="page-title">임대차 계약서 원문</h2>
          <p className="page-caption">OCR로 추출된 임대차 본문입니다.</p>

          <div className="doc-box">
            <p>
              임차인은 본 계약 체결과 동시에 임대인에게 보증금{" "}
              <span className="highlight" onClick={() => onSelect("보증금 5천만원 조항")}>
                50,000,000원
              </span>
              을 지급하며, 임대인은 이를 수령함과 동시에 목적물에 대한 사용·수익 권한을 임차인에게 부여한다.
            </p>

            <p>
              임차인은 매월 1일에 월 차임{" "}
              <span className="highlight" onClick={() => onSelect("월 차임 120만원 조항")}>
                1,200,000원
              </span>
              을 지급하여야 하며, 2회 연속 연체 시 임대인은 별도의 최고 없이 계약을 해지할 수 있다.
            </p>

            <p>
              주요 설비의 중대한 하자 수리 책임은{" "}
              <span className="highlight" onClick={() => onSelect("임대인 수리 책임")}>
                임대인
              </span>{" "}
              에게 있으며, 임차인의 고의 또는 과실 파손은 임차인이 부담한다.
            </p>

            <p>
              임차인은{" "}
              <span className="highlight" onClick={() => onSelect("무단 용도 변경·전대 금지")}>
                임대인의 동의 없이 용도 변경·전대·무단 공사
              </span>
              등을 할 수 없다.
            </p>

            <p>
              임대인은 방문 시{" "}
              <span className="highlight" onClick={() => onSelect("임대인 방문 사전 통지")}>
                24시간 전 사전 통지
              </span>
              를 해야 한다.
            </p>

            <p>
              계약기간은 2025년 3월 1일부터 2027년 2월 28일까지이다. 관련 법령에 의한{" "}
              <span className="highlight" onClick={() => onSelect("계약갱신요구권")}>
                계약갱신요구권
              </span>
              은 적용된다.
            </p>

            <p>
              계약 종료 후 임대인은 반환일로부터{" "}
              <span className="highlight" onClick={() => onSelect("보증금 반환 기한 30일")}>
                30일 이내
              </span>
              보증금을 반환해야 한다.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default ContractOriginalPage;
