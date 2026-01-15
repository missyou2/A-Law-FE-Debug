import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

const styles = {
  container: {
    backgroundColor: '#F1F2F6',
    minHeight: '100vh',
    padding: '24px 20px',
    margin: '0',
  } as const,
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '18px',
    color: '#111',
  } as const,
  headerLeft: {
    width: '46px',
    height: '46px',
    borderRadius: '14px',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    userSelect: 'none',
  } as const,
  headerTitle: {
    fontSize: '20px',
    fontWeight: '850',
  } as const,
  headerRightSpacer: {
    width: '46px',
    height: '46px',
  } as const,
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
    padding: '18px 18px',
    lineHeight: 1.6,
    color: '#222',
    fontWeight: '600',
    fontSize: '14px',
    whiteSpace: 'pre-wrap',
  } as const,
};

const PrivacyPage = () => {
  const navigate = useNavigate();

  const pressStyle = (e: React.MouseEvent<HTMLElement>) => {
    (e.currentTarget as HTMLElement).style.transform = 'scale(0.98)';
  };
  const releaseStyle = (e: React.MouseEvent<HTMLElement>) => {
    (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div
          style={styles.headerLeft}
          onClick={() => navigate(-1)}
          onMouseDown={pressStyle}
          onMouseUp={releaseStyle}
          onMouseLeave={releaseStyle}
        >
          ←
        </div>
        <div style={styles.headerTitle}>개인정보처리방침</div>
        <div style={styles.headerRightSpacer} />
      </div>

      <div style={styles.card}>
        {`개인정보처리방침(샘플)

1. 수집 항목(예시)
- (연동 시) 소셜 로그인 식별자, 닉네임/프로필 이미지
- 서비스 이용 기록(분석 기능 개선 목적)

2. 이용 목적(예시)
- 사용자 식별 및 로그인 처리
- 서비스 제공 및 품질 개선
- 문의 응대

3. 보관 및 파기(예시)
목적 달성 후 지체 없이 파기하며, 관련 법령에 따라 보관이 필요한 경우 해당 기간 동안 보관합니다.

4. 문의
개인정보 관련 문의는 “문의하기” 메뉴를 통해 접수할 수 있습니다.`}
      </div>
    </div>
  );
};

export default PrivacyPage;
