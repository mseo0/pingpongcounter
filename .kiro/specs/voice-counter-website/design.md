# Design Document: Voice Counter Website

## Overview

The Voice Counter Website is a single-page web application that provides a two-sided scoreboard controlled primarily through voice commands. Users speak natural phrases to increment, decrement, or reset scores for either side. Manual on-screen buttons serve as a fallback and correction mechanism. The app runs entirely in the browser with no backend, relying on the Web Speech API for speech recognition.

Key design goals:
- Zero-latency score updates (< 100ms from action to display)
- Robust command parsing that handles natural language variation
- Graceful degradation when the Web Speech API is unavailable
- Simple, readable UI suitable for use across devices

---

## Architecture

The application follows a unidirectional data flow pattern (similar to Flux/Redux) to keep state management predictable:

```
User (voice / click)
        │
        ▼
┌───────────────────┐
│  Speech_Recognizer │  (Web Speech API wrapper)
└────────┬──────────┘
         │ raw transcript
         ▼
┌───────────────────┐
│  Command_Parser   │  (text → structured action)
└────────┬──────────┘
         │ Action { type, target }
         ▼
┌───────────────────┐
│   Score_Store     │  (pure state reducer)
└────────┬──────────┘
         │ state
         ▼
┌───────────────────┐
│ Scoreboard_Display│  (renders scores + feedback)
└───────────────────┘
```

Manual button clicks bypass the Speech_Recognizer and Command_Parser, dispatching actions directly to the Score_Store.

The app is implemented as a Vite + TypeScript single-page application. Vite provides fast local development (HMR) and an optimized production build. The project is deployed to GitHub Pages via a GitHub Actions workflow that triggers on every push to `main`.

---

## Components and Interfaces

### Speech_Recognizer

Wraps the browser's `SpeechRecognition` (or `webkitSpeechRecognition`) API.

```typescript
interface SpeechRecognizer {
  start(): void;
  stop(): void;
  onTranscript: (text: string) => void;  // callback with recognized text
  onStateChange: (listening: boolean) => void;
  onError: (error: SpeechRecognizerError) => void;
}

type SpeechRecognizerError =
  | { kind: 'not-supported' }
  | { kind: 'permission-denied' }
  | { kind: 'runtime-error'; message: string };
```

Behavior:
- Uses `continuous: true` and `interimResults: false` so each final result fires `onTranscript` once.
- Calls `onStateChange(true)` when recognition starts, `onStateChange(false)` when it stops.
- On `not-supported` or `permission-denied`, calls `onError` and does not attempt to start.

### Command_Parser

Pure function — no side effects, no state.

```typescript
type Side = 'left' | 'right' | 'all';

type ActionType = 'increment' | 'decrement' | 'reset';

interface ParsedAction {
  type: ActionType;
  target: Side;
}

interface ParseResult {
  action: ParsedAction | null;
  rawText: string;
}

function parseCommand(text: string, sideNames: SideNames): ParseResult;
```

`SideNames` carries the current custom names so the parser can match them:

```typescript
interface SideNames {
  left: string;   // e.g. "Team A"
  right: string;  // e.g. "Team B"
}
```

Parsing strategy:
1. Normalize text to lowercase, strip punctuation.
2. Detect action keywords: increment synonyms (`add`, `plus`, `point`, `score`, `increment`, `up`), decrement synonyms (`minus`, `remove`, `subtract`, `decrement`, `down`), reset synonyms (`reset`, `clear`, `zero`).
3. Detect side references: configured names (case-insensitive), positional terms (`left`, `right`), or `all`/`both` for reset-all.
4. Return `null` action if no match.

### Score_Store

Pure reducer + in-memory state holder.

```typescript
interface ScoreState {
  sides: [SideState, SideState];  // index 0 = left, index 1 = right
  sideNames: SideNames;
}

interface SideState {
  score: number;  // always >= 0
}

function reduce(state: ScoreState, action: AppAction): ScoreState;
```

```typescript
type AppAction =
  | { type: 'INCREMENT'; target: 'left' | 'right' }
  | { type: 'DECREMENT'; target: 'left' | 'right' }
  | { type: 'RESET'; target: 'left' | 'right' | 'all' }
  | { type: 'SET_NAME'; target: 'left' | 'right'; name: string };
```

The reducer is a pure function — given the same state and action it always returns the same new state. Scores never go below 0 (decrement on 0 is a no-op).

### Scoreboard_Display

Renders the current `ScoreState` to the DOM. Re-renders synchronously on every state change, ensuring the < 100ms update requirement is met (no async rendering pipeline).

### Listening_Indicator

A simple visual element (e.g., animated mic icon) bound to the `listening: boolean` state flag. Updates immediately on `onStateChange` callbacks.

### Feedback_Display

Shows the last recognized text and action confirmation (or "not recognized" message). Auto-clears after 3 seconds via `setTimeout`.

---

## Data Models

### ScoreState (runtime, in-memory)

```typescript
interface ScoreState {
  sides: [SideState, SideState];
  sideNames: SideNames;
  listening: boolean;
  feedback: FeedbackState | null;
}

interface SideState {
  score: number;  // integer >= 0
}

interface SideNames {
  left: string;   // default: "Side 1"
  right: string;  // default: "Side 2"
}

interface FeedbackState {
  rawText: string;
  action: ParsedAction | null;  // null = not recognized
  expiresAt: number;            // Date.now() + 3000
}
```

