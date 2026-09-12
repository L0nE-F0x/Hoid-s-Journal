import { COSMERE, fullProgress } from '../data/index.ts';
import { store, type ChromeState, type VisualState } from './store.ts';

const KEY_PROGRESS = 'cephandrius.readProgress';
const KEY_READING = 'cephandrius.readingNow';
const KEY_VISUAL = 'cephandrius.visual';
const KEY_CHROME = 'cephandrius.chrome';

export function restoreSettings(): void {
  try {
    const raw = localStorage.getItem(KEY_PROGRESS);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, number>;
      const next = fullProgress();
      for (const s of COSMERE.series) {
        if (typeof parsed[s.id] === 'number') next[s.id] = parsed[s.id]!;
      }
      store.state.readProgress = next;
    } else {
      store.state.readProgress = fullProgress();
    }
  } catch {
    store.state.readProgress = fullProgress();
  }

  try {
    const rn = localStorage.getItem(KEY_READING);
    if (rn) store.state.readingNow = JSON.parse(rn);
  } catch { /* ignore */ }

  // Series that gained books after a fully-read save: keep them fully read
  // unless the companion is already pinning a beat.
  if (!store.state.readingNow) {
    const grew: Record<string, number> = { elantris: 0, whitesand: 0, mistborn2: 3 };
    const next = { ...store.state.readProgress };
    let changed = false;
    for (const s of COSMERE.series) {
      const oldLast = grew[s.id];
      if (oldLast === undefined) continue;
      if (next[s.id] === oldLast && s.arcs.length - 1 > oldLast) {
        next[s.id] = s.arcs.length - 1;
        changed = true;
      }
    }
    if (changed) store.state.readProgress = next;
  }

  try {
    const vis = localStorage.getItem(KEY_VISUAL);
    if (vis) Object.assign(store.state.visual, JSON.parse(vis) as Partial<VisualState>);
  } catch { /* ignore */ }

  try {
    const ch = localStorage.getItem(KEY_CHROME);
    if (ch) Object.assign(store.state.chrome, JSON.parse(ch) as Partial<ChromeState>);
  } catch { /* ignore */ }
}

export function connectSettingsPersistence(): void {
  store.on('readProgress', (v) => {
    try { localStorage.setItem(KEY_PROGRESS, JSON.stringify(v)); } catch { /* ignore */ }
  });
  store.on('readingNow', (v) => {
    try {
      if (v) localStorage.setItem(KEY_READING, JSON.stringify(v));
      else localStorage.removeItem(KEY_READING);
    } catch { /* ignore */ }
  });
  store.on('visual', (v) => {
    try { localStorage.setItem(KEY_VISUAL, JSON.stringify(v)); } catch { /* ignore */ }
  });
  store.on('chrome', (v) => {
    try { localStorage.setItem(KEY_CHROME, JSON.stringify(v)); } catch { /* ignore */ }
  });
}
