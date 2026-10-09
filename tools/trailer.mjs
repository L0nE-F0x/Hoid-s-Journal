/**
 * Shot list for the Hoid's Journal trailer and its stills. Read by
 * `tools/film.mjs` (renders each shot; see the note there for how the clock
 * works) and `tools/film-cut.mjs` (repairs and assembles them by `cuts`).
 *
 * Functions here are serialised into the page, so they cannot see anything
 * in this file. Shared helpers live on `window.__t`, installed by `boot`.
 */

const CSS = `
html.film-clean #ui-root { display: none !important; }
/* The HUD at phone size is unreadable at 1:1 in a 1080p frame. */
html.film-ui #ui-root { zoom: var(--film-zoom, 1.3); }
/* A slow push-in on the real interface. Stage and HUD move as one. */
html.film-ui #stage, html.film-ui #ui-root {
  transform: scale(var(--kb, 1)); transform-origin: var(--kb-o, 50% 30%);
}

#film-layer {
  position: fixed; inset: 0; pointer-events: none; z-index: 2147483000;
  font-family: var(--ceph-display); color: #f2ece0;
}
.film-card {
  position: absolute; left: 0; right: 0; text-align: center;
  transform: translateY(var(--lift, 0px));
  text-shadow: 0 2px 30px rgba(0, 0, 0, 0.9), 0 0 70px rgba(0, 0, 0, 0.55);
}
.film-scrim {
  inset: auto 0 0 0; height: 42%;
  background: linear-gradient(to top, rgba(3, 4, 9, 0.72), rgba(3, 4, 9, 0));
}
.film-band {
  inset: auto 0 0 0; height: 38%;
  background: linear-gradient(to top, rgba(3, 4, 9, 0.96) 0%, rgba(3, 4, 9, 0.82) 45%, rgba(3, 4, 9, 0));
}
.film-scrim.top { inset: 0 0 auto 0; height: 30%;
  background: linear-gradient(to bottom, rgba(3, 4, 9, 0.6), rgba(3, 4, 9, 0)); }

.film-quote {
  bottom: 12%; font-style: italic; font-size: 64px; line-height: 1.25;
  color: #ece6d8; letter-spacing: 0.005em;
}
.film-quote small {
  display: block; margin-top: 26px; font-style: normal; font-family: var(--ceph-font);
  font-size: 24px; letter-spacing: 0.42em; text-indent: 0.42em; text-transform: uppercase;
  color: var(--ceph-gold);
}

.film-mark { top: 50%; transform: translateY(calc(-50% + var(--lift, 0px))); }
.film-vignette { inset: 0; background: radial-gradient(ellipse 62% 48% at 50% 50%,
  rgba(3, 4, 9, 0.78), rgba(3, 4, 9, 0.35) 62%, rgba(3, 4, 9, 0) 100%); }
.film-mark img { width: 120px; height: 120px; border-radius: 50%;
  -webkit-mask-image: radial-gradient(circle, #000 46%, rgba(0,0,0,.55) 60%, transparent 72%);
  filter: drop-shadow(0 0 24px rgba(150, 200, 255, 0.3)); }
.film-mark h1 {
  margin: 22px 0 0; font-weight: 400; font-size: 118px; line-height: 1.05;
  letter-spacing: calc(0.24em + 0.05em * var(--p, 0)); text-indent: calc(0.24em + 0.05em * var(--p, 0));
  text-shadow: 0 2px 40px rgba(0, 0, 0, 0.9), 0 0 90px rgba(150, 190, 255, 0.18);
}
.film-mark p {
  margin: 30px 0 0; font-family: var(--ceph-font); font-size: 30px;
  letter-spacing: 0.42em; text-indent: 0.42em; text-transform: uppercase; color: var(--ceph-gold);
}
.film-mark .rule { width: 640px; height: 1px; margin: 26px auto 0;
  background: linear-gradient(90deg, transparent, rgba(217, 178, 95, 0.75), transparent); }
.film-mark .url {
  margin-top: 34px; font-family: var(--ceph-display); font-size: 58px; letter-spacing: 0.06em;
  text-transform: none; color: #f2ece0;
}
.film-mark .fine {
  margin-top: 22px; font-size: 22px; letter-spacing: 0.2em; color: var(--ceph-text-dim);
}

.film-kicker {
  top: 7%; font-family: var(--ceph-font); font-size: 30px; letter-spacing: 0.46em;
  text-indent: 0.5em; text-transform: uppercase; color: var(--ceph-gold);
}
.film-kicker::after { content: ''; display: block; width: 260px; height: 1px; margin: 18px auto 0;
  background: linear-gradient(90deg, transparent, rgba(217, 178, 95, 0.7), transparent); }

.film-world { bottom: 8.5%; }
.film-world b {
  display: block; font-weight: 400; font-size: 92px; letter-spacing: 0.26em; text-indent: 0.26em;
  text-transform: uppercase;
}
.film-world span {
  display: block; margin-top: 12px; font-family: var(--ceph-display); font-style: italic;
  font-size: 42px; color: #ddd8cc;
}
.film-world em {
  display: inline-block; margin-left: 18px; padding: 5px 12px 6px; font-style: normal;
  font-family: var(--ceph-font); font-size: 20px; letter-spacing: 0.3em; text-indent: 0.3em;
  text-transform: uppercase; vertical-align: 8px; color: #05060c; background: var(--ceph-gold);
}

.film-line { bottom: 9%; font-size: 64px; line-height: 1.22; }
.film-line small {
  display: block; margin-top: 20px; font-family: var(--ceph-font); font-size: 26px;
  letter-spacing: 0.36em; text-indent: 0.36em; text-transform: uppercase; color: var(--ceph-gold);
}
.film-line.high { bottom: auto; top: 11%; }

.film-bug {
  inset: auto 40px 30px auto; left: auto; text-align: right; font-size: 30px;
  letter-spacing: 0.24em; text-transform: uppercase; color: rgba(242, 236, 224, 0.86);
}
.film-bug small { display: block; margin-top: 8px; font-family: var(--ceph-font); font-size: 20px;
  letter-spacing: 0.3em; text-transform: none; color: var(--ceph-gold); }
`;

