import { h } from '../core/dom';
import { router } from '../core/router';
import { store } from '../core/store';

export function AppFooter(): HTMLElement {
  const lgpdPath = store.usuario ? '/app/lgpd' : '/lgpd';
  const autoresPath = store.usuario ? '/app/autores' : '/autores';

  const onNavigate = (e: MouseEvent, path: string) => {
    e.preventDefault();
    router.navigate(path);
  };

  const badge = h('span', { class: 'footer__badge' }, 'CRIVO v1.0.0');

  const copyright = h(
    'span',
    { class: 'footer__copyright' },
    '© 2026 CRIVO – Inteligência Hídrica ',
    h('span', { class: 'footer__subversion' }, '(v1.0.0)'),
  );

  const linkLgpd = h(
    'a',
    {
      href: lgpdPath,
      class: 'footer__link',
      onClick: (e: MouseEvent) => onNavigate(e, lgpdPath),
    },
    'Privacidade e LGPD',
  );

  const linkAutores = h(
    'a',
    {
      href: autoresPath,
      class: 'footer__link',
      onClick: (e: MouseEvent) => onNavigate(e, autoresPath),
    },
    'Licença e Autores',
  );

  const nav = h(
    'div',
    { class: 'footer__links' },
    linkLgpd,
    h('span', { class: 'footer__sep', 'aria-hidden': 'true' }),
    linkAutores,
  );

  return h(
    'footer',
    { class: 'app-footer', role: 'contentinfo' },
    h('div', { class: 'footer__col footer__col--left' }, badge),
    h('div', { class: 'footer__col footer__col--center' }, copyright),
    h('div', { class: 'footer__col footer__col--right' }, nav),
  );
}
