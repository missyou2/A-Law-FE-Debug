import React, { useState, useEffect } from 'react';
import '../App.css';
import './MyContracts.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import docsImportant from '../assets/icons/docs-important.png';
import docsNormal from '../assets/icons/docs-normal.png';
import checkSelected from '../assets/icons/check-selected.png';
import checkUnselected from '../assets/icons/check-unselected.png';

const API_URL = "http://localhost:4000/contracts";

const MyContracts = () => {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await axios.get(API_URL);
        setContracts(response.data);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
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
      for (const id of selectedIds) {
        await axios.delete(`${API_URL}/${id}`);
      }
      setContracts(prev => prev.filter(c => !selectedIds.includes(c.id)));
      setSelectedIds([]);
      setIsEditing(false);
    } catch (error) {
      alert("삭제 중 오류가 발생했습니다.");
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
        {contracts.length === 0 && !loading ? (
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
                    src={item.isImportant ? docsImportant : docsNormal}
                    alt="contract icon"
                    className="mc-contract-png"
                  />
                )}
              </div>
              <div className="mc-contract-details">
                <div className="mc-contract-title">{item.title}</div>
                <div className="mc-contract-date">{item.date}</div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default MyContracts;
