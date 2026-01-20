import React from "react";
// import { generateRiskAnalysis } from "../../services/contractService.js";  // 서비스 사용 시

interface Props {
  onSelect: (text: string) => void;
}

function RiskAnalysisPage({ onSelect }: Props) {
  // ============================================
  // 여기에 API 호출 코드 삽입
  // ============================================
  // API: POST /api/v1/contracts/{id}/risks
  // 설명: Risk 분석 생성
  //
  // 필요한 데이터:
  // - contractId: string (계약서 ID)
  //
  // 예시 코드:
  // const [riskAnalysis, setRiskAnalysis] = useState("");
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState("");
  //
  // useEffect(() => {
  //   const fetchRiskAnalysis = async () => {
  //     const API_KEY = "여기에 API 키 입력";
  //     const BASE_URL = "http://localhost:3000/api/v1";
  //     const CONTRACT_ID = "contract_123";  // 실제 계약서 ID로 교체 필요
  //
  //     setIsLoading(true);
  //     setError("");
  //
  //     try {
  //       const response = await fetch(
  //         `${BASE_URL}/contracts/${CONTRACT_ID}/risks`,
  //         {
  //           method: 'POST',
  //           headers: {
  //             'Authorization': `Bearer ${API_KEY}`,
  //             'Content-Type': 'application/json',
  //           },
  //         }
  //       );
  //
  //       if (!response.ok) throw new Error('위험 분석 생성 실패');
  //       const data = await response.json();
  //
  //       setIsLoading(false);
  //       setRiskAnalysis(data.riskAnalysis);
  //     } catch (error) {
  //       setIsLoading(false);
  //       setError('위험 분석을 불러오는데 실패했습니다.');
  //     }
  //   };
  //
  //   fetchRiskAnalysis();
  // }, []);
  // ============================================

  return (
    <div className="page-container">
      <h2 className="page-title">위험 요소 분석</h2>
      <p className="page-caption">임대차 계약에서 분쟁 가능성이 있는 부분을 분석했습니다.</p>
      {/* TODO: API 연동 후 동적 데이터로 교체 필요 */}

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
    </div>
  );
}

export default RiskAnalysisPage;
