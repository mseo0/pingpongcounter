import type { SpeechRecognizerError } from './types';

const CONFIDENCE_THRESHOLD = 0.5;
// How long to wait after an interim result before acting on it (ms)
const INTERIM_DEBOUNCE_MS = 600;

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onstart: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  return (
    (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition ??
    null
  );
}

const RESTARTABLE_ERRORS = new Set(['no-speech', 'audio-capture', 'network']);

export class SpeechRecognizerImpl {
  onTranscript: (text: string) => void = () => {};
  onStateChange: (listening: boolean) => void = () => {};
  onError: (error: SpeechRecognizerError) => void = () => {};

  private recognition: SpeechRecognitionInstance | null = null;
  private active = false;
  private interimTimer: ReturnType<typeof setTimeout> | null = null;
  private lastFiredTranscript = '';

  start(): void {
    const Constructor = getSpeechRecognitionConstructor();
    if (!Constructor) {
      this.onError({ kind: 'not-supported' });
      return;
    }
    this.active = true;
    this._startRecognition(Constructor);
  }

  stop(): void {
    this.active = false;
    if (this.interimTimer !== null) {
      clearTimeout(this.interimTimer);
      this.interimTimer = null;
    }
    this.recognition?.stop();
    this.recognition = null;
  }

  private _startRecognition(Constructor: SpeechRecognitionConstructor): void {
    const recognition = new Constructor();
    recognition.continuous = true;
    recognition.interimResults = true; // enabled for faster response

    recognition.onstart = () => {
      this.onStateChange(true);
    };

    recognition.onend = () => {
      if (this.active) {
        setTimeout(() => {
          if (this.active) this._startRecognition(Constructor);
        }, 200);
      } else {
        this.onStateChange(false);
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const latestResult = event.results[event.results.length - 1];
      if (!latestResult) return;

      const alternative = latestResult[0];
      const transcript = alternative.transcript.trim();
      if (!transcript) return;

      if (latestResult.isFinal) {
        // Cancel any pending interim fire — final result takes over
        if (this.interimTimer !== null) {
          clearTimeout(this.interimTimer);
          this.interimTimer = null;
        }
        // Skip low-confidence finals
        if (alternative.confidence > 0 && alternative.confidence < CONFIDENCE_THRESHOLD) return;
        this.lastFiredTranscript = transcript;
        this.onTranscript(transcript);
      } else {
        // Interim result — debounce so we don't fire on every partial word
        if (transcript === this.lastFiredTranscript) return;
        if (this.interimTimer !== null) clearTimeout(this.interimTimer);
        this.interimTimer = setTimeout(() => {
          this.interimTimer = null;
          if (transcript !== this.lastFiredTranscript) {
            this.lastFiredTranscript = transcript;
            this.onTranscript(transcript);
          }
        }, INTERIM_DEBOUNCE_MS);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'not-allowed') {
        this.active = false;
        this.onError({ kind: 'permission-denied' });
      } else if (RESTARTABLE_ERRORS.has(event.error)) {
        // transient — onend will restart
      } else {
        this.active = false;
        this.onError({ kind: 'runtime-error', message: event.error });
      }
    };

    this.recognition = recognition;
    recognition.start();
  }
}
