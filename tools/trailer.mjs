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

/* A system's name, set lower and calmer than the old world cards. */
.film-sys { bottom: 8%; }
.film-sys b {
  display: block; font-weight: 400; font-size: 66px; letter-spacing: 0.22em; text-indent: 0.22em;
  text-transform: uppercase;
}
.film-sys span {
  display: block; margin-top: 12px; font-family: var(--ceph-display); font-style: italic;
  font-size: 36px; color: #ddd8cc;
}
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

  const easeS = (u) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, u)));
  const settledAt = (r, goal) => Math.abs(r - goal) < goal * 0.004;

  window.__t = {
    hidePins: true,
    clean,
    pose,
    beauty,
    beat: {},
    /** Once, the first frame at or after `at`. */
    once(key, t, at, fn) {
      if (t >= at && !this.beat[key]) { this.beat[key] = true; fn(); }
    },
    /** Ken Burns on the interface: scale from s0 to s1 about an origin. */
    kb(t, d, s0, s1, origin) {
      const html = document.documentElement;
      html.style.setProperty('--kb', String(lerp(s0, s1, t / d)));
      html.style.setProperty('--kb-o', origin);
    },

    /**
     * Ask the app to frame something, then remember how it framed it: the
     * app's own composition is the starting point, and a shot drifts from
     * there. `check` says the flight is the one we asked for.
     */
    cue(c, check, drift) {
      st.set('cameraCue', c);
      this.cuedAt = app.frameCount;
      this.check = check;
      this.driftOpts = drift;
      this.m = null;
      this.beat = {};
    },
    ready() {
      if (this.m) return true;
      if (app.frameCount < this.cuedAt + 4 || !this.check()) return false;
      if (!settledAt(rig.radius, rig.goalRadius)) return false;
      this.m = { r: rig.goalRadius, c: rig.goalTarget.clone(), theta: rig.heading, phi: rig.elevation };
      st.set('selected', null);
      if (this.driftOpts) this.drift(0, 1, this.driftOpts);
      return true;
    },
    /**
     * A slow move from the app's framing: radius k0→k1 times its distance,
     * turning dTheta, tilting phi0→phi1. `follow` keeps a moving world in
     * the middle of the frame.
     */
    drift(t, d, o) {
      const e = easeS(t / d);
      const m = this.m;
      const c = o.follow ? app.orrery.bodyPosition(o.follow).clone() : m.c;
      pose(c, m.r * lerp(o.k0, o.k1, e), (o.theta0 ?? m.theta + (o.turn ?? 0)) + o.dTheta * e,
        lerp(o.phi0 ?? m.phi, o.phi1 ?? m.phi, e));
    },

    /** A whole system with its orbits turning. */
    system(id, drift, { realm = 'physical', rate = 4, labels = false } = {}) {
      beauty();
      rig.autoRotate = false;
      // The app's own names for what is orbiting: an atlas, not a screensaver.
      if (labels) st.patchVisual({ showLabels: true });
      if (realm !== 'physical') st.set('realm', realm);
      st.set('timeRate', rate);
      st.set('isPlaying', rate > 0);
      this.cue({ kind: 'focus', id, scale: 'system' },
        () => st.state.scale === 'system' && st.state.focusedSystem === id, drift);
    },
    /** One world, from far enough out that its moons and their orbits are in shot. */
    world(id, drift) {
      beauty();
      rig.autoRotate = false;
      this.cue({ kind: 'focus', id, scale: 'globe' },
        () => st.state.scale === 'globe' && st.state.focusedBody === id, { follow: id, ...drift });
    },
    /** The Cosmere, as the app frames it. */
    chart(drift, rate = 4) {
      beauty();
      rig.autoRotate = false;
      st.set('timeRate', rate);
      st.set('isPlaying', true);
      this.cue({ kind: 'frame' }, () => st.state.scale === 'cosmere', drift);
    },

    /**
     * The opening: the Rosharan system with its worlds turning, then out to
     * every star. Both framings are measured first (the chart, then the
     * system), so the move runs between two compositions the app would
     * choose itself.
     */
    intro: {
      HOLD: 2.2,
      MOVE: 8.8,
      begin() {
        const T = window.__t;
        T.chart(null);
        this.stage = 0;
        this.done = false;
      },
      ready() {
        const T = window.__t;
        if (this.stage === 0) {
          if (!T.ready()) return false;
          this.cos = T.m;
          this.stage = 1;
          st.set('isPlaying', true);
          T.cue({ kind: 'focus', id: 'rosharan', scale: 'system' },
            () => st.state.scale === 'system' && st.state.focusedSystem === 'rosharan');
          return false;
        }
        if (this.stage === 1) {
          if (!T.ready()) return false;
          this.sys = T.m;
          this.stage = 2;
          // The app holds the playhead during a cinematic; this one keeps
          // the worlds moving by hand.
          st.set('cinematic', true);
          this.y0 = st.state.year;
          this.frame(0);
        }
        return true;
      },
      frame(t) {
        st.state.year = this.y0 + t * 0.32;
        const u = Math.min(1, Math.max(0, (t - this.HOLD) / this.MOVE));
        const e = ease(u);
        // Under 110 units the app dresses the sky as a system, so start inside it.
        const r0 = Math.min(this.sys.r * 0.92, 104);
        const r1 = this.cos.r;
        const radius = Math.exp(lerp(Math.log(r0), Math.log(r1), e));
        const w = (radius - r0) / (r1 - r0);
        const target = this.sys.c.clone().lerp(this.cos.c, w);
        const theta = this.sys.theta + 0.05 * t + 0.85 * e;
        const phi = lerp(1.02, this.cos.phi, e);
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
          st.state.visual.nebula = 1;
          st.set('cinematic', false);
          st.set('scale', 'cosmere');
          st.set('focusedBody', null);
          st.set('focusedSystem', null);
          st.set('isPlaying', true);
        }
      },
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
      // The directory remembers its tab; after the Spiritual shot it was
      // still on Shards.
      document.querySelector('.ceph-dir-tabs button')?.click();
      rig.autoRotate = true;
      rig.autoRotateSpeed = 0.03;
      this.beat = {};
    },
    spoilers(t, d) {
      this.kb(t, d, 1.0, 1.04, '50% 40%');
      // Through the real reading companion: click the book, close the panel.
      this.once('click', t, 1.7, () => {
        const row = [...document.querySelectorAll('.ceph-book')]
          .find((b) => b.textContent.includes('The Final Empire'));
        row?.click();
      });
      this.once('close', t, 3.3, () => st.set('panel', 'none'));
      this.once('frame', t, 3.4, () => st.set('cameraCue', { kind: 'frame' }));
    },
    /** Crossed into from the Cosmere, not from a globe (see App.trackFocus). */
    spiritual() {
      beauty();
      st.set('realm', 'spiritual');
    },
    spiritualSettled() {
      rig.autoRotate = true;
      rig.autoRotateSpeed = 0.07;
      return settledAt(rig.radius, rig.goalRadius);
    },
  };
}

