interface Props {
  onCreate: () => void;
}

export function EmptyState({ onCreate }: Props) {
  return (
    <section className="empty-state" aria-labelledby="empty-title">
      <div className="empty-illustration" aria-hidden="true">
        <svg viewBox="0 0 200 140" width="160" height="120">
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect x="10" y="20" width="180" height="100" rx="14" fill="url(#grad)" />
          <rect x="26" y="40" width="50" height="14" rx="4" fill="var(--accent)" opacity="0.55" />
          <rect x="26" y="62" width="100" height="10" rx="3" fill="var(--text-muted)" opacity="0.5" />
          <rect x="26" y="80" width="80" height="10" rx="3" fill="var(--text-muted)" opacity="0.35" />
          <rect x="26" y="98" width="60" height="10" rx="3" fill="var(--text-muted)" opacity="0.25" />
          <circle cx="160" cy="50" r="14" fill="var(--accent)" />
          <path
            d="M154 50l4 4 8-8"
            stroke="var(--bg)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
      <h2 id="empty-title" className="empty-title">
        Make better decisions, fast.
      </h2>
      <p className="empty-text">
        Create a decision, list your options, weight what matters, and let Decisio score them for
        you. Everything stays on this device — no accounts, no tracking.
      </p>
      <button type="button" className="btn btn-primary btn-large" onClick={onCreate}>
        Create your first decision
      </button>
      <ul className="empty-tips" aria-label="What you can do">
        <li>Compare jobs, apartments, gear, or anything else</li>
        <li>Works offline once installed</li>
        <li>Export and import your data anytime</li>
      </ul>
    </section>
  );
}
