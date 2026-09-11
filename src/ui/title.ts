import { COSMERE, DAWNSHARDS, HUBS } from '../data/index.ts';
import { store } from '../core/store.ts';
import {
  BRAND_EPIGRAPH, BRAND_EPIGRAPH_BY, BRAND_KICKER, BRAND_TAGLINE, BRAND_WORDMARK,
  CREDIT_HREF, CREDIT_LABEL, CREDIT_NAME, DISCLAIMER,
} from './brand.ts';
import { el, listen } from './dom.ts';
import '../styles/title.css';

/** What the atlas actually holds, counted rather than claimed. */
function index(): { n: number; label: string }[] {
  const worlds = COSMERE.bodies.filter((b) => b.kind !== 'gas-giant').length;
  return [
    { n: COSMERE.systems.length, label: 'systems' },
    { n: worlds, label: 'worlds' },
    { n: COSMERE.moons.length, label: 'moons' },
    { n: COSMERE.shards.length, label: 'Shards' },
    { n: COSMERE.characters.length, label: 'people' },
    { n: COSMERE.locations.length, label: 'places' },
    { n: HUBS.length, label: 'Cognitive sites' },
    { n: COSMERE.magics.length, label: 'magics' },
    { n: DAWNSHARDS.length, label: 'Dawnshards' },
  ];
}

export function mountTitle(root: HTMLElement): { enter(): void; open(): void; destroy(): void } {
  const enterBtn = el('button', {
    className: 'ceph-title-action ceph-title-action--go', attrs: { type: 'button' },
  }, [
    el('span', { className: 'ceph-title-action-main', text: 'Enter the Cosmere' }),
    el('span', { className: 'ceph-title-action-sub', text: 'everything revealed' }),
  ]);
  const spoilBtn = el('button', {
    className: 'ceph-title-action', attrs: { type: 'button' },
  }, [
    el('span', { className: 'ceph-title-action-main', text: 'Hide what I have not read' }),
    el('span', { className: 'ceph-title-action-sub', text: 'set your place first' }),
  ]);
  const skipBtn = el('button', {
    className: 'ceph-title-skip', text: 'Skip the flight', attrs: { type: 'button' },
  });

  const node = el('div', { className: 'ceph-title is-open' }, [
    el('div', { className: 'ceph-title-vignette' }),
    el('div', { className: 'ceph-title-frame' }, [
      el('header', { className: 'ceph-title-head' }, [
        el('img', {
          className: 'ceph-title-mark',
          attrs: { src: `${import.meta.env.BASE_URL}logo.png`, alt: '', width: '84', height: '84' },
        }),
        el('hr', { className: 'ceph-rule ceph-title-rule' }),
        el('h1', { className: 'ceph-title-wordmark', text: BRAND_WORDMARK }),
        el('hr', { className: 'ceph-rule ceph-title-rule' }),
        el('p', { className: 'ceph-title-tag', text: BRAND_TAGLINE }),
      ]),

      el('blockquote', { className: 'ceph-title-epigraph' }, [
        el('p', { className: 'ceph-title-quote', text: BRAND_EPIGRAPH }),
        el('cite', { className: 'ceph-title-cite', text: BRAND_EPIGRAPH_BY }),
      ]),

      el('p', { className: 'ceph-title-kicker', text: BRAND_KICKER }),

      el('div', { className: 'ceph-title-actions' }, [enterBtn, spoilBtn]),
      skipBtn,

      el('div', { className: 'ceph-title-index' },
        index().map((row) => el('div', { className: 'ceph-title-count' }, [
          el('b', { text: String(row.n) }),
          el('span', { text: row.label }),
        ]))),
    ]),
    el('footer', { className: 'ceph-title-foot' }, [
      el('p', { className: 'ceph-title-disclaimer', text: DISCLAIMER }),
      el('a', {
        className: 'ceph-title-credit',
        text: `${CREDIT_LABEL} ${CREDIT_NAME}`,
        attrs: { href: CREDIT_HREF, rel: 'noopener' },
      }),
    ]),
  ]);
  root.append(node);

  const enter = () => {
    node.classList.remove('is-open');
    store.set('shell', 'play');
    store.set('isPlaying', true);
  };

  const off1 = listen(enterBtn, 'click', () => enter());
  const off2 = listen(spoilBtn, 'click', () => {
    store.set('panel', 'spoilers');
    enter();
  });
  const offSkip = listen(skipBtn, 'click', () => {
    enter();
    store.set('cameraCue', { kind: 'skip-cinematic' });
  });
  const off3 = store.on('shell', (shell) => {
    node.classList.toggle('is-open', shell === 'title');
  });

  return {
    enter,
    open() { store.set('shell', 'title'); },
    destroy() { off1(); off2(); offSkip(); off3(); node.remove(); },
  };
}
