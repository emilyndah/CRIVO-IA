import { DecompBar } from '../components/DecompBar';
import { decompor } from '../core/decomposicao';
import { h } from '../core/dom';
import { brl, nomeMes } from '../core/format';
import { router } from '../core/router';
import { store } from '../core/store';
import { api } from '../services/api';
import type { ResultadoMes } from '../services/types';

export async function PaginaResultado(): Promise<HTMLElement> {
  const mesAtual = store.mesAtivo || '2026-08';
  let dados: ResultadoMes;

  try {
    dados = await api.obterResultadoMes(mesAtual);
  } catch (e) {
    console.error('Erro ao buscar resultado do mês:', e);
    return h(
      'div',
      { class: 'empty' },
      h('h2', { class: 'empty__title' }, 'Não foi possível carregar os dados'),
      h('p', null, 'Verifique se o serviço está disponível ou tente novamente.'),
    );
  }

  const d = decompor({
    valorPago: dados.valorPago,
    esperado: dados.esperado,
    reajusteTarifa: dados.reajusteTarifa,
  });

  // ── Header da Página ─────────────────────────────────────
  const mesNome = nomeMes(dados.mes);
  const header = h(
    'header',
    { class: 'page-header' },
    h(
      'div',
      null,
      h('h1', { class: 'page-header__title' }, `Resultado de ${mesNome}`),
      h('p', { class: 'page-header__subtitle' }, 'Monitoramento de consumo hídrico predial'),
    ),
    h(
      'div',
      { class: 'page-header__actions' },
      h('span', { class: 'chip', 'aria-pressed': 'true' }, 'Água'),
    ),
  );

  // ── Card 1: Resultado Principal com Decomposição ─────────
  const cardResultado = h(
    'article',
    { class: 'card card--hover enter', style: '--i: 0;' },
    h(
      'div',
      { class: 'card__header' },
      h('span', { class: 'card__eyebrow' }, `Valor pago em ${mesNome}`),
      h(
        'span',
        { class: 'card__eyebrow' },
        `Esperado para o seu perfil: ${brl(dados.esperado)}`,
      ),
    ),
    h(
      'div',
      { style: 'margin-bottom: var(--space-6);' },
      h(
        'span',
        {
          class: 'mono',
          style:
            'font-size: var(--text-display); font-weight: var(--weight-bold); line-height: 1; letter-spacing: -0.03em;',
        },
        brl(dados.valorPago),
      ),
    ),
    DecompBar({
      decomposicao: d,
      tamanho: 'md',
      mostrarLegenda: true,
      estiloLegenda: 'tabela',
    }),
    h(
      'div',
      { class: `callout ${dados.tomMensagem === 'alerta' ? '' : 'callout--ok'}` },
      dados.mensagem,
    ),
  );

  // ── Card 2: Lançar Leitura Rápida ────────────────────────
  let inputValor: HTMLInputElement;

  const formLeitura = h(
    'form',
    {
      onSubmit: async (e: Event) => {
        e.preventDefault();
        const v = parseFloat(inputValor.value.replace(',', '.'));
        if (isNaN(v) || v <= 0) {
          store.addToast('Informe um valor pago válido em R$', 'erro');
          return;
        }

        try {
          await api.lancarLeitura({
            data: `${dados.mes}-20`,
            valorPago: v,
          });
          store.addToast(`Leitura de ${brl(v)} registrada com sucesso!`, 'sucesso');
          // Recarrega a página para atualizar o gráfico
          router.navigate('/app/resultado');
        } catch {
          store.addToast('Erro ao salvar leitura.', 'erro');
        }
      },
    },
    h(
      'div',
      { class: 'field' },
      h('label', { class: 'field__label' }, 'Tipo'),
      h('input', {
        class: 'input',
        value: 'Água',
        disabled: true,
        style: 'background: var(--color-bg-soft);',
      }),
    ),
    h(
      'div',
      { class: 'field' },
      h('label', { class: 'field__label', for: 'input-valor-rapido' }, 'Valor pago (R$)'),
      (inputValor = h('input', {
        id: 'input-valor-rapido',
        class: 'input input--mono',
        type: 'number',
        step: '0.01',
        value: String(dados.valorPago),
        required: true,
      })),
    ),
    h(
      'div',
      { style: 'margin-top: var(--space-5);' },
      h('button', { type: 'submit', class: 'btn btn--block' }, 'Enviar leitura'),
    ),
    h(
      'p',
      { class: 'card__note' },
      'Se pular um dia ou uma semana, tudo bem. O Crivo continua com o que já tem.',
    ),
  );

  const cardLancar = h(
    'article',
    { class: 'card enter', style: '--i: 1;' },
    h('h2', { class: 'card__title', style: 'margin-bottom: var(--space-4);' }, 'Lançar leitura'),
    formLeitura,
  );

  // ── Card 3: Unidades Parecidas ───────────────────────────
  const linhasUnidades = dados.unidadesParecidas.map((u) => {
    return h(
      'div',
      { class: `row ${u.destaque ? 'row--highlight' : ''}` },
      h('span', { class: 'row__main' }, u.nome),
      h('span', { class: 'row__value mono' }, brl(u.valorPago)),
    );
  });

  const cardUnidades = h(
    'article',
    { class: 'card enter', style: '--i: 2;' },
    h('h2', { class: 'card__title', style: 'margin-bottom: var(--space-3);' }, 'Unidades parecidas'),
    h('div', { class: 'rows' }, ...linhasUnidades),
    h('p', { class: 'card__note' }, 'Dados de exemplo para comparação entre unidades congêneres.'),
  );

  // ── Card 4: Alertas do Mês ───────────────────────────────
  const itensAlertas = dados.alertasDesteMes.map((a) => {
    return h(
      'div',
      { class: `alert-item ${a.tipo === 'alta' ? 'alert-item--alta' : ''}` },
      h('div', { class: 'alert-item__title' }, a.titulo),
      h('div', { class: 'alert-item__desc' }, a.descricao),
    );
  });

  const cardAlertas = h(
    'article',
    { class: 'card enter', style: '--i: 3;' },
    h('h2', { class: 'card__title', style: 'margin-bottom: var(--space-3);' }, 'Alertas'),
    h('div', null, ...itensAlertas),
  );

  // ── Montagem da Grade ────────────────────────────────────
  const gridPrincipal = h(
    'div',
    { class: 'grid grid--main-aside' },
    cardResultado,
    cardLancar,
  );

  const gridSecundario = h(
    'div',
    { class: 'grid grid--2', style: 'margin-top: var(--space-6);' },
    cardUnidades,
    cardAlertas,
  );

  return h('div', { class: 'page' }, header, gridPrincipal, gridSecundario);
}
