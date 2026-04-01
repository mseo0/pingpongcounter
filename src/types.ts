export type Side = 'left' | 'right' | 'all';

export type ActionType = 'increment' | 'decrement' | 'reset';

export interface SideState {
  score: number; // always >= 0
}

export interface SideNames {
  left: string;  // default: "Side 1"
  right: string; // default: "Side 2"
}

export interface ParsedAction {
  type: ActionType;
  target: Side;
}

export interface ParseResult {
  action: ParsedAction | null;
  rawText: string;
}

export interface FeedbackState {
  rawText: string;
  action: ParsedAction | null; // null = not recognized
  expiresAt: number;           // Date.now() + 3000
}

export interface ScoreState {
  sides: [SideState, SideState]; // index 0 = left, index 1 = right
  sideNames: SideNames;
  listening: boolean;
  feedback: FeedbackState | null;
}

export type AppAction =
  | { type: 'INCREMENT'; target: 'left' | 'right' }
  | { type: 'DECREMENT'; target: 'left' | 'right' }
  | { type: 'RESET'; target: 'left' | 'right' | 'all' }
  | { type: 'SET_NAME'; target: 'left' | 'right'; name: string };

export type SpeechRecognizerError =
  | { kind: 'not-supported' }
  | { kind: 'permission-denied' }
  | { kind: 'runtime-error'; message: string };
