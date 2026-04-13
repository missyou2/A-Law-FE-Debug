import type { SummaryResultEvent } from "../../types/contract.js";

interface Props {
  onSelect: (text: string) => void;
  summaryData: SummaryResultEvent | null;
}

function ClauseSummaryPage({ onSelect: _onSelect, summaryData }: Props) {
  if (!summaryData) {
    return (
      <div className="page-container">
        <h2 className="page-title">임대차 계약 요약</h2>
        <p className="page-caption">AI가 임대차 계약 내용을 이해하기 쉽게 요약했습니다.</p>
        <div className="doc-box ai-content-fadein">
          <p style={{ color: "#999", fontStyle: "italic" }}>분석 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  const { title, summaryText, keyTerms } = summaryData;

  return (
    <div className="page-container">
      <h2 className="page-title">임대차 계약 요약</h2>
      <p className="page-caption">AI가 임대차 계약 내용을 이해하기 쉽게 요약했습니다.</p>

      <div className="doc-box ai-content-fadein">
        {/* 계약 제목 */}
        <p style={{ fontWeight: 600, marginBottom: "12px" }}>{title}</p>

        {/* 요약 본문 */}
        <p style={{ fontSize: "13px", lineHeight: "1.7", color: "#333", marginBottom: "16px" }}>
          {summaryText}
        </p>

        {/* 주요 용어 */}
        {keyTerms.length > 0 && (
          <>
            <p style={{ fontWeight: 600, fontSize: "13px", color: "#555", marginBottom: "8px" }}>주요 용어</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {keyTerms.map((term, idx) => (
                <span key={idx} style={{
                  padding: "4px 10px",
                  borderRadius: "99px",
                  background: "#f0f0f0",
                  fontSize: "12px",
                  color: "#444",
                }}>
                  {term}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ClauseSummaryPage;
