import React, { use, useState } from "react";
import { useNavigate } from 'react-router-dom';
import './contractCarousel.css'
import '../../App.css'

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
          <input type="checkbox" style={{ width: 16, height: 16 }} />
          중요 문서함에 추가하기
        </label>
      </div>
          
      {/* 저장 버튼 */}
      <button
        style={{...styles.buttonBase}}
        onClick={()=>{
            // 저장 API 넣는 곳 입니다 
            navigate('/contract/saved');
        }} 
      >
        내 문서에 저장하기
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
