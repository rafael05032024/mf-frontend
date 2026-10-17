/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface RuntimeEnv {
  API_URL?: string
}

interface Window {
  __ENV__?: RuntimeEnv
}
