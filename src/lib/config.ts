// =========================================================
// Runtime config. The AI proxy (E9) base URL comes from an
// env var so the key never lives in the client bundle.
// Set VITE_API_BASE in a .env file (see .env.example).
// =========================================================

export const API_BASE: string = import.meta.env.VITE_API_BASE ?? '';

/** Whether a real AI proxy is configured. When false, the app uses the mock. */
export const HAS_AI_PROXY = API_BASE.length > 0;

export const STORAGE_KEY = 'df_state';
export const STATE_VERSION = 2;
