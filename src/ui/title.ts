import { store } from '../core/store.ts';
import { BRAND_PITCH, BRAND_TAGLINE, BRAND_WORDMARK, CREDIT_HREF, CREDIT_LABEL, CREDIT_NAME, DISCLAIMER } from './brand.ts';
import { el, listen } from './dom.ts';
import '../styles/title.css';

export function mountTitle(root: HTMLElement): { enter(): void; open(): void; destroy(): void } {
  const enterBtn = el('button', { className: 'ceph-title-enter', text: 'Enter the Cosmere', attrs: { type: 'button' } });
  const spoilBtn = el('button', { className: 'ceph-btn', text: 'I need spoilers hidden', attrs: { type: 'button' } });
  const skipBtn = el('button', { className: 'ceph-btn', text: 'Skip to the sky', attrs: { type: 'button' } });

  const node = el('div', { className: 'ceph-title is-open' }, [
    el('div', { className: 'ceph-title-vignette' }),
    el('div', { className: 'ceph-title-center' }, [
      el('img', { className: 'ceph-title-mark', attrs: { src: `${import.meta.env.BASE_URL}mark.svg`, alt: '', width: '108', height: '108' } }),
      el('h1', { className: 'ceph-title-wordmark', text: BRAND_WORDMARK }),
      el('p', { className: 'ceph-title-tag', text: BRAND_TAGLINE }),
      el('p', { className: 'ceph-title-pitch', text: BRAND_PITCH }),
      el('div', { className: 'ceph-title-actions' }, [enterBtn, spoilBtn, skipBtn]),
    ]),
    el('p', { className: 'ceph-title-disclaimer', html: `${DISCLAIMER}<br><a href="${CREDIT_HREF}" style="color:inherit">${CREDIT_LABEL} ${CREDIT_NAME}</a>` }),
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
