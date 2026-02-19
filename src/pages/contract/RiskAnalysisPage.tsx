import { useState, useEffect } from "react";
import { getRiskAnalysis } from "../../api/contractApi.js";
import type { ContractRiskResponse, RiskItem, RiskLevel, ContractRiskLevel } from "../../types/contract.js";

interface Props {
  contractId?: string;
}

/** severity → 등급/색상 매핑 */
const getSeverityStyle = (severity: RiskLevel) => {
  switch (severity) {
    case "HIGH":
      return { label: "위험", color: "#e74c3c", bg: "#fdecea", border: "#f0d0d0" };
    case "MEDIUM":
      return { label: "주의", color: "#f39c12", bg: "#fef9e7", border: "#f5e6c8" };
    case "LOW":
      return { label: "안전", color: "#27ae60", bg: "#eafaf1", border: "#c8e6d0" };
  }
};

/** risk_level → 전체 등급 매핑 */
const getRiskLevelStyle = (level: ContractRiskLevel) => {
  switch (level) {
    case "DANGER":
      return { label: "위험", color: "#e74c3c", bg: "#fdecea" };
    case "CAUTION":
      return { label: "주의", color: "#f39c12", bg: "#fef9e7" };
    case "SAFE":
      return { label: "안전", color: "#27ae60", bg: "#eafaf1" };
  }
};

function RiskAnalysisPage({ contractId }: Props) {
  const [riskData, setRiskData] = useState<ContractRiskResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [expandedSet, setExpandedSet] = useState<Set<number>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchRiskAnalysis = async () => {
      if (!contractId) return;

      setIsLoading(true);
      setError("");

      try {
        const result = await getRiskAnalysis(contractId);
        setRiskData(result);
      } catch (err) {
        console.error("위험 분석 실패:", err);
        setError("위험 분석을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRiskAnalysis();
  }, [contractId]);

  const handleToggle = (idx: number) => {
    setExpandedSet(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  if (initialLoading) {
    return (
      <div className="page-container">
        <h2 className="page-title">위험 요소 분석</h2>
        <p className="page-caption">임대차 계약에서 분쟁 가능성이 있는 부분을 분석했습니다.</p>
        <div className="ai-loading-container">
          <div className="ai-loading-icon">🛡️</div>
          <p className="ai-loading-text">AI가 위험 요소를 분석하고 있어요</p>
          <p className="ai-loading-subtext">분쟁 가능성이 있는 조항을 검토하는 중입니다...</p>
          <div className="ai-loading-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page-container">
        <h2 className="page-title">위험 요소 분석</h2>
        <p className="page-caption">임대차 계약에서 분쟁 가능성이 있는 부분을 분석했습니다.</p>
        <div className="doc-box">
          <p>위험 분석을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <h2 className="page-title">위험 요소 분석</h2>
        <p className="page-caption">임대차 계약에서 분쟁 가능성이 있는 부분을 분석했습니다.</p>
        <div className="doc-box ai-content-fadein">
          <p style={{ color: "#e74c3c" }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!riskData) {
    return (
      <div className="page-container">
        <h2 className="page-title">위험 요소 분석</h2>
        <p className="page-caption">임대차 계약에서 분쟁 가능성이 있는 부분을 분석했습니다.</p>
        <div className="doc-box ai-content-fadein">
          <p style={{ color: "#999", fontStyle: "italic" }}>데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  const level = getRiskLevelStyle(riskData.risk_level);
  const dangerCount = riskData.risk_items.filter(item => item.severity !== "LOW").length;

  return (
    <div className="page-container">
      <h2 className="page-title">위험 요소 분석</h2>
      <p className="page-caption">임대차 계약에서 분쟁 가능성이 있는 부분을 분석했습니다.</p>

      {/* 위험도 점수 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 18px",
        borderRadius: "12px",
        background: level.bg,
        marginBottom: "16px",
      }}>
        <span style={{
          fontSize: "28px",
          fontWeight: 700,
          color: level.color,
        }}>
          {riskData.total_risk_score}
        </span>
        <div>
          <span style={{
            display: "inline-block",
            padding: "2px 10px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 600,
            color: "#fff",
            background: level.color,
          }}>
            {level.label}
          </span>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#555" }}>
            총 {dangerCount}개의 위험 조항이 발견되었습니다.
          </p>
        </div>
      </div>

      {/* 조항 목록 */}
      <div className="doc-box">
        {riskData.risk_items.map((item: RiskItem, idx: number) => {
          const style = getSeverityStyle(item.severity);
          const isExpanded = expandedSet.has(idx);

          return (
            <div
              key={idx}
              onClick={() => handleToggle(idx)}
              style={{
                padding: "14px",
                marginBottom: idx < riskData.risk_items.length - 1 ? "10px" : 0,
                border: `1px solid ${style.border}`,
                borderRadius: "10px",
                background: style.bg,
                cursor: "pointer",
              }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <span style={{ fontSize: "14px", fontWeight: 600, flex: 1 }}>
                  {item.clause_no} — {item.title}
                </span>
                <span style={{
                  padding: "3px 8px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#fff",
                  background: style.color,
                  marginLeft: "8px",
                  whiteSpace: "nowrap",
                }}>
                  {style.label}
                </span>
              </div>

              <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#666" }}>
                {item.sources}
              </p>

              {/* 펼침 영역: description + alternative_text */}
              {isExpanded && (
                <div style={{
                  marginTop: "10px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: "#fff",
                  border: "1px solid #e0e0e0",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  color: "#333",
                }}>
                  <strong style={{ color: style.color }}>분석 사유</strong>
                  <p style={{ margin: "4px 0 0" }}>{item.description}</p>
                  {item.alternative_text && (
                    <>
                      <strong style={{ color: "#2980b9", display: "block", marginTop: "8px" }}>대안 문구</strong>
                      <p style={{ margin: "4px 0 0" }}>{item.alternative_text}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RiskAnalysisPage;
