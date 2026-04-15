import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaPause, FaChevronRight, FaTimes, FaTrash } from 'react-icons/fa';
import '../../App.css';
import { getVoiceRecords, deleteVoiceRecord } from '../../api/voiceApi.js';
import type { VoiceRecordListItem } from '../../api/voiceApi.js';

interface Recording {
  id: number;
  title: string;
  duration: string;
  date: string;
  contractTitle: string | null;
}

const formatDuration = (seconds: number): string => {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
};

const formatDate = (isoString: string): string => {
  const d = new Date(isoString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const toRecording = (item: VoiceRecordListItem): Recording => ({
  id: item.voiceRecordId,
  title: item.contractTitle ? `${item.contractTitle} 녹음` : `녹음 ${formatDate(item.createdAt)}`,
  duration: formatDuration(item.duration),
  date: formatDate(item.createdAt),
  contractTitle: item.contractTitle,
});

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

// 바텀 시트
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

  return (
    <>
      {/* 딤 배경 */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 100,
        }}
      />

      {/* 시트 */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff',
        borderRadius: '24px 24px 0 0',
        padding: '24px 20px 40px',
        zIndex: 101,
        maxHeight: '75vh',
        overflowY: 'auto',
      }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '17px', fontWeight: '800', color: '#111' }}>{rec.title}</div>
            <div style={{ fontSize: '12px', color: '#aaa', marginTop: '3px' }}>
              {rec.duration} · {rec.date}
              {rec.contractTitle && ` · ${rec.contractTitle}`}
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

        {/* 오디오 플레이어 (audioUrl이 있을 경우에만 표시) */}
        <audio
          ref={audioRef}
          onTimeUpdate={e => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={e => setAudioDuration(e.currentTarget.duration)}
          onEnded={() => setIsPlaying(false)}
        />
        <div style={{
          background: '#F6F5FF',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          marginBottom: '20px',
        }}>
          <button
            onClick={togglePlay}
            style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: '#5B4FCF', border: 'none', cursor: 'pointer',
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
      </div>
    </>
  );
};

const RecordingsPage = () => {
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRec, setSelectedRec] = useState<Recording | null>(null);

  useEffect(() => {
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
                  {rec.contractTitle && ` · ${rec.contractTitle}`}
                </div>
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
