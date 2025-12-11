import React from "react";

interface Props {
  onSelect: (text: string) => void;
}

function RiskAnalysisPage({ onSelect }: Props) {
  return (
    <div className="page-container">
      <h2 className="page-title">위험 요소 분석</h2>
      <p className="page-caption">임대차 계약에서 분쟁 가능성이 있는 부분을 분석했습니다.</p>

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
