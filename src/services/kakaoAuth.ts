import Cookies from 'js-cookie';

// Kakao SDK 타입 정의
declare global {
  interface Window {
    Kakao: any;
  }
}

// 카카오 앱 키 (환경변수에서 가져오기)
const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_APP_KEY;

// API 기본 URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const isSecureUrl = (url: string) => url.startsWith('https://') || url.startsWith('/');

// 쿠키 키 상수
const COOKIE_KEYS = {
  ACCESS_TOKEN: 'kakao_access_token',
  USER_INFO: 'kakao_user',
} as const;

// 쿠키 옵션
const COOKIE_OPTIONS = {
  expires: 7, // 7일 후 만료
  secure: window.location.protocol === 'https:', // HTTPS에서만 전송
  sameSite: 'strict' as const, // CSRF 방지
  path: '/', // 모든 경로에서 접근 가능
};

/**
 * Kakao SDK 로드 대기
 */
const waitForKakaoSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 이미 로드되어 있으면 즉시 반환
    if (window.Kakao) {
      resolve();
      return;
    }

    // 최대 5초 동안 100ms마다 체크
    let attempts = 0;
    const maxAttempts = 50;

    const checkKakao = setInterval(() => {
      attempts++;

      if (window.Kakao) {
        clearInterval(checkKakao);
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkKakao);
        reject(new Error('Kakao SDK 로드 시간 초과'));
      }
    }, 100);
  });
};

/**
 * 카카오 SDK 초기화
 */
export const initKakao = async (): Promise<void> => {
  console.log('=== 카카오 SDK 초기화 시작 ===');

  try {
    // SDK 로드 대기
    await waitForKakaoSDK();

    console.log('✅ Kakao SDK 로드 완료');
    console.log('KAKAO_APP_KEY:', KAKAO_APP_KEY ? '설정됨 (' + KAKAO_APP_KEY.substring(0, 4) + '...)' : '설정 안 됨');

    if (!KAKAO_APP_KEY) {
      console.error('❌ VITE_KAKAO_APP_KEY 환경변수가 설정되지 않았습니다. .env 파일을 확인하세요.');
      return;
    }

    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_APP_KEY);
      console.log('✅ Kakao SDK 초기화 완료:', window.Kakao.isInitialized());
    } else {
      console.log('ℹ️ Kakao SDK는 이미 초기화되어 있습니다.');
    }
  } catch (error) {
    console.error('❌ Kakao SDK 초기화 실패:', error);
    throw error;
  }
};

/**
 * 카카오 로그인 (SDK v2 — 리다이렉트 방식)
 * 백엔드 Spring Security OAuth2 엔드포인트로 직접 리다이렉트됨
 */
export const loginWithKakao = async (): Promise<void> => {
  // SDK가 초기화되지 않은 경우 먼저 초기화 (버튼 클릭 타이밍 보장)
  if (!window.Kakao?.isInitialized()) {
    await initKakao();
  }

  if (!window.Kakao?.Auth) {
    console.error('Kakao SDK Auth 모듈을 사용할 수 없습니다.');
    return;
  }

  console.log('🔵 카카오 로그인 리다이렉트 시작...');

  window.Kakao.Auth.authorize({
    redirectUri: 'https://api.a-law.site/oauth2/authorization/kakao',
  });
};

/**
 * 카카오 액세스 토큰 및 사용자 정보 저장 (콜백 페이지에서 호출)
 */
export const saveKakaoSession = (accessToken: string, userInfo: KakaoUserInfo): void => {
  Cookies.set(COOKIE_KEYS.USER_INFO, JSON.stringify(userInfo), COOKIE_OPTIONS);
  Cookies.set(COOKIE_KEYS.ACCESS_TOKEN, accessToken, COOKIE_OPTIONS);
  console.log('✅ 토큰과 사용자 정보가 쿠키에 저장되었습니다.');
};

/**
 * 카카오 로그아웃
 * 서버에 DELETE /api/v1/auth 요청을 보내 서버 측 쿠키를 삭제한 후 클라이언트 쿠키도 제거
 */
