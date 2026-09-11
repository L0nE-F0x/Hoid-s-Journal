/**
 * Six degrees of Hoid. A force graph in the UI layer — no Three, no O(n²)
 * canvas from v1 copied as-is. Nodes are spoiler-gated. Click one to trace
 * the shortest path to Hoid.
 */
import {
  COSMERE, DAWNSHARDS, RELATIONS, REL_TYPES, bodyByName, isVisible,
} from '../data/index.ts';
import { store } from '../core/store.ts';
import { el, listen } from './dom.ts';
import '../styles/loreWeb.css';

interface Node {
  key: string;
  id: string;
  kind: string;
  name: string;
  color: string;
  r: number;
  x: number; y: number; vx: number; vy: number;
}

interface Edge {
  a: Node; b: Node; type: string; label: string; color: string;
}

function nid(kind: string, id: string): string { return `${kind}:${id}`; }

export function mountLoreWeb(root: HTMLElement): { destroy(): void } {
  const canvas = el('canvas', { className: 'ceph-web-canvas' });
  const legend = el('div', { className: 'ceph-panel ceph-web-legend' });
  const pathEl = el('div', { className: 'ceph-web-path' });
  const host = el('div', { className: 'ceph-web' }, [canvas, legend, pathEl]);
  root.append(host);

  let nodes: Node[] = [];
  let edges: Edge[] = [];
  let adj = new Map<string, string[]>();
  let hide = new Set<string>();
  let drag: Node | null = null;
  let pathN = new Set<string>();
  let pathE = new Set<string>();
  let raf = 0;
  let w = 1, h = 1;

  const edgeKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

  const rebuild = () => {
    const progress = store.state.readProgress;
    const map = new Map<string, Node>();
    const add = (kind: string, id: string, name: string, color: string, vis: { book?: string; arc?: string }, r: number) => {
      if (!isVisible(vis, progress)) return;
      const key = nid(kind, id);
      if (map.has(key)) return;
      map.set(key, {
        key, id, kind, name, color, r,
        x: (Math.random() - 0.5) * 420,
        y: (Math.random() - 0.5) * 320,
        vx: 0, vy: 0,
      });
    };
    for (const sh of COSMERE.shards) add('shard', sh.id, sh.name, sh.color, sh, 16);
    for (const b of COSMERE.bodies) {
      if (b.kind === 'gas-giant') continue;
      add('body', b.id, b.name, b.color, b, 12);
    }
    for (const c of COSMERE.characters) add('character', c.id, c.name, c.color, c, 8);
    for (const d of DAWNSHARDS) add('dawnshard', d.id, d.name, '#e2e8f0', d, 10);
    const hoid = map.get(nid('character', 'hoid'));
    if (hoid) { hoid.x = 0; hoid.y = 0; }

    const links: Edge[] = [];
    const link = (ak: string, aid: string, bk: string, bid: string, type: string, label: string, color: string) => {
      const a = map.get(nid(ak, aid));
      const b = map.get(nid(bk, bid));
      if (!a || !b) return;
      links.push({ a, b, type, label, color });
    };
    for (const b of COSMERE.bodies) {
      for (const sh of b.shards) link('body', b.id, 'shard', sh, 'bond', 'Invested', '#94a3b8');
    }
    for (const c of COSMERE.characters) {
      const origin = bodyByName(c.origin);
      if (origin) link('character', c.id, 'body', origin.id, 'ally', 'Origin', '#64748b');
    }
    for (const r of RELATIONS) {
      if (!isVisible(r, progress)) continue;
      const col = REL_TYPES[r.type]?.color ?? '#94a3b8';
      link(r.a.kind, r.a.id, r.b.kind, r.b.id, r.type, r.label, col);
    }
    nodes = [...map.values()];
    edges = links;
    adj = new Map();
    for (const n of nodes) adj.set(n.key, []);
    for (const e of edges) {
      adj.get(e.a.key)!.push(e.b.key);
      adj.get(e.b.key)!.push(e.a.key);
    }
    paintLegend();
    trace();
  };

  const trace = () => {
    pathN = new Set(); pathE = new Set();
    const sel = store.state.selected;
    const start = sel ? nodes.find((n) => n.id === sel)?.key : undefined;
    const goal = nid('character', 'hoid');
    if (!start || !adj.has(start) || !adj.has(goal)) {
      pathEl.textContent = '';
      return;
    }
    const prev = new Map<string, string | null>();
    const q = [start];
    prev.set(start, null);
    while (q.length) {
      const cur = q.shift()!;
      if (cur === goal) break;
      for (const nx of adj.get(cur) ?? []) {
        if (!prev.has(nx)) { prev.set(nx, cur); q.push(nx); }
      }
    }
    if (!prev.has(goal)) {
      pathEl.textContent = start === goal ? 'Hoid is the centre.' : 'No path to Hoid in the visible graph.';
      return;
    }
    const order: string[] = [];
    let cur: string | null = goal;
    while (cur) {
      pathN.add(cur);
      order.push(cur);
      const prevKey: string | null = prev.get(cur) ?? null;
      if (prevKey) pathE.add(edgeKey(prevKey, cur));
      cur = prevKey;
    }
    order.reverse();
    const names = order.map((k) => nodes.find((n) => n.key === k)?.name ?? k);
    pathEl.textContent = names.join(' → ');
  };

  const paintLegend = () => {
    legend.replaceChildren(el('div', { className: 'ceph-kicker', text: 'Lore Web' }));
    legend.append(el('div', { className: 'ceph-web-hint', text: 'Click a node. The shortest path to Hoid lights up. Drag to rearrange.' }));
    for (const [type, meta] of Object.entries(REL_TYPES)) {
      const off = hide.has(type);
      const b = el('button', { className: `ceph-web-type${off ? ' is-off' : ''}`, attrs: { type: 'button' } }, [
        el('span', { className: 'ceph-dir-dot', style: { background: meta.color } }),
        el('span', { text: meta.label }),
      ]);
      listen(b, 'click', () => {
        if (hide.has(type)) hide.delete(type); else hide.add(type);
        paintLegend();
      });
      legend.append(b);
    }
  };

  const step = () => {
    const k = 0.04, repulsion = 14000, damping = 0.86, center = 0.004;
    for (const e of edges) {
      if (hide.has(e.type)) continue;
      const dx = e.b.x - e.a.x, dy = e.b.y - e.a.y;
      const dist = Math.hypot(dx, dy) || 1;
      const f = (dist - 110) * k;
      const fx = (dx / dist) * f, fy = (dy / dist) * f;
      e.a.vx += fx; e.a.vy += fy;
      e.b.vx -= fx; e.b.vy -= fy;
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i]!, n2 = nodes[j]!;
        const dx = n2.x - n1.x, dy = n2.y - n1.y;
        const distSq = dx * dx + dy * dy || 1;
        const dist = Math.sqrt(distSq);
        const f = repulsion / distSq;
        const fx = (dx / dist) * f, fy = (dy / dist) * f;
        n1.vx -= fx; n1.vy -= fy;
        n2.vx += fx; n2.vy += fy;
      }
    }
    for (const n of nodes) {
      n.vx -= n.x * center; n.vy -= n.y * center;
      if (n !== drag) { n.x += n.vx; n.y += n.vy; }
      n.vx *= damping; n.vy *= damping;
    }
  };

  const draw = () => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    for (const e of edges) {
      if (hide.has(e.type)) continue;
      const hot = pathE.has(edgeKey(e.a.key, e.b.key));
      ctx.beginPath();
      ctx.moveTo(e.a.x, e.a.y);
      ctx.lineTo(e.b.x, e.b.y);
      ctx.strokeStyle = hot ? e.color : `${e.color}55`;
      ctx.lineWidth = hot ? 2.2 : 1;
      ctx.stroke();
    }
    const sel = store.state.selected;
    for (const n of nodes) {
      const hot = pathN.has(n.key) || n.id === sel;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * (hot ? 1.25 : 1), 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.fill();
      if (hot) {
        ctx.strokeStyle = '#eaf4ff';
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }
      ctx.fillStyle = hot ? '#eaf4ff' : 'rgba(220,230,245,0.72)';
      ctx.font = `${hot ? 600 : 500} 11px Inter, ui-sans-serif, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(n.name, n.x, n.y + n.r + 12);
    }
    ctx.restore();
  };

  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (store.state.view !== 'web' || store.state.shell !== 'play') return;
    step();
    draw();
  };

  const toLocal = (ev: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return { x: ev.clientX - r.left - w / 2, y: ev.clientY - r.top - h / 2 };
  };
  const hitNode = (x: number, y: number) => {
    let best: Node | null = null;
    for (const n of nodes) {
      const d = Math.hypot(n.x - x, n.y - y);
      if (d < n.r + 8 && (!best || d < Math.hypot(best.x - x, best.y - y))) best = n;
    }
    return best;
  };

  const resize = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    w = host.clientWidth || window.innerWidth;
    h = host.clientHeight || window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const show = () => {
    const on = store.state.view === 'web' && store.state.shell === 'play';
    host.classList.toggle('is-on', on);
    if (on) { resize(); rebuild(); }
  };

  const offs = [
    listen(canvas, 'pointerdown', (ev) => {
      const e = ev as PointerEvent;
      const p = toLocal(e);
      drag = hitNode(p.x, p.y);
      if (drag) {
        store.set('selected', drag.id);
        trace();
        canvas.setPointerCapture(e.pointerId);
      }
    }),
    listen(canvas, 'pointermove', (ev) => {
      if (!drag) return;
      const p = toLocal(ev as PointerEvent);
      drag.x = p.x; drag.y = p.y; drag.vx = 0; drag.vy = 0;
    }),
    listen(canvas, 'pointerup', () => { drag = null; }),
    listen(window, 'resize', () => { if (host.classList.contains('is-on')) resize(); }),
    store.on('view', show),
    store.on('shell', show),
    store.on('readProgress', () => { if (store.state.view === 'web') rebuild(); }),
    store.on('selected', () => { if (store.state.view === 'web') trace(); }),
  ];
  raf = requestAnimationFrame(loop);
  show();
  return {
    destroy() {
      cancelAnimationFrame(raf);
      offs.forEach((o) => o());
      host.remove();
    },
  };
}
