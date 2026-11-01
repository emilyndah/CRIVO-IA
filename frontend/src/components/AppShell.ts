import { h } from '../core/dom';
import { icon } from '../core/icons';
import { router } from '../core/router';
import { store } from '../core/store';
import { api } from '../services/api';
import { AppFooter } from './AppFooter';
import { Logo } from './Logo';

export interface AppShellOptions {
  activePath: string;
  content: HTMLElement;
}

export function AppShell({ activePath, content }: AppShellOptions): HTMLElement {
  let isDrawerOpen = false;

  const scrim = h('div', {
    class: 'scrim',
    onClick: () => toggleDrawer(false),
  });

  const toggleDrawer = (open?: boolean) => {
    isDrawerOpen = typeof open === 'boolean' ? open : !isDrawerOpen;
    shell.classList.toggle('is-drawer-open', isDrawerOpen);
  };

  // ── Topbar (Mobile) ──────────────────────────────────
  const menuBtn = h(
    'button',
    {
      class: 'btn btn--icon',
      'aria-label': 'Abrir menu de navegação',
      onClick: () => toggleDrawer(true),
    },
    icon('menu'),
  );

  const topbar = h(
    'header',
    { class: 'topbar' },
    Logo({ variant: 'white', height: 28 }),
    menuBtn,
  );

  // ── Sidebar ──────────────────────────────────────────
  const navItems = [
    { path: '/app/resultado', label: 'Resultado do mês', ic: 'resultado' as const },
    { path: '/app/leitura', label: 'Lançar leitura', ic: 'leitura' as const },
    { path: '/app/unidades', label: 'Unidades', ic: 'unidades' as const },
    {
      path: '/app/alertas',
      label: 'Alertas',
      ic: 'alertas' as const,
      badge: store.alertasNaoLidos > 0 ? String(store.alertasNaoLidos) : null,
    },
    { path: '/app/historico', label: 'Histórico', ic: 'historico' as const },
  ];

  const navLinks = navItems.map((item) => {
    const isCurrent =
      activePath === item.path ||
      (item.path === '/app/resultado' && (activePath === '/app' || activePath === '/'));

    return h(
      'a',
      {
        href: item.path,
        class: 'nav__link',
        'aria-current': isCurrent ? 'page' : false,
        onClick: () => toggleDrawer(false),
      },
      icon(item.ic),
      h('span', null, item.label),
      item.badge ? h('span', { class: 'badge' }, item.badge) : null,
    );
  });

  const nav = h('nav', { class: 'nav', 'aria-label': 'Principal' }, ...navLinks);

  const predioNome = store.predio?.nome || 'Condomínio Exemplo';
  const usuarioNome = store.usuario?.nome || 'Usuário';

  const logoutBtn = h(
    'button',
    {
      class: 'sidebar__logout',
      onClick: async () => {
        await api.logout();
        store.usuario = null;
        router.navigate('/entrar');
      },
    },
    icon('sair'),
    h('span', null, 'Sair'),
  );

  const footer = h(
    'div',
    { class: 'sidebar__footer' },
    h('div', { class: 'sidebar__predio' }, predioNome),
    h('div', { class: 'sidebar__user' }, usuarioNome),
    logoutBtn,
  );

  const sidebar = h(
    'aside',
    { class: 'sidebar' },
    h('div', { class: 'sidebar__brand' }, Logo({ variant: 'white', height: 34 })),
    nav,
    footer,
  );

  // ── Main Content Container ───────────────────────────
  const main = h('main', { class: 'main', id: 'main-content', tabindex: -1 }, content);

  const contentWrap = h(
    'div',
    { class: 'shell__body' },
    topbar,
    main,
    AppFooter(),
  );

  const shell = h(
    'div',
    { class: 'shell' },
    scrim,
    sidebar,
    contentWrap,
  );

  return shell;
}
