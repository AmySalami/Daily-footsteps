import { useRef, useState } from 'react';
import type { LangCode } from '@/lib/types';
import { LANGS, LANG_CODES } from '@/lib/constants';
import { useAppState } from '@/lib/useAppState';
import { detectLang } from '@/lib/detectLang';
import { useSpeech } from '@/lib/useSpeech';
import { toast } from '@/lib/toast';

export interface FinishPayload {
  text: string;
  title: string;
  lang: LangCode;
  auto: boolean;
}

const wordCount = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);
const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/** The writing surface: title + shuffle, language tag, textarea with docked Speak. */
export function Editor({ onFinish }: { onFinish: (p: FinishPayload) => void }) {
  const state = useAppState();
  const [activeLang, setActiveLang] = useState<LangCode | null>(null);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const composeRef = useRef<HTMLTextAreaElement>(null);

  const speech = useSpeech({
    lang: LANGS[activeLang ?? 'en'].speechLang,
    getBase: () => text,
    onUpdate: setText,
    onError: () => toast('Mic error — allow microphone access'),
  });

  const toggleLang = (code: LangCode) => setActiveLang((cur) => (cur === code ? null : code));

  const shuffle = () => {
    const pool = state.workspace[activeLang ?? 'en'];
    if (!pool.length) {
      toast('Add items in Workspace first');
      return;
    }
    setTitle(pickRandom(pool).label);
    toast('Topic picked 🎲');
    composeRef.current?.focus();
  };

  const submit = () => {
    if (wordCount(text) < 3) {
      toast('Write a little more first (3+ words)');
      composeRef.current?.focus();
      return;
    }
    if (speech.recording) speech.stop();
    const auto = !activeLang;
    const lang = activeLang ?? detectLang(text);
    onFinish({ text: text.trim(), title: title.trim(), lang, auto });
  };

  return (
    <div>
      <div className="practice-head" style={{ marginBottom: 'var(--space-block)' }}>
        <p className="eyebrow" style={{ marginBottom: 8 }}>
          Daily practice
        </p>
        <h2 style={{ margin: 0 }}>Write today's step.</h2>
      </div>

      <div className="title-row">
        <input
          className="input title-input"
          value={title}
          placeholder="What do you want to write about?"
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="shuffle-btn" title="Pick a topic for me" onClick={shuffle}>
          🎲 Shuffle
        </button>
      </div>

      <div className="lang-tags">
        {LANG_CODES.map((code) => (
          <button
            key={code}
            className={`pill-btn${code === activeLang ? ' is-active' : ''}`}
            aria-pressed={code === activeLang}
            onClick={() => toggleLang(code)}
          >
            {LANGS[code].flag} {LANGS[code].name}
          </button>
        ))}
      </div>
      <p className="lang-hint">
        {activeLang ? (
          <>
            Writing in <b>{LANGS[activeLang].name}</b>. Tap it again to let us auto-detect.
          </>
        ) : (
          <>Pick a language, or just start writing — we'll detect it when you finish.</>
        )}
      </p>

      <div className="compose-wrap">
        <textarea
          ref={composeRef}
          className="textarea compose"
          value={text}
          placeholder="Start writing … or tap “Speak”. Describe your topic, or tell a little story about it."
          onChange={(e) => setText(e.target.value)}
        />
        <span className="wordcount">
          {wordCount(text)} word{wordCount(text) === 1 ? '' : 's'}
        </span>
        {speech.supported && (
          <button className={`mic-btn${speech.recording ? ' recording' : ''}`} onClick={speech.toggle}>
            <span className="mdot" />
            {speech.recording ? '■ Stop' : '🎤 Speak'}
          </button>
        )}
      </div>

      <div className="row" style={{ marginTop: 'var(--space-block)' }}>
        <button className="cta secondary" onClick={submit}>
          Finish &amp; get feedback →
        </button>
        <span className="muted" style={{ fontSize: 'var(--text-caption)' }}>
          Your coach reviews, scores, and builds your vocabulary.
        </span>
      </div>
    </div>
  );
}
