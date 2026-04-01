import type { ScoreState } from './types';

const STORAGE_KEY = 'pingpong-state';

export const initialState: ScoreState = {
  sides: [{ score: 0 }, { score: 0 }],
  sideNames: { left: 'Side One', right: 'Side Two' },
  listening: false,
  feedback: null,
};

export function saveState(state: ScoreState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      sides: state.sides,
      sideNames: state.sideNames,
    }));
  } catch {
    // storage unavailable — silently ignore
  }
}

export function loadState(): ScoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    return {
      ...initialState,
      sides: parsed.sides ?? initialState.sides,
      sideNames: parsed.sideNames ?? initialState.sideNames,
    };
  } catch {
    return initialState;
  }
}
