// ⚠️ 테스트용 목 데이터 — 머지 전 이 파일과 ContractCarousel의 USE_MOCK 블록 삭제
import type { SummaryResultEvent, AnalysisResultEvent } from '../../../types/contract.js';

export const MOCK_SUMMARY: SummaryResultEvent = {
  title: '서울특별시 마포구 원룸 임대차 계약서',
  summaryText: `본 계약은 임대인 홍길동과 임차인 김철수 간에 체결된 주거용 건물 임대차 계약입니다.

임대 목적물은 서울특별시 마포구 합정동 123-45, 지상 3층 301호(전용면적 23.14㎡)이며, 임대 기간은 2024년 6월 1일부터 2026년 5월 31일까지 24개월입니다.

보증금은 5,000만 원이며, 월 임차료는 없는 전세 형태입니다. 임차인은 계약 체결일로부터 7일 이내에 보증금 전액을 임대인 명의 계좌로 송금해야 합니다.

특약 사항으로 임대인은 계약 기간 중 건물의 구조 변경 및 재건축을 진행할 수 없으며, 임차인은 사전 서면 동의 없이 전대(轉貸) 또는 임차권 양도를 할 수 없습니다. 원상복구 의무는 임차인에게 있으며, 퇴거 시 임대인이 지정하는 업체를 통해 청소 및 복구를 완료해야 합니다.`,
  keyTerms: [
    '보증금 5,000만 원',
    '전세 계약 (월세 없음)',
    '임대 기간 24개월',
    '전대 금지',
    '원상복구 의무',
    '구조변경 금지',
  ],
};

