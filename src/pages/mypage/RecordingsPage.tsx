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
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '-0.2px',
  } as const,
  headerSpacer: {
    width: '46px',
  } as const,
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
    padding: '48px 24px',
    textAlign: 'center' as const,
    marginTop: '12px',
  },
  emptyText: {
    fontSize: '15px',
    color: '#aaa',
    fontWeight: '600',
    lineHeight: 1.6,
  } as const,
  listBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    marginTop: '12px',
  } as const,
  item: {
    padding: '16px 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #F0F0F0',
  } as const,
  itemLast: {
    borderBottom: 'none',
  } as const,
  itemTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#111',
  } as const,
  itemMeta: {
    fontSize: '12px',
    color: '#aaa',
    marginTop: '3px',
    fontWeight: '600',
  } as const,
  itemRight: {
    fontSize: '13px',
    color: '#bbb',
    fontWeight: '700',
  } as const,
};

// TODO: API 연동 후 실제 녹음 목록으로 교체
const MOCK_RECORDINGS: { id: number; title: string; duration: string; date: string; contractTitle: string | null }[] = [];

const RecordingsPage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft} onClick={() => navigate(-1)}>←</div>
        <div style={styles.headerTitle}>녹음 목록</div>
        <div style={styles.headerSpacer} />
      </div>

      {MOCK_RECORDINGS.length === 0 ? (
        <div style={styles.emptyBox}>
          <p style={styles.emptyText}>
            저장된 녹음이 없습니다.<br />
            계약 관련 대화를 녹음해 보세요.
          </p>
        </div>
      ) : (
        <div style={styles.listBox}>
          {MOCK_RECORDINGS.map((rec, idx) => (
            <div
              key={rec.id}
              style={{
                ...styles.item,
                ...(idx === MOCK_RECORDINGS.length - 1 ? styles.itemLast : {}),
              }}
            >
              <div>
                <div style={styles.itemTitle}>{rec.title}</div>
                <div style={styles.itemMeta}>
                  {rec.duration} · {rec.date}
                  {rec.contractTitle && ` · ${rec.contractTitle}`}
                </div>
              </div>
              <span style={styles.itemRight}>›</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecordingsPage;
