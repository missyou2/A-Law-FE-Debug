/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_KAKAO_APP_KEY: string
  readonly VITE_DEBUG_MODE?: string
  readonly VITE_COOKIE_EXPIRES_DAYS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
