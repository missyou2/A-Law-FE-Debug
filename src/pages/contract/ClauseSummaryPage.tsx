import { useState, useEffect } from "react";
import { generateSummary } from "../../api/contractApi.js";

interface Props {
  onSelect: (text: string) => void;
  contractId?: string; // 계약서 ID
}

function ClauseSummaryPage({ onSelect: _onSelect, contractId }: Props) {
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
        <div className="doc-box ai-content-fadein">
          <p style={{ color: "#999", fontStyle: "italic" }}>계약서 ID가 필요합니다.</p>
        </div>
      ) : isLoading ? (
        <div className="ai-loading-container">
          <div className="ai-loading-icon">🔍</div>
          <p className="ai-loading-text">AI가 계약서를 요약하고 있어요</p>
          <p className="ai-loading-subtext">핵심 조항을 분석하는 중입니다...</p>
          <div className="ai-loading-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      ) : error ? (
        <div className="doc-box ai-content-fadein">
          <p style={{ color: "#e74c3c" }}>{error}</p>
        </div>
      ) : summary ? (
        <div className="doc-box ai-content-fadein">
          <p>{summary}</p>
        </div>
      ) : null}
    </div>
  );
}

export default ClauseSummaryPage;
