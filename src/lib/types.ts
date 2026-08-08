// =========================================================
// DailyFootsteps — domain model
// The single source of truth for the shapes stored locally.
// =========================================================

export type LangCode = 'en' | 'de';

export type WordType = 'noun' | 'verb' | 'adj' | 'adv' | 'other';

/** An item in the user's workspace ("my stuff") that Shuffle draws from. */
export interface WorkspaceItem {
  id: string;
  emoji: string;
  label: string;
  note: string;
}

/** A vocabulary entry produced by the AI review. */
export interface VocabEntry {
  word: string;
  type: WordType;
  meaning: string;
  usage: string;
  example: string;
  /** ISO date (YYYY-MM-DD) the entry was created. */
  date: string;
}

/** The AI coach's feedback for one exercise. */
export interface Review {
  score: number; // 0..100
  polished: string;
  changed: boolean;
  original: string;
  suggestions: string[];
  vocab: VocabEntry[];
}

/** A single completed exercise. */
export interface Exercise {
  id: string;
  lang: LangCode;
  date: string; // ISO date
  title: string;
  input: string;
  score: number;
  review: Review;
}

/** Per-language streak state. */
export interface StreakState {
  streak: number;
  lastDate: string | null; // ISO date
  days: string[]; // ISO dates the user practiced
}

/** The full persisted application state. */
export interface AppState {
  version: number;
  langs: Record<LangCode, StreakState>;
  workspace: Record<LangCode, WorkspaceItem[]>;
  exercises: Exercise[];
  vocab: Record<LangCode, VocabEntry[]>;
}
