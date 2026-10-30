import { h, mount } from '../core/dom';
import { icon } from '../core/icons';
import { store, type ToastItem } from '../core/store';

let toastContainer: HTMLElement | null = null;

export function initToastRegion(): void {
  if (toastContainer && document.body.contains(toastContainer)) return;

  toastContainer = h('div', {
    class: 'toast-region',
    role: 'region',
    'aria-label': 'Notificações',
    'aria-live': 'polite',
  });
  document.body.appendChild(toastContainer);

  store.subscribe(() => {
    if (!toastContainer) return;
    renderToasts(toastContainer, store.toasts);
  });
}

function renderToasts(container: HTMLElement, items: ToastItem[]): void {
  const elements = items.map((t) => {
    const ic =
      t.tipo === 'erro' ? icon('erro') : t.tipo === 'info' ? icon('info') : icon('ok');

    return h(
      'div',
      {
        class: `toast ${t.tipo === 'erro' ? 'toast--erro' : ''}`,
        role: 'status',
      },
      ic,
      h('span', null, t.mensagem),
    );
  });

  mount(container, ...elements);
}
