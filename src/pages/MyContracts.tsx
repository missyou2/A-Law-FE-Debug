import React, { useState, useEffect } from 'react';
import '../App.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import menuIcon from '../assets/icons/menu.png';
import userIcon from '../assets/icons/user.png';
import docsImportant from '../assets/icons/docs-important.png';
import docsNormal from '../assets/icons/docs-normal.png';
import checkSelected from '../assets/icons/check-selected.png';
import checkUnselected from '../assets/icons/check-unselected.png';


const styles = {
  container: {
    backgroundColor: '#F1F2F6',
    minHeight: '100vh',
    padding: '24px 20px',
    margin: '0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '35px',
  },
  titleWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '15px',
  },
  sectionTitle: {
    fontSize: '30px',
    fontWeight: '800',
    color: '#000',
    margin: 0,
  } as const,
  deleteBtn: {
    fontSize: '20px',
    color: '#FF0000',
    fontWeight: '600',
    cursor: 'pointer',
  },
  editButton: {
    fontSize: '18px',
    color: '#333',
    fontWeight: '500',
    cursor: 'pointer',
  },
  
  recentContractsBox: {
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
    padding: '5px 20px',
    marginTop: '5px',
    overflow: 'hidden',
    minHeight: '70vh', 
  },
  contractItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '18px 0',
    cursor: 'pointer',
  },
  iconWrapper: {
    marginRight: '12px',
    display: 'flex',
    alignItems: 'center',
  },
  contractPng: {
    width: '45px',
    height: '45px',
    objectFit: 'contain' as const,
  },
  checkboxPng: {
    width: '30px',
    height: '30px',
    objectFit: 'contain' as const,
  },
  contractDetails: {
    flexGrow: 1,
  },
  contractTitle: {
    fontSize: '18px',
    fontWeight: '750',
    marginBottom: '2px',
    color: '#000',
  } as const,
  contractDate: {
    fontSize: '15px',
    color: '#888',
    fontWeight: '500',
  } as const,
  backHomeWrapper: {
    marginTop: '25px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    gap: '8px',
  },
  backArrow: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  backText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#000',
  },
};

const API_URL = "http://localhost:4000/contracts";

const MyContracts = () => {
  const navigate = useNavigate();

  // 상태 관리: 편집 모드 여부
  const [isEditing, setIsEditing] = useState(false);
  // 상태 관리: 선택된 아이템 ID들
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [contracts, setContracts] = useState<any[]>([]); // 초기값 빈 배열
  const [loading, setLoading] = useState(false); // 로딩 상태 추가

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await axios.get(API_URL);
        // json-server는 응답 데이터 자체가 배열이므로 바로 set 가능
        setContracts(response.data); 
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      }
    };
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem('token'); // 로그인 토큰 확인
      const response = await axios.get('/api/contracts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContracts(response.data);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
      // 401 Unauthorized인 경우 로그인 페이지로 이동시키는 로직 추가 가능
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    setSelectedIds([]);
  };

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // 3. 삭제 API 연동 로직
  const handleDelete = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      // json-server의 경우 여러 개 삭제 기능을 기본으로 제공하지 않으므로, 
      // 반복문을 돌거나 UI에서만 먼저 삭제 후 서버에 개별 요청을 보냅니다.
      // 여기서는 UI 반영 후 순차적 삭제를 예시로 듭니다.
      for (const id of selectedIds) {
        await axios.delete(`${API_URL}/${id}`);
      }

      const updatedContracts = contracts.filter(c => !selectedIds.includes(c.id));
      setContracts(updatedContracts);
      setSelectedIds([]);
      setIsEditing(false);
      alert("삭제 완료!");
    } catch (error) {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <img src={menuIcon} style={{width:'28px', height:'28px', cursor: 'pointer' }} />
        <img src={userIcon} style={{width:'36px', height:'36px', cursor: 'pointer' }} onClick={() => navigate('/mypage')} />
      </header>

      {/* 페이지 제목 및 버튼 섹션 */}
      <div style={styles.titleWrapper}>
        {isEditing ? (
          <span 
            style={{ 
              ...styles.deleteBtn, 
              opacity: loading || selectedIds.length === 0 ? 0.5 : 1,
              pointerEvents: loading ? 'none' : 'auto' 
            }} 
            onClick={handleDelete}
          >
            {loading ? "삭제 중..." : "삭제"}
          </span>
        ) : (
          <h1 style={styles.sectionTitle}>이전계약</h1>
        )}
        <span style={styles.editButton} onClick={toggleEdit}>
          {isEditing ? "완료" : "편집"}
        </span>
      </div>

      <div style={styles.recentContractsBox}>
        {contracts.length === 0 && !loading && (
          <div style={{ textAlign: 'center', marginTop: '50px', color: '#888' }}>
            내역이 없습니다.
          </div>
        )}

        {Array.isArray(contracts) && contracts.map((item, index) => (
          <div 
            key={item.id} 
            onClick={() => isEditing && toggleSelect(item.id)}
            style={{
              ...styles.contractItem, 
              borderBottom: index === contracts.length - 1 ? 'none' : '1.5px solid #eee' 
            }}
          >
            <div style={styles.iconWrapper}>
              {isEditing ? (
                <img
                  src={selectedIds.includes(item.id) ? checkSelected : checkUnselected}
                  alt="checkbox"
                  style={styles.checkboxPng}
                />
              ) : (
                <img 
                  src={item.isImportant ? docsImportant : docsNormal} 
                  alt="contract icon" 
                  style={styles.contractPng}
                />
              )}
            </div>
            
            <div style={styles.contractDetails}>
              <div style={styles.contractTitle}>{item.title}</div>
              <div style={styles.contractDate}>({item.date})</div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.backHomeWrapper} onClick={() => navigate('/')}>
        <span style={styles.backArrow}>←</span>
        <span style={styles.backText}>홈으로 돌아가기</span>
      </div>
    </div>
  );
};



export default MyContracts;