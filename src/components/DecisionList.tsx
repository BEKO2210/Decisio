import type { Decision } from '../types';
import { rankOptions } from '../utils/score';

interface Props {
  decisions: Decision[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onNew: () => void;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function DecisionList({ decisions, onOpen, onDelete, onDuplicate, onNew }: Props) {
  return (
    <div className="decision-list-page">
      <button type="button" className="btn btn-primary btn-block" onClick={onNew}>
        + New decision
      </button>

      <ul className="decision-list" aria-label="Your decisions">
        {decisions.map((d) => {
          const ranked = rankOptions(d);
          const winner = ranked[0];
          return (
            <li key={d.id} className="decision-card">
              <button
                type="button"
                className="decision-card-main"
                onClick={() => onOpen(d.id)}
                aria-label={`Open decision ${d.title}`}
              >
                <div className="decision-card-title">{d.title}</div>
                {d.description && <div className="decision-card-desc">{d.description}</div>}
                <div className="decision-card-meta">
                  <span>{d.options.length} options</span>
                  <span aria-hidden="true">·</span>
                  <span>{d.criteria.length} criteria</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatDate(d.updatedAt)}</span>
                </div>
                {winner && d.options.length >= 2 && d.criteria.length >= 1 ? (
                  <div className="decision-card-winner">
                    <span className="winner-label">Leading:</span>
                    <strong>{winner.optionName}</strong>
                    <span className="winner-score">{winner.normalizedScore.toFixed(1)} / 10</span>
                  </div>
                ) : (
                  <div className="decision-card-winner muted">Add options and criteria to rank</div>
                )}
              </button>
              <div className="decision-card-actions">
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => onDuplicate(d.id)}
                  aria-label={`Duplicate ${d.title}`}
                  title="Duplicate"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <rect
                      x="8"
                      y="8"
                      width="12"
                      height="12"
                      rx="2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className="icon-button danger"
                  onClick={() => {
                    if (confirm(`Delete "${d.title}"? This cannot be undone.`)) onDelete(d.id);
                  }}
                  aria-label={`Delete ${d.title}`}
                  title="Delete"
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
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
