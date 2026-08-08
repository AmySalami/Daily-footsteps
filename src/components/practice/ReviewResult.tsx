import type { LangCode, Review } from '@/lib/types';
import { LANGS } from '@/lib/constants';
import { dayLabel } from '@/lib/storage';
import { Paw, PawTrail } from '@/components/ui';

export interface ResultData {
  lang: LangCode;
  title: string;
  review: Review;
  auto: boolean;
  wasDone: boolean;
  streakAfter: number;
}

function scoreHeadline(score: number): string {
  if (score >= 80) return 'Strong and clear.';
  if (score >= 60) return 'Solid — a few tweaks.';
  return 'Good effort — keep building.';
}

/** The AI review: score, suggestions, polished text, vocabulary, and streak. */
export function ReviewResult({ data, onNew }: { data: ResultData; onNew: () => void }) {
  const { lang, title, review, auto, wasDone, streakAfter } = data;
  return (
    <div>
      <div className="view-head row spread">
        <div>
          <p className="eyebrow">
            {LANGS[lang].flag} {LANGS[lang].name} · review{auto ? ' · auto-detected' : ''}
          </p>
          <h1 style={{ margin: '.1em 0' }}>{title || 'Nice work.'}</h1>
        </div>
        <button className="pill-btn" onClick={onNew}>
          ← Practice
        </button>
      </div>

      <div className="ai-panel">
        <div className="inner">
          <div className="ai-tag">
            <span className="spark">✦</span> AI coach · mock feedback
          </div>
          <div className="score-ring">
            <div className="ring" style={{ ['--v' as string]: String(review.score) }}>
              <div className="hole">
                <div className="num">
                  {review.score}
                  <small>/100</small>
                </div>
              </div>
            </div>
            <div className="score-note">
              <h3>{scoreHeadline(review.score)}</h3>
              <p className="muted">
                Scored on effort, sentence variety, and clarity. In production this comes from your AI coach.
              </p>
            </div>
          </div>

          <p className="eyebrow" style={{ margin: '0 0 10px' }}>
            Suggestions
          </p>
          <ul className="sugg">
            {review.suggestions.map((s, i) => (
              <li key={i}>
                <span className="star">✦</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>

          <p className="eyebrow" style={{ margin: '22px 0 10px' }}>
            {review.changed ? 'Polished version' : 'Your writing'}
          </p>
          <div className="polished">{review.polished || review.original}</div>
        </div>
      </div>

      <div className="stack">
        <div>
          <p className="eyebrow">Vocabulary from today</p>
          <h2 style={{ margin: '.2em 0' }}>
            {review.vocab.length} word{review.vocab.length === 1 ? '' : 's'} saved
          </h2>
        </div>
        {review.vocab.length > 0 && (
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
              {review.vocab.map((v, i) => (
                <tr key={i}>
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

      <div className="celebrate">
        <div className="big-paw">
          <Paw />
        </div>
        <h2 style={{ margin: '.2em 0' }}>{wasDone ? 'Another step today' : `${dayLabel(streakAfter)} streak!`}</h2>
        <p className="muted">
          {wasDone
            ? 'You already stepped today — this still counts as practice.'
            : 'Your footsteps trail just grew.'}
        </p>
        <PawTrail streak={streakAfter} />
        <div className="row" style={{ justifyContent: 'center', marginTop: 'var(--space-block)' }}>
          <button className="cta" onClick={onNew}>
            New exercise
          </button>
        </div>
      </div>
    </div>
  );
}
