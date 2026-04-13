import { useState, useRef, useCallback, useEffect } from "react";
import styles from "./OcrOverlay.module.css";
import { getOcrEasyExplanation } from "../../api/contractApi.js";
import type { OcrEasyExplanationResponse } from "../../api/contractApi.js";

const API_URL = "/api/v1/contracts/ocr";

interface OcrWord {
  text: string;
  confidence: number;
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
  image_url?: string;
}

type StatusType = "ok" | "err" | "loading" | "idle";

interface StatusState {
  message: string;
  type: StatusType;
}

interface SelectionTooltip {
  x: number;
  y: number;
  text: string;
}

export default function OcrOverlay() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [ocrData, setOcrData] = useState<OcrData | null>(null);
  const [status, setStatus] = useState<StatusState>({ message: "", type: "idle" });
  const [debugMode, setDebugMode] = useState(false);
  const [contractId, setContractId] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

  // Selection tooltip state
  const [selectionTooltip, setSelectionTooltip] = useState<SelectionTooltip | null>(null);

  // Bottom sheet state
  const [showSheet, setShowSheet] = useState(false);
  const [sheetSentence, setSheetSentence] = useState("");
  const [sheetData, setSheetData] = useState<OcrEasyExplanationResponse | null>(null);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheetError, setSheetError] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCurrentFile(f);
    setFileName(f.name);
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

  // Dismiss tooltip on outside click
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (tooltipRef.current && tooltipRef.current.contains(e.target as Node)) return;
      setSelectionTooltip(null);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    const text = sel?.toString().trim() ?? "";
    if (!text || !imageWrapperRef.current || !sel || sel.rangeCount === 0) {
      setSelectionTooltip(null);
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const wrapperRect = imageWrapperRef.current.getBoundingClientRect();
    setSelectionTooltip({
      x: rect.left + rect.width / 2 - wrapperRect.left,
      y: rect.top - wrapperRect.top - 8,
      text,
    });
  }, []);

  const handleExplainClick = useCallback(async () => {
    if (!selectionTooltip) return;
    const sentence = selectionTooltip.text;

    setSheetSentence(sentence);
    setSelectionTooltip(null);
    setShowSheet(true);
    setSheetLoading(true);
    setSheetError("");
    setSheetData(null);
    setTimeout(() => setSheetOpen(true), 20);

    try {
      const result = await getOcrEasyExplanation(contractId, sentence);
      setSheetData(result);
    } catch {
      setSheetError("설명을 불러오는데 실패했습니다.");
    } finally {
      setSheetLoading(false);
    }
  }, [selectionTooltip, contractId]);

  const handleCloseSheet = useCallback(() => {
    setSheetOpen(false);
    setTimeout(() => setShowSheet(false), 250);
  }, []);

  const compressImage = (file: File): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const MAX_PX = 2000; // longest edge cap
      const QUALITY = 0.85;
      const img = new Image();
      img.onload = () => {
        const { naturalWidth: w, naturalHeight: h } = img;
        const scale = Math.min(1, MAX_PX / Math.max(w, h));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(w * scale);
        canvas.height = Math.round(h * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("canvas toBlob failed"))),
          "image/jpeg",
          QUALITY
        );
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });

  const handleOcr = useCallback(async () => {
    if (!currentFile) {
      setStatus({ message: "먼저 이미지를 선택하세요", type: "err" });
      return;
    }
    setStatus({ message: "OCR 처리 중...", type: "loading" });

    try {
      const compressed = await compressImage(currentFile);
      const formData = new FormData();
      formData.append("file", compressed, currentFile.name.replace(/\.[^.]+$/, ".jpg"));

      const res = await fetch(API_URL, { method: "POST", body: formData });
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
          <label className={styles.btn}>
            이미지 선택
            <input
              type="file"
              accept="image/*,application/pdf"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </label>

          {fileName && <span className={styles.fileName}>{fileName}</span>}

          <button onClick={handleOcr} className={styles.btn}>
            OCR 실행
          </button>

          <label className={styles.debugLabel}>
            <input
              type="checkbox"
              checked={debugMode}
              onChange={(e) => setDebugMode(e.target.checked)}
            />
            박스 표시 (디버그)
          </label>

          <label className={styles.debugLabel}>
            계약서 ID:
            <input
              type="number"
              value={contractId}
              onChange={(e) => setContractId(Number(e.target.value))}
              className={styles.contractIdInput}
              min={1}
            />
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
            <div
              className={styles.imageWrapper}
              ref={imageWrapperRef}
              onMouseUp={handleMouseUp}
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="OCR target"
                onLoad={handleImageLoad}
              />

              {/* Word overlays */}
              {ocrData?.words && imgSize.h > 0 &&
                ocrData.words.map((word, i) => {
                  const fontSize = Math.max((word.height / 100) * imgSize.h * 0.85, 8);
                  return (
                    <span
                      key={i}
                      className={`${styles.wordOverlay} ${debugMode ? styles.wordOverlayDebug : ""}`}
                      style={{
                        left: `${word.x}%`,
                        top: `${word.y}%`,
                        width: `${word.width}%`,
                        height: `${word.height}%`,
                        fontSize,
                      }}
                    >
                      {word.text}
                    </span>
                  );
                })}

              {/* Selection tooltip */}
              {selectionTooltip && (
                <div
                  ref={tooltipRef}
                  className={styles.selectionTooltip}
                  style={{
                    left: selectionTooltip.x,
                    top: selectionTooltip.y,
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <button
                    className={styles.explainBtn}
                    onClick={handleExplainClick}
                  >
                    설명보기
                  </button>
                </div>
              )}
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

      {/* Easy Explanation Bottom Sheet */}
      {showSheet && (
        <>
          <div
            className={`${styles.sheetBackdrop} ${sheetOpen ? styles.sheetBackdropOpen : ""}`}
            onClick={handleCloseSheet}
          />
          <div className={`${styles.bottomSheet} ${sheetOpen ? styles.bottomSheetOpen : ""}`}>
            <div className={styles.sheetHandle} />
            <h3 className={styles.sheetTitle}>선택된 문구</h3>
            <p className={styles.sheetSelectedText}>{sheetSentence}</p>
            <div className={styles.sheetDivider} />
            {sheetLoading ? (
              <p className={styles.sheetPlaceholder}>설명을 불러오는 중...</p>
            ) : sheetError ? (
              <p className={styles.sheetPlaceholder} style={{ color: "#e74c3c" }}>{sheetError}</p>
            ) : sheetData ? (
              <div className={styles.sheetExplanation}>
                <p className={styles.sheetEasyText}>{sheetData.easy_explanation}</p>
                {sheetData.examples && sheetData.examples.length > 0 && (
                  <div className={styles.sheetExamples}>
                    <h4 className={styles.sheetExamplesTitle}>예시</h4>
                    {sheetData.examples.map((ex: string, i: number) => (
                      <div key={i} className={styles.sheetExampleItem}>{ex}</div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className={styles.sheetPlaceholder}>선택한 문구에 대한 설명이 여기에 표시됩니다.</p>
            )}
          </div>
        </>
      )}
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
