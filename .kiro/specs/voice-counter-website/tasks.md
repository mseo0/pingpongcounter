# Implementation Plan: Voice Counter Website

## Overview

Implement a Vite + TypeScript single-page application. The app follows a unidirectional data flow: Speech_Recognizer → Command_Parser → Score_Store → Scoreboard_Display. Manual buttons bypass the speech pipeline and dispatch actions directly to the store. The project is deployed to GitHub Pages via GitHub Actions on every push to `main`.

## Tasks

- [x] 1. Set up Vite + TypeScript project structure
  - Scaffold the project with `npm create vite@latest . -- --template vanilla-ts`
  - Install dev dependencies: `npm install --save-dev fast-check vitest @vitest/ui jsdom`
  - Configure `vite.config.ts` with `base: '/<repo-name>/'` for GitHub Pages deployment
  - Configure `vitest` in `vite.config.ts` (environment: `jsdom`)
  - Define all shared types/interfaces in `src/types.ts`: `ScoreState`, `SideState`, `SideNames`, `AppAction`, `ParsedAction`, `ParseResult`, `FeedbackState`, `SpeechRecognizerError`
  - Define `initialState` constant in `src/state.ts`
  - _Requirements: 1.3_

- [x] 2. Implement Score_Store (pure reducer)
  - [x] 2.1 Implement the `reduce(state, action)` pure function
    - Handle `INCREMENT`, `DECREMENT` (floor at 0), `RESET` (single side and all), `SET_NAME` actions
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 2.2 Write property test for increment (Property 5)
    - **Property 5: Increment increases score by exactly 1**
    - **Validates: Requirements 4.1, 6.2**

  - [x] 2.3 Write property test for decrement (Property 6)
    - **Property 6: Decrement decreases score by 1, never below 0**
    - **Validates: Requirements 4.2, 4.5, 6.3**

  - [x] 2.4 Write property test for reset (Property 7)
    - **Property 7: Reset sets target score(s) to 0**
    - **Validates: Requirements 4.3, 4.4, 6.4**

- [x] 3. Implement Command_Parser
  - [x] 3.1 Implement `parseCommand(text, sideNames)` pure function
    - Normalize input (lowercase, strip punctuation)
    - Detect action keywords for increment, decrement, and reset synonym groups
    - Detect side references: positional terms (`left`, `right`), configured names, `all`/`both`
    - Return `{ action: null, rawText }` when no match
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 3.2 Write property test for side detection (Property 3)
    - **Property 3: Parser correctly identifies side from text**
    - **Validates: Requirements 3.1, 3.6, 5.3**

  - [x] 3.3 Write property test for action type detection (Property 4)
    - **Property 4: Parser produces correct action type**
    - **Validates: Requirements 3.2, 3.3, 3.4**

- [x] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement Scoreboard_Display
  - [x] 5.1 Implement the DOM rendering function for the scoreboard
    - Render both side names and scores from `ScoreState`
    - Render increment, decrement, and reset buttons for each side
    - Render name input fields for each side
    - Wire button clicks to dispatch actions directly to the store and re-render
    - Wire name input changes to dispatch `SET_NAME` and re-render
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4_

  - [x] 5.2 Write property test for scoreboard rendering (Property 1)
    - **Property 1: Scoreboard renders all side names and scores**
    - **Validates: Requirements 1.2, 5.2**

- [x] 6. Implement Feedback_Display
  - [x] 6.1 Implement the feedback rendering function
    - Display raw recognized text
    - Display action confirmation when action is valid
    - Display "not recognized" message when action is null
    - Auto-clear feedback after 3 seconds using `setTimeout`
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 6.2 Write property test for feedback display (Property 8)
    - **Property 8: Feedback display contains raw text and status**
    - **Validates: Requirements 7.1, 7.2, 7.3**

  - [x] 6.3 Write unit test for feedback auto-clear
    - Use fake timers to assert feedback clears after 3 seconds
    - _Requirements: 7.4_

- [x] 7. Implement Listening_Indicator
  - [x] 7.1 Implement the listening indicator DOM update function
    - Toggle active/inactive visual state based on `listening` boolean
    - _Requirements: 2.5_

  - [x] 7.2 Write property test for listening indicator (Property 2)
    - **Property 2: Listening indicator mirrors listening state**
    - **Validates: Requirements 2.5**

- [x] 8. Implement Speech_Recognizer
  - [x] 8.1 Implement the `SpeechRecognizer` wrapper around the Web Speech API
    - Use `continuous: true`, `interimResults: false`
    - Call `onTranscript` on each final result
    - Call `onStateChange(true/false)` on start/stop
    - Call `onError` with typed error on `not-supported`, `permission-denied`, or runtime errors
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 8.2 Write unit tests for Speech_Recognizer error handling
    - Test `not-supported` path: error message displayed, no crash
    - Test `permission-denied` path: correct message displayed
    - Mock the Web Speech API for these tests
    - _Requirements: 2.3, 2.4_

- [x] 9. Wire everything together in the main app entry point
  - [x] 9.1 Connect Speech_Recognizer → Command_Parser → Score_Store → Scoreboard_Display
    - On `onTranscript`: call `parseCommand`, dispatch resulting action to store, update feedback, re-render
    - On `onStateChange`: update `listening` in state, update Listening_Indicator
    - On `onError`: display appropriate error message, update Listening_Indicator to inactive
    - Add mic toggle button to start/stop the Speech_Recognizer
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.5_

- [x] 10. Set up GitHub Pages deployment
  - [x] 10.1 Create `.github/workflows/deploy.yml` GitHub Actions workflow
    - Trigger on push to `main`
    - Steps: checkout → `npm ci` → `npm run build` → deploy `dist/` to `gh-pages` branch using `actions/deploy-pages` or `peaceiris/actions-gh-pages`
  - [x] 10.2 Verify `vite.config.ts` `base` path matches the GitHub repository name
    - Ensures all asset paths resolve correctly on `https://<user>.github.io/<repo>/`
  - _Requirements: 1.1_

- [x] 11. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use **fast-check** (dev dependency) and run a minimum of 100 iterations each
- Each property test must include a comment: `// Feature: voice-counter-website, Property N: <property_text>`
- The `reduce` and `parseCommand` functions are pure — no mocking needed for their property tests
- Speech_Recognizer tests require mocking the Web Speech API
- Set `base` in `vite.config.ts` to `'/<repo-name>/'` before deploying to GitHub Pages
