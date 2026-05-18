import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { AnalysisResultEvent } from "../../types/contract.js";
import './contractCarousel.css';


interface Props {
  riskData: AnalysisResultEvent | null;
  analysisDone?: boolean;
}

/** riskLevel → 등급/색상 매핑 */
const getLevelStyle = (riskLevel: string) => {
  switch (riskLevel) {
    case '위험':
    case 'risk':
      return { label: "위험", color: "#e74c3c", bg: "#fdecea", border: "#f0d0d0" };
    case '주의':
    case 'caution':
      return { label: "주의", color: "#f39c12", bg: "#fef9e7", border: "#f5e6c8" };
    case '안전':
    case 'safety':
      return { label: "안전", color: "#27ae60", bg: "#eafaf1", border: "#c8e6d0" };
    default:
      return { label: "기타", color: "#888", bg: "#f5f5f5", border: "#e0e0e0" };
  }
};

/** riskCount 기준 전체 등급 매핑 */
const getOverallStyle = (riskCount: number, cautionCount: number) => {
  if (riskCount > 0) return { label: "위험", color: "#e74c3c", bg: "#fdecea", border: "#f0d0d0" };
  if (cautionCount > 0) return { label: "주의", color: "#f39c12", bg: "#fef9e7", border: "#f5e6c8" };
  return { label: "안전", color: "#27ae60", bg: "#eafaf1", border: "#c8e6d0" };
};

/** 스켈레톤 UI */
function SkeletonCard({ width }: { width?: string }) {
  return (
    <div style={{
      padding: "16px",
      borderRadius: "12px",
      background: "#f5f5f5",
      border: "1px solid #ebebeb",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
        <div className="skeleton" style={{ height: "14px", width: width ?? "70%" }} />
        <div className="skeleton" style={{ height: "24px", width: "40px", flexShrink: 0 }} />
      </div>
      <div className="skeleton" style={{ height: "12px", width: "40%", marginTop: "10px" }} />
    </div>
  );
}

function RiskAnalysisPage({ riskData, analysisDone }: Props) {
  const [expandedSet, setExpandedSet] = useState<Set<number>>(new Set());

  const handleToggle = (idx: number) => {
    setExpandedSet(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  /** 분석 완료됐지만 데이터 없음 → 실패 메시지 */
  if (!riskData && analysisDone) {
    return (
      <div className="page-container">
        <h2 className="page-title">위험 요소 분석</h2>
        <p className="page-caption">임대차 계약에서 분쟁 가능성이 있는 부분을 분석했습니다.</p>
        <div style={{
          padding: "24px 18px", borderRadius: "12px",
          background: "#fdecea", border: "1px solid #f0d0d0",
          textAlign: "center", color: "#c0392b", fontSize: "14px", lineHeight: "1.6",
        }}>
          <p style={{ margin: 0, fontWeight: 600 }}>분석 결과를 불러오지 못했습니다.</p>
          <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#888" }}>
            서버에서 위험 분석 데이터를 전송하지 않았습니다. 잠시 후 다시 시도해주세요.
          </p>
        </div>
      </div>
    );
  }

  /** 로딩 스켈레톤 */
  if (!riskData) {
    return (
      <div className="page-container">
        <h2 className="page-title">위험 요소 분석</h2>
        <p className="page-caption">임대차 계약에서 분쟁 가능성이 있는 부분을 분석 중에 있습니다.</p>

        {/* 점수 카드 스켈레톤 */}
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "14px 18px", borderRadius: "12px",
          background: "#f5f5f5", border: "1px solid #ebebeb", marginBottom: "16px",
        }}>
          <div className="skeleton" style={{ width: "40px", height: "36px", borderRadius: "8px" }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: "50px", height: "22px" }} />
            <div className="skeleton" style={{ width: "140px", height: "13px", marginTop: "8px" }} />
          </div>
        </div>

        {/* 조항 카드 스켈레톤 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <SkeletonCard width="75%" />
          <SkeletonCard width="60%" />
          <SkeletonCard width="50%" />
        </div>
      </div>
    );
  }

  const { riskCount, cautionCount, safetyCount, clauseResults = [] } = riskData;
  const overall = getOverallStyle(riskCount, cautionCount);
  const sortedClauses = [...clauseResults].sort((a, b) => {
    const order: Record<string, number> = { '위험': 0, '주의': 1, '안전': 2, risk: 0, caution: 1, safety: 2 };
    return (order[a.riskLevel] ?? 3) - (order[b.riskLevel] ?? 3);
  });

  return (
    <div className="page-container">
      <h2 className="page-title">위험 요소 분석</h2>
      <p className="page-caption">임대차 계약에서 분쟁 가능성이 있는 부분을 분석했습니다.</p>

      {/* 전체 등급 요약 */}
      <div style={{
        padding: "14px 18px",
        borderRadius: "12px",
        background: overall.bg,
        border: `1px solid ${overall.border}`,
        marginBottom: "16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
          <span style={{
            display: "inline-block",
            padding: "2px 10px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 600,
            color: "#fff",
            background: overall.color,
          }}>
            {overall.label}
          </span>
          <p style={{ margin: 0, fontSize: "13px", color: "#555" }}>
            위험 {riskCount}개 · 주의 {cautionCount}개 · 안전 {safetyCount}개
          </p>
        </div>
      </div>

      {/* 조항 목록 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {sortedClauses.map((clause, idx) => {
          const style = getLevelStyle(clause.riskLevel);
          const isExpanded = expandedSet.has(idx);

          return (
            <div
              key={clause.clauseId}
              onClick={() => handleToggle(idx)}
              style={{
                padding: "16px",
                border: `1px solid ${style.border}`,
                borderRadius: "12px",
                background: style.bg,
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                <span className="text-selectable" style={{ fontSize: "14px", fontWeight: 600, flex: 1, lineHeight: "1.5" }}>
                  {clause.clauseContent}
                </span>
                <span style={{
                  padding: "3px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#fff",
                  background: style.color,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}>
                  {style.label}
                </span>
              </div>

              {clause.category && (
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#888" }}>
                  {clause.category}
                </p>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
                <motion.span
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ fontSize: "12px", color: "#aaa", display: "inline-block" }}
                >
                  ∨
                </motion.span>
              </div>

              <AnimatePresence initial={false}>
                {isExpanded && (clause.reasoningSummary || clause.recommendation) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="text-selectable" style={{
                      marginTop: "8px",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      background: "#fff",
                      border: "1px solid #e0e0e0",
                      fontSize: "13px",
                      lineHeight: "1.7",
                      color: "#333",
                    }}>
                      {clause.reasoningSummary && (
                        <>
                          <strong style={{ fontSize: "13px", color: "#555" }}>분석 사유</strong>
                          <p style={{ margin: "6px 0 0" }}>{clause.reasoningSummary}</p>
                        </>
                      )}
                      {clause.recommendation && (
                        <>
                          <strong style={{ fontSize: "13px", color: "#555", display: "block", marginTop: "10px" }}>권고사항</strong>
                          <p style={{ margin: "6px 0 0" }}>{clause.recommendation}</p>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RiskAnalysisPage;
