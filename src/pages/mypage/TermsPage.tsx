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

const TermsPage = () => {
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
        <div style={styles.headerTitle}>이용약관</div>
        <div style={styles.headerRightSpacer} />
      </div>

      <div style={styles.card}>
        {`A-LAW 이용약관(샘플)

1. 목적
본 약관은 A-LAW 서비스(이하 “서비스”)의 이용과 관련하여 서비스 제공자와 이용자 간의 권리·의무 및 책임사항을 규정합니다.

2. 제공 기능(예시)
- 문서 스캔 및 텍스트 변환
- 계약서 요약 및 위험 분석(시연/프로토타입 단계)
- 분석 결과 저장(기능 확장 예정)

3. 책임 제한(예시)
서비스는 참고용 정보를 제공하며, 법적 효력을 보장하지 않습니다.
최종 판단 및 책임은 이용자에게 있습니다.

4. 약관 변경(예시)
서비스는 필요 시 약관을 변경할 수 있으며, 변경 사항은 서비스 내 공지합니다.`}
      </div>
    </div>
  );
};

export default TermsPage;
