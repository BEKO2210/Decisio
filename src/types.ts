export type ID = string;

export interface Criterion {
  id: ID;
  name: string;
  weight: number;
}

export interface Option {
  id: ID;
  name: string;
  notes?: string;
}

export interface Decision {
  id: ID;
  title: string;
  description?: string;
  criteria: Criterion[];
  options: Option[];
  scores: Record<ID, Record<ID, number>>;
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  decisions: Decision[];
  activeId: ID | null;
  schemaVersion: number;
}

export const SCHEMA_VERSION = 1;

export const DEFAULT_STATE: AppState = {
  decisions: [],
  activeId: null,
  schemaVersion: SCHEMA_VERSION
};

export const SCORE_MIN = 0;
export const SCORE_MAX = 10;
export const WEIGHT_MIN = 1;
export const WEIGHT_MAX = 10;
