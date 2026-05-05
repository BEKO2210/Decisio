import { useEffect, useRef } from 'react';

interface Props {
  onClose: () => void;
  title?: string;
  labelledBy?: string;
  children: React.ReactNode;
}

export function Modal({ onClose, title, labelledBy, children }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    const previousFocus = document.activeElement as HTMLElement | null;
    return () => {
      document.removeEventListener('keydown', onKey);
      previousFocus?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy ?? (title ? 'modal-title' : undefined)}
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 id={labelledBy ?? 'modal-title'} className="modal-title">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
