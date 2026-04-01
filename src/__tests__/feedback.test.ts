// Feature: voice-counter-website, Property 8: Feedback display contains raw text and status

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { renderFeedback, scheduleFeedbackClear } from '../feedback';
import type { FeedbackState, ActionType, Side } from '../types';

// Validates: Requirements 7.1, 7.2, 7.3

describe('Feedback_Display', () => {
  it('Property 8: feedback display contains raw text and status for any FeedbackState', () => {
    // Exclude HTML special chars that get escaped in innerHTML
    const safeString = fc.stringOf(
      fc.char().filter((c) => c !== '<' && c !== '>' && c !== '&' && c !== '"' && c !== "'"),
      { minLength: 1 }
    );

    const actionTypeArb: fc.Arbitrary<ActionType> = fc.constantFrom(
      'increment',
      'decrement',
      'reset'
    );

    const sideArb: fc.Arbitrary<Side> = fc.constantFrom('left', 'right', 'all');

    const parsedActionArb = fc.record({
      type: actionTypeArb,
      target: sideArb,
    });

    const feedbackStateArb: fc.Arbitrary<FeedbackState> = fc.record({
      rawText: safeString,
      action: fc.oneof(fc.constant(null), parsedActionArb),
      expiresAt: fc.integer(),
    });

    fc.assert(
      fc.property(feedbackStateArb, (feedback) => {
        const container = document.createElement('div');
        renderFeedback(container, feedback);

        const html = container.innerHTML;

        // Raw text must always appear
        expect(html).toContain(feedback.rawText);

        if (feedback.action !== null) {
          // Confirmation must contain action type and target
          expect(html).toContain(feedback.action.type);
          expect(html).toContain(feedback.action.target);
        } else {
          // Must contain "not recognized" indicator
          expect(html).toContain('not recognized');
        }
      }),
      { numRuns: 100 }
    );
  });
});

// Validates: Requirements 7.4
describe('scheduleFeedbackClear', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls onClear after exactly 3 seconds', () => {
    const onClear = vi.fn();
    scheduleFeedbackClear(onClear);

    vi.advanceTimersByTime(2999);
    expect(onClear).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onClear).toHaveBeenCalledOnce();
  });
});
