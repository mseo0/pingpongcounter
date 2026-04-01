import './styles.css';
import { loadState, saveState } from './state';
import { reduce } from './store';
import { parseCommand } from './parser';
import { renderScoreboard } from './scoreboard';
import { renderFeedback, scheduleFeedbackClear } from './feedback';
import { updateListeningIndicator } from './listening-indicator';
import { SpeechRecognizerImpl } from './speech-recognizer';
import type { ScoreState, AppAction, SpeechRecognizerError } from './types';

let state: ScoreState = loadState();
let feedbackTimer: ReturnType<typeof setTimeout> | null = null;

const scoreboardEl = document.getElementById('scoreboard') as HTMLElement;
const feedbackEl = document.getElementById('feedback') as HTMLElement;
const indicatorEl = document.getElementById('listening-indicator') as HTMLElement;
const indicatorTextEl = document.getElementById('listening-status-text') as HTMLElement;
const micToggleBtn = document.getElementById('mic-toggle') as HTMLButtonElement;
const errorEl = document.getElementById('error-message') as HTMLElement;

function dispatch(action: AppAction): void {
  state = reduce(state, action);
  saveState(state);
  render();
}

function render(): void {
  renderScoreboard(scoreboardEl, state, dispatch);
  renderFeedback(feedbackEl, state.feedback);
  updateListeningIndicator(indicatorEl, state.listening);
  micToggleBtn.textContent = state.listening ? 'Stop Listening' : 'Start Listening';
  indicatorTextEl.textContent = state.listening ? 'Listening now' : 'Not listening';
}

const recognizer = new SpeechRecognizerImpl();

recognizer.onTranscript = (text: string) => {
  const { action, rawText } = parseCommand(text, state.sideNames);

  if (action !== null) {
    const appAction: AppAction =
      action.type === 'increment'
        ? { type: 'INCREMENT', target: action.target as 'left' | 'right' }
        : action.type === 'decrement'
          ? { type: 'DECREMENT', target: action.target as 'left' | 'right' }
          : { type: 'RESET', target: action.target };
    dispatch(appAction);
  }

  if (feedbackTimer !== null) {
    clearTimeout(feedbackTimer);
  }

  state = {
    ...state,
    feedback: {
      rawText,
      action,
      expiresAt: Date.now() + 3000,
    },
  };
  render();

  feedbackTimer = scheduleFeedbackClear(() => {
    state = { ...state, feedback: null };
    render();
    feedbackTimer = null;
  });
};

recognizer.onStateChange = (listening: boolean) => {
  state = { ...state, listening };
  updateListeningIndicator(indicatorEl, listening);
  micToggleBtn.textContent = listening ? 'Stop Listening' : 'Start Listening';
  indicatorTextEl.textContent = listening ? 'Listening now' : 'Not listening';
};

recognizer.onError = (error: SpeechRecognizerError) => {
  let message: string;
  if (error.kind === 'not-supported') {
    message = 'Voice commands not supported in this browser.';
  } else if (error.kind === 'permission-denied') {
    message = 'Please grant microphone access to use voice commands.';
  } else {
    message = `Speech recognition error: ${error.message}`;
  }
  errorEl.textContent = message;
  state = { ...state, listening: false };
  updateListeningIndicator(indicatorEl, false);
  micToggleBtn.textContent = 'Start Listening';
  indicatorTextEl.textContent = 'Not listening';
};

micToggleBtn.addEventListener('click', () => {
  if (state.listening) {
    recognizer.stop();
  } else {
    errorEl.textContent = '';
    recognizer.start();
  }
});

render();
