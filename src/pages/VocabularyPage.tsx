import { useAppState } from '@/lib/useAppState';
import { LANGS, LANG_CODES } from '@/lib/constants';

/** E1 stand-in for the Vocabulary page. The collection view arrives in E7. */
export function VocabularyPage() {
  const state = useAppState();
  return (
    <div>
      <div className="view-head">
        <p className="eyebrow">Your collection</p>
        <h1>Vocabulary</h1>
        <p className="muted">Words the AI coach extracts from your writing, saved to review later.</p>
      </div>
      <div className="placeholder">
        <h3>Foundation ready ✓</h3>
        <p className="muted" style={{ margin: 0 }}>
          The collection table lands in <b>E7</b>. Saved so far:{' '}
          {LANG_CODES.map((c, i) => (
            <span key={c}>
              {i > 0 && ' · '}
              {LANGS[c].flag} {state.vocab[c].length} words
            </span>
          ))}
          .
        </p>
      </div>
    </div>
  );
}
