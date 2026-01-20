import React, { useState } from 'react';
import '../App.css'
import { useNavigate } from 'react-router-dom';

import menuIcon from '../assets/icons/menu.png';
import userIcon from '../assets/icons/user.png';
import docsImportant from '../assets/icons/docs-important.png';
import docsNormal from '../assets/icons/docs-normal.png';
import checkboxIcon from '../assets/icons/checkbox.png';


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

const MyContracts = () => {
  const navigate = useNavigate();

  // 상태 관리: 편집 모드 여부
  const [isEditing, setIsEditing] = useState(false);
  // 상태 관리: 선택된 아이템 ID들
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  // 상태 관리: 계약서 리스트
  const [contracts, setContracts] = useState([
    { id: 1, title: '2024년 복정동 전세...', date: '2024. 11. 19', isImportant: true },
    { id: 2, title: '논현동 매매계약서', date: '2024. 12. 10', isImportant: false },
    { id: 3, title: '매매계약서 사본', date: '2024. 11. 17', isImportant: false },
    { id: 4, title: '2023년 월세계약서', date: '2023. 05. 22', isImportant: false },
  ]);

  // // 2. 유저별 계약서 리스트 불러오기 (백엔드 연결 시 활성화)
  // /*
  // const userId = "user123"; // 실제로는 context나 auth 상태에서 가져옴

  // useEffect(() => {
  //   const fetchUserContracts = async () => {
  //     try {
  //       // 백엔드 API 호출 예시
  //       // const response = await fetch(`https://api.yourservice.com/contracts?userId=${userId}`);
  //       // if (response.ok) {
  //       //   const data = await response.json();
  //       //   setContracts(data); // 불러온 데이터로 상태 업데이트
  //       // }
  //       console.log(`${userId}님의 데이터를 불러왔습니다.`);
  //     } catch (error) {
  //       console.error("데이터 로딩 실패:", error);
  //     }
  //   };

  //   fetchUserContracts();
  // }, [userId]);
  // */

  // // 3. 삭제 실행 (백엔드 통신 고려)
  // const handleDelete = async () => {
  //   if (selectedIds.length === 0) return;
    
  //   // UI에서 즉시 반영
  //   const updatedContracts = contracts.filter(c => !selectedIds.includes(c.id));
    
  //   /* [백엔드 삭제 요청 주석]
  //   try {
  //     // await fetch(`https://api.yourservice.com/contracts/delete`, {
  //     //   method: 'POST',
  //     //   body: JSON.stringify({ ids: selectedIds })
  //     // });
  //     console.log("서버에서 삭제 완료:", selectedIds);
  //     setContracts(updatedContracts);
  //   } catch (error) {
  //     alert("삭제 중 오류가 발생했습니다.");
  //   }
  //   */

  //   // 현재는 로컬 상태만 업데이트
  //   setContracts(updatedContracts);
  //   setSelectedIds([]);
  //   setIsEditing(false);
  // };
  
  // 편집 모드 토글
  const toggleEdit = () => {
    setIsEditing(!isEditing);
    setSelectedIds([]); // 편집 모드 종료 시 선택 초기화
  };

  // 체크박스 선택/해제
  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // 삭제 실행
  const handleDelete = () => {
    if (selectedIds.length === 0) return;
    
    // 실제 삭제 로직 (필터링)
    const updatedContracts = contracts.filter(c => !selectedIds.includes(c.id));
    setContracts(updatedContracts);
    setSelectedIds([]);
    setIsEditing(false); // 삭제 후 편집모드 종료
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <img src={menuIcon} style={{width:'28px', height:'28px', cursor: 'pointer' }} />
        <img src={userIcon} style={{width:'36px', height:'36px', cursor: 'pointer' }} />
      </header>

      {/* 페이지 제목 및 버튼 섹션 */}
      <div style={styles.titleWrapper}>
        {isEditing ? (
          <span style={styles.deleteBtn} onClick={handleDelete}>삭제</span>
        ) : (
          <h1 style={styles.sectionTitle}>이전계약</h1>
        )}
        <span style={styles.editButton} onClick={toggleEdit}>
          {isEditing ? "완료" : "편집"}
        </span>
      </div>

      <div style={styles.recentContractsBox}>
        {contracts.map((item, index) => (
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
                  src={checkboxIcon} 
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