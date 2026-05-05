import type { AppState, Criterion, Decision, ID, Option } from '../types';
import { SCHEMA_VERSION } from '../types';
import { newId } from '../utils/id';

export type Action =
  | { type: 'hydrate'; state: AppState }
  | { type: 'createDecision'; title: string; description?: string }
  | { type: 'deleteDecision'; id: ID }
  | { type: 'renameDecision'; id: ID; title: string; description?: string }
  | { type: 'duplicateDecision'; id: ID }
  | { type: 'setActive'; id: ID | null }
  | { type: 'addOption'; decisionId: ID; name: string }
  | { type: 'updateOption'; decisionId: ID; option: Option }
  | { type: 'deleteOption'; decisionId: ID; optionId: ID }
  | { type: 'addCriterion'; decisionId: ID; name: string; weight: number }
  | { type: 'updateCriterion'; decisionId: ID; criterion: Criterion }
  | { type: 'deleteCriterion'; decisionId: ID; criterionId: ID }
  | { type: 'setScore'; decisionId: ID; optionId: ID; criterionId: ID; value: number }
  | { type: 'resetAll' }
  | { type: 'replace'; state: AppState };

function touch(d: Decision): Decision {
  return { ...d, updatedAt: Date.now() };
}

function mapDecision(state: AppState, id: ID, fn: (d: Decision) => Decision): AppState {
  return {
    ...state,
    decisions: state.decisions.map((d) => (d.id === id ? touch(fn(d)) : d))
  };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate':
    case 'replace':
      return action.state;

    case 'resetAll':
      return { decisions: [], activeId: null, schemaVersion: SCHEMA_VERSION };

    case 'setActive':
      return { ...state, activeId: action.id };

    case 'createDecision': {
      const now = Date.now();
      const decision: Decision = {
        id: newId(),
        title: action.title.trim() || 'Untitled decision',
        description: action.description?.trim() || undefined,
        criteria: [],
        options: [],
        scores: {},
        createdAt: now,
        updatedAt: now
      };
      return { ...state, decisions: [decision, ...state.decisions], activeId: decision.id };
    }

    case 'deleteDecision':
      return {
        ...state,
        decisions: state.decisions.filter((d) => d.id !== action.id),
        activeId: state.activeId === action.id ? null : state.activeId
      };

    case 'renameDecision':
      return mapDecision(state, action.id, (d) => ({
        ...d,
        title: action.title.trim() || d.title,
        description: action.description?.trim() || undefined
      }));

    case 'duplicateDecision': {
      const original = state.decisions.find((d) => d.id === action.id);
      if (!original) return state;
      const now = Date.now();
      const copy: Decision = {
        ...original,
        id: newId(),
        title: `${original.title} (copy)`,
        createdAt: now,
        updatedAt: now
      };
      return { ...state, decisions: [copy, ...state.decisions], activeId: copy.id };
    }

    case 'addOption':
      return mapDecision(state, action.decisionId, (d) => ({
        ...d,
        options: [...d.options, { id: newId(), name: action.name.trim() || 'New option' }]
      }));

    case 'updateOption':
      return mapDecision(state, action.decisionId, (d) => ({
        ...d,
        options: d.options.map((o) => (o.id === action.option.id ? action.option : o))
      }));

    case 'deleteOption':
      return mapDecision(state, action.decisionId, (d) => {
        const { [action.optionId]: _removed, ...rest } = d.scores;
        return {
          ...d,
          options: d.options.filter((o) => o.id !== action.optionId),
          scores: rest
        };
      });

    case 'addCriterion':
      return mapDecision(state, action.decisionId, (d) => ({
        ...d,
        criteria: [
          ...d.criteria,
          { id: newId(), name: action.name.trim() || 'New criterion', weight: action.weight }
        ]
      }));

    case 'updateCriterion':
      return mapDecision(state, action.decisionId, (d) => ({
        ...d,
        criteria: d.criteria.map((c) => (c.id === action.criterion.id ? action.criterion : c))
      }));

    case 'deleteCriterion':
      return mapDecision(state, action.decisionId, (d) => ({
        ...d,
        criteria: d.criteria.filter((c) => c.id !== action.criterionId),
        scores: Object.fromEntries(
          Object.entries(d.scores).map(([oid, perCrit]) => {
            const { [action.criterionId]: _removed, ...rest } = perCrit;
            return [oid, rest];
          })
        )
      }));

    case 'setScore':
      return mapDecision(state, action.decisionId, (d) => ({
        ...d,
        scores: {
          ...d.scores,
          [action.optionId]: {
            ...(d.scores[action.optionId] ?? {}),
            [action.criterionId]: action.value
          }
        }
      }));

    default:
      return state;
  }
}
