# Ping Pong Counter

![App screenshot](images/1.png)

A voice-activated scoreboard for two-sided competitions — debates, ping pong, sports, or anything else. Control scores hands-free with voice commands, or use the on-screen buttons.

## Features

- Voice commands to increment, decrement, and reset scores
- Manual +/- buttons as fallback
- Customizable side names (used as voice targets)
- Live feedback showing what was recognized
- Works entirely in the browser — no backend

## Voice Commands

Speak a keyword followed by a side reference (or just the side name to increment):

| Action | Keywords |
|---|---|
| Increment | `add`, `plus`, `point`, `score`, `increment`, `up` |
| Decrement | `minus`, `remove`, `subtract`, `decrement`, `down` |
| Reset | `reset`, `clear`, `zero` |

**Side references:** `left`, `right`, the default names (`Side 1`, `Side 2`), or any custom name you've set.

Examples:
- "add left" — increments left
- "minus right" — decrements right
- "reset left" — resets left to 0
- "Side 1" — increments left (name-only shortcut)

## Development

```bash
npm install
npm run dev
```

## Tests

```bash
npm run test
```

## Tech Stack

- Vite + TypeScript
- Vitest + fast-check (property-based testing)
- Web Speech API
- Deployed via Cloudflare Pages