/** Installed once, in the page. Everything the shots share. */
function boot() {
  const c = window.__ceph;
  const st = c.store;
  const app = c.app;
  const rig = app.rig;
  c.ui.enter();
  st.set('cameraCue', { kind: 'skip-cinematic' });
  st.set('isPlaying', false);
  st.patchVisual({ quality: 'high', showCharacters: false, showLabels: false });
  const fullProgress = { ...st.state.readProgress };

  // Place pins are the point of the app and the clutter of a beauty shot.
  const pins = app.pins;
  const pinUpdate = pins.update.bind(pins);
  pins.update = (...a) => { pinUpdate(...a); if (window.__t?.hidePins) pins.group.visible = false; };

  // With the HUD hidden it must not keep reporting insets, or every world is
  // framed off-centre to make room for panels nobody can see.
  const setInset = st.setInset.bind(st);
  const clean = (on) => {
    document.documentElement.classList.toggle('film-clean', on);
    if (on) {
      st.setInset = () => {};
      st.insetSources.clear();
      setInset('__film', { left: 0 });
    } else {
      st.setInset = setInset;
      st.insetSources.delete('__film');
      window.dispatchEvent(new Event('resize'));
    }
  };
  clean(true);

  const V = (x, y, z) => rig.target.clone().set(x, y, z);
  const lerp = (a, b, u) => a + (b - a) * u;
  const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

  /** Hold a pose exactly: no damping, no autorotate fighting us. */
  const pose = (target, radius, theta, phi) => {
    rig.path = [];
    rig.target.copy(target);
    rig.goalTarget.copy(target);
    rig.radius = rig.goalRadius = radius;
    rig.theta = rig.goalTheta = theta;
    rig.phi = rig.goalPhi = phi;
    // The HUD's inset offset eases out over a second; a held pose must not.
    rig.offsetX = rig.goalOffsetX;
    rig.offsetY = rig.goalOffsetY;
    rig.applyImmediate();
  };

  /** Back to a clean sky: everything read, physical, no panels. */
  const beauty = () => {
    const html = document.documentElement;
    html.classList.remove('film-ui');
    html.style.removeProperty('--kb');
    window.__t.hidePins = true;
    if (st.state.readingNow) st.set('readingNow', null);
    st.setProgress({ ...fullProgress });
    st.set('panel', 'none');
    st.set('view', 'sky');
    st.set('selected', null);
    st.set('realm', 'physical');
    st.set('focusedBody', null);
    st.set('focusedSystem', null);
    st.set('focusedLocation', null);
    st.set('scale', 'cosmere');
    st.patchVisual({ showLabels: false, showCharacters: false, nebula: 1 });
    clean(true);
  };

  window.__t = {
    hidePins: true,
    clean,
    pose,
    beauty,
    /** Powers of ten: Roshar's storm, out through its system, to every star. */
    intro: {
      MOVE: 10.6,
      begin() {
        beauty();
        st.set('cinematic', true);
        st.set('scale', 'globe');
        st.set('focusedBody', 'roshar');
        st.set('focusedSystem', 'rosharan');
        this.to = V(0, 0, 0);
        this.done = false;
        this.frame(0);
      },
      frame(t) {
        const u = Math.min(1, t / this.MOVE);
        const e = ease(u);
        const r0 = 2.75;
        const r1 = 262;
        const radius = Math.exp(lerp(Math.log(r0), Math.log(r1), e));
        // Linear in radius, not in its log: Roshar is 80 units from the
        // middle, so the aim may only leave it as fast as the frame widens.
        const w = Math.pow((radius - r0) / (r1 - r0), 1.15);
        // Roshar is read every frame: entering the app moves the playhead,
        // and the planets ease to their new places over the first seconds.
        const target = app.orrery.bodyPosition('roshar').clone().lerp(this.to, w);
        const theta = 0.15 + 1.9 * e + 0.035 * t;
        const phi = lerp(1.06, 0.96, e);
        pose(target, radius, theta, phi);
        // App.frame re-dresses the sky at 110 units out, and every nebula in
        // the Cosmere switches on in one frame. Dim the clouds into the
        // switch and let them bloom back out of it instead.
        const s01 = (a0, a1, x) => { const k = Math.min(1, Math.max(0, (x - a0) / (a1 - a0))); return k * k * (3 - 2 * k); };
        st.state.visual.nebula = radius < 109
          ? 1 - 0.96 * s01(78, 107, radius)
          : 0.04 + 0.96 * s01(111, 175, radius);
        if (u >= 1 && !this.done) {
          this.done = true;
          st.set('cinematic', false);
          st.set('scale', 'cosmere');
          st.set('focusedBody', null);
          st.set('focusedSystem', null);
        }
      },
    },
    /** A world, framed closer than the app frames it, turning. */
    world(id, push = 0.78, phi = null) {
      beauty();
      st.set('cameraCue', { kind: 'focus', id, scale: 'globe' });
      this.push = push;
      this.phi = phi;
      this.pushed = false;
    },
    arrived(id) {
      const s = st.state;
      if (s.scale !== 'globe' || s.focusedBody !== id) return false;
      if (!this.pushed) {
        this.pushed = true;
        rig.setDistance(rig.goalDistance * this.push, 2.2);
        if (this.phi) rig.setAngles(rig.goalTheta, this.phi);
        // The app only turns the sky by itself on the title screen.
        rig.autoRotate = true;
        rig.autoRotateSpeed = 0.2;
      }
      return Math.abs(rig.radius - rig.goalRadius) < rig.goalRadius * 0.004
        && Math.abs(rig.phi - rig.goalPhi) < 0.004;
    },
    realm(name) {
      if (st.state.realm !== name) st.set('realm', name);
    },
    /**
     * Crossed into from the Cosmere, not from a globe: with a body focused,
     * App.trackFocus keeps locking the target to it in every Realm, and the
     * Shards end up in a corner of the frame.
     */
    spiritual() {
      beauty();
      st.set('realm', 'spiritual');
    },
    spiritualSettled() {
      rig.autoRotate = true;
      rig.autoRotateSpeed = 0.12;
      return Math.abs(rig.radius - rig.goalRadius) < rig.goalRadius * 0.004;
    },
    /** The cosmere, framed by the app, turning slowly. */
    chart() {
      beauty();
      st.set('cameraCue', { kind: 'frame' });
      rig.autoRotate = true;
      rig.autoRotateSpeed = 0.035;
    },
    chartSettled() {
      return st.state.scale === 'cosmere' && Math.abs(rig.radius - rig.goalRadius) < rig.goalRadius * 0.003;
    },
    /** The real HUD, enlarged, with the sky behind it. */
    ui({ panel = 'none', view = 'sky', zoom = 1.3 } = {}) {
      beauty();
      const html = document.documentElement;
      html.style.setProperty('--film-zoom', String(zoom));
      html.classList.add('film-ui');
      this.hidePins = false;
      st.patchVisual({ showLabels: true });
      st.set('chrome', { ...st.state.chrome, timeline: false, minimap: true, directory: true });
      clean(false);
      st.set('cameraCue', { kind: 'frame' });
      st.set('view', view);
      st.set('panel', panel);
      rig.autoRotate = true;
      rig.autoRotateSpeed = 0.035;
      this.beat = {};
    },
    /** Ken Burns on the interface: scale from s0 to s1 about an origin. */
    kb(t, d, s0, s1, origin) {
      const html = document.documentElement;
      html.style.setProperty('--kb', String(lerp(s0, s1, t / d)));
      html.style.setProperty('--kb-o', origin);
    },
    /** Once, the first frame at or after `at`. */
    once(key, t, at, fn) {
      if (t >= at && !this.beat[key]) { this.beat[key] = true; fn(); }
    },
    spoilers(t, d) {
      this.kb(t, d, 1.0, 1.05, '50% 40%');
      // Through the real reading companion: click the book, close the panel.
      this.once('click', t, 1.3, () => {
        const row = [...document.querySelectorAll('.ceph-book')]
          .find((b) => b.textContent.includes('The Final Empire'));
        row?.click();
      });
      this.once('close', t, 2.5, () => st.set('panel', 'none'));
      this.once('frame', t, 2.6, () => st.set('cameraCue', { kind: 'frame' }));
    },
  };
}

