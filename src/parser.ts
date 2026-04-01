import type { SideNames, ParseResult, Side, ActionType } from './types';

const RESET_KEYWORDS = ['reset', 'clear', 'zero'];

const PHONETIC_MAP: Record<string, string> = {
  'resit': 'reset',
  'arrest': 'reset',
  'read': 'red',
  'reed': 'red',
  'blew': 'blue',
};

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function fuzzyMatch(word: string, candidates: string[]): string {
  if (candidates.includes(word)) return word;
  for (const candidate of candidates) {
    if (Math.abs(word.length - candidate.length) <= 1 && levenshtein(word, candidate) <= 1) {
      return candidate;
    }
  }
  return word;
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, '');
}

function applyPhoneticMap(words: string[]): string[] {
  return words.map(w => PHONETIC_MAP[w] ?? w);
}

function detectAction(words: string[]): ActionType | null {
  for (const word of words) {
    if (RESET_KEYWORDS.includes(fuzzyMatch(word, RESET_KEYWORDS))) return 'reset';
  }
  return null;
}

function matchesName(normalized: string, name: string): boolean {
  if (!name) return false;
  const escaped = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  return new RegExp(`(?<![\\w])${escaped}(?![\\w])`).test(normalized);
}

function fuzzyMatchesName(word: string, name: string): boolean {
  if (!name) return false;
  const nameWords = name.split(/\s+/);
  if (nameWords.length === 1) {
    return levenshtein(word, nameWords[0]) <= 1;
  }
  return false;
}

function detectSide(normalized: string, words: string[], sideNames: SideNames): Side | null {
  const leftName = sideNames.left.toLowerCase().replace(/[^\w\s]/g, '');
  const rightName = sideNames.right.toLowerCase().replace(/[^\w\s]/g, '');

  const [firstSide, secondSide] =
    rightName.length >= leftName.length
      ? (['right', 'left'] as const)
      : (['left', 'right'] as const);

  const names = { left: leftName, right: rightName };

  if (matchesName(normalized, names[firstSide])) return firstSide;
  if (matchesName(normalized, names[secondSide])) return secondSide;

  for (const word of words) {
    if (fuzzyMatchesName(word, names[firstSide])) return firstSide;
    if (fuzzyMatchesName(word, names[secondSide])) return secondSide;
  }

  if (words.includes('all') || words.includes('both')) return 'all';

  return null;
}

export function parseCommand(text: string, sideNames: SideNames): ParseResult {
  const normalized = normalize(text);
  const rawWords = normalized.split(/\s+/).filter(Boolean);
  const words = applyPhoneticMap(rawWords);

  const side = detectSide(normalized, words, sideNames);
  const actionType = detectAction(words);

  // Saying just the side name increments
  if (actionType === null) {
    if (side === 'left' || side === 'right') {
      return { action: { type: 'increment', target: side }, rawText: text };
    }
    return { action: null, rawText: text };
  }

  // Reset
  if (actionType === 'reset') {
    if (side === 'all' || words.includes('all') || words.includes('both')) {
      return { action: { type: 'reset', target: 'all' }, rawText: text };
    }
    if (side === 'left' || side === 'right') {
      return { action: { type: 'reset', target: side }, rawText: text };
    }
  }

  return { action: null, rawText: text };
}
