import { h } from '../core/dom';

export interface LogoOptions {
  variant?: 'color' | 'white';
  height?: number;
  showLink?: boolean;
}

export function Logo({
  variant = 'color',
  height = 36,
  showLink = true,
}: LogoOptions = {}): HTMLElement {
  const isWhite = variant === 'white';
  const src = isWhite ? '/brand/logo-white.png' : '/brand/logo.png';

  const img = h('img', {
    src,
    alt: 'Crivo — Inteligência Hídrica',
    style: `height: ${height}px; width: auto; display: block;`,
  });

  if (!showLink) {
    return h('div', { class: `logo logo--${variant}` }, img);
  }

  return h(
    'a',
    {
      href: '/app/resultado',
      class: `logo logo--${variant}`,
      'aria-label': 'Página inicial do Crivo',
    },
    img,
  );
}
