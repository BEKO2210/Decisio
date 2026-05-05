import { useEffect, useRef, useState } from 'react';
import { Modal } from './Modal';

interface Props {
  onCancel: () => void;
  onCreate: (title: string, description?: string) => void;
}

export function NewDecisionDialog({ onCancel, onCreate }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate(title.trim(), description.trim() || undefined);
  }

  return (
    <Modal onClose={onCancel} title="New decision" labelledBy="new-decision-title">
      <form onSubmit={submit} className="form">
        <label className="field">
          <span className="field-label">What are you deciding?</span>
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            required
            placeholder="e.g. Which apartment to rent"
            autoComplete="off"
          />
        </label>
        <label className="field">
          <span className="field-label">
            Notes <span className="optional">(optional)</span>
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={300}
            rows={2}
            placeholder="Anything you want to remember about this decision"
          />
        </label>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
            Create
          </button>
        </div>
      </form>
    </Modal>
  );
}
