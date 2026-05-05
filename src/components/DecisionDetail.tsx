import { useState } from 'react';
import type { Decision } from '../types';
import { useDecisions } from '../state/useDecisions';
import { decisionCompleteness, decisionIsScorable, rankOptions } from '../utils/score';
import { CriteriaEditor } from './CriteriaEditor';
import { OptionsEditor } from './OptionsEditor';
import { ScoreMatrix } from './ScoreMatrix';
import { Ranking } from './Ranking';
import { Modal } from './Modal';

interface Props {
  decision: Decision;
}

type Tab = 'options' | 'criteria' | 'score' | 'rank';

export function DecisionDetail({ decision }: Props) {
  const { dispatch } = useDecisions();
  const [tab, setTab] = useState<Tab>(decision.options.length === 0 ? 'options' : 'rank');
  const [editTitleOpen, setEditTitleOpen] = useState(false);
  const ranked = rankOptions(decision);
  const scorable = decisionIsScorable(decision);
  const completeness = decisionCompleteness(decision);

  return (
    <div className="decision-detail">
      <div className="decision-summary">
        {decision.description && <p className="decision-description">{decision.description}</p>}
        <div className="decision-summary-row">
          <button type="button" className="link-button" onClick={() => setEditTitleOpen(true)}>
            Edit title & notes
          </button>
          {scorable && (
            <span className="completeness" aria-label={`Scoring ${Math.round(completeness * 100)}% complete`}>
              {Math.round(completeness * 100)}% scored
            </span>
          )}
        </div>
      </div>

      <nav className="tab-bar" role="tablist" aria-label="Decision sections">
        {(['options', 'criteria', 'score', 'rank'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={`tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'options' && `Options (${decision.options.length})`}
            {t === 'criteria' && `Criteria (${decision.criteria.length})`}
            {t === 'score' && 'Score'}
            {t === 'rank' && 'Result'}
          </button>
        ))}
      </nav>

      <div className="tab-panels">
        {tab === 'options' && <OptionsEditor decision={decision} />}
        {tab === 'criteria' && <CriteriaEditor decision={decision} />}
        {tab === 'score' && (
          <ScoreMatrix
            decision={decision}
            onSetScore={(optionId, criterionId, value) =>
              dispatch({ type: 'setScore', decisionId: decision.id, optionId, criterionId, value })
            }
          />
        )}
        {tab === 'rank' && (
          <Ranking
            ranked={ranked}
            scorable={scorable}
            optionsCount={decision.options.length}
            criteriaCount={decision.criteria.length}
            onGoTo={(target) => setTab(target)}
          />
        )}
      </div>

      {editTitleOpen && (
        <EditTitleDialog
          title={decision.title}
          description={decision.description ?? ''}
          onCancel={() => setEditTitleOpen(false)}
          onSave={(t, d) => {
            dispatch({ type: 'renameDecision', id: decision.id, title: t, description: d });
            setEditTitleOpen(false);
          }}
        />
      )}
    </div>
  );
}

function EditTitleDialog({
  title,
  description,
  onCancel,
  onSave
}: {
  title: string;
  description: string;
  onCancel: () => void;
  onSave: (title: string, description?: string) => void;
}) {
  const [t, setT] = useState(title);
  const [d, setD] = useState(description);
  return (
    <Modal onClose={onCancel} title="Edit decision">
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!t.trim()) return;
          onSave(t.trim(), d.trim() || undefined);
        }}
      >
        <label className="field">
          <span className="field-label">Title</span>
          <input value={t} onChange={(e) => setT(e.target.value)} maxLength={100} required />
        </label>
        <label className="field">
          <span className="field-label">
            Notes <span className="optional">(optional)</span>
          </span>
          <textarea value={d} onChange={(e) => setD(e.target.value)} maxLength={300} rows={2} />
        </label>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!t.trim()}>
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}
