import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { SummaryResultEvent } from "../../types/contract.js";
import './contractCarousel.css';

interface Props {
  onSelect: (text: string) => void;
  summaryData: SummaryResultEvent | null;
}

function ClauseSummaryPage({ onSelect: _onSelect, summaryData }: Props) {
  if (!summaryData) {
    return (
      <div className="page-container">
        <h2 className="page-title">임대차 계약 요약</h2>
        <p className="page-caption">AI가 임대차 계약 내용을 분석 중에 있습니다.</p>

        {/* 제목 스켈레톤 */}
        <div className="skeleton" style={{ height: "16px", width: "55%", marginBottom: "20px" }} />

        {/* 본문 스켈레톤 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
          {["100%", "100%", "80%", "100%", "65%"].map((w, i) => (
            <div key={i} className="skeleton" style={{ height: "13px", width: w }} />
          ))}
        </div>

        {/* 주요 용어 스켈레톤 */}
        <div className="skeleton" style={{ height: "13px", width: "20%", marginBottom: "10px" }} />
        <div style={{ display: "flex", gap: "6px" }}>
          {["60px", "80px", "50px"].map((w, i) => (
            <div key={i} className="skeleton" style={{ height: "26px", borderRadius: "99px", width: w }} />
          ))}
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
        <div style={{ fontSize: "13px", lineHeight: "1.7", color: "#333", marginBottom: "16px" }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p style={{ margin: "0 0 8px" }}>{children}</p>,
              strong: ({ children }) => <strong style={{ color: "#222" }}>{children}</strong>,
              ul: ({ children }) => <ul style={{ paddingLeft: "18px", margin: "4px 0 8px" }}>{children}</ul>,
              ol: ({ children }) => <ol style={{ paddingLeft: "18px", margin: "4px 0 8px" }}>{children}</ol>,
              li: ({ children }) => <li style={{ marginBottom: "4px" }}>{children}</li>,
            }}
          >
            {summaryText}
          </ReactMarkdown>
        </div>

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
