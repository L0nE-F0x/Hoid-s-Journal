import {
  COSMERE,
  bodyById,
  canEnterCity,
  characterAt,
  characterById,
  cityById,
  dawnshardById,
  eraAt,
  hubById,
  isNewThisArc,
  landmarkById,
  perpAt,
  seriesById,
  sliderToYear,
  worldDate,
  yearToSlider,
} from '../data/index.ts';
import { store } from '../core/store.ts';
import { copyShareLink } from '../core/urlState.ts';
import { BRAND_TAGLINE, BRAND_WORDMARK } from './brand.ts';
import { atlasIsOpen } from './atlas.ts';
import { el, listen } from './dom.ts';
import '../styles/hud.css';

const TIME_RATES = [0.25, 1, 4, 16, 64];

function field(label: string, value: string | undefined | null): HTMLElement | null {
  if (!value || value === '—' || value === 'None') return null;
  return el('div', { className: 'ceph-field' }, [
    el('div', { className: 'ceph-field-label', text: label }),
    el('div', { className: 'ceph-field-val', text: value }),
  ]);
}

function fields(pairs: [string, string | undefined | null][]): HTMLElement {
  const grid = el('div', { className: 'ceph-fields' });
  for (const [k, v] of pairs) {
    const n = field(k, v);
    if (n) grid.append(n);
  }
  return grid;
}

function swatch(color: string): HTMLElement {
  return el('div', { className: 'ceph-swatch', style: { background: color } });
}

function entityById(id: string | null) {
  if (!id) return null;
  const body = bodyById[id];
  if (body) return { kind: 'body' as const, obj: body };
  const moon = COSMERE.moons.find((m) => m.id === id);
  if (moon) return { kind: 'moon' as const, obj: moon };
  const sys = COSMERE.systems.find((s) => s.id === id);
  if (sys) return { kind: 'system' as const, obj: sys };
  const ch = characterById[id];
  if (ch) return { kind: 'character' as const, obj: ch };
  const loc = COSMERE.locations.find((l) => l.id === id);
  if (loc) return { kind: 'location' as const, obj: loc };
  const mark = landmarkById[id];
  if (mark) return { kind: 'landmark' as const, obj: mark };
  const hub = hubById[id];
  if (hub) return { kind: 'hub' as const, obj: hub };
  const ds = dawnshardById[id];
  if (ds) return { kind: 'dawnshard' as const, obj: ds };
  const sh = COSMERE.shards.find((s) => s.id === id);
  if (sh) return { kind: 'shard' as const, obj: sh };
  return null;
}

