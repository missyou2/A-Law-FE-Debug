# 카카오 로그인 쿠키 저장 가이드

## 📌 개요

카카오 로그인 토큰과 사용자 정보를 **쿠키(Cookie)**에 저장하는 방식으로 구현되었습니다.

## 🍪 쿠키 vs localStorage 비교

### 쿠키 사용의 장점

1. **보안 옵션 설정 가능**
   - `Secure`: HTTPS에서만 전송
   - `SameSite`: CSRF 공격 방지
   - `HttpOnly`: XSS 공격 방지 (백엔드에서 설정 시)

2. **자동 만료 관리**
   - 만료 시간 설정 가능
   - 브라우저가 자동으로 만료된 쿠키 삭제

3. **서버 전송 자동화**
   - 매 HTTP 요청마다 자동으로 쿠키 전송
   - API 요청 시 인증 헤더 자동 포함 (백엔드 구현 필요)

### 쿠키 사용의 단점

1. **용량 제한**
   - 최대 4KB까지만 저장 가능
   - localStorage는 5~10MB까지 가능

2. **네트워크 오버헤드**
   - 매 요청마다 쿠키가 자동 전송됨
   - 불필요한 데이터 전송 가능

3. **프론트엔드 제약**
   - JavaScript로 설정한 쿠키는 HttpOnly 설정 불가
   - 완벽한 보안을 위해서는 백엔드에서 쿠키 설정 필요

## 🔧 현재 구현 내용

### 저장되는 쿠키

1. **kakao_access_token**
   - 카카오 액세스 토큰
   - API 요청 시 인증에 사용

2. **kakao_user**
   - 사용자 정보 (JSON)
   - id, nickname, profileImage, email

### 쿠키 옵션

```typescript
{
  expires: 7,           // 7일 후 만료
  secure: true,         // HTTPS에서만 전송 (운영 환경)
  sameSite: 'strict',   // CSRF 방지
  path: '/',            // 모든 경로에서 접근 가능
}
```

### 쿠키 저장 위치

파일: `src/services/kakaoAuth.ts`

```typescript
import Cookies from 'js-cookie';

// 로그인 시 쿠키 저장
Cookies.set('kakao_user', JSON.stringify(userInfo), {
  expires: 7,
  secure: window.location.protocol === 'https:',
  sameSite: 'strict',
  path: '/',
});

// 쿠키 읽기
const userStr = Cookies.get('kakao_user');

// 쿠키 삭제
Cookies.remove('kakao_user', { path: '/' });
```

## 🔒 보안 강화 방법

### 1. HTTPS 사용 (운영 환경 필수)

```typescript
// 현재 구현
secure: window.location.protocol === 'https:'

// 개발 환경: http → secure: false
// 운영 환경: https → secure: true
```

### 2. SameSite 설정

```typescript
sameSite: 'strict'  // CSRF 공격 방지
```

옵션:
- `strict`: 가장 안전, 외부 사이트에서 쿠키 전송 차단
- `lax`: 중간 수준, GET 요청은 허용
- `none`: 모든 요청에서 쿠키 전송 (Secure 필수)

### 3. HttpOnly 설정 (백엔드 필요)

**현재 제약:**
- JavaScript로 설정한 쿠키는 HttpOnly 불가
- HttpOnly는 서버에서만 설정 가능

**백엔드 연동 시 권장 구조:**

```
프론트엔드 → 카카오 토큰 → 백엔드 API
                              ↓
                         토큰 검증 및 JWT 발급
                              ↓
                    HttpOnly 쿠키로 응답
```

백엔드 예시 (Express.js):
```javascript
res.cookie('auth_token', jwtToken, {
  httpOnly: true,      // JavaScript 접근 차단
  secure: true,        // HTTPS만
  sameSite: 'strict',  // CSRF 방지
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7일
});
```

## 📊 쿠키 확인 방법

### 브라우저 개발자 도구

1. `F12` 눌러서 개발자 도구 열기
2. **Application** 탭 (또는 Storage 탭)
3. 왼쪽 메뉴: **Cookies** > `http://localhost:5173`
4. 저장된 쿠키 확인:
   - `kakao_access_token`
   - `kakao_user`

### 콘솔에서 확인

```javascript
// 모든 쿠키 확인
document.cookie

// 특정 쿠키 확인 (js-cookie 사용)
Cookies.get('kakao_access_token')
Cookies.get('kakao_user')
```

## 🚀 백엔드 API 요청 시 쿠키 사용

### axios 설정

```typescript
import axios from 'axios';
import { getKakaoAccessToken } from './kakaoAuth';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,  // 쿠키 자동 전송
});

// 요청 인터셉터: Authorization 헤더에 토큰 추가
apiClient.interceptors.request.use((config) => {
  const token = getKakaoAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 백엔드에서 쿠키 읽기

```javascript
// Express.js 예시
app.get('/api/user', (req, res) => {
  const token = req.cookies.kakao_access_token;
  // 또는
  const token = req.headers.authorization?.split(' ')[1];

  // 토큰 검증 및 사용자 정보 반환
});
```

## ⚠️ 주의사항

### 1. CORS 설정

백엔드에서 쿠키를 받으려면 CORS 설정 필요:

```javascript
// Express.js
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,  // 쿠키 허용
}));
```

### 2. Secure 속성

- 개발 환경(HTTP): `secure: false`
- 운영 환경(HTTPS): `secure: true`
- 현재 구현은 자동으로 프로토콜 감지

### 3. 쿠키 삭제 시 path 일치

쿠키 삭제 시 설정할 때와 동일한 path 사용:

```typescript
// 설정 시
Cookies.set('key', 'value', { path: '/' });

// 삭제 시
Cookies.remove('key', { path: '/' });  // path 일치 필수!
```

## 🔄 localStorage로 되돌리기

쿠키 대신 다시 localStorage를 사용하고 싶다면:

1. `kakaoAuth.ts`에서 `Cookies.set/get/remove` 부분을
2. `localStorage.setItem/getItem/removeItem`으로 변경

## 📚 참고 자료

- [js-cookie 공식 문서](https://github.com/js-cookie/js-cookie)
- [MDN - HTTP 쿠키](https://developer.mozilla.org/ko/docs/Web/HTTP/Cookies)
- [OWASP - 세션 관리](https://owasp.org/www-community/controls/Session_Management_Cheat_Sheet)
