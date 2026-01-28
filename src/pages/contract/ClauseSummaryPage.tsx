import React, { useState, useEffect } from "react";
import { generateSummary } from "../../services/contractApi.js";

interface Props {
  onSelect: (text: string) => void;
  contractId?: string; // 계약서 ID
}

function ClauseSummaryPage({ onSelect, contractId }: Props) {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      if (!contractId) return;

      setIsLoading(true);
      setError("");

      try {
        const result = await generateSummary(contractId);
        setSummary(result.summary_content);
      } catch (err) {
        console.error("요약 생성 실패:", err);
        setError("요약을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [contractId]);

  return (
    <div className="page-container">
      <h2 className="page-title">임대차 계약 요약</h2>
      <p className="page-caption">AI가 임대차 계약 내용을 이해하기 쉽게 요약했습니다.</p>

      {!contractId ? (
        <div className="doc-box">
          <p style={{ color: "#999", fontStyle: "italic" }}>계약서 ID가 필요합니다.</p>
        </div>
      ) : isLoading ? (
        <div className="doc-box">
          <p>요약을 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="doc-box">
          <p style={{ color: "#e74c3c" }}>{error}</p>
        </div>
      ) : summary ? (
        <div className="doc-box">
          <p>{summary}</p>
        </div>
      ) : (
        <div className="doc-box">

        <p>
          임차인은 보증금{" "}
          <span className="highlight" onClick={() => onSelect("보증금 요약")}>5천만원</span>
          과 월 차임{" "}
          <span className="highlight" onClick={() => onSelect("월세 요약")}>120만원</span>
          을 지급한다.
        </p>

        <p>
          월세를 2회 연속 연체하면 계약은{" "}
          <span className="highlight" onClick={() => onSelect("즉시 해지 가능성")}>즉시 해지</span>
          될 수 있다.
        </p>

        <p>중대한 시설 수리는 임대인, 경미한 수리는 임차인이 부담한다.</p>

        <p>
          임차인은{" "}
          <span className="highlight" onClick={() => onSelect("무단 변경 금지 요약")}>
            무단 공사·전대·용도 변경
          </span>
          을 할 수 없다.
        </p>

        <p>임대인은 방문 시 24시간 전에 통지해야 한다. (긴급 상황 제외)</p>

        <p>
          계약기간은 2년이며 관련 법령에 따른{" "}
          <span className="highlight" onClick={() => onSelect("갱신요구권 요약")}>
            계약갱신요구권
          </span>
          이 적용될 수 있다.
        </p>

        <p>
          계약 종료 시 임차인은 원상복구 후 인도해야 하고, 임대인은{" "}
          <span className="highlight" onClick={() => onSelect("보증금 반환 요약")}>
            30일 내 보증금 반환
          </span>
          을 해야 한다.
        </p>

        <p>안전사고는 과실 여부에 따라 임대인 또는 임차인이 책임진다.</p>

        <p>분쟁은 협의 후 관할 법원에서 해결한다.</p>

        </div>
      )}
    </div>
  );
}

export default ClauseSummaryPage;
