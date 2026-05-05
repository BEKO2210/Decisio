import { useState } from 'react';
import type { Decision } from '../types';
import { useDecisions } from '../state/useDecisions';
import { WEIGHT_MAX, WEIGHT_MIN } from '../types';
import { clampWeight } from '../utils/score';

interface Props {
  decision: Decision;
}

export function CriteriaEditor({ decision }: Props) {
  const { dispatch } = useDecisions();
  const [name, setName] = useState('');
  const [weight, setWeight] = useState(5);

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    dispatch({
      type: 'addCriterion',
      decisionId: decision.id,
      name: name.trim(),
      weight: clampWeight(weight)
    });
    setName('');
    setWeight(5);
  }

  return (
    <section className="editor" aria-labelledby="criteria-heading">
      <h2 id="criteria-heading" className="editor-heading">
        What matters and how much
      </h2>
      <p className="editor-help">
        Weight each criterion from {WEIGHT_MIN} (nice to have) to {WEIGHT_MAX} (deal breaker).
      </p>

      <form onSubmit={add} className="criteria-form">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a criterion (e.g. Price, Commute)"
          maxLength={80}
          aria-label="Criterion name"
        />
        <div className="weight-input-group">
          <label className="weight-input-label">
            Weight
            <input
              type="number"
              inputMode="numeric"
              min={WEIGHT_MIN}
              max={WEIGHT_MAX}
              value={weight}
              onChange={(e) => setWeight(clampWeight(Number(e.target.value)))}
              aria-label="New criterion weight"
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
            Add
          </button>
        </div>
      </form>

      {decision.criteria.length === 0 ? (
        <p className="empty-row">No criteria yet. Add what factors into your decision.</p>
      ) : (
        <ul className="criteria-list">
          {decision.criteria.map((c) => (
            <li key={c.id} className="criterion-row">
              <input
                type="text"
                value={c.name}
                onChange={(e) =>
                  dispatch({
                    type: 'updateCriterion',
                    decisionId: decision.id,
                    criterion: { ...c, name: e.target.value }
                  })
                }
                aria-label={`Rename criterion ${c.name}`}
                maxLength={80}
              />
              <div className="weight-control">
                <input
                  type="range"
                  min={WEIGHT_MIN}
                  max={WEIGHT_MAX}
                  value={c.weight}
                  onChange={(e) =>
                    dispatch({
                      type: 'updateCriterion',
                      decisionId: decision.id,
                      criterion: { ...c, weight: clampWeight(Number(e.target.value)) }
                    })
                  }
                  aria-label={`Weight for ${c.name}: ${c.weight}`}
                />
                <span className="weight-value" aria-hidden="true">
                  {c.weight}
                </span>
              </div>
              <button
                type="button"
                className="icon-button danger"
                onClick={() => {
                  if (confirm(`Delete criterion "${c.name}"?`))
                    dispatch({ type: 'deleteCriterion', decisionId: decision.id, criterionId: c.id });
                }}
                aria-label={`Delete criterion ${c.name}`}
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
