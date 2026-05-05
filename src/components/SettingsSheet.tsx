import { useRef, useState } from 'react';
import { useDecisions } from '../state/useDecisions';
import { exportJson, importJson } from '../storage/localStore';
import { Modal } from './Modal';

interface Props {
  onClose: () => void;
}

export function SettingsSheet({ onClose }: Props) {
  const { state, dispatch } = useDecisions();
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const blob = new Blob([exportJson(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `decisio-export-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    file
      .text()
      .then((raw) => {
        const next = importJson(raw);
        if (!next) {
          setImportError('That file does not look like a Decisio export.');
          return;
        }
        if (!confirm(`Replace your current data with ${next.decisions.length} imported decisions?`))
          return;
        dispatch({ type: 'replace', state: next });
      })
      .catch(() => setImportError('Could not read file.'))
      .finally(() => {
        if (fileInputRef.current) fileInputRef.current.value = '';
      });
  }

  function handleReset() {
    if (!confirm('Delete every decision on this device? This cannot be undone.')) return;
    dispatch({ type: 'resetAll' });
  }

  const total = state.decisions.length;

  return (
    <Modal onClose={onClose} title="Settings">
      <div className="settings">
        <section className="settings-section">
          <h3 className="settings-heading">Your data</h3>
          <p className="settings-text">
            {total === 0
              ? 'No decisions yet.'
              : `${total} decision${total === 1 ? '' : 's'} stored on this device only.`}
          </p>
          <div className="settings-actions">
            <button type="button" className="btn" onClick={handleExport} disabled={total === 0}>
              Export JSON
            </button>
            <button type="button" className="btn" onClick={handleImportClick}>
              Import JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={handleFile}
            />
          </div>
          {importError && (
            <p role="alert" className="settings-error">
              {importError}
            </p>
          )}
        </section>

        <section className="settings-section">
          <h3 className="settings-heading">Danger zone</h3>
          <button type="button" className="btn btn-danger" onClick={handleReset} disabled={total === 0}>
            Delete all decisions
          </button>
        </section>

        <section className="settings-section">
          <h3 className="settings-heading">About</h3>
          <p className="settings-text">
            Decisio runs entirely in your browser. No accounts, no servers, no tracking. Open
            source on{' '}
            <a href="https://github.com/" target="_blank" rel="noreferrer">
              GitHub
            </a>
            .
          </p>
        </section>

        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