No persistence layer — state is ephemeral and lives only in memory for the session. There is no serialization requirement.

### Initial State

```typescript
const initialState: ScoreState = {
  sides: [{ score: 0 }, { score: 0 }],
  sideNames: { left: 'Side 1', right: 'Side 2' },
  listening: false,
  feedback: null,
};
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Scoreboard renders all side names and scores

*For any* ScoreState (with any combination of side names and score values), the rendered Scoreboard_Display output must contain both side names and both score values.

**Validates: Requirements 1.2, 5.2**

---

### Property 2: Listening indicator mirrors listening state

*For any* listening state (true or false), the Listening_Indicator's visual representation must match that state — active when listening, inactive when not.

**Validates: Requirements 2.5**

---

### Property 3: Parser correctly identifies side from text

*For any* text containing a recognizable side reference — whether a positional term ("left", "right"), the default names ("Side 1", "Side 2"), or any configured custom name — the Command_Parser must identify the correct target side.

**Validates: Requirements 3.1, 3.6, 5.3**

---

### Property 4: Parser produces correct action type

*For any* text containing a recognizable command keyword (increment, decrement, or reset synonyms) paired with a side reference, the Command_Parser must return a ParsedAction whose `type` matches the intended action category.

**Validates: Requirements 3.2, 3.3, 3.4**

---

### Property 5: Increment increases score by exactly 1

*For any* ScoreState and any target side, applying an INCREMENT action must increase that side's score by exactly 1 and leave the other side's score unchanged.

**Validates: Requirements 4.1, 6.2**

---

### Property 6: Decrement decreases score by 1, never below 0

*For any* ScoreState and any target side, applying a DECREMENT action must decrease that side's score by exactly 1 if the score is greater than 0, and leave the score at 0 if it is already 0. The other side's score must remain unchanged.

**Validates: Requirements 4.2, 4.5, 6.3**

---

### Property 7: Reset sets target score(s) to 0

*For any* ScoreState, applying a RESET action to a specific side must set that side's score to 0. Applying RESET to all sides must set every side's score to 0.

**Validates: Requirements 4.3, 4.4, 6.4**

---

### Property 8: Feedback display contains raw text and status

*For any* parse result (recognized or unrecognized), the Feedback_Display must contain the raw recognized text. If the action is valid, it must also contain a confirmation message. If the action is null (unrecognized), it must contain a "not recognized" indicator.

**Validates: Requirements 7.1, 7.2, 7.3**

---

## Error Handling

| Condition | Behavior |
|---|---|
| Web Speech API not available | Show "Voice commands not supported in this browser" message; manual buttons remain fully functional |
| Microphone permission denied | Show "Please grant microphone access to use voice commands" message; manual buttons remain fully functional |
| Speech recognition runtime error | Log error, stop recognizer, update Listening_Indicator to inactive, show brief error message |
| Unrecognized voice command | Show raw transcript + "not recognized" in Feedback_Display for 3 seconds; no state change |
| Empty side name input | Fall back to default name ("Side 1" / "Side 2"); parser uses the default |
| Decrement on zero score | No-op; score stays at 0; no error shown to user |

All errors are non-fatal — the app continues to function with manual controls even when voice input fails entirely.

---

## Testing Strategy

### Dual Testing Approach

Both unit tests and property-based tests are required. They are complementary:
- Unit tests catch concrete bugs in specific scenarios and edge cases.
- Property-based tests verify universal correctness across the full input space.

### Unit Tests (specific examples and integration)

- Initial state: both scores are 0, both names are defaults
- Web Speech API absent: error message is displayed, no crash
- Microphone permission denied: correct message is displayed
- Empty side name: default name is used
- Scoreboard renders two sides with correct structure (DOM checks)
- Feedback clears after 3 seconds (using fake timers)
- Unrecognized command: "not recognized" message appears

### Property-Based Tests

Use **fast-check** (installed as a dev dependency via `npm install --save-dev fast-check`) for property-based testing.

Each property test must run a minimum of **100 iterations**.

Each test must include a comment tag in the format:
`// Feature: voice-counter-website, Property N: <property_text>`

| Property | Test Description |
|---|---|
| Property 1 | Generate random ScoreState; assert rendered HTML contains both names and scores |
| Property 2 | Generate random listening boolean; assert indicator class/attribute matches |
| Property 3 | Generate random side names and random texts embedding those names or positional terms; assert parser returns correct target |
| Property 4 | Generate random command texts with known keywords; assert parser returns correct action type |
| Property 5 | Generate random ScoreState; apply INCREMENT; assert score increased by 1, other side unchanged |
| Property 6 | Generate random ScoreState (score >= 0); apply DECREMENT; assert score is max(0, score - 1), other side unchanged |
| Property 7 | Generate random ScoreState; apply RESET; assert target score(s) are 0 |
| Property 8 | Generate random parse results; assert feedback display contains raw text and correct status indicator |

### Testing Notes

- The `reduce` function and `parseCommand` function are pure, making them ideal targets for property-based testing with no mocking required.
- Speech_Recognizer tests require mocking the Web Speech API; keep these as unit tests.
- Feedback timer tests should use fake/mock timers to avoid real 3-second waits.
