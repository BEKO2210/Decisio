import { describe, expect, it } from 'vitest';
import type { Decision } from '../types';
import { SCHEMA_VERSION } from '../types';
import { clampScore, clampWeight, decisionCompleteness, decisionIsScorable, rankOptions } from './score';

function makeDecision(overrides: Partial<Decision> = {}): Decision {
  return {
    id: 'd1',
    title: 'Test',
    criteria: [],
    options: [],
    scores: {},
    createdAt: 0,
    updatedAt: 0,
    ...overrides
  };
}

describe('clampScore', () => {
  it('clamps below 0 to 0', () => expect(clampScore(-5)).toBe(0));
  it('clamps above 10 to 10', () => expect(clampScore(99)).toBe(10));
  it('passes valid values through', () => expect(clampScore(7)).toBe(7));
  it('handles NaN', () => expect(clampScore(NaN)).toBe(0));
});

describe('clampWeight', () => {
  it('clamps below 1 to 1', () => expect(clampWeight(0)).toBe(1));
  it('clamps above 10 to 10', () => expect(clampWeight(99)).toBe(10));
  it('passes valid values through', () => expect(clampWeight(5)).toBe(5));
});

describe('rankOptions', () => {
  it('returns empty array when no options', () => {
    expect(rankOptions(makeDecision())).toEqual([]);
  });

  it('ranks higher weighted scores first', () => {
    const d = makeDecision({
      criteria: [
        { id: 'c1', name: 'Price', weight: 10 },
        { id: 'c2', name: 'Style', weight: 1 }
      ],
      options: [
        { id: 'a', name: 'A' },
        { id: 'b', name: 'B' }
      ],
      scores: {
        a: { c1: 10, c2: 0 },
        b: { c1: 0, c2: 10 }
      }
    });
    const ranked = rankOptions(d);
    expect(ranked[0].optionId).toBe('a');
    expect(ranked[1].optionId).toBe('b');
    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].rank).toBe(2);
  });

  it('produces normalized scores within [0,10]', () => {
    const d = makeDecision({
      criteria: [{ id: 'c1', name: 'X', weight: 5 }],
      options: [{ id: 'a', name: 'A' }],
      scores: { a: { c1: 8 } }
    });
    const [r] = rankOptions(d);
    expect(r.normalizedScore).toBeCloseTo(8, 5);
    expect(r.rawScore).toBe(40);
  });

  it('assigns equal rank to ties', () => {
    const d = makeDecision({
      criteria: [{ id: 'c1', name: 'X', weight: 5 }],
      options: [
        { id: 'a', name: 'A' },
        { id: 'b', name: 'B' }
      ],
      scores: { a: { c1: 7 }, b: { c1: 7 } }
    });
    const ranked = rankOptions(d);
    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].rank).toBe(1);
  });

  it('handles missing scores as 0', () => {
    const d = makeDecision({
      criteria: [{ id: 'c1', name: 'X', weight: 5 }],
      options: [
        { id: 'a', name: 'A' },
        { id: 'b', name: 'B' }
      ],
      scores: { a: { c1: 5 } }
    });
    const ranked = rankOptions(d);
    expect(ranked.find((r) => r.optionId === 'b')?.normalizedScore).toBe(0);
  });
});

describe('decisionIsScorable', () => {
  it('false when fewer than 2 options', () => {
    expect(decisionIsScorable(makeDecision({ options: [{ id: 'a', name: 'A' }] }))).toBe(false);
  });

  it('false when no criteria', () => {
    expect(
      decisionIsScorable(makeDecision({ options: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }] }))
    ).toBe(false);
  });

  it('true with 2 options and 1 criterion', () => {
    expect(
      decisionIsScorable(
        makeDecision({
          options: [
            { id: 'a', name: 'A' },
            { id: 'b', name: 'B' }
          ],
          criteria: [{ id: 'c', name: 'C', weight: 5 }]
        })
      )
    ).toBe(true);
  });
});

describe('decisionCompleteness', () => {
  it('returns 0 for empty decision', () => {
    expect(decisionCompleteness(makeDecision())).toBe(0);
  });

  it('returns 1 when all cells filled', () => {
    const d = makeDecision({
      options: [{ id: 'a', name: 'A' }],
      criteria: [{ id: 'c', name: 'C', weight: 5 }],
      scores: { a: { c: 7 } }
    });
    expect(decisionCompleteness(d)).toBe(1);
  });

  it('returns 0.5 when half filled', () => {
    const d = makeDecision({
      options: [
        { id: 'a', name: 'A' },
        { id: 'b', name: 'B' }
      ],
      criteria: [{ id: 'c', name: 'C', weight: 5 }],
      scores: { a: { c: 7 } }
    });
    expect(decisionCompleteness(d)).toBe(0.5);
  });
});

describe('schema', () => {
  it('exports schema version', () => expect(SCHEMA_VERSION).toBeGreaterThan(0));
});
