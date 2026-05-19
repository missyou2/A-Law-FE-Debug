import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaPause, FaChevronRight, FaTimes, FaTrash } from 'react-icons/fa';
import '../../App.css';
import { getVoiceRecords, deleteVoiceRecord, getVoiceAnalysisResult } from '../../api/voiceApi.js';
import type { VoiceRecordListItem, VoiceFactCheckResponse } from '../../api/voiceApi.js';
import { useRecording } from '../../contexts/RecordingContext.js';

interface Recording {
  id: number;
  title: string;
  duration: string; // 오디오 로드 후 동적으로 채워짐
  date: string;
  contractId: number | null;
  fileUrl: string | null;
}

const formatDate = (isoString: string): string => {
  const d = new Date(isoString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const toRecording = (item: VoiceRecordListItem): Recording => ({
  id: item.voiceRecordId,
  title: item.title ?? `녹음 ${formatDate(item.createdAt)}`,
  duration: '',
  date: formatDate(item.createdAt),
  contractId: item.contractId,
  fileUrl: item.fileUrl,
});

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const MOCK_RECORDINGS: Recording[] = [
  {
    id: 1,
    title: '원룸 전세 계약 상담 녹음',
    duration: '00:05',
    date: '2026-05-09',
    contractId: 1,
    fileUrl: '/dummy-recording.wav',
  },
  {
    id: 2,
    title: '녹음 2026-05-08',
    duration: '00:05',
    date: '2026-05-08',
    contractId: null,
    fileUrl: '/dummy-recording.wav',
  },
];

const severityColor = (severity: string) => {
  switch (severity?.toUpperCase()) {
    case 'HIGH': return '#FF4D4F';
    case 'MEDIUM': return '#FA8C16';
    case 'LOW': return '#52C41A';
    default: return '#8c8c8c';
  }
};

const severityLabel = (severity: string) => {
  switch (severity?.toUpperCase()) {
    case 'HIGH': return '높음';
    case 'MEDIUM': return '중간';
    case 'LOW': return '낮음';
    default: return severity;
  }
};

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
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
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
    boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    marginTop: '12px',
  } as const,
  item: {
    padding: '16px 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #F0F0F0',
    cursor: 'pointer',
  } as const,
  itemTitle: { fontSize: '15px', fontWeight: '700', color: '#111' } as const,
  itemMeta: { fontSize: '12px', color: '#aaa', marginTop: '3px', fontWeight: '600' } as const,
};

