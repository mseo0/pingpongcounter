// Feature: voice-counter-website, Property 5: Increment increases score by exactly 1

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { reduce } from '../store';
import type { ScoreState } from '../types';

const scoreStateArb = fc.record({
  sides: fc.tuple(
    fc.record({ score: fc.nat() }),
    fc.record({ score: fc.nat() })
  ),
  sideNames: fc.record({
    left: fc.string({ minLength: 1 }),
    right: fc.string({ minLength: 1 }),
  }),
  listening: fc.boolean(),
  feedback: fc.constant(null),
}) as fc.Arbitrary<ScoreState>;

const targetArb = fc.oneof(fc.constant('left' as const), fc.constant('right' as const));

describe('Score_Store', () => {
  it('Property 5: INCREMENT increases target score by exactly 1 and leaves other side unchanged', () => {
    // Validates: Requirements 4.1, 6.2
    fc.assert(
      fc.property(scoreStateArb, targetArb, (state, target) => {
        const action = { type: 'INCREMENT' as const, target };
        const next = reduce(state, action);

        const targetIdx = target === 'left' ? 0 : 1;
        const otherIdx = target === 'left' ? 1 : 0;

        expect(next.sides[targetIdx].score).toBe(state.sides[targetIdx].score + 1);
        expect(next.sides[otherIdx].score).toBe(state.sides[otherIdx].score);
      }),
      { numRuns: 100 }
    );
  });

  // Feature: voice-counter-website, Property 6: Decrement decreases score by 1, never below 0
  it('Property 6: DECREMENT decreases target score by 1 (never below 0) and leaves other side unchanged', () => {
    // Validates: Requirements 4.2, 4.5, 6.3
    fc.assert(
      fc.property(scoreStateArb, targetArb, (state, target) => {
        const action = { type: 'DECREMENT' as const, target };
        const next = reduce(state, action);

        const targetIdx = target === 'left' ? 0 : 1;
        const otherIdx = target === 'left' ? 1 : 0;

        expect(next.sides[targetIdx].score).toBe(Math.max(0, state.sides[targetIdx].score - 1));
        expect(next.sides[otherIdx].score).toBe(state.sides[otherIdx].score);
      }),
      { numRuns: 100 }
    );
  });

  // Feature: voice-counter-website, Property 7: Reset sets target score(s) to 0
  it('Property 7: RESET sets target score(s) to 0', () => {
    // Validates: Requirements 4.3, 4.4, 6.4
    const resetTargetArb = fc.oneof(
      fc.constant('left' as const),
      fc.constant('right' as const),
      fc.constant('all' as const)
    );

    fc.assert(
      fc.property(scoreStateArb, resetTargetArb, (state, target) => {
        const action = { type: 'RESET' as const, target };
        const next = reduce(state, action);

        if (target === 'all') {
          expect(next.sides[0].score).toBe(0);
          expect(next.sides[1].score).toBe(0);
        } else {
          const targetIdx = target === 'left' ? 0 : 1;
          const otherIdx = target === 'left' ? 1 : 0;

          expect(next.sides[targetIdx].score).toBe(0);
          expect(next.sides[otherIdx].score).toBe(state.sides[otherIdx].score);
        }
      }),
      { numRuns: 100 }
    );
  });
});