const world = (name, id, title, book, opts = {}) => {
  const duration = opts.duration ?? 1.4;
  return {
    name,
    setup: (wid, push) => window.__t.world(wid, push),
    args: [id, opts.push ?? 0.78],
    preroll: 1,
    until: new Function(`return window.__t.arrived(${JSON.stringify(id)})`),
    after: 1.6,
    duration,
    cards: [
      { html: '', cls: 'film-scrim', from: 0, fade: 0 },
      {
        html: `<b>${title}</b><span>${book}${opts.badge ? `<em>${opts.badge}</em>` : ''}</span>`,
        cls: 'film-world', from: 0.06, to: duration - 0.05, fadeIn: 0.24, fadeOut: 0.14, rise: 10,
      },
      { html: 'Every published world', cls: 'film-kicker', from: 0, fadeIn: opts.first ? 0.3 : 0, fadeOut: opts.last ? 0.3 : 0 },
    ],
  };
};

const BUG = '<div>Hoid’s Journal</div><small>the-cosmere.com</small>';
const MARK = (extra = '') => '<img src="./logo.jpg" alt=""><h1>HOID’S JOURNAL</h1><div class="rule"></div>'
  + `<p>A living atlas of the Cosmere</p>${extra}`;

/**
 * How tools/film-cut.mjs assembles the clips. Each output is a list of
 * sections: hard cuts inside a section, a 0.3 s dissolve between them.
 */