export function mountHud(root: HTMLElement, host: { onHome(): void }): { destroy(): void } {
  const word = el('button', { className: 'ceph-wordmark', text: BRAND_WORDMARK, attrs: { type: 'button', title: BRAND_TAGLINE } });
  const scaleLabel = el('div', { className: 'ceph-command-sub', text: 'Cosmere · Physical' });
  const readingLabel = el('button', { className: 'ceph-reading', text: '', attrs: { type: 'button', title: 'Reading companion' } });
  readingLabel.style.display = 'none';
  const btnDir = el('button', {
    className: 'ceph-btn ceph-icon-btn',
    text: '☰',
    attrs: { type: 'button', title: 'Toggle directory' },
  });
  const back = el('button', {
    className: 'ceph-btn ceph-back',
    text: '← Cosmere',
    attrs: { type: 'button', title: 'Frame the whole Cosmere (F)' },
  });

  const mkTool = (label: string, title: string) =>
    el('button', { className: 'ceph-btn', text: label, attrs: { type: 'button', title } });
  const btnCodex = mkTool('Codex', 'Search the journal (K /)');
  const btnArc = mkTool('Arcanum', 'Magic systems');
  const btnSpoil = mkTool('Journal', 'Reading progress');
  const btnRealm = mkTool('Realms', 'Physical / Cognitive / Spiritual (C / V)');
  const btnLook = mkTool('Look', 'Display settings');
  const btnHelp = mkTool('Help', 'How to read the sky (H)');
  const btnShare = mkTool('Share', 'Copy a link to this view');
  const btnWeb = mkTool('Web', 'Lore Web — six degrees of Hoid (L)');
  const btnMusic = mkTool('Music', 'Soundtrack');
  const tools = el('div', { className: 'ceph-tools' }, [btnCodex, btnArc, btnSpoil, btnRealm, btnLook, btnWeb, btnMusic, btnHelp, btnShare]);

  const topbar = el('div', { className: 'ceph-panel ceph-topbar' }, [
    el('div', { className: 'ceph-topbar-left' }, [btnDir, word, scaleLabel, readingLabel, back]),
    tools,
  ]);

  const play = el('button', { className: 'ceph-play', text: '❚❚', attrs: { type: 'button', title: 'Play / pause time' } });
  const yearEl = el('div', { className: 'ceph-year', text: COSMERE.eras[3]!.realDate });
  const slider = el('input', { className: 'ceph-slider', attrs: { type: 'range', min: '0', max: '1000', value: '500' } });
  const eraRow = el('div', { className: 'ceph-era-row' });
  const eraShort = ['Pre', 'Post', 'MB1', 'SA', 'MB2', 'Far'];
  for (const era of COSMERE.eras) {
    const b = el('button', { className: 'ceph-chip', text: eraShort[era.id] ?? String(era.id), attrs: { type: 'button', title: era.name } });
    listen(b, 'click', () => {
      store.set('year', era.start + 1);
      store.set('era', era.id);
    });
    eraRow.append(b);
  }
  const slower = el('button', { className: 'ceph-chip', text: '−', attrs: { type: 'button', title: 'Slower' } });
  const faster = el('button', { className: 'ceph-chip', text: '+', attrs: { type: 'button', title: 'Faster' } });
  const rateEl = el('span', { className: 'ceph-rate', text: '1×' });
  const speed = el('div', { className: 'ceph-speed' }, [slower, rateEl, faster]);
  const btnTimeMin = el('button', {
    className: 'ceph-btn ceph-icon-btn',
    text: '▾',
    attrs: { type: 'button', title: 'Minimise timeline' },
  });
  const ticker = el('div', { className: 'ceph-ticker', text: COSMERE.eras[3]!.event });
  const timeline = el('div', { className: 'ceph-panel ceph-timeline' }, [
    el('div', { className: 'ceph-timeline-top' }, [play, yearEl, speed, btnTimeMin]),
    ticker,
    slider,
    eraRow,
  ]);

  const drawer = el('div', { className: 'ceph-panel ceph-panel-drawer', style: { display: 'none' } });

  const skip = el('button', { className: 'ceph-btn ceph-btn--primary ceph-skip', text: 'Skip · Space', attrs: { type: 'button' } });
  const tooltip = el('div', { className: 'ceph-panel ceph-tooltip', text: '' });

  const hud = el('div', { className: 'ceph-hud' }, [topbar, timeline, drawer, skip, tooltip]);
  root.append(hud);

  /**
   * Stable chrome owns insets. The info card is an overlay: it must never
   * report an inset, or hovering/selecting a world shoves the sky.
   */
  const measure = () => {
    const bar = topbar.getBoundingClientRect();
    document.documentElement.style.setProperty(
      '--ceph-command-bottom', `${Math.round(bar.bottom)}px`,
    );
    const tl = timeline.getBoundingClientRect();
    document.documentElement.style.setProperty(
      '--ceph-timeline-top', `${Math.round(Math.max(0, window.innerHeight - tl.top + 8))}px`,
    );
    document.documentElement.style.setProperty('--ceph-tools-top', '0px');
    store.setInset('drawer', null);
    store.setInset('tools', null);
    if (!hud.classList.contains('is-on')) {
      store.setInset('timeline', null);
      store.setInset('chrome', null);
      return;
    }
    store.setInset('chrome', { top: Math.round(bar.bottom + 8) });
    store.setInset('timeline', { bottom: Math.round(Math.max(0, window.innerHeight - tl.top + 10)) });
  };

  const refreshReading = () => {
    const now = store.state.readingNow;
    if (!now) { readingLabel.style.display = 'none'; return; }
    const s = seriesById[now.series];
    readingLabel.style.display = '';
    readingLabel.textContent = `✦ reading · ${s?.arcs[now.arc]?.label ?? s?.title ?? now.series}`;
    measure();
  };

  const refreshScale = () => {
    const s = store.state;
    const realm = s.realm[0]!.toUpperCase() + s.realm.slice(1);
    const sys = s.focusedSystem ? COSMERE.systems.find((x) => x.id === s.focusedSystem)?.name : null;
    const body = s.focusedBody ? bodyById[s.focusedBody]?.name : null;
    const loc = s.focusedLocation ? COSMERE.locations.find((l) => l.id === s.focusedLocation)?.name : null;
    const grain = s.scale === 'city'
      ? (s.focusedLocation && cityById[s.focusedLocation] ? 'city plate' : 'local scan')
      : null;
    const trail = ['Cosmere', sys, body, loc, grain].filter(Boolean).join(' · ');
    scaleLabel.textContent = `${trail} · ${realm}`;
    back.classList.toggle('is-on', s.scale !== 'cosmere' && s.realm !== 'spiritual');
    btnDir.classList.toggle('is-on', s.chrome.directory);
    timeline.classList.toggle('is-thin', !s.chrome.timeline);
    btnTimeMin.textContent = s.chrome.timeline ? '▾' : '▴';
    btnTimeMin.title = s.chrome.timeline ? 'Minimise timeline' : 'Expand timeline';
    btnCodex.classList.toggle('is-on', s.panel === 'codex');
    btnArc.classList.toggle('is-on', s.panel === 'arcanum');
    btnSpoil.classList.toggle('is-on', s.panel === 'spoilers');
    btnLook.classList.toggle('is-on', s.panel === 'settings');
    btnHelp.classList.toggle('is-on', s.panel === 'help');
    btnRealm.classList.toggle('is-on', s.panel === 'realms' || s.realm !== 'physical');
    btnWeb.classList.toggle('is-on', s.view === 'web');
    btnMusic.classList.toggle('is-on', s.visual.music);
  };

  const refreshTime = () => {
    const s = store.state;
    const era = COSMERE.eras[s.era] ?? COSMERE.eras[0]!;
    const local = s.focusedSystem ? worldDate(s.focusedSystem, s.era) : null;
    const approx = era.canon !== 'canon' ? ' ≈' : '';
    yearEl.textContent = (local ?? era.realDate) + approx;
    ticker.textContent = era.event;
    slider.value = String(Math.round(yearToSlider(s.year) * 1000));
    play.textContent = s.isPlaying ? '❚❚' : '▶';
    rateEl.textContent = `${s.timeRate}×`;
    [...eraRow.children].forEach((c, i) => c.classList.toggle('is-on', i === s.era));
  };

  const refreshDrawer = () => {
    // Hover is a tooltip. The card opens only on a click, so the sky does not jump.
    const id = store.state.selected;
    const hit = entityById(id);
    // A phone cannot afford both sheets, and on a globe the atlas already
    // names the world the drawer would be describing.
    const crowded = window.innerWidth <= 900 && atlasIsOpen() &&
      id === store.state.focusedBody;
    if (!hit || crowded) { drawer.style.display = 'none'; measure(); return; }
    drawer.style.display = '';
    drawer.replaceChildren();
    const close = el('button', {
      className: 'ceph-btn',
      text: '×',
      attrs: { type: 'button', title: 'Close' },
      style: { float: 'right', padding: '2px 8px', fontSize: '16px' },
    });
    listen(close, 'click', () => { store.set('selected', null); store.set('hovered', null); });
    drawer.append(close);
    if (isNewThisArc(hit.obj as { book?: string; arc?: string }, store.state.readingNow)) {
      drawer.append(el('div', { className: 'ceph-reading ceph-reading--chip', text: '✦ new this arc' }));
    }
    const notes = 'fieldNotes' in hit.obj ? hit.obj.fieldNotes : undefined;
    const head = el('div', { className: 'ceph-drawer-head' });
    if (hit.kind === 'body') {
      const b = hit.obj;
      head.append(swatch(b.color), el('div', {}, [
        el('div', { className: 'ceph-kicker', text: b.kind.replace('-', ' ') }),
        el('h2', { text: b.name }),
        el('span', { className: `ceph-canon ceph-canon--${b.canon}`, text: b.canon }),
      ]));
      drawer.append(head);
      drawer.append(el('p', { className: 'ceph-fact', text: b.fact }));
      drawer.append(fields([
        ['System', COSMERE.systems.find((s) => s.id === b.system)?.name],
        ['Shards', b.shards.join(', ')],
        ['Magic', b.magic.join(', ')],
        ['Species', b.species.join(', ')],
        ['Places', b.locations],
        ['Sources', b.sources.join(' · ')],
        ['Local date', worldDate(b.system, store.state.era)],
      ]));
      if (b.hasSurface) {
        const go = el('button', { className: 'ceph-btn ceph-btn--primary', text: 'Surface scan', style: { marginTop: '14px' } });
        listen(go, 'click', () => store.set('cameraCue', { kind: 'focus', id: b.id, scale: 'surface' }));
        drawer.append(go);
      }
    } else if (hit.kind === 'moon') {
      const m = hit.obj;
      const parent = bodyById[m.parent];
      head.append(swatch(m.color), el('div', {}, [
        el('div', { className: 'ceph-kicker', text: `Moon of ${parent?.name ?? m.parent}` }),
        el('h2', { text: m.name }),
      ]));
      drawer.append(head, el('p', { className: 'ceph-fact', text: m.fact }));
      if (parent) {
        const go = el('button', { className: 'ceph-btn ceph-btn--primary', text: `Go to ${parent.name}`, style: { marginTop: '14px' } });
        listen(go, 'click', () => store.set('cameraCue', { kind: 'focus', id: parent.id, scale: 'globe' }));
        drawer.append(go);
      }
    } else if (hit.kind === 'hub') {
      const h = hit.obj;
      head.append(swatch(h.color), el('div', {}, [
        el('div', { className: 'ceph-kicker', text: 'Cognitive city' }),
        el('h2', { text: h.name }),
        el('span', { className: `ceph-canon ceph-canon--${h.canon}`, text: h.canon }),
      ]));
      drawer.append(head, el('p', { className: 'ceph-fact', text: h.fact }));
    } else if (hit.kind === 'dawnshard') {
      const d = hit.obj;
      head.append(el('div', {}, [
        el('div', { className: 'ceph-kicker', text: `Dawnshard · ${d.command}` }),
        el('h2', { text: d.name }),
        el('span', { className: `ceph-canon ceph-canon--${d.canon}`, text: d.canon }),
      ]));
      drawer.append(head, el('p', { className: 'ceph-fact', text: d.fact }));
    } else if (hit.kind === 'system') {
      const sys = hit.obj;
      const worlds = COSMERE.bodies.filter((b) => b.system === sys.id && b.kind !== 'gas-giant');
      head.append(swatch(sys.sunColor), el('div', {}, [
        el('div', { className: 'ceph-kicker', text: 'System · click the rings to enter' }),
        el('h2', { text: sys.name }),
      ]));
      drawer.append(head);
      drawer.append(fields([
        ['Worlds', worlds.map((b) => b.name).join(', ')],
        ['Local date', worldDate(sys.id, store.state.era)],
      ]));
      const go = el('button', { className: 'ceph-btn ceph-btn--primary', text: 'Enter this system', style: { marginTop: '14px' } });
      listen(go, 'click', () => store.set('cameraCue', { kind: 'focus', id: sys.id, scale: 'system' }));
      drawer.append(go);
    } else if (hit.kind === 'location') {
      const l = hit.obj;
      const perp = perpAt(l.id);
      head.append(swatch(l.color), el('div', {}, [
        el('div', { className: 'ceph-kicker', text: bodyById[l.body]?.name ?? l.body }),
        el('h2', { text: l.name }),
      ]));
      drawer.append(head, el('p', { className: 'ceph-fact', text: l.desc }));
      drawer.append(fields([
        ['World', bodyById[l.body]?.name],
        ['Perpendicularity', perp?.name],
      ]));
      if (perp) drawer.append(el('p', { className: 'ceph-fact', text: perp.fact }));
      if (canEnterCity(l, store.state.era, store.state.realm) && store.state.scale !== 'city') {
        const go = el('button', {
          className: 'ceph-btn ceph-btn--primary',
          text: cityById[l.id] ? 'Open the city plate' : 'Look closer',
          style: { marginTop: '14px' },
        });
        listen(go, 'click', () => store.set('cameraCue', { kind: 'focus', id: l.id, scale: 'city' }));
        drawer.append(go);
      }
    } else if (hit.kind === 'landmark') {
      const m = hit.obj;
      const city = COSMERE.locations.find((l) => l.id === m.city);
      head.append(el('div', {}, [
        el('div', { className: 'ceph-kicker', text: city?.name ?? m.city }),
        el('h2', { text: m.name }),
      ]));
      drawer.append(head, el('p', { className: 'ceph-fact', text: m.desc }));
    } else if (hit.kind === 'character') {
      const c = hit.obj;
      const at = characterAt(c, store.state.era);
      const here = at?.body ? bodyById[at.body]?.name : null;
      head.append(swatch(c.color), el('div', {}, [
        el('div', { className: 'ceph-kicker', text: c.origin }),
        el('h2', { text: c.name }),
      ]));
      drawer.append(head, el('p', { className: 'ceph-fact', text: c.fact }));
      drawer.append(fields([
        ['Aliases', c.aliases],
        ['Abilities', c.abilities],
        ['This era', here],
      ]));
      if (at?.body) {
        const go = el('button', { className: 'ceph-btn ceph-btn--primary', text: `Go to ${here}`, style: { marginTop: '14px' } });
        listen(go, 'click', () => {
          store.set('selected', c.id);
          store.set('cameraCue', { kind: 'focus', id: at.body!, scale: 'globe' });
        });
        drawer.append(go);
      }
    } else {
      const sh = hit.obj;
      const row = sh.eras.find((e) => e.era === store.state.era) ?? sh.eras[0];
      head.append(swatch(sh.color), el('div', {}, [
        el('div', { className: 'ceph-kicker', text: 'Shard of Adonalsium' }),
        el('h2', { text: sh.name }),
      ]));
      drawer.append(head, el('p', { className: 'ceph-fact', text: sh.desc }));
      drawer.append(fields([
        ['Vessel', row?.vessel],
        ['Location', row?.loc],
        ['Status', row?.status],
        ['World', sh.world],
      ]));
    }
    if (notes) {
      const box = el('div', { className: 'ceph-meta', style: { marginTop: '10px' } });
      for (const [k, n] of Object.entries(notes)) {
        box.append(el('div', {
          html: `<b>${k}</b> <span class="ceph-canon ceph-canon--${n.canon}">${n.canon}</span> — ${n.note}`,
        }));
      }
      drawer.append(box);
    }
  };

  const offs = [
    listen(word, 'click', () => host.onHome()),
    listen(play, 'click', () => store.set('isPlaying', !store.state.isPlaying)),
    listen(slower, 'click', () => {
      const i = TIME_RATES.indexOf(store.state.timeRate);
      store.set('timeRate', TIME_RATES[Math.max(0, (i < 0 ? 1 : i) - 1)]!);
    }),
    listen(faster, 'click', () => {
      const i = TIME_RATES.indexOf(store.state.timeRate);
      store.set('timeRate', TIME_RATES[Math.min(TIME_RATES.length - 1, (i < 0 ? 1 : i) + 1)]!);
    }),
    listen(btnShare, 'click', async () => {
      const ok = await copyShareLink();
      btnShare.textContent = ok ? 'Copied' : 'Share';
      setTimeout(() => { btnShare.textContent = 'Share'; }, 1400);
    }),
    listen(btnWeb, 'click', () => store.set('view', store.state.view === 'web' ? 'sky' : 'web')),
    listen(btnMusic, 'click', () => store.patchVisual({ music: !store.state.visual.music })),
    listen(slider, 'input', () => {
      const y = sliderToYear(Number(slider.value) / 1000);
      store.set('isPlaying', false);
      store.set('year', y);
      store.set('era', eraAt(y));
    }),
    listen(btnCodex, 'click', () => store.set('panel', store.state.panel === 'codex' ? 'none' : 'codex')),
    listen(btnArc, 'click', () => store.set('panel', store.state.panel === 'arcanum' ? 'none' : 'arcanum')),
    listen(btnSpoil, 'click', () => store.set('panel', store.state.panel === 'spoilers' ? 'none' : 'spoilers')),
    listen(btnLook, 'click', () => store.set('panel', store.state.panel === 'settings' ? 'none' : 'settings')),
    listen(btnHelp, 'click', () => store.set('panel', store.state.panel === 'help' ? 'none' : 'help')),
    listen(btnRealm, 'click', () => store.set('panel', store.state.panel === 'realms' ? 'none' : 'realms')),
    listen(btnDir, 'click', () => store.patchChrome({ directory: !store.state.chrome.directory })),
    listen(btnTimeMin, 'click', () => store.patchChrome({ timeline: !store.state.chrome.timeline })),
    listen(back, 'click', () => store.set('cameraCue', { kind: 'frame' })),
    listen(skip, 'click', () => store.set('cameraCue', { kind: 'skip-cinematic' })),
    listen(window, 'mousemove', (e) => {
      const m = e as MouseEvent;
      tooltip.style.left = `${m.clientX}px`;
      tooltip.style.top = `${m.clientY}px`;
    }),
    listen(readingLabel, 'click', () => store.set('panel', 'spoilers')),
    store.on('readingNow', refreshReading),
    listen(window, 'resize', () => measure()),
    store.on('cinematic', (on) => skip.classList.toggle('is-on', on)),
    store.on('shell', (shell) => {
      hud.classList.toggle('is-on', shell === 'play');
      measure();
    }),
    store.on('year', refreshTime),
    store.on('era', refreshTime),
    store.on('isPlaying', refreshTime),
    store.on('timeRate', refreshTime),
    store.on('scale', () => { refreshScale(); refreshDrawer(); }),
    store.on('realm', refreshScale),
    store.on('panel', refreshScale),
    store.on('view', refreshScale),
    store.on('visual', refreshScale),
    store.on('chrome', () => { refreshScale(); measure(); }),
    store.on('focusedBody', refreshScale),
    store.on('focusedSystem', refreshScale),
    store.on('focusedLocation', refreshScale),
    store.on('selected', () => { refreshDrawer(); measure(); }),
    store.on('hovered', () => {
      const h = entityById(store.state.hovered);
      tooltip.classList.toggle('is-on', !!h && !store.state.selected);
      tooltip.textContent = h
        ? `${'name' in h.obj ? h.obj.name : ''} · ${h.kind === 'body' ? 'world' : h.kind} · click`
        : '';
    }),
  ];

  refreshTime();
  refreshScale();
  refreshReading();
  measure();

  return { destroy() { offs.forEach((o) => o()); hud.remove(); } };
}
