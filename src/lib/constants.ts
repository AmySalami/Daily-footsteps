import type { LangCode, WorkspaceItem } from './types';

export interface LangMeta {
  name: string;
  flag: string;
  /** BCP-47 tag for the Web Speech API. */
  speechLang: string;
}

export const LANGS: Record<LangCode, LangMeta> = {
  en: { name: 'English', flag: '🇬🇧', speechLang: 'en-US' },
  de: { name: 'German', flag: '🇩🇪', speechLang: 'de-DE' },
};

export const LANG_CODES = Object.keys(LANGS) as LangCode[];

/** Cat-paw footprint (viewBox 0 0 64 64). Shared by brand, trail, celebrate. */
export const PAW_PATHS = {
  toes: [
    { cx: 23, cy: 20, rx: 7.5, ry: 10.5, rot: -14 },
    { cx: 42, cy: 18, rx: 7.5, ry: 11, rot: 12 },
    { cx: 9.5, cy: 35, rx: 6.3, ry: 9, rot: -26 },
    { cx: 55, cy: 33, rx: 6.3, ry: 9, rot: 24 },
  ],
  pad: 'M32 34c-10 0-17 7-17 14 0 6 4.5 9 9.5 9 3 0 4.5-1.3 7.5-1.3s4.5 1.3 7.5 1.3c5 0 9.5-3 9.5-9 0-7-7-14-17-14z',
};

/** Seed workspace so a fresh install is usable immediately. */
export const SEED_WORKSPACE: Record<LangCode, Omit<WorkspaceItem, 'id'>[]> = {
  en: [
    { emoji: '🫖', label: "My grandmother's teapot", note: 'porcelain, chipped handle' },
    { emoji: '🚲', label: 'The old bicycle', note: 'rusty, still rides' },
    { emoji: '☕', label: 'My favorite coffee mug', note: 'morning ritual' },
    { emoji: '🌧️', label: 'A rainy Sunday', note: '' },
  ],
  de: [
    { emoji: '☕', label: 'Meine Kaffeetasse', note: 'jeden Morgen' },
    { emoji: '🚲', label: 'Mein altes Fahrrad', note: '' },
    { emoji: '🌳', label: 'Der Park am Morgen', note: 'ruhig und grün' },
    { emoji: '🌧️', label: 'Ein regnerischer Sonntag', note: '' },
  ],
};

export const EMOJIS = ['🫖', '🚲', '☕', '🌧️', '🌳', '📚', '🎒', '🐈', '🎸', '🏔️', '🍞', '🕰️', '🧣', '🪴', '✏️', '🗝️'];
