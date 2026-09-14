/**
 * Tiny DOM helpers shared across UI modules. No framework.
 */

export type Attrs = Record<string, string | number | boolean | undefined>;

export interface ElOptions {
  className?: string;
  text?: string;
  html?: string;
  attrs?: Attrs;
  style?: Partial<CSSStyleDeclaration>;
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  opts: ElOptions = {},
  children: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (opts.className) node.className = opts.className;
  if (opts.text !== undefined) node.textContent = opts.text;
  if (opts.html !== undefined) node.innerHTML = opts.html;
  if (opts.attrs) {
    for (const [k, v] of Object.entries(opts.attrs)) {
      if (v === undefined || v === false) continue;
      node.setAttribute(k, v === true ? '' : String(v));
    }
  }
  if (tag === 'button' && opts.attrs?.title && !node.getAttribute('aria-label')) {
    node.setAttribute('aria-label', String(opts.attrs.title));
  }
  if (opts.style) Object.assign(node.style, opts.style);
  for (const child of children) node.append(child);
  return node;
}

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

export function listen(
  target: EventTarget,
  type: string,
  handler: (ev: Event) => void,
  opts?: boolean | AddEventListenerOptions,
): () => void {
  target.addEventListener(type, handler, opts);
  return () => target.removeEventListener(type, handler, opts);
}

/**
 * The left instrument column stacks: a panel, then the journal card under it.
 * Each panel publishes its own bottom edge under its own name and the card's
 * CSS reads the lowest one, the same way the top bar publishes
 * `--ceph-command-bottom`. Panels do not know about each other, and the card
 * still reports no camera inset of its own — it is the column's width, so the
 * open panel's `setInset` already tells the camera the truth.
 */
const columnEdges = new Map<string, number>();

export function setColumnBottom(source: string, bottom: number | null): void {
  if (bottom === null) {
    if (!columnEdges.delete(source)) return;
  } else {
    if (columnEdges.get(source) === bottom) return;
    columnEdges.set(source, bottom);
  }
  const low = columnEdges.size ? Math.max(...columnEdges.values()) : null;
  const root = document.documentElement.style;
  if (low === null) root.removeProperty('--ceph-col-bottom');
  else root.setProperty('--ceph-col-bottom', `${Math.round(low)}px`);
}
