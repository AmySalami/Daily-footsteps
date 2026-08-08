import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '@/lib/useAppState';
import { LANGS, LANG_CODES } from '@/lib/constants';
import type { LangCode } from '@/lib/types';

/** E7 — Vocabulary collection. Browse the words the coach saved, per language. */
export function VocabularyPage() {
  const state = useAppState();
  const [lang, setLang] = useState<LangCode>('en');
  const [query, setQuery] = useState('');

  // Newest first, filtered by the search box (word or meaning).
  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = state.vocab[lang].slice().reverse();
    if (!q) return list;
    return list.filter((v) => v.word.toLowerCase().includes(q) || v.meaning.toLowerCase().includes(q));
  }, [state.vocab, lang, query]);

  const total = state.vocab[lang].length;

  return (
    <div>
      <div className="view-head">
        <p className="eyebrow">Your collection</p>
        <h1>Vocabulary</h1>
        <p className="muted">
          Every exercise adds new words here — with meaning, type, and an example from your own writing.
        </p>
      </div>

      <div className="row spread" style={{ marginBottom: 'var(--space-block)' }}>
        <div className="row">
          {LANG_CODES.map((code) => (
            <button
              key={code}
              className={`pill-btn${code === lang ? ' is-active' : ''}`}
              onClick={() => setLang(code)}
            >
              {LANGS[code].flag} {LANGS[code].name}{' '}
              <span className="muted">({state.vocab[code].length})</span>
            </button>
          ))}
        </div>
        {total > 0 && (
          <input
            className="input vocab-search"
            value={query}
            placeholder="Search words…"
            aria-label="Search vocabulary"
            onChange={(e) => setQuery(e.target.value)}
          />
        )}
      </div>

      {total === 0 ? (
        <div className="vocab-empty">
          No words yet. Finish an exercise to start your collection.
          <div style={{ marginTop: 'var(--space-block)' }}>
            <Link className="cta" to="/">
              Start writing
            </Link>
          </div>
        </div>
      ) : entries.length === 0 ? (
        <div className="vocab-empty">No words match “{query}”.</div>
      ) : (
        <table className="vocab-table">
          <thead>
            <tr>
              <th>Word</th>
              <th>Type</th>
              <th>Meaning</th>
              <th>How to use</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((v, i) => (
              <tr key={`${v.word}-${i}`}>
                <td className="word">{v.word}</td>
                <td>
                  <span className="type-tag">{v.type}</span>
                </td>
                <td>{v.meaning}</td>
                <td className="muted">{v.usage}</td>
                <td className="ex">{v.example}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
