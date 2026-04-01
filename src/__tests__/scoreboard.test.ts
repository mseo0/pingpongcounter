// Feature: voice-counter-website, Property 1: Scoreboard renders all side names and scores

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { renderScoreboard } from '../scoreboard';
import type { ScoreState } from '../types';

// Validates: Requirements 1.2, 5.2

describe('Scoreboard_Display', () => {
  it('Property 1: renders all side names and scores for any ScoreState', () => {
    // Use strings that won't be HTML-escaped in attribute values
    // (exclude HTML special chars: " < > & which get escaped in innerHTML)
    const nonEmptyString = fc.stringOf(
      fc.char().filter((c) => c !== '"' && c !== "'" && c !== '<' && c !== '>' && c !== '&'),
      { minLength: 1 }
    );
    const nonNegativeInt = fc.integer({ min: 0 });

    const scoreStateArb = fc.record<ScoreState>({
      sides: fc.tuple(
        fc.record({ score: nonNegativeInt }),
        fc.record({ score: nonNegativeInt })
      ),
      sideNames: fc.record({
        left: nonEmptyString,
        right: nonEmptyString,
      }),
      listening: fc.boolean(),
      feedback: fc.constant(null),
    });

    fc.assert(
      fc.property(scoreStateArb, (state) => {
        const container = document.createElement('div');
        renderScoreboard(container, state, () => {});

        const html = container.innerHTML;

        // Both side names must appear in the rendered output
        expect(html).toContain(state.sideNames.left);
        expect(html).toContain(state.sideNames.right);

        // Both score values must appear as strings
        expect(html).toContain(String(state.sides[0].score));
        expect(html).toContain(String(state.sides[1].score));
      }),
      { numRuns: 100 }
    );
  });
});