export const logoutKakao = async (): Promise<void> => {
  // 서버에 로그아웃 요청 (서버 측 쿠키 삭제)
  try {
    const response = await fetch(`${BASE_URL}/auth`, {
      method: 'DELETE',
      credentials: isSecureUrl(BASE_URL) ? 'include' : 'omit',
    });
    if (response.ok) {
      console.log('✅ 서버 로그아웃 완료');
    } else {
      const body = await response.text();
      console.error(`서버 로그아웃 실패: ${response.status}`, body);
    }
  } catch (error) {
    console.error('서버 로그아웃 요청 실패:', error);
  }

  // 클라이언트 쿠키 삭제
  Cookies.remove(COOKIE_KEYS.USER_INFO, { path: '/' });
  Cookies.remove(COOKIE_KEYS.ACCESS_TOKEN, { path: '/' });
  Cookies.remove('is_logged_in', { path: '/' });
  console.log('✅ 클라이언트 쿠키가 삭제되었습니다.');

  // Kakao SDK 로그아웃 (SDK가 초기화되어 있는 경우)
  if (window.Kakao?.Auth?.getAccessToken()) {
    try {
      await window.Kakao.Auth.logout();
      console.log('✅ 카카오 SDK 로그아웃 완료');
    } catch (error) {
      console.error('카카오 SDK 로그아웃 실패:', error);
    }
  }
};

/**
 * 저장된 사용자 정보 가져오기
 */
export const getKakaoUser = (): KakaoUserInfo | null => {
  const userStr = Cookies.get(COOKIE_KEYS.USER_INFO);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * 로그인 상태 확인 (백엔드가 발급한 is_logged_in 쿠키 기준)
 */
export const isKakaoLoggedIn = (): boolean => {
  return Cookies.get('is_logged_in') === 'true';
};

/**
 * 액세스 토큰 가져오기
 */
export const getKakaoAccessToken = (): string | undefined => {
  return Cookies.get(COOKIE_KEYS.ACCESS_TOKEN);
};

// 타입 정의
export interface KakaoUserInfo {
  id: number;
  nickname: string;
  profileImage?: string;
  email?: string;
}

/**
 * 개발용 강제 로그인
 * 1순위: POST /api/v1/auth/dev (백엔드 dev 엔드포인트)
 * fallback: 프론트엔드 전용 mock 쿠키 세팅 (API 호출은 실패하지만 UI 탐색 가능)
 */
export const devLogin = async (): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/dev`, {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      const body = await response.json() as {
        success: boolean;
        data?: string | null;
        message?: string;
      };

      if (body.success) {
        if (body.data) {
          Cookies.set(COOKIE_KEYS.ACCESS_TOKEN, body.data, COOKIE_OPTIONS);
        }
        Cookies.set('is_logged_in', 'true', COOKIE_OPTIONS);
        const devUser: KakaoUserInfo = { id: 0, nickname: '개발 테스트 사용자' };
        Cookies.set(COOKIE_KEYS.USER_INFO, JSON.stringify(devUser), COOKIE_OPTIONS);
        console.log('✅ Dev login 완료 (서버).');
        return;
      }
    }

    // 서버가 403 등으로 막혀있으면 프론트 mock으로 fallback
    console.warn(`⚠️ /auth/dev 응답 ${response.status} — 프론트 mock 로그인으로 전환`);
  } catch (e) {
    console.warn('⚠️ /auth/dev 요청 실패 — 프론트 mock 로그인으로 전환:', e);
  }

  // Fallback: 쿠키만 직접 심어서 로그인 상태 유지 (API 호출은 인증 실패할 수 있음)
  Cookies.set('is_logged_in', 'true', COOKIE_OPTIONS);
  const devUser: KakaoUserInfo = { id: 0, nickname: '[Mock] 개발 사용자' };
  Cookies.set(COOKIE_KEYS.USER_INFO, JSON.stringify(devUser), COOKIE_OPTIONS);
  console.log('✅ Dev login 완료 (mock — UI 탐색 전용, API는 인증 불필요한 항목만 동작).');
};
