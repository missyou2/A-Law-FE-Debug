import React from "react";
// import { generateSummary } from "../../services/contractService.js";  // 서비스 사용 시

interface Props {
  onSelect: (text: string) => void;
}

function ClauseSummaryPage({ onSelect }: Props) {
  // ============================================
  // 여기에 API 호출 코드 삽입
  // ============================================
  // API: POST /api/v1/contracts/{id}/summaries
  // 설명: 계약서 간단 요약 생성
  //
  // 필요한 데이터:
  // - contractId: string (계약서 ID)
  //
  // 예시 코드:
  // const [summary, setSummary] = useState("");
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState("");
  //
  // useEffect(() => {
  //   const fetchSummary = async () => {
  //     const API_KEY = "여기에 API 키 입력";
  //     const BASE_URL = "http://localhost:3000/api/v1";
  //     const CONTRACT_ID = "contract_123";  // 실제 계약서 ID로 교체 필요
  //
  //     setIsLoading(true);
  //     setError("");
  //
  //     try {
  //       const response = await fetch(
  //         `${BASE_URL}/contracts/${CONTRACT_ID}/summaries`,
  //         {
  //           method: 'POST',
  //           headers: {
  //             'Authorization': `Bearer ${API_KEY}`,
  //             'Content-Type': 'application/json',
  //           },
  //         }
  //       );
  //
  //       if (!response.ok) throw new Error('요약 생성 실패');
  //       const data = await response.json();
  //
  //       setIsLoading(false);
  //       setSummary(data.summary);
  //     } catch (error) {
  //       setIsLoading(false);
  //       setError('요약을 불러오는데 실패했습니다.');
  //     }
  //   };
  //
  //   fetchSummary();
  // }, []);
  // ============================================

  return (
    <div className="page-container">
      <h2 className="page-title">임대차 계약 요약</h2>
      <p className="page-caption">AI가 임대차 계약 내용을 이해하기 쉽게 요약했습니다.</p>
      {/* TODO: API 연동 후 동적 데이터로 교체 필요 */}

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
    </div>
  );
}

export default ClauseSummaryPage;
