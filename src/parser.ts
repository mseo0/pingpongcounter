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

function matchesName(normalized: string, name: string): boolean {
  if (!name) return false;
  // Escape regex special chars, then use word-boundary lookarounds
  const escaped = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, String.raw`\$&`);
  return new RegExp(`(?<![\\w])${escaped}(?![\\w])`).test(normalized);
}

function detectSide(normalized: string, words: string[], sideNames: SideNames): Side | null {
  const leftName = sideNames.left.toLowerCase().replace(/[^\w\s]/g, '');
  const rightName = sideNames.right.toLowerCase().replace(/[^\w\s]/g, '');

  // Check longer name first to avoid one name being a substring of the other
  const [firstSide, secondSide] =
    rightName.length >= leftName.length
      ? (['right', 'left'] as const)
      : (['left', 'right'] as const);

  const names = { left: leftName, right: rightName };
  if (matchesName(normalized, names[firstSide])) return firstSide;
  if (matchesName(normalized, names[secondSide])) return secondSide;

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

  const side = detectSide(normalized, words, sideNames);
  const actionType = detectAction(words);

  // If only a side name is spoken (no action keyword), default to increment
  if (actionType === null) {
    if (side !== null && side !== 'all') {
      return { action: { type: 'increment', target: side }, rawText: text };
    }
    return { action: null, rawText: text };
  }

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
