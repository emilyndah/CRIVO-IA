import { h, mount } from '../core/dom';
import { dataCurta } from '../core/format';
import { icon } from '../core/icons';
import { store } from '../core/store';
import { api } from '../services/api';
import type { AlertaCompleto } from '../services/types';

export async function PaginaAlertas(): Promise<HTMLElement> {
  let alertas: AlertaCompleto[] = [];
  try {
    alertas = await api.listarAlertas();
  } catch (err) {
    console.error('Erro ao listar alertas:', err);
  }

  type Filtro = 'todos' | 'alta' | 'tarifa' | 'resolvido';
  let filtroAtual: Filtro = 'todos';

  const container = h('div', { class: 'stack' });

  const renderAlertas = () => {
    let filtrados = alertas;
    if (filtroAtual === 'alta') {
      filtrados = alertas.filter((a) => a.tipo === 'alta' || a.tipo === 'noturno');
    } else if (filtroAtual === 'tarifa') {
      filtrados = alertas.filter((a) => a.tipo === 'tarifa');
    } else if (filtroAtual === 'resolvido') {
      filtrados = alertas.filter((a) => a.status === 'resolvido' || a.status === 'lido');
    }

    if (filtrados.length === 0) {
      mount(
        container,
        h(
          'div',
          { class: 'empty card' },
          icon('ok', 'empty__icon'),
          h('h3', { class: 'empty__title' }, 'Nenhum alerta nesta categoria'),
          h('p', null, 'Tudo em ordem com o monitoramento hídrico do condomínio.'),
        ),
      );
      return;
    }

    const cards = filtrados.map((a) => {
      const isAlta = a.tipo === 'alta' || a.tipo === 'noturno';
      const isResolvido = a.status === 'resolvido' || a.status === 'lido';

      const btnResolver = !isResolvido
        ? h(
            'button',
            {
              class: 'btn btn--subtle',
              style: 'margin-left: auto;',
              onClick: async () => {
                await api.marcarAlertaLido(a.id);
                a.status = 'resolvido';
                store.alertasNaoLidos = Math.max(0, store.alertasNaoLidos - 1);
                store.notify();
                renderAlertas();
                store.addToast('Alerta marcado como verificado.', 'sucesso');
              },
            },
            icon('ok'),
            'Marcar como verificado',
          )
        : h('span', { class: 'tag', style: 'margin-left: auto;' }, 'Verificado');

      return h(
        'article',
        {
          class: `card ${isAlta ? 'card--hover' : ''}`,
          style: isAlta ? 'border-left: 4px solid var(--color-overuse);' : '',
        },
        h(
          'div',
          { class: 'card__header', style: 'margin-bottom: var(--space-2);' },
          h(
            'div',
            { style: 'display: flex; align-items: center; gap: var(--space-2);' },
            h(
              'span',
              { class: `tag ${isAlta ? 'tag--alerta' : 'tag--marca'}` },
              isAlta ? 'Atenção' : 'Informativo',
            ),
            h('span', { class: 'card__eyebrow' }, dataCurta(a.criadoEm)),
          ),
          btnResolver,
        ),
        h('h2', { class: 'card__title' }, a.titulo),
        h('p', { style: 'color: var(--color-text-muted); margin-top: var(--space-1);' }, a.descricao),
        a.impactoEstimado
          ? h(
              'div',
              {
                style:
                  'margin-top: var(--space-3); font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--color-text);',
              },
              `Impacto estimado: ${a.impactoEstimado}`,
            )
          : null,
      );
    });

    mount(container, ...cards);
  };

  const btnFiltro = (filtro: Filtro, label: string) => {
    const btn = h(
      'button',
      {
        class: 'chip',
        'aria-pressed': filtroAtual === filtro ? 'true' : 'false',
        onClick: () => {
          filtroAtual = filtro;
          toolbar.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', 'false'));
          btn.setAttribute('aria-pressed', 'true');
          renderAlertas();
        },
      },
      label,
    );
    return btn;
  };

  const toolbar = h(
    'div',
    { style: 'display: flex; gap: var(--space-2); margin-bottom: var(--space-6); flex-wrap: wrap;' },
    btnFiltro('todos', 'Todos'),
    btnFiltro('alta', 'Possível Vazamento'),
    btnFiltro('tarifa', 'Reajustes de Tarifa'),
    btnFiltro('resolvido', 'Verificados'),
  );

  renderAlertas();

  return h(
    'div',
    { class: 'page' },
    h(
      'header',
      { class: 'page-header' },
      h(
        'div',
        null,
        h('h1', { class: 'page-header__title' }, 'Alertas e Diagnósticos'),
        h(
          'p',
          { class: 'page-header__subtitle' },
          'Notificações em linguagem natural quando o consumo foge do padrão esperado.',
        ),
      ),
    ),
    toolbar,
    container,
  );
}
