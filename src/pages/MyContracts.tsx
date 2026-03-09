import React, { useState, useEffect } from 'react';
import '../App.css';
import './MyContracts.css';
import docsImportant from '../assets/icons/docs-important.png';
import docsNormal from '../assets/icons/docs-normal.png';
import checkSelected from '../assets/icons/check-selected.png';
import checkUnselected from '../assets/icons/check-unselected.png';

import { getContractList, addBookmark, removeBookmark } from '../api/contractApi.js';
import type { ContractListItem } from '../api/contractApi.js';


const formatDate = (isoString: string): string => {
  const d = new Date(isoString);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const MyContracts = () => {

  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [contracts, setContracts] = useState<ContractListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true);
      try {
        const data = await getContractList();
        setContracts(data);
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
      setContracts(prev => prev.filter(c => !selectedIds.includes(c.contractId)));
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
    if (bookmarkLoading.has(item.contractId)) return;

    // 낙관적 업데이트
    setContracts(prev =>
      prev.map(c => c.contractId === item.contractId ? { ...c, bookmark: !c.bookmark } : c)
    );
    setBookmarkLoading(prev => new Set(prev).add(item.contractId));

    try {
      if (item.bookmark) {
        await removeBookmark(item.contractId);
      } else {
        await addBookmark(item.contractId);
      }
    } catch (error) {
      // 실패 시 롤백
      setContracts(prev =>
        prev.map(c => c.contractId === item.contractId ? { ...c, bookmark: item.bookmark } : c)
      );
      alert("즐겨찾기 처리 중 오류가 발생했습니다.");
    } finally {
      setBookmarkLoading(prev => {
        const next = new Set(prev);
        next.delete(item.contractId);
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
              key={item.contractId}
              className="mc-contract-item"
              onClick={() => isEditing && toggleSelect(item.contractId)}
            >
              <div className="mc-icon-wrapper">
                {isEditing ? (
                  <img
                    src={selectedIds.includes(item.contractId) ? checkSelected : checkUnselected}
                    alt="checkbox"
                    className="mc-checkbox-png"
                  />
                ) : (
                  <img
                    src={item.bookmark ? docsImportant : docsNormal}
                    alt="contract icon"
                    className="mc-contract-png"
                  />
                )}
              </div>

              <div className="mc-contract-details">
                <div className="mc-contract-title">{item.title}</div>
                <div className="mc-contract-date">{formatDate(item.createdAt)}</div>
              </div>

              {/* 즐겨찾기 버튼 (편집 모드에서는 숨김) */}
              {!isEditing && (
                <button
                  className={`mc-bookmark-btn${item.bookmark ? ' active' : ''}${bookmarkLoading.has(item.contractId) ? ' loading' : ''}`}
                  onClick={(e) => handleBookmarkToggle(e, item)}
                  aria-label={item.bookmark ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                >
                  {item.bookmark ? '★' : '☆'}
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
