import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { saveKakaoSession } from '../services/kakaoAuth.js';
import type { KakaoUserInfo } from '../services/kakaoAuth.js';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.a-law.site/api/v1';

const KakaoCallback = () => {
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) {
      console.error('카카오 인증 코드가 없습니다.');
      navigate('/mypage', { replace: true });
      return;
    }

    const exchangeCode = async () => {
      try {
        // 백엔드가 code를 받아 Kakao 토큰 교환 및 사용자 정보를 반환
        const response = await axios.post<{ access_token: string; user: KakaoUserInfo }>(
          `${BASE_URL}/auth/kakao/callback`,
          { code, redirect_uri: `${window.location.origin}/oauth/callback` },
          { withCredentials: true },
        );

        const { access_token, user } = response.data;
        saveKakaoSession(access_token, user);

        console.log('✅ 카카오 로그인 완료:', user);
        navigate('/mypage', { replace: true });
      } catch (error) {
        console.error('카카오 토큰 교환 실패:', error);
        navigate('/mypage', { replace: true });
      }
    };

    exchangeCode();
  }, [navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f1f2f6',
      gap: '16px',
    }}>
      <p style={{ fontSize: '16px', color: '#555' }}>카카오 로그인 처리 중...</p>
    </div>
  );
};

export default KakaoCallback;
