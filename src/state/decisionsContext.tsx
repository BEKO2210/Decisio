import { createContext, useEffect, useMemo, useReducer } from 'react';
import type { AppState } from '../types';
import { loadState, saveState } from '../storage/localStore';
import type { Action } from './decisionsReducer';
import { reducer } from './decisionsReducer';

interface Ctx {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const DecisionsContext = createContext<Ctx | null>(null);

export function DecisionsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <DecisionsContext.Provider value={value}>{children}</DecisionsContext.Provider>;
}
