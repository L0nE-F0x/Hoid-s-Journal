import {
  COSMERE,
  bodyById,
  characterById,
  eraAt,
  isNewThisArc,
  perpAt,
  seriesById,
  sliderToYear,
  worldDate,
  yearToSlider,
} from '../data/index.ts';
import { store } from '../core/store.ts';
import { BRAND_TAGLINE, BRAND_WORDMARK } from './brand.ts';
import { el, listen } from './dom.ts';
import '../styles/hud.css';

function entityById(id: string | null) {
  if (!id) return null;
  const body = bodyById[id];
  if (body) return { kind: 'body' as const, obj: body };
  const sys = COSMERE.systems.find((s) => s.id === id);
  if (sys) return { kind: 'system' as const, obj: sys };
  const ch = characterById[id];
  if (ch) return { kind: 'character' as const, obj: ch };
  const loc = COSMERE.locations.find((l) => l.id === id);
  if (loc) return { kind: 'location' as const, obj: loc };
  const sh = COSMERE.shards.find((s) => s.id === id);
  if (sh) return { kind: 'shard' as const, obj: sh };
  return null;
}

export function mountHud(root: HTMLElement, host: { onHome(): void }): { destroy(): void } {
  const word = el('button', { className: 'ceph-wordmark', text: BRAND_WORDMARK, attrs: { type: 'button' } });
  const scaleLabel = el('div', { className: 'ceph-command-sub', text: 'Cosmere · Physical' });
  const readingLabel = el('button', { className: 'ceph-reading', text: '', attrs: { type: 'button', title: 'Reading companion' } });
  readingLabel.style.display = 'none';
  const command = el('div', { className: 'ceph-panel ceph-command' }, [
    el('div', { className: 'ceph-command-top' }, [word]),
    el('div', { className: 'ceph-kicker', text: BRAND_TAGLINE, style: { marginTop: '4px' } }),
    scaleLabel,
    readingLabel,
  ]);

  const mkTool = (label: string, title: string) =>
    el('button', { className: 'ceph-btn', text: label, attrs: { type: 'button', title } });
  const btnCodex = mkTool('Codex', 'Search the journal (K)');
  const btnArc = mkTool('Arcanum', 'Magic systems (A)');
  const btnSpoil = mkTool('Journal', 'Reading progress');
  const btnRealm = mkTool('Realms', 'Physical / Cognitive / Spiritual (C / V)');
  const btnLook = mkTool('Look', 'Orbits, moons, nebulae, labels');
  const tools = el('div', { className: 'ceph-tools' }, [btnCodex, btnArc, btnSpoil, btnRealm, btnLook]);

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
  const timeline = el('div', { className: 'ceph-panel ceph-timeline' }, [
    el('div', { className: 'ceph-timeline-top' }, [play, yearEl]),
    slider,
    eraRow,
  ]);

  const ticker = el('div', { className: 'ceph-panel ceph-ticker', text: COSMERE.eras[3]!.event });

  const drawer = el('div', { className: 'ceph-panel ceph-panel-drawer', style: { display: 'none' } });

  const skip = el('button', { className: 'ceph-btn ceph-btn--primary ceph-skip', text: 'Skip · Space', attrs: { type: 'button' } });
  const tooltip = el('div', { className: 'ceph-panel ceph-tooltip', text: '' });

  const hud = el('div', { className: 'ceph-hud' }, [command, tools, timeline, ticker, drawer, skip, tooltip]);
  root.append(hud);

  /**
   * The HUD owns the right and bottom insets; the atlas owns left and top.
   * The camera frames its subject in what is left (see CameraRig.setInsets).
   */
  const measure = () => {
    // The command panel grows when a book is being tracked; the atlas hangs
    // off its bottom edge rather than a hard-coded offset.
    document.documentElement.style.setProperty(
      '--ceph-command-bottom', `${Math.round(command.getBoundingClientRect().bottom)}px`,
    );
    if (!hud.classList.contains('is-on')) {
      store.patchInsets({ right: 0, bottom: 0 });
      return;
    }
    const t = timeline.getBoundingClientRect();
    const bottom = Math.round(Math.max(0, window.innerHeight - t.top + 10));
    const open = drawer.style.display !== 'none';
    const d = drawer.getBoundingClientRect();
    const right = open ? Math.round(Math.max(0, window.innerWidth - d.left + 12)) : 0;
    store.patchInsets({ right, bottom });
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
    const trail = ['Cosmere', sys, body, loc].filter(Boolean).join(' · ');
    scaleLabel.textContent = `${trail} · ${realm}`;
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
    [...eraRow.children].forEach((c, i) => c.classList.toggle('is-on', i === s.era));
  };

  const refreshDrawer = () => {
    const id = store.state.selected ?? store.state.hovered;
    const hit = entityById(id);
    if (!hit) { drawer.style.display = 'none'; measure(); return; }
    drawer.style.display = '';
    drawer.replaceChildren();
    if (isNewThisArc(hit.obj as { book?: string; arc?: string }, store.state.readingNow)) {
      drawer.append(el('div', { className: 'ceph-reading ceph-reading--chip', text: '✦ new this arc' }));
    }
    if (hit.kind === 'body') {
      const b = hit.obj;
      drawer.append(
        el('div', { className: 'ceph-kicker', text: b.kind.replace('-', ' ') }),
        el('h2', { text: b.name }),
        el('span', { className: `ceph-canon ceph-canon--${b.canon}`, text: b.canon }),
        el('p', { className: 'ceph-fact', text: b.fact }),
        el('div', { className: 'ceph-meta' }, [
          el('div', { html: `<b>System</b> ${COSMERE.systems.find((s) => s.id === b.system)?.name ?? b.system}` }),
          el('div', { html: `<b>Shards</b> ${b.shards.join(', ') || '—'}` }),
          el('div', { html: `<b>Magic</b> ${b.magic.join(', ') || '—'}` }),
          el('div', { html: `<b>Species</b> ${b.species.join(', ') || '—'}` }),
          el('div', { html: `<b>Sources</b> ${b.sources.join(' · ')}` }),
        ]),
      );
      if (b.hasSurface) {
        const go = el('button', { className: 'ceph-btn ceph-btn--primary', text: 'Surface scan', style: { marginTop: '14px' } });
        listen(go, 'click', () => store.set('cameraCue', { kind: 'focus', id: b.id, scale: 'surface' }));
        drawer.append(go);
      }
    } else if (hit.kind === 'system') {
      const s = hit.obj;
      const worlds = COSMERE.bodies.filter((b) => b.system === s.id).map((b) => b.name).join(', ');
      drawer.append(
        el('div', { className: 'ceph-kicker', text: 'System' }),
        el('h2', { text: s.name }),
        el('p', { className: 'ceph-fact', text: worlds }),
      );
    } else if (hit.kind === 'location') {
      const l = hit.obj;
      drawer.append(
        el('div', { className: 'ceph-kicker', text: bodyById[l.body]?.name ?? l.body }),
        el('h2', { text: l.name }),
        el('p', { className: 'ceph-fact', text: l.desc }),
      );
      const perp = perpAt(l.id);
      if (perp) {
        drawer.append(el('div', { className: 'ceph-meta' }, [
          el('div', { html: `<b>Perpendicularity</b> ${perp.name}` }),
          el('div', { text: perp.fact }),
        ]));
      }
    } else if (hit.kind === 'character') {
      const c = hit.obj;
      drawer.append(
        el('div', { className: 'ceph-kicker', text: c.origin }),
        el('h2', { text: c.name }),
        el('p', { className: 'ceph-fact', text: c.fact }),
        el('div', { className: 'ceph-meta' }, [
          el('div', { html: `<b>Aliases</b> ${c.aliases}` }),
          el('div', { html: `<b>Abilities</b> ${c.abilities}` }),
        ]),
      );
    } else {
      const sh = hit.obj;
      const row = sh.eras.find((e) => e.era === store.state.era) ?? sh.eras[0];
      drawer.append(
        el('div', { className: 'ceph-kicker', text: 'Shard' }),
        el('h2', { text: sh.name }),
        el('p', { className: 'ceph-fact', text: sh.desc }),
        el('div', { className: 'ceph-meta' }, [
          el('div', { html: `<b>Vessel</b> ${row?.vessel ?? '—'}` }),
          el('div', { html: `<b>Location</b> ${row?.loc ?? '—'}` }),
        ]),
      );
    }
  };

  const offs = [
    listen(word, 'click', () => host.onHome()),
    listen(play, 'click', () => store.set('isPlaying', !store.state.isPlaying)),
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
    listen(btnRealm, 'click', () => {
      const order = ['physical', 'cognitive', 'spiritual'] as const;
      const i = order.indexOf(store.state.realm);
      store.set('realm', order[(i + 1) % order.length]!);
    }),
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
    store.on('scale', refreshScale),
    store.on('realm', refreshScale),
    store.on('focusedBody', refreshScale),
    store.on('focusedSystem', refreshScale),
    store.on('focusedLocation', refreshScale),
    store.on('selected', () => { refreshDrawer(); measure(); }),
    store.on('hovered', () => {
      if (!store.state.selected) { refreshDrawer(); measure(); }
      const h = entityById(store.state.hovered);
      tooltip.classList.toggle('is-on', !!h && !store.state.selected);
      tooltip.textContent = h
        ? ('name' in h.obj ? h.obj.name : '')
        : '';
    }),
  ];

  refreshTime();
  refreshScale();
  refreshReading();
  measure();

  return { destroy() { offs.forEach((o) => o()); hud.remove(); } };
}
