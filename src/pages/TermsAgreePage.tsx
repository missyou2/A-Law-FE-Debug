import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const styles = {
  container: {
    backgroundColor: '#F1F2F6',
    minHeight: '100vh',
    padding: '24px 20px 100px',
    margin: '0',
    display: 'flex',
    flexDirection: 'column',
  } as const,
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '6px',
  } as const,
  headerTitle: {
    fontSize: '22px',
    fontWeight: '850',
    color: '#111',
    letterSpacing: '-0.2px',
  } as const,
  subtitle: {
    fontSize: '14px',
    color: '#888',
    fontWeight: '600',
    textAlign: 'center' as const,
    marginBottom: '24px',
    lineHeight: 1.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
    padding: '18px',
    marginBottom: '12px',
  } as const,
  cardTitle: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#111',
    marginBottom: '10px',
  } as const,
  scrollBox: {
    maxHeight: '160px',
    overflowY: 'auto' as const,
    fontSize: '12px',
    color: '#555',
    fontWeight: '600',
    lineHeight: 1.7,
    whiteSpace: 'pre-wrap' as const,
    backgroundColor: '#F8F8FA',
    borderRadius: '10px',
    padding: '12px',
  },
  checkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '12px',
    cursor: 'pointer',
    userSelect: 'none' as const,
  },
  checkbox: (checked: boolean) => ({
    width: '20px',
    height: '20px',
    borderRadius: '6px',
    border: checked ? '2px solid #5B4FCF' : '2px solid #D0D0D0',
    backgroundColor: checked ? '#5B4FCF' : '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.15s',
  }),
  checkmark: {
    color: '#fff',
    fontSize: '12px',
    fontWeight: '900',
  } as const,
  checkLabel: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#111',
  } as const,
  checkLabelRequired: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#5B4FCF',
    marginLeft: '4px',
  } as const,
  allAgreeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
    padding: '16px 18px',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    userSelect: 'none' as const,
  } as const,
  allAgreeLabel: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#111',
  } as const,
  fixedBottom: {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: '16px 20px 28px',
    backgroundColor: '#F1F2F6',
  },
  agreeBtn: (enabled: boolean) => ({
    width: '100%',
    padding: '16px 0',
    borderRadius: '14px',
    border: 'none',
    backgroundColor: enabled ? '#5B4FCF' : '#D0D0D0',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '800',
    cursor: enabled ? 'pointer' : 'default',
    transition: 'background-color 0.2s',
  }),
};

const TERMS_CONTENT = `제1조 (목적)
본 약관은 A-LAW(이하 "서비스")가 제공하는 AI 기반 계약서 분석 서비스의 이용과 관련하여 서비스 제공자와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (정의)
① "서비스"란 AI 기술을 활용하여 계약서를 분석·요약하고 위험 요소를 탐지하는 A-LAW 플랫폼을 의미합니다.
② "이용자"란 본 약관에 동의하고 서비스를 이용하는 자를 말합니다.
③ "분석 결과"란 AI가 계약서를 처리하여 생성한 요약, 위험 요소 분석, 조항 설명 등의 결과물을 의미합니다.

제3조 (서비스 제공 및 변경)
① 서비스는 계약서 OCR 인식, AI 분석, 요약, 위험 요소 탐지, 챗봇 상담 기능을 제공합니다.
② 서비스는 운영상·기술상의 이유로 서비스 내용을 변경할 수 있으며, 변경 시 사전 공지합니다.

제4조 (AI 분석 결과의 법적 한계)
① 서비스가 제공하는 분석 결과는 참고용 정보로, 법적 효력을 갖는 법률 조언이 아닙니다.
② 분석 결과는 AI 모델의 특성상 오류가 포함될 수 있으며, 최종 판단 및 법적 책임은 이용자에게 있습니다.
③ 중요한 법적 사안은 반드시 변호사 등 전문가의 조언을 받으시기 바랍니다.

제5조 (이용자의 의무)
① 이용자는 타인의 계약서를 무단으로 업로드하거나 불법적인 목적으로 서비스를 이용하여서는 안 됩니다.
② 이용자는 서비스를 통해 취득한 정보를 서비스 이용 목적 외에 사용하여서는 안 됩니다.

제6조 (책임의 한계)
① 서비스는 이용자가 서비스를 통해 얻은 정보를 기반으로 행한 법적 결정에 대해 책임을 지지 않습니다.
② 서비스는 천재지변, 시스템 장애 등 불가항력적 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.

제7조 (약관의 변경)
서비스는 관련 법령 및 운영 정책의 변경에 따라 본 약관을 변경할 수 있으며, 변경 시 7일 전 서비스 내 공지합니다.

제8조 (준거법 및 관할)
본 약관은 대한민국 법령에 따라 해석되며, 분쟁 발생 시 서울중앙지방법원을 제1심 관할법원으로 합니다.`;

