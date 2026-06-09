/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional API base URL. Defaults to same-origin ('') in dev and on Vercel. */
  readonly VITE_API_BASE?: string
}
