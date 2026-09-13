/**
 * The journal's answer engine. Codex and the Directory both run queries
 * through here so "who is Thaidakar" and "Wit" hit the same person.
 */
import type { CanonLevel } from './types.ts';

const STOP = new Set([
  'who', 'what', 'where', 'when', 'why', 'how', 'is', 'are', 'was', 'were',
  'the', 'a', 'an', 'of', 'in', 'on', 'to', 'for', 'and', 'or', 'do', 'does',
  'did', 'tell', 'me', 'about', 'explain', 'define', 'meaning', 'called',
  'name', 'named', 'please',
]);

export type SearchKind =
  | 'world'
  | 'moon'
  | 'system'
  | 'person'
  | 'shard'
  | 'magic'
  | 'term'
  | 'place'
  | 'relic'
  | 'org'
  | 'door';

export interface SearchHit {
  id: string;
  label: string;
  kind: SearchKind;
  fact: string;
  book?: string;
  arc?: string;
  aliases?: string;
  score: number;
  fresh?: boolean;
  canon?: CanonLevel;
}

/** Strip question-shaped queries down to the noun a reread actually typed. */
export function normalizeQuery(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[?!.,:;'"()]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length && !STOP.has(w))
    .join(' ')
    .trim();
}

export function haystack(...parts: Array<string | undefined | null>): string {
  return parts.filter(Boolean).join(' · ').toLowerCase();
}

/**
 * Lower is better. Exact name, then exact alias, then prefix, then contains.
 * Fact-only matches sort last so "storm" still prefers Stormfather over a
 * paragraph that happens to mention one.
 */
export function scoreHit(q: string, label: string, aliases = '', fact = ''): number {
  const n = q.toLowerCase();
  const l = label.toLowerCase();
  const aliasList = aliases.toLowerCase().split(/[,;/]/).map((s) => s.trim()).filter(Boolean);
  if (l === n) return 0;
  if (aliasList.includes(n)) return 1;
  if (l.startsWith(n)) return 2;
  if (aliasList.some((a) => a.startsWith(n) || n.startsWith(a))) return 3;
  if (l.includes(n)) return 4;
  if (aliasList.some((a) => a.includes(n))) return 5;
  if (fact.toLowerCase().includes(n)) return 6;
  return 9;
}

export function matchesQuery(q: string, hay: string, label: string, aliases = ''): boolean {
  if (q.length < 2) return false;
  const l = label.toLowerCase();
  const a = aliases.toLowerCase();
  if (l.includes(q) || a.includes(q)) return true;
  // Short queries ("wit") must not hit "with" / "without" in a paragraph.
  if (q.length <= 3) {
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'i');
    return re.test(hay);
  }
  return hay.includes(q);
}

export const SEARCH_KIND_LABEL: Record<SearchKind, string> = {
  world: 'world',
  moon: 'moon',
  system: 'system',
  person: 'person',
  shard: 'shard',
  magic: 'magic',
  term: 'term',
  place: 'place',
  relic: 'relic',
  org: 'order',
  door: 'door',
};

export function copperUrl(title: string): string {
  return `https://coppermind.net/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
}
