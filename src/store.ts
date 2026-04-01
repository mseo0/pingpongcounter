import type { ScoreState, AppAction } from './types';

export function reduce(state: ScoreState, action: AppAction): ScoreState {
  switch (action.type) {
    case 'INCREMENT': {
      const idx = action.target === 'left' ? 0 : 1;
      const sides: [typeof state.sides[0], typeof state.sides[1]] = [
        { ...state.sides[0] },
        { ...state.sides[1] },
      ];
      sides[idx] = { score: sides[idx].score + 1 };
      return { ...state, sides };
    }

    case 'DECREMENT': {
      const idx = action.target === 'left' ? 0 : 1;
      const sides: [typeof state.sides[0], typeof state.sides[1]] = [
        { ...state.sides[0] },
        { ...state.sides[1] },
      ];
      sides[idx] = { score: Math.max(0, sides[idx].score - 1) };
      return { ...state, sides };
    }

    case 'RESET': {
      if (action.target === 'all') {
        return {
          ...state,
          sides: [{ score: 0 }, { score: 0 }],
        };
      }
      const idx = action.target === 'left' ? 0 : 1;
      const sides: [typeof state.sides[0], typeof state.sides[1]] = [
        { ...state.sides[0] },
        { ...state.sides[1] },
      ];
      sides[idx] = { score: 0 };
      return { ...state, sides };
    }

    case 'SET_NAME': {
      return {
        ...state,
        sideNames: {
          ...state.sideNames,
          [action.target]: action.name,
        },
      };
    }

    default:
      return state;
  }
}
