import type { LangCode } from './types';

// Lightweight client-side language guess. Used when the user submits without
// picking a language tag. In production the AI proxy could return this too;
// this heuristic keeps the app working offline / before the proxy exists.
const DE_WORDS = new Set(
  'der die das und ich nicht ein eine ist mit auf für sich dem den zu von wir sie es war haben sind wird auch aber oder weil wenn schreiben sprechen mein meine ganz sehr heute gestern morgen'.split(' '),
);
const EN_WORDS = new Set(
  'the and is a an to of in it was with for this that have are you my we they on at but or because when today yesterday very really about would could there their'.split(' '),
);

export function detectLang(text: string): LangCode {
  const t = text.toLowerCase();
  let de = 0;
  let en = 0;
  if (/[äöüß]/.test(t)) de += 3;
  for (const w of t.split(/[^a-zäöüß]+/)) {
    if (DE_WORDS.has(w)) de++;
    if (EN_WORDS.has(w)) en++;
  }
  return de > en ? 'de' : 'en';
}
