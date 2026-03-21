import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { AnalysisRiskEvent } from "../../types/contract.js";

export const MOCK_RISK_DATA: AnalysisRiskEvent = {
  status: "risk_complete",
  task_id: "mock-001",
  risk_analysis: {
    risk_score: 75,
    toxic_terms: [
      {
        index: 1,
        content: "임차인은 퇴실시 청소비 20만원 있음.",
        toxic_level: 2,
        toxic_category: "임차인에게 불리한 조항",
        toxic_reason: "퇴실 시 청소비를 임차인에게 일방적으로 부담시키는 조항은 공정거래위원회의 불공정약관 기준에 해당할 수 있습니다.",
      },
      {
        index: 2,
        content: "보증금은 퇴실 후 30일 이내 반환한다.",
        toxic_level: 1,
        toxic_category: "보증금 반환 지연 위험",
        toxic_reason: "법적으로는 즉시 반환이 원칙이나, 30일 유예는 임차인에게 불리할 수 있습니다.",
      },
      {
        index: 3,
        content: "애완동물사육금지 및 건물내 금연",
        toxic_level: 0,
        toxic_category: "일반 관리 규정",
        toxic_reason: "일반적인 임대차 계약에 포함되는 표준 조항입니다.",
      },
    ],
  },
};

interface Props {
  riskData: AnalysisRiskEvent | null;
}

/** toxic_level → 등급/색상 매핑 (0=안전, 1=주의, 2=위험) */
const getLevelStyle = (toxicLevel: 0 | 1 | 2) => {
  switch (toxicLevel) {
    case 2:
      return { label: "위험", color: "#e74c3c", bg: "#fdecea", border: "#f0d0d0" };
    case 1:
      return { label: "주의", color: "#f39c12", bg: "#fef9e7", border: "#f5e6c8" };
    case 0:
      return { label: "안전", color: "#27ae60", bg: "#eafaf1", border: "#c8e6d0" };
  }
};

/** risk_score → 전체 등급 매핑 */
const getOverallStyle = (score: number) => {
  if (score >= 70) return { label: "위험", color: "#e74c3c", bg: "#fdecea", border: "#f0d0d0", gauge: "#e74c3c" };
  if (score >= 40) return { label: "주의", color: "#f39c12", bg: "#fef9e7", border: "#f5e6c8", gauge: "#f39c12" };
  return { label: "안전", color: "#27ae60", bg: "#eafaf1", border: "#c8e6d0", gauge: "#27ae60" };
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
        <div style={{ height: "14px", borderRadius: "6px", background: "#e0e0e0", width: width ?? "70%" }} />
        <div style={{ height: "24px", width: "40px", borderRadius: "6px", background: "#e0e0e0", flexShrink: 0 }} />
      </div>
      <div style={{ height: "12px", borderRadius: "6px", background: "#e0e0e0", width: "40%", marginTop: "10px" }} />
    </div>
  );
}

function RiskAnalysisPage({ riskData }: Props) {
  const [expandedSet, setExpandedSet] = useState<Set<number>>(new Set());

  const handleToggle = (idx: number) => {
    setExpandedSet(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  /** 로딩 스켈레톤 */
  if (!riskData) {
    return (
      <div className="page-container">
        <h2 className="page-title">위험 요소 분석</h2>
        <p className="page-caption">임대차 계약에서 분쟁 가능성이 있는 부분을 분석했습니다.</p>

        {/* 점수 카드 스켈레톤 */}
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "14px 18px", borderRadius: "12px",
          background: "#f5f5f5", border: "1px solid #ebebeb", marginBottom: "16px",
        }}>
          <div style={{ width: "40px", height: "36px", borderRadius: "8px", background: "#e0e0e0" }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: "50px", height: "22px", borderRadius: "6px", background: "#e0e0e0" }} />
            <div style={{ width: "140px", height: "13px", borderRadius: "6px", background: "#e0e0e0", marginTop: "8px" }} />
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

  const { risk_analysis } = riskData;
  const overall = getOverallStyle(risk_analysis.risk_score);
  const dangerCount = risk_analysis.toxic_terms.filter(t => t.toxic_level > 0).length;
  const sortedTerms = [...risk_analysis.toxic_terms].sort((a, b) => b.toxic_level - a.toxic_level);

  return (
    <div className="page-container">
      <h2 className="page-title">위험 요소 분석</h2>
      <p className="page-caption">임대차 계약에서 분쟁 가능성이 있는 부분을 분석했습니다.</p>

      {/* 위험도 점수 */}
      <div style={{
        padding: "14px 18px",
        borderRadius: "12px",
        background: overall.bg,
        border: `1px solid ${overall.border}`,
        marginBottom: "16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
          <span style={{ fontSize: "28px", fontWeight: 700, color: overall.color }}>
            {risk_analysis.risk_score}
          </span>
          <div>
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
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#555" }}>
              총 {dangerCount}개의 위험 조항이 발견되었습니다.
            </p>
          </div>
        </div>

        {/* 게이지 바 */}
        <div style={{ height: "6px", borderRadius: "99px", background: "#00000015" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${risk_analysis.risk_score}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              height: "100%",
              borderRadius: "99px",
              background: overall.gauge,
            }}
          />
        </div>
      </div>

      {/* 조항 목록 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {sortedTerms.map((term, idx) => {
          const style = getLevelStyle(term.toxic_level);
          const isExpanded = expandedSet.has(idx);

          return (
            <div
              key={idx}
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
                <span style={{ fontSize: "14px", fontWeight: 600, flex: 1, lineHeight: "1.5" }}>
                  {term.content}
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

              {term.toxic_category && (
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#888" }}>
                  {term.toxic_category}
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
                {isExpanded && term.toxic_reason && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{
                      marginTop: "8px",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      background: "#fff",
                      border: "1px solid #e0e0e0",
                      fontSize: "13px",
                      lineHeight: "1.7",
                      color: "#333",
                    }}>
                      <strong style={{ fontSize: "13px", color: "#555" }}>분석 사유</strong>
                      <p style={{ margin: "6px 0 0" }}>{term.toxic_reason}</p>
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
