import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

import UserIcon from '../../assets/icons/user.png';
import {
  initKakao,
  loginWithKakao,
  dummyLogin,
  logoutKakao,
  getKakaoUser,
  isKakaoLoggedIn,
  type KakaoUserInfo,
} from '../../services/kakaoAuth.js';

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
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [kakaoUser, setKakaoUser] = useState<KakaoUserInfo | null>(null);

  // 카카오 SDK 초기화 및 로그인 상태 확인
  useEffect(() => {
    const init = async () => {
      try {
        await initKakao();
        console.log('✅ 카카오 SDK 초기화 성공');

        // 저장된 로그인 정보 확인
        if (isKakaoLoggedIn()) {
          const user = getKakaoUser();
          if (user) {
            setKakaoUser(user);
            setIsLoggedIn(true);
            console.log('✅ 저장된 로그인 정보 복원:', user.nickname);
          }
        }
      } catch (error) {
        console.error('❌ 카카오 SDK 초기화 실패:', error);
      }
    };

    init();
  }, []);

  const user = useMemo(
    () => ({
      nickname: kakaoUser?.nickname || '사용자',
      note: kakaoUser ? '카카오톡 계정으로 로그인되었습니다.' : '로그인 상태(더미)입니다.',
      profileImage: kakaoUser?.profileImage,
    }),
    [kakaoUser]
  );

  const handleKakaoLogin = async () => {
    if (isAuthLoading) return;
    setIsAuthLoading(true);

    try {
      // TODO: 백엔드 구축 후 loginWithKakao()로 변경
      const userInfo = await dummyLogin();
      setKakaoUser(userInfo);
      setIsLoggedIn(true);
      console.log('카카오 로그인 성공:', userInfo);
    } catch (error) {
      console.error('카카오 로그인 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      alert(`로그인에 실패했습니다.\n\n오류: ${errorMessage}\n\n다시 시도해주세요.`);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isAuthLoading) return;
    setIsAuthLoading(true);

    try {
      await logoutKakao();
      setKakaoUser(null);
      setIsLoggedIn(false);
      console.log('로그아웃 완료');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    } finally {
      setIsAuthLoading(false);
    }
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
            onClick={handleKakaoLogin}
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
            {user.profileImage ? (
              <img
                src={user.profileImage}
                style={{
                  ...styles.userIcon,
                  width: '74px',
                  height: '74px',
                  borderRadius: '22px',
                  opacity: 1,
                }}
                alt="프로필"
              />
            ) : (
              <img src={UserIcon} style={styles.userIcon} />
            )}
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
            카카오 계정으로 로그인되었습니다.
            <br />
            계약서와 분석 기록이 안전하게 저장됩니다.
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
