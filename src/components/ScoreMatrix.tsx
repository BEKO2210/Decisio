import type { Decision } from '../types';
import { SCORE_MAX, SCORE_MIN } from '../types';
import { clampScore, getScore } from '../utils/score';

interface Props {
  decision: Decision;
  onSetScore: (optionId: string, criterionId: string, value: number) => void;
}

export function ScoreMatrix({ decision, onSetScore }: Props) {
  if (decision.options.length === 0 || decision.criteria.length === 0) {
    return (
      <section className="editor">
        <h2 className="editor-heading">Score each option</h2>
        <p className="empty-row">
          Add at least one option and one criterion first, then come back to score them.
        </p>
      </section>
    );
  }

  return (
    <section className="editor" aria-labelledby="score-heading">
      <h2 id="score-heading" className="editor-heading">
        Score each option
      </h2>
      <p className="editor-help">
        For each criterion, give every option a score from {SCORE_MIN} (terrible) to {SCORE_MAX}{' '}
        (perfect).
      </p>

      <div className="score-groups">
        {decision.criteria.map((c) => (
          <div key={c.id} className="score-group">
            <header className="score-group-head">
              <h3 className="score-group-title">{c.name}</h3>
              <span className="score-group-weight" aria-label={`Weight ${c.weight} of ${SCORE_MAX}`}>
                weight {c.weight}
              </span>
            </header>
            <ul className="score-group-list">
              {decision.options.map((o) => {
                const value = getScore(decision, o.id, c.id);
                const id = `score-${o.id}-${c.id}`;
                return (
                  <li key={o.id} className="score-row">
                    <label htmlFor={id} className="score-row-label">
                      {o.name}
                    </label>
                    <input
                      id={id}
                      type="range"
                      min={SCORE_MIN}
                      max={SCORE_MAX}
                      step={1}
                      value={value}
                      onChange={(e) => onSetScore(o.id, c.id, clampScore(Number(e.target.value)))}
                      aria-valuemin={SCORE_MIN}
                      aria-valuemax={SCORE_MAX}
                      aria-valuenow={value}
                      aria-label={`Score ${o.name} on ${c.name}`}
                    />
                    <output className="score-row-value" htmlFor={id}>
                      {value}
                    </output>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