/** A name and where it is from, low in the frame, unhurried. */
const label = (name, sub, d, extra = '') => ({
  html: `<b>${name}</b><span>${sub}${extra}</span>`,
  cls: 'film-sys', from: 0.9, to: d - 0.85, fadeIn: 0.7, fadeOut: 0.6, rise: 8,
});
const scrim = { html: '', cls: 'film-scrim', from: 0, fade: 0 };

/** A system or world shot: framed by the app, then a slow drift. */
const sysShot = (name, kind, id, drift, opts, caption, duration = 5.5) => ({
  name,
  setup: kind === 'system'
    ? (sid, dr, o) => window.__t.system(sid, dr, o)
    : (wid, dr) => window.__t.world(wid, dr),
  args: kind === 'system' ? [id, drift, opts ?? {}] : [id, drift],
  preroll: 0.5,
  until: () => window.__t.ready(),
  wait: 25,
  after: 0.4,
  duration,
  frame: new Function('t', 'd', `window.__t.drift(t, d, ${JSON.stringify(drift)})`),
  cards: [scrim, label(caption[0], caption[1], duration, caption[2] ?? '')],
});

const BUG = '<div>Hoid’s Journal</div><small>the-cosmere.com</small>';
const MARK = (extra = '') => '<img src="./logo.jpg" alt=""><h1>HOID’S JOURNAL</h1><div class="rule"></div>'
  + `<p>A living atlas of the Cosmere</p>${extra}`;

/** Medium shots: the whole system in frame, pushed a little closer, turning. */
const MEDIUM = { k0: 0.82, k1: 0.68, dTheta: 0.30, phi0: 1.10, phi1: 1.00 };

/**
 * How tools/film-cut.mjs assembles the clips. Every shot is its own
 * section, so every join is a one-second dissolve: the owner asked for
 * breathing room, not a montage.
 */
