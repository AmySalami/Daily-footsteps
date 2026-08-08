/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the AI proxy (E9). Empty = use the mock. */
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
