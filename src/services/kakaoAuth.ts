import Cookies from 'js-cookie';

// Kakao SDK 타입 정의
declare global {
  interface Window {
    Kakao: any;
  }
}

// 카카오 앱 키 (환경변수에서 가져오기)
const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_APP_KEY;

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
 */
export const logoutKakao = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!window.Kakao || !window.Kakao.Auth.getAccessToken()) {
      // 이미 로그아웃 상태 - 쿠키만 삭제
      Cookies.remove(COOKIE_KEYS.USER_INFO, { path: '/' });
      Cookies.remove(COOKIE_KEYS.ACCESS_TOKEN, { path: '/' });
      console.log('✅ 쿠키가 삭제되었습니다.');
      resolve();
      return;
    }

    window.Kakao.Auth.logout(() => {
      console.log('카카오 로그아웃 성공');
      // 쿠키 삭제
      Cookies.remove(COOKIE_KEYS.USER_INFO, { path: '/' });
      Cookies.remove(COOKIE_KEYS.ACCESS_TOKEN, { path: '/' });
      console.log('✅ 쿠키가 삭제되었습니다.');
      resolve();
    });
  });
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
 * 로그인 상태 확인 (백엔드가 발급한 access_token 또는 refresh_token 쿠키 기준)
 */
export const isKakaoLoggedIn = (): boolean => {
  return !!Cookies.get('access_token') || !!Cookies.get('refresh_token');
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

// /**
//  * 더미 로그인 (백엔드 구축 전 테스트용)
//  */
// export const dummyLogin = (): Promise<KakaoUserInfo> => {
//   return new Promise((resolve) => {
//     const dummyUser: KakaoUserInfo = {
//       id: 12345678,
//       nickname: '테스트 사용자',
//       // profileImage: undefined,
//       email: 'test@example.com',
//     };
//
//     // 쿠키에 저장
//     Cookies.set(COOKIE_KEYS.USER_INFO, JSON.stringify(dummyUser), COOKIE_OPTIONS);
//     Cookies.set(COOKIE_KEYS.ACCESS_TOKEN, 'dummy_access_token_for_testing', COOKIE_OPTIONS);
//
//     console.log('✅ 더미 로그인 완료:', dummyUser);
//     resolve(dummyUser);
//   });
// };