export const cuts = {
  'hoids-journal-trailer': {
    dissolve: 1.0,
    sections: [
      ['01-intro'], ['02-cosmere'], ['03-scadrian'], ['04-selish'], ['05-taldain'], ['06-lumar'],
      ['07-shadesmar'], ['08-spiritual'], ['09-web'], ['10-spoilers'], ['11-end'],
    ],
  },
  'hoids-journal-teaser': {
    dissolve: 1.0,
    sections: [['02-cosmere'], ['07-shadesmar'], ['11-end']],
  },
};

export default {
  css: CSS,
  boot,
  shots: [
    {
      name: '01-intro',
      setup: () => window.__t.intro.begin(),
      preroll: 0.5,
      until: () => window.__t.intro.ready(),
      wait: 30,
      duration: 13.5,
      frame: (t) => window.__t.intro.frame(t),
      dip: [1.2, 0],
      cards: [
        { html: '', cls: 'film-scrim', from: 0, to: 9.8, fade: 0.9 },
        { html: 'I have walked more worlds<br>than you have had days.', cls: 'film-quote', from: 1.2, to: 5.4, fade: 0.8 },
        { html: 'And written down almost none of it.<small>Cephandrius, in his own hand</small>', cls: 'film-quote', from: 5.9, to: 9.6, fade: 0.8 },
        { html: '', cls: 'film-vignette', from: 9.6, to: 13.5, fadeIn: 1.2, fadeOut: 0 },
        { html: MARK(), cls: 'film-mark', from: 10.0, to: 13.5, fadeIn: 1.1, fadeOut: 0, rise: 0 },
      ],
    },
    {
      name: '02-cosmere',
      setup: () => window.__t.chart({ k0: 0.96, k1: 0.86, dTheta: 0.22, phi0: 1.16, phi1: 1.08 }),
      preroll: 0.5,
      until: () => window.__t.ready(),
      after: 0.4,
      duration: 6.0,
      frame: (t, d) => window.__t.drift(t, d, { k0: 0.96, k1: 0.86, dTheta: 0.22, phi0: 1.16, phi1: 1.08 }),
      cards: [
        scrim,
        { html: 'Every published world<small>19 systems · 33 worlds · 57 moons</small>', cls: 'film-line', from: 0.9, to: 5.15, fadeIn: 0.7, fadeOut: 0.6, rise: 8 },
      ],
    },
    sysShot('03-scadrian', 'system', 'scadrian', MEDIUM, { labels: true }, ['The Scadrian system', 'Mistborn']),
    sysShot('04-selish', 'system', 'selish', { ...MEDIUM, dTheta: -0.30 }, { labels: true }, ['The Selish system', 'Elantris · The Emperor’s Soul']),
    sysShot('05-taldain', 'system', 'taldainian', { k0: 0.95, k1: 0.80, dTheta: 0.26, phi0: 1.12, phi1: 1.02 }, { labels: true }, ['Taldain', 'White Sand · held between two suns']),
    sysShot('06-lumar', 'world', 'lumar-world', { k0: 2.05, k1: 1.72, dTheta: 0.28, phi0: 1.12, phi1: 1.05 }, null, ['Lumar', 'Tress of the Emerald Sea · twelve moons']),
    // Framed like the other systems, wide enough to see the Realm: the
    // owner's note was that tight shots hid it, not that it needed redrawing.
    sysShot('07-shadesmar', 'system', 'rosharan',
      { k0: 0.92, k1: 0.76, turn: 0.9, dTheta: 0.32, phi0: 1.06, phi1: 0.98 },
      { realm: 'cognitive', rate: 1, labels: true },
      ['Shadesmar', 'The Cognitive Realm'], 6.5),
    {
      name: '08-spiritual',
      setup: () => window.__t.spiritual(),
      preroll: 0.5,
      until: () => window.__t.spiritualSettled(),
      after: 1.2,
      duration: 5.5,
      cards: [scrim, label('The Spiritual Realm', 'Sixteen Shards of Adonalsium', 5.5)],
    },
    {
      name: '09-web',
      setup: () => window.__t.ui({ view: 'web' }),
      preroll: 1.4,
      duration: 5.5,
      // Kaladin is picked on camera: the web steps back and his ties light.
      frame: (t, d) => {
        window.__t.kb(t, d, 1.0, 1.04, '0% 42%');
        window.__t.once('pick', t, 1.6, () => window.__ceph.store.set('selected', 'kaladin'));
      },
      cards: [
        { html: '', cls: 'film-band', from: 0, fade: 0 },
        { html: '438 people.<small>And how they’re connected</small>', cls: 'film-line', from: 0.9, to: 4.65, fadeIn: 0.7, fadeOut: 0.6 },
      ],
    },
    {
      name: '10-spoilers',
      setup: () => window.__t.ui({ panel: 'journal', zoom: 1.2 }),
      preroll: 1.4,
      duration: 6.5,
      frame: (t, d) => window.__t.spoilers(t, d),
      cards: [
        { html: '', cls: 'film-band', from: 0, fade: 0 },
        { html: 'Tell it where you are in the books.<small>First read? Pick your place</small>', cls: 'film-line', from: 0.9, to: 3.2, fadeIn: 0.7, fadeOut: 0.5 },
        { html: 'It hides what you haven’t read.<small>Names, places, people, lore</small>', cls: 'film-line', from: 3.6, to: 5.65, fadeIn: 0.6, fadeOut: 0.6 },
      ],
    },
    {
      name: '11-end',
      setup: () => window.__t.chart({ k0: 1.0, k1: 0.95, dTheta: 0.10, phi0: 1.04, phi1: 1.0 }),
      preroll: 0.5,
      until: () => window.__t.ready(),
      after: 0.4,
      duration: 7.0,
      frame: (t, d) => window.__t.drift(t, d, { k0: 1.0, k1: 0.95, dTheta: 0.10, phi0: 1.04, phi1: 1.0 }),
      dip: [0, 1.5],
      cards: [
        { html: '', cls: 'film-vignette', from: 0, fadeIn: 0.8, fadeOut: 0 },
        {
          html: MARK('<div class="url">the-cosmere.com</div><div class="fine">Free, in your browser · Unofficial fan project, not affiliated with Dragonsteel</div>'),
          cls: 'film-mark', from: 0.6, fadeIn: 1.0, fadeOut: 0, rise: 0,
        },
      ],
    },

    // Stills. `--stills` renders only these, one PNG each.
    {
      name: 'still-1-hero', still: true,
      setup: () => window.__t.chart(null), preroll: 0.5, until: () => window.__t.ready(), after: 1.5,
      cards: [
        { html: '', cls: 'film-vignette', from: 0, fade: 0 },
        { html: MARK('<div class="url">the-cosmere.com</div>'), cls: 'film-mark', from: 0, fade: 0, rise: 0 },
      ],
    },
    {
      name: 'still-2-rosharan', still: true,
      setup: () => window.__t.system('rosharan', { k0: 0.78, k1: 0.78, dTheta: 0, phi0: 1.04, phi1: 1.04 }, { rate: 0 }),
      preroll: 0.5, until: () => window.__t.ready(), wait: 25, after: 0.6,
      cards: [
        scrim,
        { html: 'I have walked more worlds<br>than you have had days.<small>Cephandrius, in his own hand</small>', cls: 'film-quote', from: 0, fade: 0, rise: 0 },
      ],
    },
    {
      name: 'still-3-lumar', still: true,
      setup: () => window.__t.world('lumar-world', { k0: 1.8, k1: 1.8, dTheta: 0, phi0: 1.1, phi1: 1.1 }),
      preroll: 0.5, until: () => window.__t.ready(), wait: 25, after: 1.0,
      cards: [
        scrim,
        { html: '<b>Lumar</b><span>Tress of the Emerald Sea · twelve moons</span>', cls: 'film-sys', from: 0, fade: 0, rise: 0 },
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
      setup: () => window.__t.system('rosharan', { k0: 0.84, k1: 0.84, turn: 1.05, dTheta: 0, phi0: 1.02, phi1: 1.02 }, { realm: 'cognitive', rate: 0, labels: true }),
      preroll: 0.5, until: () => window.__t.ready(), wait: 25, after: 1.0,
      cards: [
        scrim,
        { html: '<b>Shadesmar</b><span>The Cognitive Realm</span>', cls: 'film-sys', from: 0, fade: 0, rise: 0 },
        { html: BUG, cls: 'film-bug', from: 0, fade: 0, rise: 0 },
      ],
    },
    {
      name: 'still-6-taldain', still: true,
      setup: () => window.__t.system('taldainian', { k0: 0.86, k1: 0.86, dTheta: 0, phi0: 1.06, phi1: 1.06 }, { rate: 0, labels: true }),
      preroll: 0.5, until: () => window.__t.ready(), wait: 25, after: 0.6,
      cards: [
        scrim,
        { html: '<b>Taldain</b><span>White Sand · held between two suns</span>', cls: 'film-sys', from: 0, fade: 0, rise: 0 },
        { html: BUG, cls: 'film-bug', from: 0, fade: 0, rise: 0 },
      ],
    },
  ],
};
