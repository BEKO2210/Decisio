import { useContext } from 'react';
import { DecisionsContext } from './decisionsContext';
import type { AppState } from '../types';
import type { Action } from './decisionsReducer';

interface Ctx {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

export function useDecisions(): Ctx {
  const ctx = useContext(DecisionsContext);
  if (!ctx) throw new Error('useDecisions must be used within DecisionsProvider');
  return ctx;
}
