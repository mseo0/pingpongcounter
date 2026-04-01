// Feature: voice-counter-website, Property 3: Parser correctly identifies side from text

import { describe, it } from 'vitest';
import { expect } from 'vitest';
import * as fc from 'fast-check';
import { parseCommand } from '../parser';

// Keywords to exclude from generated side names to avoid ambiguity
const RESERVED = new Set([
  'left', 'right', 'all', 'both',
  'add', 'plus', 'point', 'score', 'increment', 'up',
  'minus', 'remove', 'subtract', 'decrement', 'down',
  'reset', 'clear', 'zero',
  'side',
]);

// Simple alphanumeric side name generator — no punctuation, no reserved keywords
const sideNameArb = fc
  .stringMatching(/^[a-z]{3,8}$/)
  .filter((s) => !RESERVED.has(s));

// Arbitrary for a pair of distinct side names
const sideNamePairArb = fc
  .tuple(sideNameArb, sideNameArb)
  .filter(([a, b]) => a !== b);

// Increment keywords (a subset that won't conflict with side detection)
const INCREMENT_KEYWORDS = ['add', 'plus', 'point', 'score', 'increment', 'up'];
const incrementKeywordArb = fc.constantFrom(...INCREMENT_KEYWORDS);

describe('Command_Parser', () => {
  it('Property 3: parser correctly identifies side from text (custom names and positional terms)', () => {
    // Validates: Requirements 3.1, 3.6, 5.3
    fc.assert(
      fc.property(
        sideNamePairArb,
        incrementKeywordArb,
        // which variant to test: 0=leftName, 1=rightName, 2="left" keyword, 3="right" keyword
        fc.integer({ min: 0, max: 3 }),
        ([leftName, rightName], keyword, variant) => {
          const sideNames = { left: leftName, right: rightName };

          let text: string;
          let expectedTarget: 'left' | 'right';

          switch (variant) {
            case 0:
              // Custom left name + increment keyword
              text = `${leftName} ${keyword}`;
              expectedTarget = 'left';
              break;
            case 1:
              // Custom right name + increment keyword
              text = `${rightName} ${keyword}`;
              expectedTarget = 'right';
              break;
            case 2:
              // Positional "left" + increment keyword (use default names so no custom name conflicts)
              text = `left ${keyword}`;
              expectedTarget = 'left';
              break;
            case 3:
            default:
              // Positional "right" + increment keyword (use default names so no custom name conflicts)
              text = `right ${keyword}`;
              expectedTarget = 'right';
              break;
          }

          // For positional term variants, use default names to avoid custom name shadowing
          const namesForParse =
            variant <= 1 ? sideNames : { left: 'Side 1', right: 'Side 2' };

          const result = parseCommand(text, namesForParse);

          expect(result.action).not.toBeNull();
          expect(result.action!.target).toBe(expectedTarget);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: voice-counter-website, Property 4: Parser produces correct action type
describe('Command_Parser - action type detection', () => {
  it('Property 4: parser produces correct action type for increment keywords', () => {
    // Validates: Requirements 3.2, 3.3, 3.4
    const incrementKeywords = ['add', 'plus', 'point', 'score', 'increment', 'up'];
    const decrementKeywords = ['minus', 'remove', 'subtract', 'decrement', 'down'];
    const resetKeywords = ['reset', 'clear', 'zero'];

    const sideNames = { left: 'Side 1', right: 'Side 2' };

    fc.assert(
      fc.property(
        fc.constantFrom(...incrementKeywords),
        (keyword) => {
          const result = parseCommand(`${keyword} left`, sideNames);
          expect(result.action).not.toBeNull();
          expect(result.action!.type).toBe('increment');
        }
      ),
      { numRuns: 100 }
    );

    fc.assert(
      fc.property(
        fc.constantFrom(...decrementKeywords),
        (keyword) => {
          const result = parseCommand(`${keyword} left`, sideNames);
          expect(result.action).not.toBeNull();
          expect(result.action!.type).toBe('decrement');
        }
      ),
      { numRuns: 100 }
    );

    fc.assert(
      fc.property(
        fc.constantFrom(...resetKeywords),
        (keyword) => {
          const result = parseCommand(`${keyword} left`, sideNames);
          expect(result.action).not.toBeNull();
          expect(result.action!.type).toBe('reset');
        }
      ),
      { numRuns: 100 }
    );
  });
});
