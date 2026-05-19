import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import './contractCarousel.css'
import '../../App.css'
// import { saveContract } from "../../services/contractService.js";  // 서비스 사용 시

const styles={
    container: {
    backgroundColor: '#F1F2F6',
    minHeight: '100vh',
    padding: '40px 24px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
  } as const,
  title: {
    fontSize: '34px',
    fontWeight: '530',
    width:'100%',
    textAlign: 'left',
    marginBottom: '100px',
    lineHeight: '1.3',
    color: '#1a1a1aff',
  } as const,

  buttonBase: {
    width: "100%",
    padding: "11px 20px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(to right, #21D8FC, #5865B9)",
    boxShadow: '0 2px 5px rgba(143, 143, 143, 0.8)',
    color: "#fff",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: "12px",
  },
}

function DocumentSavePage() {
  const [title, setTitle] = useState("2024-11-표준계약서_임대");
  const [isImportant, setIsImportant] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  return (
    <div style={styles.container}
    >
      <h1 style={styles.title}>
        이 계약서를<br />나의 문서로 저장할까요?
      </h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "20px",
          marginBottom:'80px',
        }}
      >
        <div>
          <label
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#000000ff",
              marginBottom: "10px",
              display: "block",
            }}
          >
            문서 이름
          </label>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 0",
              fontSize: "15px",
              border: "none",
              borderBottom: "1px solid #ccc",
              outline: "none",
              background: "transparent"
            }}
          />
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
            gap: "8px",
            color: "#444"
          }}
        >
          <input
            type="checkbox"
            checked={isImportant}
            onChange={(e) => setIsImportant(e.target.checked)}
            style={{ width: 16, height: 16 }}
          />
          중요 문서함에 추가하기
        </label>
      </div>
          
      {/* 에러 메시지 */}
      {error && (
        <p style={{ color: "#ff0000", fontSize: "13px", marginBottom: "10px" }}>
          {error}
        </p>
      )}

      {/* 저장 버튼 */}
      <button
        style={{
          ...styles.buttonBase,
          backgroundColor: isSaving ? "#ccc" : undefined,
          cursor: isSaving ? "not-allowed" : "pointer",
        }}
        onClick={async () => {
          if (isSaving) return;

          setIsSaving(true);
          setError("");

          // ============================================
          // 여기에 API 호출 코드 삽입
          // ============================================
          // API: POST /api/v1/contracts
          // 설명: 계약서 업로드 및 분석 요청 (파일 저장 생성)
          //
          // 필요한 데이터:
          // - title: string (계약서 제목)
          // - isImportant: boolean (중요 문서 여부)
          // - file: File (이미지, PDF, 텍스트 파일)
          //
          // 예시 코드:
          // const API_KEY = "여기에 API 키 입력";
          // const BASE_URL = "http://localhost:3000/api/v1";
          //
          // const formData = new FormData();
          // formData.append('title', title);
          // formData.append('isImportant', String(isImportant));
          // // formData.append('file', fileObject);  // 파일이 있는 경우
          //
          // try {
          //   const response = await fetch(`${BASE_URL}/contracts`, {
          //     method: 'POST',
          //     headers: {
          //       'Authorization': `Bearer ${API_KEY}`,
          //     },
          //     body: formData,
          //   });
          //
          //   if (!response.ok) throw new Error('업로드 실패');
          //   const data = await response.json();
          //
          //   setIsSaving(false);
          //   navigate('/contract/saved');
          // } catch (error) {
          //   setIsSaving(false);
          //   setError('저장에 실패했습니다.');
          // }
          // ============================================

          // 임시: 더미 동작 (위 코드로 교체하세요)
          setTimeout(() => {
            setIsSaving(false);
            navigate('/contract/saved');
          }, 1000);
        }}
        disabled={isSaving}
      >
        {isSaving ? "저장 중..." : "내 문서에 저장하기"}
      </button>

      {/* 저장하지 않기 버튼 */}
      <button
        style={{...styles.buttonBase, background:'white', color:'black'}}
        onClick={()=>{
            navigate('/'); // 저장하지 않고 홈으로 돌아감
        }} 
      >
        저장하지 않고 나가기
      </button>

      <div
        style={{
          marginTop: "28px",
          fontSize: "14px",
          color: "#666",
          cursor: "pointer",
        }}
        onClick={() => navigate(-1)}
      >
        ← 이전으로 돌아가기
      </div>
    </div>
  );
}

export default DocumentSavePage;
