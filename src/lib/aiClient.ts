// =========================================================
// AI client — talks to the E9 proxy when configured, otherwise
// (or on any failure) falls back to the built-in mock so the app
// keeps working offline and before the proxy exists.
// =========================================================
import type { LangCode, Review, VocabEntry, WordType } from './types';
import { API_BASE, HAS_AI_PROXY } from './config';
import { mockReview } from './mockAI';
import { todayStr } from './storage';

const WORD_TYPES: WordType[] = ['noun', 'verb', 'adj', 'adv', 'other'];
const normalizeType = (t: unknown): WordType =>
  WORD_TYPES.includes(t as WordType) ? (t as WordType) : 'other';

/** Coerce an untrusted proxy payload into a valid Review (client fills date/original). */
function normalizeReview(data: unknown, original: string): Review {
  const d = (data ?? {}) as Record<string, unknown>;
  const today = todayStr();
  const vocab: VocabEntry[] = Array.isArray(d.vocab)
    ? (d.vocab as Record<string, unknown>[]).map((v) => ({
        word: String(v.word ?? ''),
        type: normalizeType(v.type),
        meaning: String(v.meaning ?? ''),
        usage: String(v.usage ?? ''),
        example: String(v.example ?? ''),
        date: today,
      }))
    : [];
  return {
    score: Math.max(0, Math.min(100, Math.round(Number(d.score) || 0))),
    polished: String(d.polished ?? original),
    changed: Boolean(d.changed),
    original,
    suggestions: Array.isArray(d.suggestions) ? d.suggestions.map(String) : [],
    vocab,
  };
}

export interface ReviewOutcome {
  review: Review;
  /** true when the mock produced this (no proxy, or the proxy failed). */
  isMock: boolean;
}

/** Review a piece of writing via the proxy, falling back to the mock. */
export async function reviewExercise(text: string, title: string, lang: LangCode): Promise<ReviewOutcome> {
  if (!HAS_AI_PROXY) {
    return { review: mockReview(text, lang), isMock: true };
  }
  try {
    const res = await fetch(`${API_BASE}/review`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text, title, lang }),
    });
    if (!res.ok) throw new Error(`proxy responded ${res.status}`);
    const data = await res.json();
    return { review: normalizeReview(data, text.trim()), isMock: false };
  } catch {
    // Network error, proxy down, missing key, bad payload — degrade gracefully.
    return { review: mockReview(text, lang), isMock: true };
  }
}
