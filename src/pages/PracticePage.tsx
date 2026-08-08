import { useAppState } from '@/lib/useAppState';
import { doneToday, dayLabel } from '@/lib/storage';
import { LANGS, LANG_CODES } from '@/lib/constants';
import { PawTrail } from '@/components/ui';

/**
 * E1 foundation stand-in for the Practice page.
 * Renders the real per-language streak cards from stored state to prove the
 * data layer + design system + shared components are wired end-to-end.
 * The writing flow (Title, language tag, editor, review) lands in E2 & E4.
 */
export function PracticePage() {
  const state = useAppState();
  return (
    <div>
      <div className="streak-strip">
        {LANG_CODES.map((code) => {
          const st = state.langs[code];
          return (
            <div className="streak-card" key={code}>
              <span className="chip-top">
                <span className="chip-flag">{LANGS[code].flag}</span>
                <span className="chip-name">{LANGS[code].name}</span>
                {doneToday(code) && <span className="chip-check">done ✓</span>}
              </span>
              <span className="chip-bottom">
                <PawTrail streak={st.streak} compact />
                <span className="chip-num">{dayLabel(st.streak)}</span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="practice-head" style={{ marginBottom: 'var(--space-block)' }}>
        <p className="eyebrow" style={{ marginBottom: 8 }}>
          Daily practice
        </p>
        <h2 style={{ margin: 0 }}>Write today's step.</h2>
      </div>

      <div className="placeholder">
        <h3>Foundation ready ✓</h3>
        <p className="muted" style={{ margin: 0 }}>
          The writing flow — Title, <code>🎲 Shuffle</code>, language tag, editor, and AI review —
          arrives in <b>E2</b> &amp; <b>E4</b>. The streak cards above are live from local storage.
        </p>
      </div>
    </div>
  );
}
