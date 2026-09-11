/**
 * Tiny reactive store. The single seam between the UI layer and the renderer:
 * the UI only ever mutates state through here, the renderer only ever reads it
 * and subscribes. Neither imports the other.
 */

export type ShellMode = 'title' | 'play';
export type Realm = 'physical' | 'cognitive' | 'spiritual';
export type Scale = 'cosmere' | 'system' | 'globe' | 'surface' | 'city';

export interface VisualState {
  bloom: number;
  exposure: number;
  starSize: number;
  nebula: number;
  showNebula: boolean;
  showLabels: boolean;
  showOrbits: boolean;
  showMoons: boolean;
  showAtmospheres: boolean;
  motionBlur: boolean;
  autoRotate: boolean;
}

export interface ViewInsets {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface Stats {
  fps: number;
  drawCalls: number;
  ms: number;
}

/** UI → camera: the renderer consumes this and clears it. */
export type CameraCue =
  | { kind: 'focus'; id: string; scale: Scale }
  | { kind: 'cinematic' }
  | { kind: 'skip-cinematic' }
  | { kind: 'frame' }
  | { kind: 'pop' };

export interface AppState {
  ready: boolean;
  loadProgress: number;
  loadLabel: string;
  shell: ShellMode;
  realm: Realm;
  scale: Scale;
  /** System id when scale is system or deeper; null at Cosmere. */
  focusedSystem: string | null;
  /** Body id when scale is globe or deeper. */
  focusedBody: string | null;
  /** Location id when scale is surface or city. */
  focusedLocation: string | null;
  hovered: string | null;
  selected: string | null;
  /** Speculative Cosmere playhead. Printed dates come from per-world calendars. */
  year: number;
  isPlaying: boolean;
  timeRate: number;
  era: number;
  /** seriesId → furthest arc index reached (-1 = not started). */
  readProgress: Record<string, number>;
  /** Reading Companion: series + arc the reader is currently in. */
  readingNow: { series: string; arc: number } | null;
  visual: VisualState;
  insets: ViewInsets;
  stats: Stats;
  cameraCue: CameraCue | null;
  cinematic: boolean;
  viewHeading: number;
  searchQuery: string;
  panel: 'none' | 'arcanum' | 'codex' | 'spoilers' | 'settings';
  magicId: string | null;
}

export function defaultVisual(): VisualState {
  return {
    bloom: 1,
    exposure: 1,
    starSize: 1,
    nebula: 1,
    showNebula: true,
    showLabels: true,
    showOrbits: true,
    showMoons: true,
    showAtmospheres: true,
    motionBlur: false,
    autoRotate: true,
  };
}

export function defaultInsets(): ViewInsets {
  return { left: 0, right: 0, top: 0, bottom: 0 };
}

type Listener<T> = (value: T, prev: T) => void;
export type StateKey = keyof AppState;

class Store {
  readonly state: AppState = {
    ready: false,
    loadProgress: 0,
    loadLabel: 'Opening the journal',
    shell: 'title',
    realm: 'physical',
    scale: 'cosmere',
    focusedSystem: null,
    focusedBody: null,
    focusedLocation: null,
    hovered: null,
    selected: null,
    year: 2,
    isPlaying: true,
    timeRate: 1,
    era: 3,
    readProgress: {},
    readingNow: null,
    visual: defaultVisual(),
    insets: defaultInsets(),
    stats: { fps: 0, drawCalls: 0, ms: 0 },
    cameraCue: null,
    cinematic: false,
    viewHeading: 0,
    searchQuery: '',
    panel: 'none',
    magicId: null,
  };

  private listeners = new Map<StateKey, Set<Listener<never>>>();
  private anyListeners = new Set<(keys: StateKey[]) => void>();
  private pending = new Set<StateKey>();
  private flushQueued = false;

  on<K extends StateKey>(key: K, fn: Listener<AppState[K]>): () => void {
    let set = this.listeners.get(key);
    if (!set) this.listeners.set(key, (set = new Set()));
    set.add(fn as Listener<never>);
    return () => set!.delete(fn as Listener<never>);
  }

  onAny(fn: (keys: StateKey[]) => void): () => void {
    this.anyListeners.add(fn);
    return () => this.anyListeners.delete(fn);
  }

  set<K extends StateKey>(key: K, value: AppState[K]): void {
    const prev = this.state[key];
    if (prev === value) return;
    this.state[key] = value;
    this.pending.add(key);
    this.queueFlush();
    const set = this.listeners.get(key);
    if (set) for (const fn of set) (fn as Listener<AppState[K]>)(value, prev);
  }

  touch(key: StateKey): void {
    this.pending.add(key);
    this.queueFlush();
    const set = this.listeners.get(key);
    if (set) {
      const v = this.state[key];
      for (const fn of set) (fn as Listener<never>)(v as never, v as never);
    }
  }

  patchVisual(patch: Partial<VisualState>): void {
    Object.assign(this.state.visual, patch);
    this.touch('visual');
  }

  patchInsets(patch: Partial<ViewInsets>): void {
    const prev = this.state.insets;
    const next = { ...prev, ...patch };
    if (
      next.left === prev.left &&
      next.right === prev.right &&
      next.top === prev.top &&
      next.bottom === prev.bottom
    ) return;
    this.set('insets', next);
  }

  patchProgress(series: string, arc: number): void {
    this.state.readProgress[series] = arc;
    this.touch('readProgress');
  }

  private queueFlush(): void {
    if (this.flushQueued) return;
    this.flushQueued = true;
    queueMicrotask(() => {
      this.flushQueued = false;
      const keys = [...this.pending] as StateKey[];
      this.pending.clear();
      for (const fn of this.anyListeners) fn(keys);
    });
  }
}

export const store = new Store();
