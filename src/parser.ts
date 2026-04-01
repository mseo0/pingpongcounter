import type { SideNames, ParseResult, ParsedAction, Side, ActionType } from './types';

const INCREMENT_KEYWORDS = ['add', 'plus', 'point', 'score', 'increment', 'up'];
const DECREMENT_KEYWORDS = ['minus', 'remove', 'subtract', 'decrement', 'down'];
const RESET_KEYWORDS = ['reset', 'clear', 'zero'];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, '');
}

function detectAction(words: string[]): ActionType | null {
  for (const word of words) {
    if (INCREMENT_KEYWORDS.includes(word)) return 'increment';
    if (DECREMENT_KEYWORDS.includes(word)) return 'decrement';
    if (RESET_KEYWORDS.includes(word)) return 'reset';
  }
  return null;
}

function detectSide(normalized: string, words: string[], sideNames: SideNames): Side | null {
  // Check custom names first (case-insensitive, multi-word names supported)
  const leftName = sideNames.left.toLowerCase().replace(/[^\w\s]/g, '');
  const rightName = sideNames.right.toLowerCase().replace(/[^\w\s]/g, '');

  if (leftName && normalized.includes(leftName)) return 'left';
  if (rightName && normalized.includes(rightName)) return 'right';

  // Positional terms
  if (words.includes('left')) return 'left';
  if (words.includes('right')) return 'right';

  // All/both for reset-all
  if (words.includes('all') || words.includes('both')) return 'all';

  return null;
}

export function parseCommand(text: string, sideNames: SideNames): ParseResult {
  const normalized = normalize(text);
  const words = normalized.split(/\s+/).filter(Boolean);

  const actionType = detectAction(words);
  if (actionType === null) {
    return { action: null, rawText: text };
  }

  const side = detectSide(normalized, words, sideNames);
  if (side === null) {
    return { action: null, rawText: text };
  }

  // 'all' target is only valid for reset
  if (side === 'all' && actionType !== 'reset') {
    return { action: null, rawText: text };
  }

  const action: ParsedAction = { type: actionType, target: side };
  return { action, rawText: text };
}
