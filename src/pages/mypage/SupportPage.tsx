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
    fontWeight: '650',
    fontSize: '14px',
  } as const,
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '850',
    marginBottom: '10px',
  } as const,
  item: {
    marginBottom: '12px',
    color: '#333',
  } as const,
  subtle: {
    color: '#777',
    fontWeight: '600',
    fontSize: '13px',
    marginTop: '10px',
    whiteSpace: 'pre-wrap',
  } as const,
};

const SupportPage = () => {
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
        <div style={styles.headerTitle}>문의하기</div>
        <div style={styles.headerRightSpacer} />
      </div>

      <div style={styles.card}>
        <div style={styles.sectionTitle}>문의 채널(샘플)</div>

        <div style={styles.item}>- 이메일: support@a-law.example</div>
        <div style={styles.item}>- 운영 시간: 평일 10:00 ~ 18:00</div>

        <div style={styles.subtle}>
          {`현재는 졸업작품(프로토타입) 단계입니다.
문의 채널/연락처는 추후 실제 운영 환경에 맞게 교체하세요.`}
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
