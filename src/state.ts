import type { ScoreState } from './types';

export const initialState: ScoreState = {
  sides: [{ score: 0 }, { score: 0 }],
  sideNames: { left: 'Side 1', right: 'Side 2' },
  listening: false,
  feedback: null,
};
