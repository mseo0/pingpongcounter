import type { SpeechRecognizerError } from './types';

// Inline types for the Web Speech API (not in TypeScript's built-in lib)
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

export class SpeechRecognizerImpl {
  onTranscript: (text: string) => void = () => {};
  onStateChange: (listening: boolean) => void = () => {};
  onError: (error: SpeechRecognizerError) => void = () => {};

  private recognition: SpeechRecognitionInstance | null = null;

  start(): void {
    const Constructor = getSpeechRecognitionConstructor();
    if (!Constructor) {
      this.onError({ kind: 'not-supported' });
      return;
    }

    const recognition = new Constructor();
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => {
      this.onStateChange(true);
    };

    recognition.onend = () => {
      this.onStateChange(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const transcript = result[0].transcript.trim();
          if (transcript) {
            this.onTranscript(transcript);
          }
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'not-allowed') {
        this.onError({ kind: 'permission-denied' });
      } else {
        this.onError({ kind: 'runtime-error', message: event.error });
      }
    };

    this.recognition = recognition;
    recognition.start();
  }

  stop(): void {
    this.recognition?.stop();
    this.recognition = null;
  }
}
