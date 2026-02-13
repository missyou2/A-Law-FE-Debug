import { useState } from "react";
import type { RiskAnalysis, ToxicTerm } from "../../services/socketService.js";

interface Props {
  onSelect: (text: string) => void;
  contractId?: string;
}

// ============================================
// Mock 데이터 — 백엔드 WebSocket 연동 시 제거
// ============================================
const mockRiskAnalysis: RiskAnalysis = {
  toxic_terms: [
    {
      index: 2,
      content: "임차인은 퇴실시 청소비 20만원 있음.",
      toxic_level: 2,
      toxic_category: "임차인에게 불리한 조항",
      toxic_reason: "퇴실 시 청소비를 임차인에게 일방적으로 부담시키는 조항은 공정거래위원회의 불공정약관 기준에 해당할 수 있습니다.",
    },
    {
      index: 5,
      content: "보증금은 퇴실 후 30일 이내 반환한다.",
      toxic_level: 1,
      toxic_category: "보증금 반환 지연 위험",
      toxic_reason: "주택임대차보호법상 보증금은 임차인이 주택을 인도한 날에 반환하는 것이 원칙이며, 30일 유예는 임차인에게 불리할 수 있습니다.",
    },
    {
      index: 7,
      content: "애완동물사육금지 및 건물내 금연",
      toxic_level: 0,
      toxic_category: "",
      toxic_reason: "",
    },
  ],
  risk_score: 75,
};

/** toxic_level → 등급/색상 매핑 */
const getToxicLevelStyle = (level: number) => {
  if (level >= 2) return { label: "위험", color: "#e74c3c", bg: "#fdecea", border: "#f0d0d0" };
  if (level >= 1) return { label: "주의", color: "#f39c12", bg: "#fef9e7", border: "#f5e6c8" };
  return { label: "안전", color: "#27ae60", bg: "#eafaf1", border: "#c8e6d0" };
};

/** risk_score → 전체 등급 매핑 */
const getRiskLevel = (score: number) => {
  if (score >= 70) return { label: "위험", color: "#e74c3c", bg: "#fdecea" };
  if (score >= 40) return { label: "주의", color: "#f39c12", bg: "#fef9e7" };
  return { label: "안전", color: "#27ae60", bg: "#eafaf1" };
};

function RiskAnalysisPage(_props: Props) {
  // TODO: WebSocket(socketService)에서 risk_complete 메시지 수신 시 상태 업데이트
  const riskData: RiskAnalysis = mockRiskAnalysis;
  const level = getRiskLevel(riskData.risk_score);
  const dangerCount = riskData.toxic_terms.filter(t => t.toxic_level > 0).length;

  const [expandedSet, setExpandedSet] = useState<Set<number>>(new Set());

  const handleToggle = (term: ToxicTerm) => {
    setExpandedSet(prev => {
      const next = new Set(prev);
      if (next.has(term.index)) {
        next.delete(term.index);
      } else {
        next.add(term.index);
      }
      return next;
    });
  };

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
          {riskData.risk_score}
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
        {riskData.toxic_terms.map((term: ToxicTerm, idx: number) => {
          const style = getToxicLevelStyle(term.toxic_level);
          const isExpanded = expandedSet.has(term.index);

          return (
            <div
              key={idx}
              onClick={() => handleToggle(term)}
              style={{
                padding: "14px",
                marginBottom: idx < riskData.toxic_terms.length - 1 ? "10px" : 0,
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
                  {term.content}
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

              {term.toxic_category && (
                <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#666" }}>
                  {term.toxic_category}
                </p>
              )}

              {/* 펼침 영역: content + toxic_reason */}
              {isExpanded && term.toxic_reason && (
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
                  <p style={{ margin: "4px 0 0" }}>{term.toxic_reason}</p>
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