export const cuts = {
  'hoids-journal-trailer': [
    ['01-intro'],
    ['02-lumar', '03-canticle', '04-taldain', '05-komashi', '06-scadrial', '07-nalthis', '08-sel', '09-miral'],
    ['10-realms', '11-spiritual'],
    ['12-web', '13-arcanum', '14-spoilers'],
    ['15-end'],
  ],
  'hoids-journal-teaser-15s': [
    ['02-lumar', '03-canticle', '05-komashi', '09-miral'],
    ['10-realms'],
    ['15-end'],
  ],
};

export default {
  css: CSS,
  boot,
  shots: [
    {
      name: '01-intro',
      setup: () => window.__t.intro.begin(),
      preroll: 0.5,
      duration: 12.6,
      frame: (t) => window.__t.intro.frame(t),
      dip: [0.9, 0],
      cards: [
        { html: '', cls: 'film-scrim', from: 0, to: 9.0, fade: 0.8 },
        { html: 'I have walked more worlds<br>than you have had days.', cls: 'film-quote', from: 0.7, to: 4.4, fade: 0.55 },
        { html: 'And written down almost none of it.<small>Cephandrius, in his own hand</small>', cls: 'film-quote', from: 4.8, to: 8.7, fade: 0.55 },
        { html: '', cls: 'film-vignette', from: 9.0, to: 12.6, fadeIn: 1.0, fadeOut: 0 },
        { html: MARK(), cls: 'film-mark', from: 9.3, to: 12.6, fadeIn: 0.9, fadeOut: 0.3, rise: 0 },
      ],
    },
    world('02-lumar', 'lumar-world', 'Lumar', 'Tress of the Emerald Sea', { first: true }),
    world('03-canticle', 'canticle-world', 'Canticle', 'The Sunlit Man'),
    world('04-taldain', 'taldain', 'Taldain', 'White Sand'),
    world('05-komashi', 'komashi', 'Komashi', 'Yumi and the Nightmare Painter'),
    world('06-scadrial', 'scadrial', 'Scadrial', 'Mistborn'),
    world('07-nalthis', 'nalthis', 'Nalthis', 'Warbreaker'),
    world('08-sel', 'sel', 'Sel', 'Elantris'),
    world('09-miral', 'miral', 'Miral', 'The Fires of December', { badge: 'New', duration: 2.0, last: true }),
    {
      name: '10-realms',
      // The survey marks are worth showing here: Roshar's places, then the
      // Cognitive sites that replace them when the Realm turns over.
      setup: () => { window.__t.world('roshar', 0.95); window.__t.hidePins = false; },
      preroll: 1,
      until: () => window.__t.arrived('roshar'),
      after: 1.6,
      duration: 3.4,
      frame: (t) => window.__t.realm(t < 1.4 ? 'physical' : 'cognitive'),
      cards: [
        { html: '', cls: 'film-scrim', from: 0, fade: 0 },
        { html: 'Three Realms', cls: 'film-kicker', from: 0, fadeIn: 0.3, fadeOut: 0 },
        { html: '<b>Physical</b><span>Roshar, as the Alethi see it</span>', cls: 'film-world', from: 0.08, to: 1.4, fadeIn: 0.24, fadeOut: 0.14, rise: 10 },
        { html: '<b>Cognitive</b><span>Shadesmar, the sea of beads</span>', cls: 'film-world', from: 1.45, to: 3.35, fadeIn: 0.24, fadeOut: 0.14, rise: 10 },
      ],
    },
    {
      name: '11-spiritual',
      setup: () => window.__t.spiritual(),
      preroll: 0.5,
      until: () => window.__t.spiritualSettled(),
      after: 1.0,
      duration: 2.4,
      cards: [
        { html: '', cls: 'film-scrim', from: 0, fade: 0 },
        { html: 'Three Realms', cls: 'film-kicker', from: 0, fadeIn: 0, fadeOut: 0.3 },
        { html: '<b>Spiritual</b><span>Sixteen Shards of Adonalsium</span>', cls: 'film-world', from: 0.05, to: 2.35, fadeIn: 0.24, fadeOut: 0.2, rise: 10 },
      ],
    },
    {
      name: '12-web',
      setup: () => window.__t.ui({ view: 'web' }),
      preroll: 1.2,
      duration: 3.2,
      // Kaladin is picked on camera: the web steps back and his ties light.
      frame: (t, d) => {
        // Anchored left: the card that opens there must not be cropped.
        window.__t.kb(t, d, 1.0, 1.05, '0% 42%');
        window.__t.once('pick', t, 1.0, () => window.__ceph.store.set('selected', 'kaladin'));
      },
      cards: [
        { html: '', cls: 'film-band', from: 0, fade: 0 },
        { html: '438 people.<small>And how they’re connected</small>', cls: 'film-line', from: 0.08, to: 3.15, fadeIn: 0.28, fadeOut: 0.14 },
      ],
    },
    {
      name: '13-arcanum',
      setup: () => window.__t.ui({ panel: 'arcanum', zoom: 1.2 }),
      preroll: 1.2,
      duration: 2.2,
      frame: (t, d) => window.__t.kb(t, d, 1.0, 1.06, '50% 30%'),
      cards: [
        { html: '', cls: 'film-band', from: 0, fade: 0 },
        { html: 'Twenty magic systems.<small>And how each one works</small>', cls: 'film-line', from: 0.08, to: 2.15, fadeIn: 0.28, fadeOut: 0.14 },
      ],
    },
    {
      name: '14-spoilers',
      setup: () => window.__t.ui({ panel: 'journal', zoom: 1.2 }),
      preroll: 1.4,
      duration: 4.8,
      frame: (t, d) => window.__t.spoilers(t, d),
      cards: [
        { html: '', cls: 'film-band', from: 0, fade: 0 },
        { html: 'Tell it where you are in the books.<small>First read? Pick your place</small>', cls: 'film-line', from: 0.08, to: 2.45, fadeIn: 0.28, fadeOut: 0.18 },
        { html: 'It hides what you haven’t read.<small>Names, places, people, lore</small>', cls: 'film-line', from: 2.6, to: 4.75, fadeIn: 0.28, fadeOut: 0.18 },
      ],
    },
    {
      name: '15-end',
      setup: () => window.__t.chart(),
      preroll: 1,
      until: () => window.__t.chartSettled(),
      after: 2,
      duration: 5.0,
      dip: [0, 0.9],
      cards: [
        { html: '', cls: 'film-vignette', from: 0, fadeIn: 0.5, fadeOut: 0 },
        {
          html: MARK('<div class="url">the-cosmere.com</div><div class="fine">Free, in your browser · Unofficial fan project, not affiliated with Dragonsteel</div>'),
          cls: 'film-mark', from: 0.1, fadeIn: 0.7, fadeOut: 0, rise: 0,
        },
      ],
    },

    // Stills. `--stills` renders only these, one PNG each.
    {
      name: 'still-1-hero', still: true,
      setup: () => window.__t.chart(), preroll: 1, until: () => window.__t.chartSettled(), after: 2,
      cards: [
        { html: '', cls: 'film-vignette', from: 0, fade: 0 },
        { html: MARK('<div class="url">the-cosmere.com</div>'), cls: 'film-mark', from: 0, fade: 0, rise: 0 },
      ],
    },
    {
      name: 'still-2-roshar', still: true,
      setup: () => { window.__t.intro.begin(); window.__t.intro.frame(1.6); }, preroll: 0.3,
      cards: [
        { html: '', cls: 'film-scrim', from: 0, fade: 0 },
        { html: 'I have walked more worlds<br>than you have had days.<small>Cephandrius, in his own hand</small>', cls: 'film-quote', from: 0, fade: 0, rise: 0 },
      ],
    },
    {
      name: 'still-3-lumar', still: true,
      setup: () => window.__t.world('lumar-world', 0.78), preroll: 1,
      until: () => window.__t.arrived('lumar-world'), after: 3.2,
      cards: [
        { html: '', cls: 'film-scrim', from: 0, fade: 0 },
        { html: '<b>Lumar</b><span>Tress of the Emerald Sea</span>', cls: 'film-world', from: 0, fade: 0, rise: 0 },
        { html: BUG, cls: 'film-bug', from: 0, fade: 0, rise: 0 },
      ],
    },
    {
      name: 'still-4-web', still: true,
      setup: () => { window.__t.ui({ view: 'web' }); window.__ceph.store.set('selected', 'kaladin'); }, preroll: 2.4,
      cards: [
        { html: '', cls: 'film-band', from: 0, fade: 0 },
        { html: '438 people.<small>And how they’re connected</small>', cls: 'film-line', from: 0, fade: 0, rise: 0 },
      ],
    },
    {
      name: 'still-5-shadesmar', still: true,
      setup: () => { window.__t.world('roshar', 0.95); }, preroll: 1,
      until: () => { const ok = window.__t.arrived('roshar'); if (ok) window.__t.realm('cognitive'); return ok; }, after: 2.5,
      cards: [
        { html: '', cls: 'film-scrim', from: 0, fade: 0 },
        { html: '<b>Cognitive</b><span>Shadesmar, the sea of beads</span>', cls: 'film-world', from: 0, fade: 0, rise: 0 },
        { html: BUG, cls: 'film-bug', from: 0, fade: 0, rise: 0 },
      ],
    },
    {
      name: 'still-6-miral', still: true,
      setup: () => window.__t.world('miral', 0.8, 1.5), preroll: 1,
      until: () => window.__t.arrived('miral'), after: 3.2,
      cards: [
        { html: '', cls: 'film-scrim', from: 0, fade: 0 },
        { html: '<b>Miral</b><span>The Fires of December<em>New</em></span>', cls: 'film-world', from: 0, fade: 0, rise: 0 },
        { html: BUG, cls: 'film-bug', from: 0, fade: 0, rise: 0 },
      ],
    },
  ],
};
