import { useState } from 'react';
import { useAppState } from '@/lib/useAppState';
import { addWorkspaceItem } from '@/lib/storage';
import { toast } from '@/lib/toast';
import { LANGS, LANG_CODES } from '@/lib/constants';
import type { LangCode } from '@/lib/types';
import { ItemForm } from '@/components/workspace/ItemForm';
import { WorkspaceCard } from '@/components/workspace/WorkspaceCard';

/** E3 — Workspace CRUD. Add / edit / remove the items Shuffle draws from. */
export function WorkspacePage() {
  const state = useAppState();
  const [lang, setLang] = useState<LangCode>('en');
  const items = state.workspace[lang];

  return (
    <div>
      <div className="view-head">
        <p className="eyebrow">Your workspace</p>
        <h1>My stuff</h1>
        <p className="muted">
          The things Shuffle draws from when you don't know what to write about. Add whatever matters to you.
        </p>
      </div>

      <div className="row" style={{ marginBottom: 'var(--space-block)' }}>
        {LANG_CODES.map((code) => (
          <button
            key={code}
            className={`pill-btn${code === lang ? ' is-active' : ''}`}
            onClick={() => setLang(code)}
          >
            {LANGS[code].flag} {LANGS[code].name}{' '}
            <span className="muted">({state.workspace[code].length})</span>
          </button>
        ))}
      </div>

      <div className="ws-grid">
        {items.map((item) => (
          <WorkspaceCard key={item.id} lang={lang} item={item} />
        ))}
        <ItemForm
          key={lang /* reset fields when switching language */}
          variant="add"
          submitLabel="＋ Add to workspace"
          onSubmit={(data) => {
            addWorkspaceItem(lang, data);
            toast('Added ✓');
          }}
        />
      </div>
    </div>
  );
}
