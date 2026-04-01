import type { FeedbackState } from './types';

export function renderFeedback(container: HTMLElement, feedback: FeedbackState | null): void {
  if (feedback === null) {
    container.innerHTML = '';
    return;
  }

  const textEl = document.createElement('p');
  textEl.className = 'feedback-text';
  textEl.textContent = feedback.rawText;

  container.innerHTML = '';
  container.appendChild(textEl);

  if (feedback.action !== null) {
    const actionEl = document.createElement('p');
    actionEl.className = 'feedback-action';
    actionEl.textContent = `✓ ${feedback.action.type} ${feedback.action.target}`;
    container.appendChild(actionEl);
  } else {
    const statusEl = document.createElement('p');
    statusEl.className = 'feedback-status';
    statusEl.textContent = 'not recognized';
    container.appendChild(statusEl);
  }
}

export function scheduleFeedbackClear(onClear: () => void): ReturnType<typeof setTimeout> {
  return setTimeout(onClear, 3000);
}
