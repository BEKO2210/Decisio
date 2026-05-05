import { useState } from 'react';
import { Modal } from './Modal';

interface Props {
  onDone: () => void;
}

const STEPS = [
  {
    title: 'Welcome to Decisio',
    body: 'A private, on-device tool for making better decisions. No accounts, no servers, no tracking.',
    icon: (
      <svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">
        <rect x="6" y="6" width="52" height="52" rx="14" fill="var(--accent)" opacity="0.18" />
        <path d="M18 22h22M18 32h28M18 42h18" stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <circle cx="46" cy="22" r="3.5" fill="var(--accent)" />
        <circle cx="50" cy="32" r="3.5" fill="var(--accent)" />
        <circle cx="42" cy="42" r="3.5" fill="var(--accent)" />
      </svg>
    )
  },
  {
    title: 'How it works',
    body: 'Add the options you\'re choosing between, list the criteria that matter, and weight each one from 1 (nice to have) to 10 (deal breaker).',
    icon: (
      <svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">
        <rect x="8" y="14" width="20" height="12" rx="3" fill="var(--accent)" opacity="0.55" />
        <rect x="8" y="30" width="32" height="6" rx="3" fill="var(--text-muted)" opacity="0.6" />
        <rect x="8" y="40" width="26" height="6" rx="3" fill="var(--text-muted)" opacity="0.45" />
        <rect x="8" y="50" width="18" height="6" rx="3" fill="var(--text-muted)" opacity="0.3" />
        <circle cx="50" cy="20" r="6" fill="var(--accent)" />
        <path d="M46 20l3 3 6-6" stroke="var(--bg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    )
  },
  {
    title: 'See the ranking',
    body: 'Score each option per criterion. Decisio computes a transparent weighted ranking — change a weight or score anytime and watch the result update live.',
    icon: (
      <svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">
        <rect x="8" y="22" width="48" height="6" rx="3" fill="var(--accent)" />
        <rect x="8" y="34" width="34" height="6" rx="3" fill="var(--accent)" opacity="0.7" />
        <rect x="8" y="46" width="20" height="6" rx="3" fill="var(--accent)" opacity="0.4" />
        <circle cx="56" cy="14" r="5" fill="var(--accent)" />
        <path d="M53 14l2 2 4-4" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    )
  }
];

export function Onboarding({ onDone }: Props) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <Modal onClose={onDone} title={undefined} labelledBy="onboarding-title">
      <div className="onboarding">
        <div className="onboarding-icon" aria-hidden="true">
          {current.icon}
        </div>
        <h2 id="onboarding-title" className="onboarding-title">
          {current.title}
        </h2>
        <p className="onboarding-body">{current.body}</p>

        <div className="onboarding-dots" role="tablist" aria-label="Onboarding progress">
          {STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === step}
              aria-label={`Step ${i + 1} of ${STEPS.length}`}
              className={`onboarding-dot ${i === step ? 'active' : ''}`}
              onClick={() => setStep(i)}
            />
          ))}
        </div>

        <div className="onboarding-actions">
          <button type="button" className="link-button" onClick={onDone}>
            Skip
          </button>
          {isLast ? (
            <button type="button" className="btn btn-primary" onClick={onDone}>
              Get started
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => setStep(step + 1)}>
              Next
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
