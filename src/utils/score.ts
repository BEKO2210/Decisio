import type { Decision, ID } from '../types';
import { SCORE_MAX, SCORE_MIN, WEIGHT_MAX, WEIGHT_MIN } from '../types';

export interface RankedOption {
  optionId: ID;
  optionName: string;
  rawScore: number;
  normalizedScore: number;
  percent: number;
  rank: number;
}

export function clampScore(value: number): number {
  if (Number.isNaN(value)) return SCORE_MIN;
  return Math.min(SCORE_MAX, Math.max(SCORE_MIN, value));
}

export function clampWeight(value: number): number {
  if (Number.isNaN(value)) return WEIGHT_MIN;
  return Math.min(WEIGHT_MAX, Math.max(WEIGHT_MIN, value));
}

export function getScore(d: Decision, optionId: ID, criterionId: ID): number {
  return d.scores[optionId]?.[criterionId] ?? 0;
}

/**
 * Weighted sum of (score × weight) for one option, divided by sum of weights
 * to give a comparable normalized 0-10 score. Raw is the unnormalized total.
 */
export function rankOptions(d: Decision): RankedOption[] {
  const totalWeight = d.criteria.reduce((s, c) => s + clampWeight(c.weight), 0) || 1;
  const ranked = d.options.map<Omit<RankedOption, 'rank' | 'percent'>>((o) => {
    let raw = 0;
    for (const c of d.criteria) {
      const s = clampScore(getScore(d, o.id, c.id));
      raw += s * clampWeight(c.weight);
    }
    const normalized = raw / totalWeight;
    return {
      optionId: o.id,
      optionName: o.name,
      rawScore: raw,
      normalizedScore: normalized
    };
  });

  const max = ranked.reduce((m, r) => Math.max(m, r.normalizedScore), 0);
  const sorted = [...ranked].sort((a, b) => b.normalizedScore - a.normalizedScore);

  let lastScore = -Infinity;
  let lastRank = 0;
  return sorted.map((r, i) => {
    const rank = r.normalizedScore === lastScore ? lastRank : i + 1;
    lastScore = r.normalizedScore;
    lastRank = rank;
    return {
      ...r,
      rank,
      percent: max > 0 ? (r.normalizedScore / max) * 100 : 0
    };
  });
}

export function decisionIsScorable(d: Decision): boolean {
  return d.options.length >= 2 && d.criteria.length >= 1;
}

export function decisionCompleteness(d: Decision): number {
  const total = d.options.length * d.criteria.length;
  if (total === 0) return 0;
  let filled = 0;
  for (const o of d.options) {
    for (const c of d.criteria) {
      if ((d.scores[o.id]?.[c.id] ?? null) !== null) filled++;
    }
  }
  return filled / total;
}
