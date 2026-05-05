import { useState } from 'react';
import type { Decision } from '../types';
import { useDecisions } from '../state/useDecisions';

interface Props {
  decision: Decision;
}

export function OptionsEditor({ decision }: Props) {
  const { dispatch } = useDecisions();
  const [name, setName] = useState('');

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    dispatch({ type: 'addOption', decisionId: decision.id, name: name.trim() });
    setName('');
  }

  return (
    <section className="editor" aria-labelledby="options-heading">
      <h2 id="options-heading" className="editor-heading">
        Options to compare
      </h2>
      <p className="editor-help">
        Add at least two things you're choosing between. You can rename or delete them anytime.
      </p>

      <form onSubmit={add} className="row-form">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add an option (e.g. Apartment A)"
          maxLength={80}
          aria-label="Option name"
        />
        <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
          Add
        </button>
      </form>

      {decision.options.length === 0 ? (
        <p className="empty-row">No options yet. Add your first one above.</p>
      ) : (
        <ul className="row-list">
          {decision.options.map((o) => (
            <li key={o.id} className="row">
              <input
                type="text"
                value={o.name}
                onChange={(e) =>
                  dispatch({
                    type: 'updateOption',
                    decisionId: decision.id,
                    option: { ...o, name: e.target.value }
                  })
                }
                aria-label={`Rename option ${o.name}`}
                maxLength={80}
              />
              <button
                type="button"
                className="icon-button danger"
                onClick={() => {
                  if (confirm(`Delete option "${o.name}"?`))
                    dispatch({ type: 'deleteOption', decisionId: decision.id, optionId: o.id });
                }}
                aria-label={`Delete option ${o.name}`}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path
                    d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
