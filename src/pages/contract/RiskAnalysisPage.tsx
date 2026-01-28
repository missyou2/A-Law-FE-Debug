import React, { useState, useEffect } from "react";
import { getRiskAnalysis } from "../../services/contractApi.js";
import type { RiskItem } from "../../types/contract.js";

interface Props {
  onSelect: (text: string) => void;
  contractId?: string; // 계약서 ID
}

function RiskAnalysisPage({ onSelect, contractId }: Props) {
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRiskAnalysis = async () => {
      if (!contractId) return;

      setIsLoading(true);
      setError("");

      try {
        const result = await getRiskAnalysis(contractId);
        setRisks(result.risk_items);
      } catch (err) {
        console.error("위험 분석 실패:", err);
        setError("위험 분석을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRiskAnalysis();
  }, [contractId]);

  return (
    <div className="page-container">
      <h2 className="page-title">위험 요소 분석</h2>
      <p className="page-caption">임대차 계약에서 분쟁 가능성이 있는 부분을 분석했습니다.</p>

      {!contractId ? (
        <div className="doc-box">
          <p style={{ color: "#999", fontStyle: "italic" }}>계약서 ID가 필요합니다.</p>
        </div>
      ) : isLoading ? (
        <div className="doc-box">
          <p>위험 분석을 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="doc-box">
          <p style={{ color: "#e74c3c" }}>{error}</p>
        </div>
      ) : risks.length > 0 ? (
        <div className="doc-box">
          {risks.map((risk, idx) => (
            <div key={idx} style={{ marginBottom: "20px", padding: "15px", border: "1px solid #e0e0e0", borderRadius: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <h3 style={{ fontSize: "16px", margin: 0 }}>
                  {risk.clause_no} - {risk.title}
                </h3>
                <span style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  backgroundColor: risk.severity === "HIGH" ? "#e74c3c" : risk.severity === "MEDIUM" ? "#f39c12" : "#3498db",
                  color: "white"
                }}>
                  {risk.severity}
                </span>
              </div>
              <p style={{ marginBottom: "10px" }}>{risk.description}</p>
              {risk.sources && (
                <p style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>
                  <strong>출처:</strong> {risk.sources}
                </p>
              )}
              {risk.alternative_text && (
                <p style={{ fontSize: "14px", color: "#27ae60" }}>
                  <strong>권장사항:</strong> {risk.alternative_text}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="doc-box">

        <p>
          월 차임 <strong>2회 연속 연체 시 즉시 해지</strong>는 
          <span className="highlight" onClick={() => onSelect("거주 안정성 위험")}>
            임차인의 거주 안정성이 불안정해질 위험
          </span>
          이 있다.
        </p>

        <p>
          “무단 공사·전대·용도 변경 시 즉시 원상복구” 조항은 
          <span className="highlight" onClick={() => onSelect("원상복구 분쟁")}>
            원상복구 비용 분쟁
          </span>
          으로 이어질 수 있다.
        </p>

        <p>
          경미한 수선 범위가 구체적이지 않아 
          <span className="highlight" onClick={() => onSelect("수선 범위 모호성")}>
            비용 부담 논쟁
          </span>
          이 발생할 수 있다.
        </p>

        <p>
          임대인의 긴급 출입 권한은 사생활 침해로 이어질 수 있으며, 
          <span className="highlight" onClick={() => onSelect("사생활 침해 우려")}>
            '긴급 상황'의 기준이 모호
          </span>
          하다.
        </p>

        <p>
          중도 해지 시 임차인에게 신규 임차인 주선 의무가 발생할 수 있어 
          <span className="highlight" onClick={() => onSelect("중도 해지 부담")}>
            과도한 부담
          </span>
          이 될 수 있다.
        </p>

        <p>
          보증금 반환까지 최대 30일이 소요될 수 있어 
          <span className="highlight" onClick={() => onSelect("보증금 반환 지연 위험")}>
            임차인의 자금 운영에 영향을 미칠 위험
          </span>
          이 있다.
        </p>

        <p>
          원상복구 범위가 명확하지 않아 
          <span className="highlight" onClick={() => onSelect("원상복구 해석 차이")}>
            자연 마모와 훼손 구분 문제
          </span>
          로 분쟁이 잦다.
        </p>

        <p>
          안전사고 시 과실 여부 해석이 일치하지 않아
          <span className="highlight" onClick={() => onSelect("책임 소재 분쟁")}>
            임대인·임차인 간 분쟁
          </span>
          이 발생할 가능성이 크다.
        </p>

        </div>
      )}
    </div>
  );
}

export default RiskAnalysisPage;