const BottomSheet = ({
  rec,
  onClose,
  onDelete,
}: {
  rec: Recording;
  onClose: () => void;
  onDelete: (id: number) => void;
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [analysis, setAnalysis] = useState<VoiceFactCheckResponse | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [analysisError, setAnalysisError] = useState('');

  useEffect(() => {
    if (USE_MOCK) {
      if (rec.id === 1) {
        // 계약서 연동 — STT 텍스트 + 팩트체크 결과
        setAnalysis({
          voiceRecordId: 1,
          transcript: '네, 보증금은 5천만원이고요, 계약 기간은 2년으로 알고 있습니다. 중도 해지하시면 위약금이 발생한다고 하셨고, 관리비는 따로 월 5만원이라고 하셨는데 맞나요?',
          factCheckItems: [
            { claim: '보증금 5천만원', contractContent: '제3조: 보증금은 금 오천만원정(₩50,000,000)으로 한다.', isMatch: true, severity: 'LOW' },
            { claim: '계약 기간 2년', contractContent: '제4조: 임대차 기간은 2024년 6월 1일부터 2026년 5월 31일까지로 한다.', isMatch: true, severity: 'LOW' },
            { claim: '중도 해지 시 위약금 발생', contractContent: '특약사항: 중도해지 관련 조항 없음', isMatch: false, severity: 'HIGH' },
            { claim: '관리비 월 5만원', contractContent: '제6조: 관리비는 월 7만원으로 임차인이 부담한다.', isMatch: false, severity: 'MEDIUM' },
          ],
          status: 'COMPLETED',
          createdAt: rec.date,
        });
      } else {
        // 단순 저장 — STT 텍스트만
        setAnalysis({
          voiceRecordId: 2,
          transcript: '저 혹시 이 건물 전세 매물 관련해서 문의드리려고요. 보증금이 얼마나 되는지, 그리고 계약 기간은 보통 어떻게 되는지 여쭤봐도 될까요? 그리고 혹시 옵션이나 관리비 같은 것도 따로 있나요?',
          factCheckItems: [],
          status: 'COMPLETED',
          createdAt: rec.date,
        });
      }
      setAnalysisLoading(false);
      return;
    }
    const fetchAnalysis = async () => {
      setAnalysisLoading(true);
      setAnalysisError('');
      try {
        const result = await getVoiceAnalysisResult(
          rec.id,
          rec.contractId ?? undefined,
        );
        setAnalysis(result);
      } catch {
        setAnalysisError('분석 결과를 불러오지 못했습니다.');
      } finally {
        setAnalysisLoading(false);
      }
    };
    fetchAnalysis();
  }, [rec.id, rec.contractId]);

  // 분석 중이면 3초마다 자동 갱신
  useEffect(() => {
    const isRunning = analysis?.status === 'PENDING' || analysis?.status === 'PROCESSING';
    if (!isRunning) return;
    const timer = setInterval(async () => {
      try {
        const result = await getVoiceAnalysisResult(rec.id, rec.contractId ?? undefined);
        setAnalysis(result);
      } catch { /* ignore */ }
    }, 3000);
    return () => clearInterval(timer);
  }, [analysis?.status, rec.id, rec.contractId]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(Math.floor(sec % 60)).padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleDelete = async () => {
    if (!confirm('이 녹음을 삭제하시겠습니까?')) return;
    setDeleting(true);
    try {
      await deleteVoiceRecord(rec.id);
      onDelete(rec.id);
      onClose();
    } catch (err) {
      console.error('녹음 삭제 실패:', err);
      alert('삭제에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setDeleting(false);
    }
  };

  const hasFactCheck = analysis && analysis.factCheckItems && analysis.factCheckItems.length > 0;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 100,
        }}
      />

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff',
        borderRadius: '24px 24px 0 0',
        padding: '24px 20px 40px',
        zIndex: 101,
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '17px', fontWeight: '800', color: '#111' }}>{rec.title}</div>
            <div style={{ fontSize: '12px', color: '#aaa', marginTop: '3px' }}>
              {rec.duration} · {rec.date}
              {rec.contractId && ` · 계약서 연동`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#FF6B6B' }}
            >
              <FaTrash size={16} />
            </button>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#aaa' }}
            >
              <FaTimes size={18} />
            </button>
          </div>
        </div>

        {/* 오디오 플레이어 */}
        {rec.fileUrl && (
          <audio
            ref={audioRef}
            src={rec.fileUrl}
            onTimeUpdate={e => setCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={e => setAudioDuration(e.currentTarget.duration)}
            onEnded={() => setIsPlaying(false)}
          />
        )}
        <div style={{
          background: '#F6F5FF',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          marginBottom: '24px',
        }}>
          <button
            onClick={togglePlay}
            disabled={!rec.fileUrl}
            style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: rec.fileUrl ? '#5B4FCF' : '#ccc',
              border: 'none', cursor: rec.fileUrl ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {isPlaying ? <FaPause size={16} color="#fff" /> : <FaPlay size={16} color="#fff" style={{ marginLeft: '2px' }} />}
          </button>
          <div style={{ flex: 1 }}>
            <input
              type="range"
              min={0}
              max={audioDuration || 0}
              value={currentTime}
              onChange={e => {
                const t = Number(e.target.value);
                if (audioRef.current) audioRef.current.currentTime = t;
                setCurrentTime(t);
              }}
              style={{ width: '100%', accentColor: '#5B4FCF' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#999', marginTop: '2px' }}>
              <span>{formatTime(currentTime)}</span>
              <span>{rec.duration}</span>
            </div>
          </div>
        </div>

        {/* 분석 결과 */}
        <div style={{ borderTop: '1px solid #F0F0F0', paddingTop: '20px' }}>
          <div style={{ fontSize: '15px', fontWeight: '800', color: '#111', marginBottom: '14px' }}>
            분석 결과
          </div>

          {analysisLoading ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#aaa', fontSize: '14px' }}>
              분석 결과를 불러오는 중...
            </div>
          ) : analysisError ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#FF6B6B', fontSize: '14px' }}>
              {analysisError}
            </div>
          ) : analysis?.status === 'PENDING' || analysis?.status === 'PROCESSING' ? (
            <div style={{
              background: '#FFF9E6',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '14px',
              color: '#886600',
              textAlign: 'center',
            }}>
              분석이 아직 진행 중입니다. 잠시 후 다시 확인해 주세요.
            </div>
          ) : hasFactCheck ? (
            /* 계약서 팩트체크 결과 */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* 팩트체크 카드 */}
              {analysis.factCheckItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: item.isMatch ? '#F6FFED' : '#FFF2F0',
                    border: `1px solid ${item.isMatch ? '#B7EB8F' : '#FFCCC7'}`,
                    borderRadius: '12px',
                    padding: '14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '18px' }}>{item.isMatch ? '✅' : '❌'}</span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: severityColor(item.severity),
                      background: '#fff',
                      borderRadius: '6px',
                      padding: '2px 8px',
                    }}>
                      위험도 {severityLabel(item.severity)}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111', marginBottom: '6px' }}>
                    발화 내용
                  </div>
                  <div style={{ fontSize: '13px', color: '#444', marginBottom: '10px', lineHeight: 1.5 }}>
                    {item.claim}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111', marginBottom: '6px' }}>
                    계약서 내용
                  </div>
                  <div style={{ fontSize: '13px', color: '#666', lineHeight: 1.5 }}>
                    {item.contractContent}
                  </div>
                </div>
              ))}
              {/* STT 전사 텍스트 */}
              {analysis.transcript && (
                <div style={{ background: '#F8F9FF', borderRadius: '12px', padding: '16px', marginTop: '4px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111', marginBottom: '8px' }}>녹음 내용</div>
                  <div style={{ fontSize: '13px', color: '#444', lineHeight: 1.6 }}>{analysis.transcript}</div>
                </div>
              )}
            </div>
          ) : analysis?.transcript ? (
            /* 단순 녹음 — 전사 텍스트만 */
            <div style={{
              background: '#F8F9FF',
              borderRadius: '12px',
              padding: '16px',
            }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#111', marginBottom: '8px' }}>
                녹음 내용
              </div>
              <div style={{ fontSize: '13px', color: '#444', lineHeight: 1.6 }}>
                {analysis.transcript}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#aaa', fontSize: '14px' }}>
              분석 결과가 없습니다.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const RecordingsPage = () => {
  const navigate = useNavigate();
  const { analyzingIds } = useRecording();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRec, setSelectedRec] = useState<Recording | null>(null);

  useEffect(() => {
    if (USE_MOCK) {
      setRecordings(MOCK_RECORDINGS);
      setLoading(false);
      return;
    }
    const fetchRecordings = async () => {
      try {
        const data = await getVoiceRecords();
        setRecordings(data.map(toRecording));
      } catch (err) {
        console.error('녹음 목록 로딩 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecordings();
  }, []);

  const handleDelete = (id: number) => {
    setRecordings(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft} onClick={() => navigate(-1)}>←</div>
        <div style={styles.headerTitle}>녹음 목록</div>
        <div style={styles.headerSpacer} />
      </div>

      {loading ? (
        <div style={styles.emptyBox}>
          <p style={styles.emptyText}>불러오는 중...</p>
        </div>
      ) : recordings.length === 0 ? (
        <div style={styles.emptyBox}>
          <p style={styles.emptyText}>
            저장된 녹음이 없습니다.<br />
            계약 관련 대화를 녹음해 보세요.
          </p>
        </div>
      ) : (
        <div style={styles.listBox}>
          {recordings.map((rec, idx) => (
            <div
              key={rec.id}
              style={{
                ...styles.item,
                ...(idx === recordings.length - 1 ? { borderBottom: 'none' } : {}),
              }}
              onClick={() => setSelectedRec(rec)}
            >
              <div>
                <div style={styles.itemTitle}>{rec.title}</div>
                <div style={styles.itemMeta}>
                  {rec.duration} · {rec.date}
                  {rec.contractId && ` · 계약서 연동`}
                </div>
                {analyzingIds.includes(rec.id) && (
                  <div style={{ fontSize: '11px', color: '#FA8C16', fontWeight: 700, marginTop: '3px' }}>
                    분석 중...
                  </div>
                )}
              </div>
              <FaChevronRight size={13} color="#ccc" />
            </div>
          ))}
        </div>
      )}

      {selectedRec && (
        <BottomSheet
          rec={selectedRec}
          onClose={() => setSelectedRec(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default RecordingsPage;
