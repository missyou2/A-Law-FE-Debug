import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

import UserIcon from '../../assets/icons/user.png';

const styles = {
  container: {
    backgroundColor: '#F1F2F6',
    minHeight: '100vh',
    padding: '24px 20px',
    margin: '0',
    display: 'flex',
    flexDirection: 'column',
  } as const,

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '18px',
    color: '#111',
  } as const,
  headerLeft: {
    width: '46px',
    height: '46px',
    borderRadius: '14px',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    userSelect: 'none',
  } as const,
  headerTitle: {
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '-0.2px',
  } as const,
  headerRightSpacer: {
    width: '46px',
    height: '46px',
  } as const,

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '20px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.10)',
    padding: '34px 24px 26px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    marginTop: '12px',
  } as const,
  userIconWrap: {
    width: '74px',
    height: '74px',
    borderRadius: '22px',
    backgroundColor: '#F1F2F6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  } as const,
  userIcon: {
    width: '44px',
    height: '44px',
    opacity: 0.9,
  } as const,
  title: {
    fontSize: '22px',
    fontWeight: '850',
    color: '#111',
    marginBottom: '10px',
    letterSpacing: '-0.2px',
  } as const,
  desc: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#666',
    lineHeight: 1.55,
    marginBottom: '18px',
    letterSpacing: '-0.1px',
  } as const,

  kakaoBtn: {
    width: '100%',
    height: '54px',
    borderRadius: '14px',
    backgroundColor: '#FEE500',
    color: '#111',
    fontSize: '16px',
    fontWeight: '850',
    border: 'none',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  } as const,
  kakaoMark: {
    width: '22px',
    height: '22px',
    borderRadius: '7px',
    backgroundColor: '#111',
    color: '#FEE500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '900',
    fontSize: '14px',
    lineHeight: 1,
  } as const,

  secondaryBtn: {
    width: '100%',
    height: '50px',
    borderRadius: '14px',
    backgroundColor: '#FFFFFF',
    color: '#111',
    fontSize: '15px',
    fontWeight: '850',
    border: '1px solid #EAEAEA',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '10px',
  } as const,

  hint: {
    marginTop: '14px',
    fontSize: '12px',
    color: '#888',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 1.45,
  } as const,

  menuBox: {
    marginTop: '16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
  } as const,
  menuItem: {
    padding: '16px 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    color: '#111',
    fontWeight: '750',
    fontSize: '15px',
    borderBottom: '1px solid #F0F0F0',
    userSelect: 'none',
  } as const,
  menuItemLast: {
    borderBottom: 'none',
  } as const,
  menuRight: {
    color: '#999',
    fontSize: '14px',
    fontWeight: '700',
  } as const,

  footerSpacer: {
    flex: 1,
  } as const,
  version: {
    marginTop: '16px',
    textAlign: 'center',
    fontSize: '12px',
    color: '#999',
    fontWeight: '650',
  } as const,

  spinnerWrap: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '8px',
    marginBottom: '2px',
  } as const,
  spinner: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    border: '3px solid #EAEAEA',
    borderTop: '3px solid #111',
    animation: 'spin 0.9s linear infinite',
  } as const,
};

const MyPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const user = useMemo(
    () => ({
      nickname: '사용자',
      note: '로그인 상태(더미)입니다.',
    }),
    []
  );

  const handleMockKakaoLogin = () => {
    if (isAuthLoading) return;
    setIsAuthLoading(true);
    window.setTimeout(() => {
      setIsLoggedIn(true);
      setIsAuthLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    if (isAuthLoading) return;
    setIsLoggedIn(false);
  };

  const pressStyle = (e: React.MouseEvent<HTMLElement>) => {
    (e.currentTarget as HTMLElement).style.transform = 'scale(0.98)';
  };

  const releaseStyle = (e: React.MouseEvent<HTMLElement>) => {
    (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div style={styles.header}>
        <div
          style={styles.headerLeft}
          onClick={() => navigate(-1)}
          onMouseDown={pressStyle}
          onMouseUp={releaseStyle}
          onMouseLeave={releaseStyle}
        >
          ←
        </div>
        <div style={styles.headerTitle}>마이페이지</div>
        <div style={styles.headerRightSpacer} />
      </div>

      {!isLoggedIn ? (
        <div style={styles.card}>
          <div style={styles.userIconWrap}>
            <img src={UserIcon} style={styles.userIcon} />
          </div>

          <div style={styles.title}>로그인이 필요합니다</div>
          <div style={styles.desc}>
            카카오톡으로 로그인하고
            <br />
            계약서를 안전하게 관리하세요
          </div>

          <button
            style={{
              ...styles.kakaoBtn,
              opacity: isAuthLoading ? 0.75 : 1,
              cursor: isAuthLoading ? 'default' : 'pointer',
            }}
            onClick={handleMockKakaoLogin}
            onMouseDown={pressStyle}
            onMouseUp={releaseStyle}
            onMouseLeave={releaseStyle}
          >
            <div style={styles.kakaoMark}>K</div>
            카카오톡 로그인
          </button>

          {isAuthLoading && (
            <div style={styles.spinnerWrap}>
              <div style={styles.spinner} />
            </div>
          )}

          <div style={styles.hint}>
            로그인 후 저장한 계약서와 분석 기록을
            <br />
            여러 기기에서 확인할 수 있어요.
          </div>
        </div>
      ) : (
        <div style={styles.card}>
          <div style={styles.userIconWrap}>
            <img src={UserIcon} style={styles.userIcon} />
          </div>

          <div style={styles.title}>{user.nickname} 님</div>
          <div style={styles.desc}>{user.note}</div>

          <button
            style={styles.secondaryBtn}
            onClick={handleLogout}
            onMouseDown={pressStyle}
            onMouseUp={releaseStyle}
            onMouseLeave={releaseStyle}
          >
            로그아웃
          </button>

          <div style={styles.hint}>
            현재는 카카오 OAuth 연동 전 단계이며,
            <br />
            UI/흐름 검증을 위한 더미 로그인입니다.
          </div>
        </div>
      )}

      <div style={styles.menuBox}>
        <div
          style={styles.menuItem}
          onClick={() => navigate('/terms')}
          onMouseDown={pressStyle}
          onMouseUp={releaseStyle}
          onMouseLeave={releaseStyle}
        >
          이용약관 <span style={styles.menuRight}>›</span>
        </div>

        <div
          style={styles.menuItem}
          onClick={() => navigate('/privacy')}
          onMouseDown={pressStyle}
          onMouseUp={releaseStyle}
          onMouseLeave={releaseStyle}
        >
          개인정보처리방침 <span style={styles.menuRight}>›</span>
        </div>

        <div
          style={{ ...styles.menuItem, ...styles.menuItemLast }}
          onClick={() => navigate('/support')}
          onMouseDown={pressStyle}
          onMouseUp={releaseStyle}
          onMouseLeave={releaseStyle}
        >
          문의하기 <span style={styles.menuRight}>›</span>
        </div>
      </div>

      <div style={styles.footerSpacer} />
      <div style={styles.version}>A-LAW v0.1</div>
    </div>
  );
};

export default MyPage;
