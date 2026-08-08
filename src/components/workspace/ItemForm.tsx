import { useRef, useState } from 'react';
import { EMOJIS } from '@/lib/constants';
import type { WorkspaceDraft } from '@/lib/storage';
import { toast } from '@/lib/toast';

interface ItemFormProps {
  initial?: WorkspaceDraft;
  submitLabel: string;
  onSubmit: (data: WorkspaceDraft) => void;
  onCancel?: () => void;
  variant?: 'add' | 'edit';
}

/** Shared form for creating and editing a workspace item. */
export function ItemForm({ initial, submitLabel, onSubmit, onCancel, variant = 'add' }: ItemFormProps) {
  const [emoji, setEmoji] = useState(initial?.emoji || '📚');
  const [label, setLabel] = useState(initial?.label || '');
  const [note, setNote] = useState(initial?.note || '');
  const labelRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const trimmed = label.trim();
    if (!trimmed) {
      toast('Type something first');
      labelRef.current?.focus();
      return;
    }
    onSubmit({ emoji, label: trimmed, note: note.trim() });
    if (variant === 'add') {
      setLabel('');
      setNote('');
      labelRef.current?.focus();
    }
  };

  return (
    <div className={variant === 'add' ? 'ws-add' : 'ws-edit'}>
      <div className="field">
        <label>Item</label>
        <input
          ref={labelRef}
          className="input"
          value={label}
          placeholder="e.g. The train station near home"
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
      </div>
      <div className="field">
        <label>Note (optional)</label>
        <input
          className="input"
          value={note}
          placeholder="a detail or two"
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
      </div>
      <div className="emoji-pick" role="group" aria-label="Pick an emoji">
        {EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            className={e === emoji ? 'sel' : ''}
            aria-pressed={e === emoji}
            onClick={() => setEmoji(e)}
          >
            {e}
          </button>
        ))}
      </div>
      <div className="row">
        <button className="cta" onClick={submit}>
          {submitLabel}
        </button>
        {onCancel && (
          <button className="pill-btn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
