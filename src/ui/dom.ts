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