const PRIVACY_CONTENT = `제1조 (수집하는 개인정보 항목)
서비스는 카카오 소셜 로그인을 통해 다음 정보를 수집합니다.
- 카카오 회원번호 (서비스 내 식별자)
- 닉네임 및 프로필 이미지 (선택)
- 이메일 주소 (선택, 카카오 계정 제공 시)
- 서비스 이용 기록 (분석 요청 내역, 접속 로그)

제2조 (개인정보의 이용 목적)
① 사용자 식별 및 로그인 처리
② 계약서 분석 결과 저장 및 관리
③ 서비스 품질 개선 및 오류 분석
④ 법령상 의무 이행

제3조 (개인정보의 보유 및 파기)
① 수집된 개인정보는 서비스 탈퇴 시 지체 없이 파기합니다.
② 단, 관련 법령에 따라 보관이 필요한 경우 해당 기간 동안 보관합니다.
- 계약 또는 청약철회 기록: 5년 (전자상거래법)
- 접속에 관한 기록: 3개월 (통신비밀보호법)

제4조 (개인정보의 제3자 제공)
서비스는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 법령에 의한 경우는 예외로 합니다.

제5조 (이용자의 권리)
이용자는 언제든지 자신의 개인정보 열람, 수정, 삭제를 요청할 수 있으며, "문의하기" 메뉴를 통해 요청하실 수 있습니다.

제6조 (문의)
개인정보 관련 문의는 서비스 내 "문의하기" 메뉴를 통해 접수할 수 있습니다.`;

const TermsAgreePage = () => {
  const navigate = useNavigate();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const allAgreed = agreeTerms && agreePrivacy;

  const toggleAll = () => {
    const next = !allAgreed;
    setAgreeTerms(next);
    setAgreePrivacy(next);
  };

  const handleAgree = () => {
    if (!allAgreed) return;
    localStorage.setItem('termsAgreed', 'true');
    navigate('/mypage', { replace: true });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerTitle}>서비스 이용약관</div>
      </div>
      <p style={styles.subtitle}>
        A-LAW를 이용하시기 전에<br />
        아래 약관을 확인해 주세요.
      </p>

      {/* 전체 동의 */}
      <div style={styles.allAgreeCard} onClick={toggleAll}>
        <div style={styles.checkbox(allAgreed)}>
          {allAgreed && <span style={styles.checkmark}>✓</span>}
        </div>
        <span style={styles.allAgreeLabel}>전체 동의</span>
      </div>

      {/* 이용약관 */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>이용약관</div>
        <div style={styles.scrollBox}>{TERMS_CONTENT}</div>
        <div style={styles.checkRow} onClick={() => setAgreeTerms(v => !v)}>
          <div style={styles.checkbox(agreeTerms)}>
            {agreeTerms && <span style={styles.checkmark}>✓</span>}
          </div>
          <span style={styles.checkLabel}>
            이용약관에 동의합니다
            <span style={styles.checkLabelRequired}>(필수)</span>
          </span>
        </div>
      </div>

      {/* 개인정보처리방침 */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>개인정보처리방침</div>
        <div style={styles.scrollBox}>{PRIVACY_CONTENT}</div>
        <div style={styles.checkRow} onClick={() => setAgreePrivacy(v => !v)}>
          <div style={styles.checkbox(agreePrivacy)}>
            {agreePrivacy && <span style={styles.checkmark}>✓</span>}
          </div>
          <span style={styles.checkLabel}>
            개인정보처리방침에 동의합니다
            <span style={styles.checkLabelRequired}>(필수)</span>
          </span>
        </div>
      </div>

      {/* 동의 버튼 */}
      <div style={styles.fixedBottom}>
        <button style={styles.agreeBtn(allAgreed)} onClick={handleAgree}>
          동의하고 시작하기
        </button>
      </div>
    </div>
  );
};

export default TermsAgreePage;
