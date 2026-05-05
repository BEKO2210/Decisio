import { useEffect, useState } from 'react';
import { useDecisions } from './state/useDecisions';
import { Header } from './components/Header';
import { DecisionList } from './components/DecisionList';
import { DecisionDetail } from './components/DecisionDetail';
import { EmptyState } from './components/EmptyState';
import { SettingsSheet } from './components/SettingsSheet';
import { NewDecisionDialog } from './components/NewDecisionDialog';
import { Onboarding } from './components/Onboarding';

const ONBOARDING_KEY = 'decisio:onboarded:v1';

export default function App() {
  const { state, dispatch } = useDecisions();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(ONBOARDING_KEY)) setOnboardingOpen(true);
    } catch {
      /* storage disabled — silently skip onboarding */
    }
  }, []);

  function dismissOnboarding() {
    try {
      window.localStorage.setItem(ONBOARDING_KEY, '1');
    } catch {
      /* ignore */
    }
    setOnboardingOpen(false);
  }

  const active = state.decisions.find((d) => d.id === state.activeId) ?? null;

  return (
    <div className="app-shell">
      <Header
        title={active ? active.title : 'Decisio'}
        onBack={active ? () => dispatch({ type: 'setActive', id: null }) : undefined}
        onSettings={() => setSettingsOpen(true)}
      />

      <main className="app-main" id="main">
        {active ? (
          <DecisionDetail decision={active} />
        ) : state.decisions.length === 0 ? (
          <EmptyState onCreate={() => setNewDialogOpen(true)} />
        ) : (
          <DecisionList
            decisions={state.decisions}
            onOpen={(id) => dispatch({ type: 'setActive', id })}
            onDelete={(id) => dispatch({ type: 'deleteDecision', id })}
            onDuplicate={(id) => dispatch({ type: 'duplicateDecision', id })}
            onNew={() => setNewDialogOpen(true)}
          />
        )}
      </main>

      {onboardingOpen && <Onboarding onDone={dismissOnboarding} />}
      {settingsOpen && <SettingsSheet onClose={() => setSettingsOpen(false)} />}
      {newDialogOpen && (
        <NewDecisionDialog
          onCancel={() => setNewDialogOpen(false)}
          onCreate={(title, description) => {
            dispatch({ type: 'createDecision', title, description });
            setNewDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}
