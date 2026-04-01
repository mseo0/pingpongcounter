import type { ScoreState, AppAction } from './types';

export function renderScoreboard(
  container: HTMLElement,
  state: ScoreState,
  dispatch: (action: AppAction) => void
): void {
  container.innerHTML = '';

  const sides: Array<'left' | 'right'> = ['left', 'right'];

  sides.forEach((side, idx) => {
    const sideState = state.sides[idx];
    const sideName = state.sideNames[side];

    const section = document.createElement('section');
    section.dataset.side = side;

    // Name input
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.setAttribute('value', sideName);
    nameInput.dataset.side = side;
    nameInput.addEventListener('input', () => {
      dispatch({ type: 'SET_NAME', target: side, name: nameInput.value });
    });

    // Score display
    const scoreDisplay = document.createElement('span');
    scoreDisplay.dataset.side = side;
    scoreDisplay.textContent = String(sideState.score);

    // Increment button
    const incrementBtn = document.createElement('button');
    incrementBtn.dataset.action = 'increment';
    incrementBtn.dataset.side = side;
    incrementBtn.textContent = '+';
    incrementBtn.addEventListener('click', () => {
      dispatch({ type: 'INCREMENT', target: side });
    });

    // Decrement button
    const decrementBtn = document.createElement('button');
    decrementBtn.dataset.action = 'decrement';
    decrementBtn.dataset.side = side;
    decrementBtn.textContent = '-';
    decrementBtn.addEventListener('click', () => {
      dispatch({ type: 'DECREMENT', target: side });
    });

    // Reset button
    const resetBtn = document.createElement('button');
    resetBtn.dataset.action = 'reset';
    resetBtn.dataset.side = side;
    resetBtn.textContent = 'Reset';
    resetBtn.addEventListener('click', () => {
      dispatch({ type: 'RESET', target: side });
    });

    section.appendChild(nameInput);
    section.appendChild(scoreDisplay);
    section.appendChild(incrementBtn);
    section.appendChild(decrementBtn);
    section.appendChild(resetBtn);

    container.appendChild(section);
  });
}
