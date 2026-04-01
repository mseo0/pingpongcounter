import type { ScoreState } from './types';

export const initialState: ScoreState = {
  sides: [{ score: 0 }, { score: 0 }],
  sideNames: { left: 'Side One', right: 'Side Two' },
  listening: false,
  feedback: null,
};
