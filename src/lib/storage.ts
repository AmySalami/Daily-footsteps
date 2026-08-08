// =========================================================
// DailyFootsteps — persistence layer
// A typed wrapper over localStorage with seeding, versioning,
// and a tiny pub/sub so React can subscribe via useSyncExternalStore.
// This is the ONLY module that touches localStorage.
// =========================================================
import type { AppState, LangCode, StreakState, WorkspaceItem } from './types';
import { LANG_CODES, SEED_WORKSPACE } from './constants';
import { STORAGE_KEY, STATE_VERSION } from './config';

// ---------- small utilities ----------
export const uid = (): string => Math.random().toString(36).slice(2, 9);
export const todayStr = (): string => new Date().toISOString().slice(0, 10);
export const daysBetween = (a: string, b: string): number =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);
export const dayLabel = (n: number): string => `${n} day${n === 1 ? '' : 's'}`;

// ---------- defaults ----------
function emptyStreak(): StreakState {
  return { streak: 0, lastDate: null, days: [] };
}

export function defaultState(): AppState {
  const langs = {} as Record<LangCode, StreakState>;
  const workspace = {} as Record<LangCode, AppState['workspace'][LangCode]>;
  const vocab = {} as Record<LangCode, AppState['vocab'][LangCode]>;
  for (const code of LANG_CODES) {
    langs[code] = emptyStreak();
    workspace[code] = SEED_WORKSPACE[code].map((i) => ({ id: uid(), ...i }));
    vocab[code] = [];
  }
  return { version: STATE_VERSION, langs, workspace, exercises: [], vocab };
}

// ---------- load / migrate ----------
function migrate(raw: unknown): AppState {
  if (!raw || typeof raw !== 'object') return defaultState();
  const parsed = raw as Partial<AppState>;
  // The prototype (v1) and v2 share the same shape — carry data forward,
  // backfilling anything missing from defaults so we never crash on read.
  if (!parsed.langs || !parsed.workspace || !parsed.vocab) return defaultState();
  const base = defaultState();
  const merged: AppState = {
    version: STATE_VERSION,
    langs: { ...base.langs, ...parsed.langs },
    workspace: { ...base.workspace, ...parsed.workspace },
    vocab: { ...base.vocab, ...parsed.vocab },
    exercises: parsed.exercises ?? [],
  };
  return merged;
}

function readFromStorage(): AppState {
  try {
    const rawStr = localStorage.getItem(STORAGE_KEY);
    if (!rawStr) return defaultState();
    return migrate(JSON.parse(rawStr));
  } catch {
    return defaultState();
  }
}

// ---------- store (pub/sub) ----------
let state: AppState = readFromStorage();
const listeners = new Set<() => void>();

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or unavailable — ignore for the prototype */
  }
}

export function getState(): AppState {
  return state;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Apply a mutation to the current state, persist it, and notify subscribers.
 * The mutator receives a draft it may mutate in place; a new top-level
 * reference is produced so React re-renders.
 */
export function setState(mutator: (draft: AppState) => void): void {
  mutator(state);
  state = { ...state };
  persist();
  listeners.forEach((l) => l());
}

/** Dev/testing helper — wipe everything and reseed. */
export function resetState(): void {
  state = defaultState();
  persist();
  listeners.forEach((l) => l());
}

// ---------- domain helpers ----------
export function doneToday(lang: LangCode): boolean {
  return state.langs[lang].days.includes(todayStr());
}

/** Record today's completion for a language and advance/reset the streak. */
export function completeToday(lang: LangCode): void {
  setState((draft) => {
    const L = draft.langs[lang];
    const today = todayStr();
    if (L.days.includes(today)) return;
    if (L.lastDate && daysBetween(L.lastDate, today) === 1) L.streak += 1;
    else L.streak = 1;
    L.lastDate = today;
    L.days.push(today);
  });
}

// ---------- workspace mutations ----------
export type WorkspaceDraft = Omit<WorkspaceItem, 'id'>;

/** Add a new workspace item for a language. Returns the created id. */
export function addWorkspaceItem(lang: LangCode, data: WorkspaceDraft): string {
  const id = uid();
  setState((draft) => {
    draft.workspace[lang] = [...draft.workspace[lang], { id, ...data }];
  });
  return id;
}

/** Patch an existing workspace item in place. */
export function updateWorkspaceItem(lang: LangCode, id: string, patch: Partial<WorkspaceDraft>): void {
  setState((draft) => {
    draft.workspace[lang] = draft.workspace[lang].map((it) =>
      it.id === id ? { ...it, ...patch } : it,
    );
  });
}

/** Remove a workspace item. */
export function removeWorkspaceItem(lang: LangCode, id: string): void {
  setState((draft) => {
    draft.workspace[lang] = draft.workspace[lang].filter((it) => it.id !== id);
  });
}
