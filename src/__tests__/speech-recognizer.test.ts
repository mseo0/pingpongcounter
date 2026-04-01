// Feature: voice-counter-website, Speech_Recognizer error handling unit tests

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SpeechRecognizerImpl } from '../speech-recognizer';
import type { SpeechRecognizerError } from '../types';

// Validates: Requirements 2.3, 2.4

// Minimal mock for SpeechRecognition instances
class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  onstart: ((event: Event) => void) | null = null;
  onend: ((event: Event) => void) | null = null;
  onresult: ((event: Event) => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;

  start() {
    // no-op; tests trigger events manually
  }

  stop() {
    // no-op
  }
}

describe('SpeechRecognizerImpl error handling', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('not-supported path', () => {
    it('calls onError with { kind: "not-supported" } when Web Speech API is unavailable', () => {
      // Remove both SpeechRecognition constructors
      vi.stubGlobal('SpeechRecognition', undefined);
      vi.stubGlobal('webkitSpeechRecognition', undefined);

      const recognizer = new SpeechRecognizerImpl();
      const errors: SpeechRecognizerError[] = [];
      recognizer.onError = (err) => errors.push(err);

      // Should not throw
      expect(() => recognizer.start()).not.toThrow();

      expect(errors).toHaveLength(1);
      expect(errors[0]).toEqual({ kind: 'not-supported' });
    });
  });

  describe('permission-denied path', () => {
    it('calls onError with { kind: "permission-denied" } when onerror fires with "not-allowed"', () => {
      let instance: MockSpeechRecognition | null = null;

      const MockConstructor = vi.fn().mockImplementation(() => {
        instance = new MockSpeechRecognition();
        return instance;
      });

      vi.stubGlobal('SpeechRecognition', MockConstructor);

      const recognizer = new SpeechRecognizerImpl();
      const errors: SpeechRecognizerError[] = [];
      recognizer.onError = (err) => errors.push(err);

      recognizer.start();

      // Manually trigger the onerror handler
      expect(instance).not.toBeNull();
      instance!.onerror?.({ error: 'not-allowed' });

      expect(errors).toHaveLength(1);
      expect(errors[0]).toEqual({ kind: 'permission-denied' });
    });
  });

  describe('runtime-error path', () => {
    it('calls onError with { kind: "runtime-error", message } for other error strings', () => {
      let instance: MockSpeechRecognition | null = null;

      const MockConstructor = vi.fn().mockImplementation(() => {
        instance = new MockSpeechRecognition();
        return instance;
      });

      vi.stubGlobal('SpeechRecognition', MockConstructor);

      const recognizer = new SpeechRecognizerImpl();
      const errors: SpeechRecognizerError[] = [];
      recognizer.onError = (err) => errors.push(err);

      recognizer.start();

      const errorMessage = 'audio-capture';
      instance!.onerror?.({ error: errorMessage });

      expect(errors).toHaveLength(1);
      expect(errors[0]).toEqual({ kind: 'runtime-error', message: errorMessage });
    });

    it('passes the exact error string as the message', () => {
      let instance: MockSpeechRecognition | null = null;

      const MockConstructor = vi.fn().mockImplementation(() => {
        instance = new MockSpeechRecognition();
        return instance;
      });

      vi.stubGlobal('webkitSpeechRecognition', MockConstructor);

      const recognizer = new SpeechRecognizerImpl();
      const errors: SpeechRecognizerError[] = [];
      recognizer.onError = (err) => errors.push(err);

      recognizer.start();

      const errorMessage = 'network';
      instance!.onerror?.({ error: errorMessage });

      expect(errors).toHaveLength(1);
      expect(errors[0]).toEqual({ kind: 'runtime-error', message: errorMessage });
    });
  });
});
