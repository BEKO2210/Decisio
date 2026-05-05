import type { RankedOption } from '../utils/score';

interface Props {
  ranked: RankedOption[];
  scorable: boolean;
  optionsCount: number;
  criteriaCount: number;
  onGoTo: (target: 'options' | 'criteria' | 'score') => void;
}

export function Ranking({ ranked, scorable, optionsCount, criteriaCount, onGoTo }: Props) {
  if (!scorable) {
    return (
      <section className="editor">
        <h2 className="editor-heading">Result</h2>
        <p className="empty-row">
          Add at least 2 options and 1 criterion to see your ranking.
        </p>
        <div className="ranking-cta">
          {optionsCount < 2 && (
            <button type="button" className="btn btn-primary" onClick={() => onGoTo('options')}>
              Add options
            </button>
          )}
          {criteriaCount < 1 && (
            <button type="button" className="btn" onClick={() => onGoTo('criteria')}>
              Add criteria
            </button>
          )}
        </div>
      </section>
    );
  }

  const top = ranked[0];

  return (
    <section className="editor" aria-labelledby="ranking-heading">
      <h2 id="ranking-heading" className="editor-heading">
        Result
      </h2>
      {top && (
        <p className="ranking-summary">
          Based on your weights, <strong>{top.optionName}</strong> ranks highest with{' '}
          <strong>{top.normalizedScore.toFixed(2)} / 10</strong>.
        </p>
      )}

      <ol className="ranking-list" aria-label="Ranked options">
        {ranked.map((r) => (
          <li key={r.optionId} className={`ranking-item rank-${r.rank}`}>
            <div className="ranking-item-head">
              <span className="ranking-rank" aria-label={`Rank ${r.rank}`}>
                {r.rank}
              </span>
              <span className="ranking-name">{r.optionName}</span>
              <span className="ranking-score" aria-label={`Score ${r.normalizedScore.toFixed(2)} of 10`}>
                {r.normalizedScore.toFixed(2)}
              </span>
            </div>
            <div
              className="ranking-bar"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(r.percent)}
            >
              <div className="ranking-bar-fill" style={{ width: `${r.percent}%` }} />
            </div>
          </li>
        ))}
      </ol>

      <div className="ranking-cta">
        <button type="button" className="link-button" onClick={() => onGoTo('score')}>
          Adjust scores
        </button>
        <button type="button" className="link-button" onClick={() => onGoTo('criteria')}>
          Adjust weights
        </button>
      </div>
    </section>
  );
}
