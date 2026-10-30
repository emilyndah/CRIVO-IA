import { DecompBar } from '../components/DecompBar';
import { decompor } from '../core/decomposicao';
import { h } from '../core/dom';
import { brl, mesAno, porcentagem } from '../core/format';
import { router } from '../core/router';
import { store } from '../core/store';
import { api } from '../services/api';
import type { HistoricoItem } from '../services/types';

export async function PaginaHistorico(): Promise<HTMLElement> {
  let historico: HistoricoItem[] = [];
  try {
    historico = await api.listarHistorico();
  } catch (err) {
    console.error('Erro ao listar histórico:', err);
  }

  const cardsMeses = historico.map((item) => {
    const d = decompor({
      valorPago: item.valorPago,
      esperado: item.esperado,
      reajusteTarifa: item.reajusteTarifa,
    });

    const isMesAtivo = store.mesAtivo === item.mes;

    const btnVerMes = h(
      'button',
      {
        class: 'btn btn--ghost',
        onClick: () => {
          store.setMesAtivo(item.mes);
          router.navigate('/app/resultado');
        },
      },
      'Ver diagnóstico',
    );

    const variacaoBadge =
      item.variacaoMesAnteriorPct !== undefined
        ? h(
            'span',
            {
              class: `tag ${item.variacaoMesAnteriorPct > 0 ? 'tag--alerta' : 'tag--marca'}`,
              style: 'margin-left: var(--space-2);',
            },
            `${item.variacaoMesAnteriorPct > 0 ? '+' : ''}${porcentagem(item.variacaoMesAnteriorPct)}`,
          )
        : null;

    return h(
      'article',
      {
        class: 'card card--hover',
        style: isMesAtivo ? 'border-color: var(--color-brand-strong); box-shadow: var(--shadow-lg);' : '',
      },
      h(
        'div',
        { class: 'card__header' },
        h(
          'div',
          null,
          h(
            'div',
            { style: 'display: flex; align-items: center;' },
            h('h2', { class: 'card__title' }, mesAno(item.mes)),
            variacaoBadge,
          ),
          h('span', { class: 'card__eyebrow' }, `Esperado: ${brl(item.esperado)}`),
        ),
        h(
          'div',
          { style: 'text-align: right;' },
          h('div', { class: 'mono', style: 'font-size: var(--text-2xl); font-weight: var(--weight-bold);' }, brl(item.valorPago)),
        ),
      ),
      DecompBar({
        decomposicao: d,
        tamanho: 'sm',
        mostrarLegenda: true,
        estiloLegenda: 'inline',
      }),
      h(
        'div',
        { style: 'margin-top: var(--space-4); display: flex; justify-content: flex-end;' },
        btnVerMes,
      ),
    );
  });

  return h(
    'div',
    { class: 'page' },
    h(
      'header',
      { class: 'page-header' },
      h(
        'div',
        null,
        h('h1', { class: 'page-header__title' }, 'Histórico de Faturas'),
        h(
          'p',
          { class: 'page-header__subtitle' },
          'Acompanhe a evolução do consumo e o impacto dos reajustes de tarifa ao longo dos meses.',
        ),
      ),
    ),
    h('div', { class: 'stack' }, ...cardsMeses),
  );
}
