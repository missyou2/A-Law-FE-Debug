import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import '../App.css';
import './MyContracts.css';
import checkSelected from '../assets/icons/check-selected.png';
import checkUnselected from '../assets/icons/check-unselected.png';

import { getContractList, addBookmark, removeBookmark, getContractById, deleteContract } from '../api/contractApi.js';
import type { ContractListItem } from '../api/contractApi.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const MOCK_CONTRACTS: ContractListItem[] = [
  { contractId: 1, title: '원룸 전세 계약서',       bookmark: true,  contractType: '임대차계약서', status: '분석 완료', createdAt: '2024-03-15T10:00:00.000Z' },
  { contractId: 2, title: '투룸 월세 계약서',        bookmark: false, contractType: '임대차계약서', status: '분석 완료', createdAt: '2024-05-20T14:30:00.000Z' },
  { contractId: 3, title: '오피스텔 임대차 계약서',  bookmark: false, contractType: '임대차계약서', status: '분석 완료', createdAt: '2024-07-10T09:15:00.000Z' },
];

const formatDate = (isoString: string): string => {
  const d = new Date(isoString);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

type SortOrder = 'default' | 'newest' | 'oldest';

const MyContracts = () => {

  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [contracts, setContracts] = useState<ContractListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState<Set<number>>(new Set());
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true);
      try {
        if (USE_MOCK) {
          setContracts(MOCK_CONTRACTS);
        } else {
          const data = await getContractList();
          setContracts(data.sort((a, b) => (b.bookmark ? 1 : 0) - (a.bookmark ? 1 : 0)));
        }
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, []);

  const filteredContracts = useMemo(() => {
    let result = [...contracts];

    if (dateFrom) {
      result = result.filter(c => new Date(c.createdAt) >= dateFrom);
    }
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59);
      result = result.filter(c => new Date(c.createdAt) <= end);
    }

    if (sortOrder === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortOrder === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    return result;
  }, [contracts, sortOrder, dateFrom, dateTo]);

  const isFilterActive = dateFrom !== null || dateTo !== null || sortOrder !== 'default';

  const resetFilter = () => {
    setDateFrom(null);
    setDateTo(null);
    setSortOrder('default');
  };

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
      await Promise.all(selectedIds.map(id => deleteContract(id)));
      setContracts(prev => prev.filter(c => !selectedIds.includes(c.contractId)));
      setSelectedIds([]);
      setIsEditing(false);
    } catch (error) {
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleContractClick = async (contractId: number) => {
    try {
      const res = await getContractById(contractId);
      navigate('/contract/view', { state: { contract: res.data } });
    } catch (error) {
      console.error("계약서 조회 실패:", error);
    }
  };

  const handleBookmarkToggle = async (e: React.MouseEvent, item: ContractListItem) => {
    e.stopPropagation();
    if (bookmarkLoading.has(item.contractId)) return;

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

      {/* 정렬 / 필터 */}
      {!isEditing && (
        <div className="mc-filter-bar">
          <div className="mc-sort-row">
            <button
              className={`mc-sort-btn${sortOrder === 'newest' ? ' active' : ''}`}
              onClick={() => setSortOrder(prev => prev === 'newest' ? 'default' : 'newest')}
            >
              최신순
            </button>
            <button
              className={`mc-sort-btn${sortOrder === 'oldest' ? ' active' : ''}`}
              onClick={() => setSortOrder(prev => prev === 'oldest' ? 'default' : 'oldest')}
            >
              오래된순
            </button>
            {isFilterActive && (
              <button className="mc-reset-btn" onClick={resetFilter}>초기화</button>
            )}
          </div>
          <div className="mc-date-row">
            <DatePicker
              selected={dateFrom}
              onChange={(date: Date | Date[] | null) => setDateFrom(date as Date | null)}
              selectsStart
              startDate={dateFrom}
              endDate={dateTo}
              {...(dateTo ? { maxDate: dateTo } : {})}
              dateFormat="yyyy.MM.dd"
              placeholderText="시작일"
              locale={ko}
              className="mc-date-input"
              calendarClassName="mc-calendar"
              isClearable
            />
            <span className="mc-date-sep">~</span>
            <DatePicker
              selected={dateTo}
              onChange={(date: Date | Date[] | null) => setDateTo(date as Date | null)}
              selectsEnd
              startDate={dateFrom}
              endDate={dateTo}
              {...(dateFrom ? { minDate: dateFrom } : {})}
              dateFormat="yyyy.MM.dd"
              placeholderText="종료일"
              locale={ko}
              className="mc-date-input"
              calendarClassName="mc-calendar"
              isClearable
            />
          </div>
        </div>
      )}

      {/* Contracts list */}
      <div className="mc-contracts-box">
        {!loading && filteredContracts.length === 0 ? (
          <div className="mc-empty-state">
            {isFilterActive ? '조건에 맞는 계약서가 없습니다.' : '저장된 계약서가 없습니다.\n계약서를 스캔해 보세요.'}
          </div>
        ) : (
          filteredContracts.map((item) => (
            <div
              key={item.contractId}
              className="mc-contract-item"
              onClick={() => isEditing ? toggleSelect(item.contractId) : handleContractClick(item.contractId)}
            >
              {isEditing && (
                <div className="mc-icon-wrapper">
                  <img
                    src={selectedIds.includes(item.contractId) ? checkSelected : checkUnselected}
                    alt="checkbox"
                    className="mc-checkbox-png"
                  />
                </div>
              )}

              <div className="mc-contract-details">
                <div className="mc-contract-title">
                  {item.bookmark && <span className="mc-star">★</span>}
                  {item.title}
                </div>
                <div className="mc-contract-meta">
                  <span className="mc-contract-type-badge">{item.contractType}</span>
                </div>
                <div className="mc-contract-date">{formatDate(item.createdAt)}</div>
              </div>

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
