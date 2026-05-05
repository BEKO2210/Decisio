import type { AppState } from '../types';
import { DEFAULT_STATE, SCHEMA_VERSION } from '../types';

const STORAGE_KEY = 'decisio:v1';

export function loadState(): AppState {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_STATE };
    if (parsed.schemaVersion !== SCHEMA_VERSION) {
      // Future: migration logic. For now, accept the data shape if compatible.
    }
    return {
      decisions: Array.isArray(parsed.decisions) ? parsed.decisions : [],
      activeId: parsed.activeId ?? null,
      schemaVersion: SCHEMA_VERSION
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded or storage disabled; we silently drop.
  }
}

export function clearState(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function exportJson(state: AppState): string {
  return JSON.stringify(
    { app: 'decisio', schemaVersion: SCHEMA_VERSION, exportedAt: new Date().toISOString(), state },
    null,
    2
  );
}

export function importJson(raw: string): AppState | null {
  try {
    const data = JSON.parse(raw) as { state?: Partial<AppState> } & Partial<AppState>;
    const candidate = (data.state ?? data) as Partial<AppState>;
    if (!candidate || !Array.isArray(candidate.decisions)) return null;
    return {
      decisions: candidate.decisions,
      activeId: candidate.activeId ?? null,
      schemaVersion: SCHEMA_VERSION
    };
  } catch {
    return null;
  }
}
