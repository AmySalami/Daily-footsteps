import { useAppState } from '@/lib/useAppState';
import { LANGS, LANG_CODES } from '@/lib/constants';

/** E1 stand-in for the Workspace page. Full CRUD arrives in E3. */
export function WorkspacePage() {
  const state = useAppState();
  return (
    <div>
      <div className="view-head">
        <p className="eyebrow">Your workspace</p>
        <h1>My stuff</h1>
        <p className="muted">The things Shuffle draws from when you don't know what to write about.</p>
      </div>
      <div className="placeholder">
        <h3>Foundation ready ✓</h3>
        <p className="muted" style={{ margin: 0 }}>
          Add / edit / remove lands in <b>E3</b>. Seeded so far:{' '}
          {LANG_CODES.map((c, i) => (
            <span key={c}>
              {i > 0 && ' · '}
              {LANGS[c].flag} {state.workspace[c].length} items
            </span>
          ))}
          .
        </p>
      </div>
    </div>
  );
}
