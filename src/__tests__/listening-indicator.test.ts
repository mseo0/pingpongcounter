// Feature: voice-counter-website, Property 2: Listening indicator mirrors listening state

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { updateListeningIndicator } from '../listening-indicator';

// Validates: Requirements 2.5

describe('Listening_Indicator', () => {
  it('Property 2: indicator visual state mirrors listening boolean for any input', () => {
    fc.assert(
      fc.property(fc.boolean(), (listening) => {
        const element = document.createElement('div');
        updateListeningIndicator(element, listening);

        if (listening) {
          expect(element.classList.contains('listening-active')).toBe(true);
          expect(element.classList.contains('listening-inactive')).toBe(false);
          expect(element.getAttribute('aria-label')).toBe('Listening');
        } else {
          expect(element.classList.contains('listening-inactive')).toBe(true);
          expect(element.classList.contains('listening-active')).toBe(false);
          expect(element.getAttribute('aria-label')).toBe('Not listening');
        }
      }),
      { numRuns: 100 }
    );
  });
});
