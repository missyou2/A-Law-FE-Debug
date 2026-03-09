import React, { useState, useEffect } from 'react';
import '../App.css';
import './MyContracts.css';
import { useNavigate } from 'react-router-dom';
import docsImportant from '../assets/icons/docs-important.png';
import docsNormal from '../assets/icons/docs-normal.png';
import checkSelected from '../assets/icons/check-selected.png';
import checkUnselected from '../assets/icons/check-unselected.png';

import { getContractList, addBookmark, removeBookmark } from '../api/contractApi.js';
import type { ContractListItem } from '../api/contractApi.js';

// ── Mock data (FE 테스트용) ─────────────────────────────────────
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || true;

const MOCK_CONTRACTS: ContractListItem[] = [
  { id: 1, title: '원룸 전세 계약서', date: '2024-03-15', is_bookmarked: true },
  { id: 2, title: '투룸 월세 계약서', date: '2024-05-20', is_bookmarked: false },
  { id: 3, title: '오피스텔 임대차 계약서', date: '2024-07-10', is_bookmarked: false },
  { id: 4, title: '상가 임대 계약서', date: '2024-09-03', is_bookmarked: true },
  { id: 5, title: '아파트 전세 계약서', date: '2025-01-22', is_bookmarked: false },
];
// ──────────────────────────────────────────────────────────────

const MyContracts = () => {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [contracts, setContracts] = useState<ContractListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true);
      try {
        if (USE_MOCK) {
          // FE 테스트: 목 데이터 사용
          setContracts(MOCK_CONTRACTS);
        } else {
          const data = await getContractList();
          setContracts(data);
        }
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, []);

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    setSelectedIds([]);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      setLoading(true);
      // TODO: 계약서 삭제 API 연동
      setContracts(prev => prev.filter(c => !selectedIds.includes(c.id)));
      setSelectedIds([]);
      setIsEditing(false);
    } catch (error) {
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = async (e: React.MouseEvent, item: ContractListItem) => {
    e.stopPropagation();
    if (bookmarkLoading.has(item.id)) return;

    // 낙관적 업데이트
    setContracts(prev =>
      prev.map(c => c.id === item.id ? { ...c, is_bookmarked: !c.is_bookmarked } : c)
    );
    setBookmarkLoading(prev => new Set(prev).add(item.id));

    try {
      if (USE_MOCK) {
        // FE 테스트: API 호출 없이 상태만 업데이트
        await new Promise(resolve => setTimeout(resolve, 300));
      } else {
        if (item.is_bookmarked) {
          await removeBookmark(item.id);
        } else {
          await addBookmark(item.id);
        }
      }
    } catch (error) {
      // 실패 시 롤백
      setContracts(prev =>
        prev.map(c => c.id === item.id ? { ...c, is_bookmarked: item.is_bookmarked } : c)
      );
      alert("즐겨찾기 처리 중 오류가 발생했습니다.");
    } finally {
      setBookmarkLoading(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  return (
    <div className="mc-container">

      {/* Title row */}
      <div className="mc-title-row">
        {isEditing ? (
          <span
            className={`mc-title--delete${selectedIds.length === 0 || loading ? ' disabled' : ''}`}
            onClick={handleDelete}
          >
            {loading ? "삭제 중..." : "삭제"}
          </span>
        ) : (
          <h1 className="mc-title">이전 계약</h1>
        )}
        <span className="mc-edit-btn" onClick={toggleEdit}>
          {isEditing ? "완료" : "편집"}
        </span>
      </div>

      {/* Contracts list */}
      <div className="mc-contracts-box">
        {!loading && contracts.length === 0 ? (
          <div className="mc-empty-state">
            저장된 계약서가 없습니다.<br />
            계약서를 스캔해 보세요.
          </div>
        ) : (
          contracts.map((item) => (
            <div
              key={item.id}
              className="mc-contract-item"
              onClick={() => isEditing && toggleSelect(item.id)}
            >
              <div className="mc-icon-wrapper">
                {isEditing ? (
                  <img
                    src={selectedIds.includes(item.id) ? checkSelected : checkUnselected}
                    alt="checkbox"
                    className="mc-checkbox-png"
                  />
                ) : (
                  <img
                    src={item.is_bookmarked ? docsImportant : docsNormal}
                    alt="contract icon"
                    className="mc-contract-png"
                  />
                )}
              </div>

              <div className="mc-contract-details">
                <div className="mc-contract-title">{item.title}</div>
                <div className="mc-contract-date">{item.date}</div>
              </div>

              {/* 즐겨찾기 버튼 (편집 모드에서는 숨김) */}
              {!isEditing && (
                <button
                  className={`mc-bookmark-btn${item.is_bookmarked ? ' active' : ''}${bookmarkLoading.has(item.id) ? ' loading' : ''}`}
                  onClick={(e) => handleBookmarkToggle(e, item)}
                  aria-label={item.is_bookmarked ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                >
                  {item.is_bookmarked ? '★' : '☆'}
                </button>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default MyContracts;
