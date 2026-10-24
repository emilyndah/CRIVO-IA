import { type Decomposicao, decompor } from '../core/decomposicao';
import { h, nextFrame, prefersReducedMotion } from '../core/dom';
import { brl } from '../core/format';

export interface DecompBarOptions {
  decomposicao?: Decomposicao;
  valorPago?: number;
  esperado?: number;
  reajusteTarifa?: number;
  tamanho?: 'md' | 'sm';
  mostrarLegenda?: boolean;
  estiloLegenda?: 'tabela' | 'inline';
}

export function DecompBar(options: DecompBarOptions): HTMLElement {
  const d =
    options.decomposicao ??
    decompor({
      valorPago: options.valorPago ?? 0,
      esperado: options.esperado ?? 0,
      reajusteTarifa: options.reajusteTarifa ?? 0,
    });

  const tamanho = options.tamanho ?? 'md';
  const mostrarLegenda = options.mostrarLegenda ?? true;
  const estiloLegenda = options.estiloLegenda ?? 'tabela';

  const segEsperado = h('div', {
    class: 'decomp__seg decomp__seg--expected',
    role: 'progressbar',
    'aria-label': 'Consumo esperado',
    'aria-valuenow': Math.round(d.pct.esperado),
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    title: `Esperado: ${brl(d.esperado)} (${Math.round(d.pct.esperado)}%)`,
  });

  const segTarifa = h('div', {
    class: 'decomp__seg decomp__seg--tariff',
    role: 'progressbar',
    'aria-label': 'Reajuste de tarifa',
    'aria-valuenow': Math.round(d.pct.tarifa),
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    title: `Reajuste de tarifa: ${brl(d.tarifa)} (${Math.round(d.pct.tarifa)}%)`,
  });

  const segUso = h('div', {
    class: 'decomp__seg decomp__seg--overuse',
    role: 'progressbar',
    'aria-label': 'Uso acima do esperado',
    'aria-valuenow': Math.round(d.pct.usoAcima),
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    title: `Uso acima do esperado: ${brl(d.usoAcima)} (${Math.round(d.pct.usoAcima)}%)`,
  });

  // Anima as larguras da barra no próximo frame
  if (prefersReducedMotion()) {
    segEsperado.style.width = `${d.pct.esperado}%`;
    segTarifa.style.width = `${d.pct.tarifa}%`;
    segUso.style.width = `${d.pct.usoAcima}%`;
  } else {
    nextFrame(() => {
      segEsperado.style.width = `${d.pct.esperado}%`;
      segTarifa.style.width = `${d.pct.tarifa}%`;
      segUso.style.width = `${d.pct.usoAcima}%`;
    });
  }

  const bar = h(
    'div',
    {
      class: `decomp ${tamanho === 'sm' ? 'decomp--sm' : ''}`,
      'aria-label': `Decomposição da conta: total ${brl(d.total)}, esperado ${brl(d.esperado)}, tarifa ${brl(d.tarifa)}, uso acima ${brl(d.usoAcima)}`,
    },
    segEsperado,
    segTarifa,
    segUso,
  );

  if (!mostrarLegenda) {
    return bar;
  }

  if (estiloLegenda === 'inline') {
    const inlineLegend = h(
      'div',
      { class: 'legend-inline' },
      h(
        'span',
        null,
        h('span', { class: 'legend__dot', style: 'background: var(--color-expected);' }),
        `Esperado ${brl(d.esperado)}`,
      ),
      h(
        'span',
        null,
        h('span', { class: 'legend__dot', style: 'background: var(--color-tariff);' }),
        `Tarifa ${brl(d.tarifa)}`,
      ),
      h(
        'span',
        null,
        h('span', { class: 'legend__dot', style: 'background: var(--color-overuse);' }),
        `Uso acima ${brl(d.usoAcima)}`,
      ),
    );
    return h('div', null, bar, inlineLegend);
  }

  // Legenda completa em formato de tabela (como no Figma do Resultado de Agosto)
  const rows = [
    h(
      'div',
      { class: 'legend__row' },
      h('span', { class: 'legend__dot', style: 'background: var(--color-expected);' }),
      h('span', { class: 'legend__label' }, 'Esperado'),
      h('span', { class: 'legend__value mono' }, brl(d.esperado)),
    ),
    h(
      'div',
      { class: 'legend__row' },
      h('span', { class: 'legend__dot', style: 'background: var(--color-tariff);' }),
      h('span', { class: 'legend__label' }, 'Reajuste de tarifa, nada a fazer'),
      h('span', { class: 'legend__value mono' }, brl(d.tarifa)),
    ),
    h(
      'div',
      { class: 'legend__row legend__row--overuse' },
      h('span', { class: 'legend__dot', style: 'background: var(--color-overuse);' }),
      h('span', { class: 'legend__label' }, 'Uso acima do esperado'),
      h('span', { class: 'legend__value mono' }, brl(d.usoAcima)),
    ),
  ];

  const fullLegend = h('div', { class: 'legend' }, ...rows);

  return h('div', null, bar, fullLegend);
}
