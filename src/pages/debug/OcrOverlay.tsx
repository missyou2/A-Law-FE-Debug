import { useState, useRef, useCallback, useEffect } from "react";
import styles from "./OcrOverlay.module.css";

const API_BASE = "http://localhost:8001/api/contracts";

interface OcrWord {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface OcrData {
  words: OcrWord[];
  full_text: string;
  processing_time: number;
  image_width: number;
  image_height: number;
}

type StatusType = "ok" | "err" | "loading" | "idle";

interface StatusState {
  message: string;
  type: StatusType;
}

export default function OcrOverlay() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [ocrData, setOcrData] = useState<OcrData | null>(null);
  const [status, setStatus] = useState<StatusState>({ message: "", type: "idle" });
  const [debugMode, setDebugMode] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCurrentFile(f);
    setOcrData(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageSrc(ev.target?.result as string);
      setStatus({ message: '이미지 로드됨 — "OCR 실행" 클릭', type: "ok" });
    };
    reader.readAsDataURL(f);
  };

  const handleImageLoad = () => {
    if (imgRef.current) {
      setImgSize({
        w: imgRef.current.clientWidth,
        h: imgRef.current.clientHeight,
      });
    }
  };

  useEffect(() => {
    const onResize = () => {
      if (imgRef.current) {
        setImgSize({
          w: imgRef.current.clientWidth,
          h: imgRef.current.clientHeight,
        });
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleOcr = useCallback(async () => {
    if (!currentFile) {
      setStatus({ message: "먼저 이미지를 선택하세요", type: "err" });
      return;
    }
    setStatus({ message: "OCR 처리 중... (Upstage API 호출)", type: "loading" });

    try {
      const formData = new FormData();
      formData.append("file", currentFile);

      const res = await fetch(
        `${API_BASE}/ocr/full?structurize=false&include_overlay=true`,
        { method: "POST", body: formData }
      );
      if (!res.ok) throw new Error("HTTP " + res.status + ": " + (await res.text()));

      const data: OcrData = await res.json();
      console.log("OCR 응답:", data);

      setOcrData(data);
      const wordCount = data.words?.length ?? 0;
      setStatus({
        message: `OCR 완료! ${wordCount}개 단어 감지 (${data.processing_time}초)`,
        type: "ok",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus({ message: "OCR 실패: " + message, type: "err" });
      console.error(err);
    }
  }, [currentFile]);

const statusClassName: Record<StatusType, string> = {
  ok: styles.statusOk ?? "",
  err: styles.statusErr ?? "",
  loading: styles.statusLoading ?? "",
  idle: "",
};

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.header}>
          <h1>OCR Text Overlay</h1>
          <p>이미지 위에 투명 텍스트를 올려 드래그 &amp; 복사가 가능합니다</p>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <label className={styles.btnPrimary}>
            이미지 선택
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </label>

          <button onClick={handleOcr} className={styles.btnPrimary}>
            OCR 실행
          </button>

          <label className={styles.checkLabel}>
            <input
              type="checkbox"
              checked={debugMode}
              onChange={(e) => setDebugMode(e.target.checked)}
            />
            박스 표시 (디버그)
          </label>

          {status.type !== "idle" && (
            <span className={statusClassName[status.type]}>
              {status.message}
            </span>
          )}
        </div>

        {/* Viewer */}
        <div className={styles.viewer}>
          {imageSrc ? (
            <div className={styles.imageWrapper}>
              <img
                ref={imgRef}
                src={imageSrc}
                alt="OCR target"
                onLoad={handleImageLoad}
              />

              {/* Word overlays */}
              {ocrData?.words && imgSize.w > 0 &&
                ocrData.words.map((word, i) => {
                  const left = (word.x / 100) * imgSize.w;
                  const top = (word.y / 100) * imgSize.h;
                  const w = (word.width / 100) * imgSize.w;
                  const h = (word.height / 100) * imgSize.h;
                  const fontSize = Math.max(h * 0.85, 8);

                  return (
                    <span
                      key={i}
                      className={`${styles.wordOverlay} ${debugMode ? styles.wordOverlayDebug : ""}`}
                      style={{ left, top, width: w, height: h, fontSize }}
                    >
                      {word.text}
                    </span>
                  );
                })}
            </div>
          ) : (
            <p className={styles.placeholder}>
              이미지를 선택하고 OCR 실행을 눌러주세요
            </p>
          )}
        </div>

        {/* Info Panel */}
        {ocrData && (
          <div className={styles.infoPanel}>
            <InfoCard label="이미지 크기" value={`${ocrData.image_width} x ${ocrData.image_height}`} />
            <InfoCard label="처리 시간" value={`${ocrData.processing_time}초`} />
            <InfoCard label="단어 수" value={`${ocrData.words?.length ?? 0}개`} />
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>전체 텍스트</div>
              <div className={styles.infoTextValue}>
                {(ocrData.full_text || "").substring(0, 300)}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.infoCard}>
      <div className={styles.infoLabel}>{label}</div>
      <div className={styles.infoValue}>{value}</div>
    </div>
  );
}
