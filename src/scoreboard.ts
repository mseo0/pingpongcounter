import type { ScoreState, AppAction } from './types';

export function renderScoreboard(
  container: HTMLElement,
  state: ScoreState,
  dispatch: (action: AppAction) => void
): void {
  const activeElement = document.activeElement;
  const focusedInput =
    activeElement instanceof HTMLInputElement &&
    activeElement.classList.contains('side-name-input')
      ? activeElement
      : null;
  const focusedSide = focusedInput?.dataset.side;
  const selectionStart = focusedInput?.selectionStart ?? null;
  const selectionEnd = focusedInput?.selectionEnd ?? null;

  container.innerHTML = '';

  const sides: Array<'left' | 'right'> = ['left', 'right'];

  sides.forEach((side, idx) => {
    const sideState = state.sides[idx];
    const sideName = state.sideNames[side];
    const sideTitleId = `${side}-name`;

    const section = document.createElement('section');
    section.className = 'score-card';
    section.dataset.side = side;
    section.setAttribute('aria-labelledby', sideTitleId);

    const nameField = document.createElement('div');

    const nameInput = document.createElement('input');
    nameInput.id = sideTitleId;
    nameInput.className = 'side-name-input';
    nameInput.type = 'text';
    nameInput.setAttribute('value', sideName);
    nameInput.dataset.side = side;
    nameInput.setAttribute('aria-label', `${side} side name`);
    nameInput.setAttribute('placeholder', side === 'left' ? 'Side One' : 'Side Two');
    nameInput.addEventListener('input', () => {
      dispatch({ type: 'SET_NAME', target: side, name: nameInput.value });
    });
    nameField.appendChild(nameInput);

    const scoreBlock = document.createElement('div');
    const scoreDisplay = document.createElement('strong');
    scoreDisplay.className = 'score-value';
    scoreDisplay.dataset.side = side;
    scoreDisplay.textContent = String(sideState.score);
    scoreDisplay.setAttribute('aria-live', 'polite');
    scoreDisplay.setAttribute('aria-label', `${sideName} score ${sideState.score}`);
    scoreBlock.appendChild(scoreDisplay);

    const controls = document.createElement('div');
    controls.className = 'score-controls';

    const incrementBtn = document.createElement('button');
    incrementBtn.className = 'score-action';
    incrementBtn.dataset.action = 'increment';
    incrementBtn.dataset.side = side;
    incrementBtn.textContent = '+';
    incrementBtn.type = 'button';
    incrementBtn.setAttribute('aria-label', `Increment ${sideName}`);
    incrementBtn.addEventListener('click', () => {
      dispatch({ type: 'INCREMENT', target: side });
    });

    const decrementBtn = document.createElement('button');
    decrementBtn.className = 'score-action';
    decrementBtn.dataset.action = 'decrement';
    decrementBtn.dataset.side = side;
    decrementBtn.textContent = '-';
    decrementBtn.type = 'button';
    decrementBtn.setAttribute('aria-label', `Decrement ${sideName}`);
    decrementBtn.addEventListener('click', () => {
      dispatch({ type: 'DECREMENT', target: side });
    });
    controls.appendChild(incrementBtn);
    controls.appendChild(decrementBtn);

    const resetBtn = document.createElement('button');
    resetBtn.className = 'reset-button';
    resetBtn.dataset.action = 'reset';
    resetBtn.dataset.side = side;
    resetBtn.textContent = 'Reset';
    resetBtn.type = 'button';
    resetBtn.addEventListener('click', () => {
      dispatch({ type: 'RESET', target: side });
    });

    section.appendChild(nameField);
    section.appendChild(scoreBlock);
    section.appendChild(controls);
    section.appendChild(resetBtn);

    container.appendChild(section);
  });

  if (focusedSide !== undefined) {
    const nextInput = container.querySelector<HTMLInputElement>(
      `.side-name-input[data-side="${focusedSide}"]`
    );
    if (nextInput !== null) {
      nextInput.focus();
      if (selectionStart !== null && selectionEnd !== null) {
        nextInput.setSelectionRange(selectionStart, selectionEnd);
      }
    }
  }
}