export const MOCK_RISK: AnalysisResultEvent = {
  totalClauses: 8,
  riskCount: 2,
  cautionCount: 3,
  safetyCount: 3,
  clauseResults: [
    {
      clauseId: 1,
      clauseTitle: '원상복구 범위 불명확',
      clauseContent:
        '임차인은 임대차 계약 종료 시 임대인이 지정하는 업체를 통해 원상복구를 완료하여야 하며, 이에 소요되는 비용은 임차인이 전액 부담한다.',
      riskLevel: '위험',
      reasoningSummary:
        '임대인이 지정하는 업체를 강제함으로써 과도한 비용 청구 가능성이 있습니다. 원상복구 범위와 기준이 명시되지 않아 분쟁 발생 시 임차인에게 불리하게 작용할 수 있습니다.',
      recommendation:
        '원상복구 범위를 "정상적인 사용으로 인한 소모 제외"로 명시하고, 업체 지정 조항을 삭제하거나 시장가 기준으로 한정하는 조항을 추가할 것을 권고합니다.',
      legalReference: '주택임대차보호법 제3조',
      relatedLaw: '민법 제654조, 제615조',
      score: 25,
      category: '원상복구',
    },
    {
      clauseId: 2,
      clauseTitle: '보증금 반환 기한 미명시',
      clauseContent:
        '임대인은 임대차 계약 종료 후 임차인이 목적물을 인도한 때에 보증금을 반환한다.',
      riskLevel: '위험',
      reasoningSummary:
        '보증금 반환 기한이 구체적으로 명시되어 있지 않아, 임대인이 반환을 지연할 경우 임차인이 법적으로 대응하기 어렵습니다.',
      recommendation:
        '"목적물 인도 후 14일 이내" 등 구체적인 반환 기한을 명시하고, 지연 시 연 12% 이자를 가산하는 조항을 추가할 것을 권고합니다.',
      legalReference: '주택임대차보호법 제3조의2',
      relatedLaw: '민법 제587조',
      score: 30,
      category: '보증금',
    },
    {
      clauseId: 3,
      clauseTitle: '관리비 항목 불특정',
      clauseContent:
        '임차인은 매월 관리비를 납부하여야 하며, 관리비 항목 및 금액은 관리사무소 기준에 따른다.',
      riskLevel: '주의',
      reasoningSummary:
        '관리비 항목이 계약서에 명시되지 않아 임의로 인상되거나 불합리한 항목이 포함될 수 있습니다.',
      recommendation:
        '관리비 항목(청소비, 경비비, 공용전기료 등)과 월 예상 금액을 계약서에 명시할 것을 권고합니다.',
      legalReference: '공동주택관리법 제23조',
      relatedLaw: '민법 제618조',
      score: 55,
      category: '관리비',
    },
    {
      clauseId: 4,
      clauseTitle: '임대인 수선 의무 제한',
      clauseContent:
        '소규모 수선(20만 원 이하)은 임차인이 부담하며, 임대인은 대규모 구조적 하자에 한하여 수선 의무를 진다.',
      riskLevel: '주의',
      reasoningSummary:
        '법적 기준(민법 제623조)에 따라 임대인은 수선 의무가 있으나, 본 조항은 임차인의 부담 범위를 확대하고 있습니다.',
      recommendation:
        '"소규모"의 기준을 구체적으로 명시하고, 임대인의 귀책사유로 발생한 하자는 금액에 관계없이 임대인이 부담하도록 수정할 것을 권고합니다.',
      legalReference: '민법 제623조',
      relatedLaw: '민법 제626조',
      score: 50,
      category: '수선의무',
    },
    {
      clauseId: 5,
      clauseTitle: '계약 해지 통보 기간',
      clauseContent:
        '임차인이 계약 만료 전 해지를 원할 경우, 만료일 2개월 전까지 서면으로 통보하여야 한다.',
      riskLevel: '주의',
      reasoningSummary:
        '주택임대차보호법상 임차인은 언제든지 해지를 통보할 수 있으며, 3개월 후 효력이 발생합니다. 해당 조항은 법적 기준과 다를 수 있어 혼란을 초래할 수 있습니다.',
      recommendation:
        '법정 해지 통보 규정(주택임대차보호법 제6조의3)에 따른다고 명시하거나, 해당 특약 조항을 삭제할 것을 권고합니다.',
      legalReference: '주택임대차보호법 제6조의3',
      relatedLaw: '민법 제635조',
      score: 52,
      category: '계약해지',
    },
    {
      clauseId: 6,
      clauseTitle: '임대차 기간',
      clauseContent:
        '임대차 기간은 2024년 6월 1일부터 2026년 5월 31일까지로 한다.',
      riskLevel: '안전',
      reasoningSummary: '주택임대차보호법에서 정한 최소 임대 기간(2년)을 충족하고 있으며, 시작일과 종료일이 명확하게 기재되어 있습니다.',
      recommendation: '현행 유지를 권고합니다.',
      legalReference: '주택임대차보호법 제4조',
      relatedLaw: '민법 제618조',
      score: 90,
      category: '임대기간',
    },
    {
      clauseId: 7,
      clauseTitle: '전대 및 임차권 양도 금지',
      clauseContent:
        '임차인은 임대인의 서면 동의 없이 목적물을 전대하거나 임차권을 양도할 수 없다.',
      riskLevel: '안전',
      reasoningSummary: '민법 및 주택임대차보호법의 기본 원칙에 부합하는 조항으로, 임대인의 권리를 적절히 보호합니다.',
      recommendation: '현행 유지를 권고합니다.',
      legalReference: '민법 제629조',
      relatedLaw: '주택임대차보호법 제3조',
      score: 88,
      category: '전대금지',
    },
    {
      clauseId: 8,
      clauseTitle: '보증금 금액 및 지급 방법',
      clauseContent:
        '보증금은 금 오천만 원(₩50,000,000)으로 하며, 임차인은 계약 체결일로부터 7일 이내에 임대인 명의 계좌(국민은행 123-456-789012)로 송금한다.',
      riskLevel: '안전',
      reasoningSummary:
        '보증금 금액, 지급 방법, 기한, 계좌 정보가 명확하게 기재되어 있어 분쟁 소지가 적습니다.',
      recommendation: '계약금 영수증 수령 및 확정일자 등록을 권고합니다.',
      legalReference: '주택임대차보호법 제3조의2',
      relatedLaw: '민법 제587조',
      score: 85,
      category: '보증금',
    },
  ],
};
