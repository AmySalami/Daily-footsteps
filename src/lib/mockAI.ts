// =========================================================
// Mock AI coach — heuristic stand-in for the real proxy (E9/E6).
// Same shape the real reviewer will return, so swapping it out
// later is a one-line change at the call site.
// =========================================================
import type { LangCode, Review, VocabEntry, WordType } from './types';
import { todayStr } from './storage';

interface DictEntry {
  t: WordType;
  m: string;
}

const MINI_DICT: Record<LangCode, Record<string, DictEntry>> = {
  en: {
    teapot: { t: 'noun', m: 'a container for making and pouring tea' },
    bicycle: { t: 'noun', m: 'a two-wheeled vehicle you pedal' },
    morning: { t: 'noun', m: 'the early part of the day' },
    rusty: { t: 'adj', m: 'covered with rust; out of practice' },
    quiet: { t: 'adj', m: 'making little or no noise' },
    remember: { t: 'verb', m: 'to keep in mind; recall' },
    gentle: { t: 'adj', m: 'mild, kind, or soft in action' },
  },
  de: {
    kaffeetasse: { t: 'noun', m: 'a coffee cup' },
    fahrrad: { t: 'noun', m: 'a bicycle' },
    morgen: { t: 'noun', m: 'the morning' },
    ruhig: { t: 'adj', m: 'calm, quiet' },
    regnerisch: { t: 'adj', m: 'rainy' },
    erinnern: { t: 'verb', m: 'to remember' },
  },
};

const STOPWORDS = new Set(
  'the a an and or but of to in on at for with my your his her its our their is are was were be been being this that these those it he she they we you i as by from about into over under then than so if not no yes ich du er sie es wir ihr der die das ein eine und oder aber mit von zu in an auf für ist sind war den dem des nicht ja nein'.split(
    ' ',
  ),
);

function guessType(w: string): WordType {
  if (/ly$/.test(w)) return 'adv';
  if (/(tion|ness|ment|ity|schaft|ung|heit|keit)$/.test(w)) return 'noun';
  if (/(ful|ous|ive|able|isch|ig|lich)$/.test(w)) return 'adj';
  if (/(ing|ed|ieren|en)$/.test(w)) return 'verb';
  return 'noun';
}

function usageHint(t: WordType): string {
  return (
    { noun: 'names a thing', verb: 'an action', adj: 'describes a noun', adv: 'describes an action', other: 'general' } as Record<WordType, string>
  )[t];
}

/** Produce mock feedback for a piece of writing. Shape matches the real reviewer. */
export function mockReview(text: string, lang: LangCode): Review {
  const clean = text.trim().replace(/\s+/g, ' ');
  const words = clean ? clean.split(' ') : [];
  const sentences = clean.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const wc = words.length;

  let score = Math.round(Math.min(98, 42 + wc * 1.4 + sentences.length * 3));
  if (wc < 8) score = Math.max(20, Math.round(wc * 3));

  const polished = sentences.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('. ') + (sentences.length ? '.' : '');
  const changed = polished.trim() !== clean.trim();

  const suggestions: string[] = [];
  if (wc < 30)
    suggestions.push(lang === 'de' ? 'Guter Anfang — versuche 40+ Wörter für mehr Flüssigkeit.' : 'Great start — try stretching to 40+ words to build fluency.');
  if (sentences.length <= 1)
    suggestions.push(lang === 'de' ? 'Teile den Gedanken in zwei, drei Sätze auf.' : 'Break the idea into two or three sentences for rhythm.');
  suggestions.push(
    lang === 'de'
      ? 'Verwende Verbindungswörter wie „weil", „obwohl", „deshalb".'
      : 'Use connectors like "however", "although", "because" to link ideas.',
  );
  suggestions.push(
    lang === 'de'
      ? 'Achte auf die Groß- und Kleinschreibung der Nomen.'
      : 'Vary sentence length — mix short and long for a natural rhythm.',
  );

  const dict = MINI_DICT[lang];
  const seen = new Set<string>();
  const vocab: VocabEntry[] = [];
  const today = todayStr();
  for (const raw of words) {
    const w = raw.toLowerCase().replace(/[^a-zäöüß]/gi, '');
    if (w.length < 4 || STOPWORDS.has(w) || seen.has(w)) continue;
    seen.add(w);
    const hit = dict[w];
    const type = hit ? hit.t : guessType(w);
    vocab.push({
      word: raw.replace(/[.!?,;:]$/, ''),
      type,
      meaning: hit ? hit.m : '— (defined by AI in production)',
      usage: usageHint(type),
      example: sentences.find((s) => s.toLowerCase().includes(w)) ?? `… ${raw} …`,
      date: today,
    });
    if (vocab.length >= 6) break;
  }

  return { score, polished, changed, original: clean, suggestions, vocab };
}
