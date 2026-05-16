import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

const CHANGELOG = [
  {
    version: 'v0.8.2',
    date: '2026.05.16',
    items: [
      '카카오 로그인 안정성 개선',
      '음성 분석 결과 UI 개선 (팩트체크 + 녹음 내용 함께 표시)',
      '계약서 요약·리스크 분석 로딩 스켈레톤 추가',
    ],
  },
  {
    version: 'v0.8.0',
    date: '2026.05.09',
    items: [
      '음성 녹음 기능 추가',
      '녹음 목록 페이지 추가',
      'SSE 기반 실시간 분석 결과 수신',
    ],
  },
  {
    version: 'v0.7.0',
    date: '2026.04.28',
    items: [
      '계약서 OCR 업로드 기능 추가',
      '리스크 분석 페이지 개선',
      '챗봇 플로팅 버튼 추가',
    ],
  },
];

const styles = {
  container: {
    backgroundColor: '#F1F2F6',
    minHeight: '100vh',
    padding: '24px 20px',
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
    boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    userSelect: 'none',
  } as const,
  headerTitle: {
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '-0.2px',
  } as const,
  headerSpacer: { width: '46px' } as const,
};

const InfoPage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft} onClick={() => navigate(-1)}>‹</div>
        <div style={styles.headerTitle}>정보</div>
        <div style={styles.headerSpacer} />
      </div>

      {/* 현재 버전 카드 */}
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
        padding: '24px 20px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '14px',
          background: '#F6F5FF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', flexShrink: 0,
        }}>⚖️</div>
        <div>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '2px' }}>현재 버전</div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#5B4FCF' }}>v0.8.2</div>
          <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>2026년 5월 16일 업데이트</div>
        </div>
      </div>

      {/* 변경 내역 */}
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
        padding: '20px',
      }}>
        <div style={{ fontSize: '15px', fontWeight: '800', color: '#111', marginBottom: '16px' }}>변경 내역</div>
        {CHANGELOG.map((log, idx) => (
          <div key={log.version} style={{ marginBottom: idx < CHANGELOG.length - 1 ? '20px' : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{
                fontSize: '12px', fontWeight: '700', color: '#5B4FCF',
                background: '#F6F5FF', borderRadius: '6px', padding: '2px 8px',
              }}>{log.version}</span>
              <span style={{ fontSize: '12px', color: '#aaa' }}>{log.date}</span>
            </div>
            {log.items.map((item, i) => (
              <div key={i} style={{
                fontSize: '13px', color: '#444', lineHeight: 1.7, paddingLeft: '4px',
              }}>· {item}</div>
            ))}
            {idx < CHANGELOG.length - 1 && (
              <div style={{ borderTop: '1px solid #F0F0F0', marginTop: '20px' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoPage;
