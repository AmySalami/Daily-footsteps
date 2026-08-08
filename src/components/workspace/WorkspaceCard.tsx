import { useState } from 'react';
import type { LangCode, WorkspaceItem } from '@/lib/types';
import { removeWorkspaceItem, updateWorkspaceItem } from '@/lib/storage';
import { toast } from '@/lib/toast';
import { ItemForm } from './ItemForm';

/** A single workspace item: view mode with edit/remove, or inline edit form. */
export function WorkspaceCard({ lang, item }: { lang: LangCode; item: WorkspaceItem }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <ItemForm
        variant="edit"
        initial={{ emoji: item.emoji, label: item.label, note: item.note }}
        submitLabel="Save"
        onSubmit={(data) => {
          updateWorkspaceItem(lang, item.id, data);
          setEditing(false);
          toast('Saved ✓');
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="ws-item">
      <span className="emo">{item.emoji || '📌'}</span>
      <div className="ws-body">
        <div className="lbl">{item.label}</div>
        {item.note && <div className="nt">{item.note}</div>}
      </div>
      <div className="ws-actions">
        <button className="icon-btn" title="Edit" aria-label="Edit item" onClick={() => setEditing(true)}>
          ✎
        </button>
        <button
          className="icon-btn"
          title="Remove"
          aria-label="Remove item"
          onClick={() => {
            removeWorkspaceItem(lang, item.id);
            toast('Removed');
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
