import { DecompBar } from '../components/DecompBar';
import { decompor } from '../core/decomposicao';
import { h } from '../core/dom';
import { brl, m3, nomeMes } from '../core/format';
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

  const tarifa = store.predio?.tarifaVigenteAgua ?? 10.0;
  const d = decompor({
    valorPago: dados.valorPago,
    esperado: dados.esperado,
    reajusteTarifa: dados.reajusteTarifa,
  });

  const deltaReais = dados.valorPago - dados.esperado;

  // ── Header Limpo e Focado ────────────────────────────────
  const mesNome = nomeMes(dados.mes);
  const mesesRapidos = [
    { ref: '2026-06', label: 'Junho' },
    { ref: '2026-07', label: 'Julho' },
    { ref: '2026-08', label: 'Agosto' },
  ];

  const seletorMeses = h(
    'div',
    { class: 'segmented', role: 'group', 'aria-label': 'Selecionar mês' },
    ...mesesRapidos.map((m) =>
      h(
        'button',
        {
          type: 'button',
          'aria-pressed': dados.mes === m.ref ? 'true' : 'false',
          onClick: () => {
            store.setMesAtivo(m.ref);
            router.navigate('/app/resultado');
          },
        },
        m.label,
      ),
    ),
  );

  const header = h(
    'header',
    { class: 'page-header' },
    h(
      'div',
      null,
      h('h1', { class: 'page-header__title' }, `Resultado de ${mesNome}`),
      h(
        'p',
        { class: 'page-header__subtitle' },
        `Monitoramento de consumo hídrico · ${store.predio?.nome || 'Condomínio Exemplo'}`,
      ),
    ),
    h('div', { class: 'page-header__actions' }, seletorMeses),
  );

  // ── Card 1 (Foco Principal): Valor Pago + Decomposição ───
  const cardResultado = h(
    'article',
    { class: 'card card--hover enter', style: '--i: 0;' },
    h(
      'div',
      { class: 'card__header' },
      h('span', { class: 'card__eyebrow' }, `Valor pago em ${mesNome}`),
      h(
        'span',
        {
          class: 'card__eyebrow',
          style: 'font-weight: var(--weight-semibold); color: var(--tinta-800);',
        },
        `Esperado para o seu perfil: ${brl(dados.esperado)}`,
      ),
    ),
    h(
      'div',
      {
        style:
          'display: flex; align-items: baseline; flex-wrap: wrap; gap: var(--space-4); margin-bottom: var(--space-5);',
      },
      h(
        'span',
        {
          class: 'mono',
          style:
            'font-size: var(--text-display); font-weight: var(--weight-bold); line-height: 1; letter-spacing: -0.035em; color: var(--tinta-900);',
        },
        brl(dados.valorPago),
      ),
      deltaReais !== 0
        ? h(
            'span',
            {
              class: `tag ${deltaReais > 0 ? 'tag--alerta' : 'tag--marca'}`,
              style: 'font-size: var(--text-xs); padding: 0.25rem 0.65rem;',
            },
            deltaReais > 0
              ? `+${brl(deltaReais)} acima do esperado`
              : `${brl(Math.abs(deltaReais))} abaixo do esperado`,
          )
        : null,
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
  let previewM3: HTMLElement;

  const atualizarPreview = () => {
    const v = parseFloat(inputValor.value.replace(',', '.'));
    if (!isNaN(v) && v > 0) {
      previewM3.textContent = `Equivale a cerca de ${m3(v / tarifa)} de água.`;
    } else {
      previewM3.textContent = 'Informe o valor da conta para atualizar o resultado.';
    }
  };

  const formLeitura = h(
    'form',
    {
      style: 'display: flex; flex-direction: column; flex: 1; gap: var(--space-4);',
      onSubmit: async (e: Event) => {
        e.preventDefault();
        const v = parseFloat(inputValor.value.replace(',', '.'));
        if (isNaN(v) || v <= 0) {
          store.addToast('Informe um valor pago válido em R$', 'erro');
          return;
        }
        try {
          await api.lancarLeitura({
            data: new Date().toISOString().slice(0, 10),
            valorPago: v,
          });
          store.addToast('Leitura registrada com sucesso!', 'sucesso');
          router.navigate('/app/resultado');
        } catch {
          store.addToast('Erro ao registrar leitura.', 'erro');
        }
      },
    },
    h(
      'div',
      { class: 'field' },
      h('label', { class: 'field__label', for: 'quick-tipo' }, 'Tipo'),
      h('input', {
        id: 'quick-tipo',
        class: 'input',
        type: 'text',
        value: 'Água',
        disabled: true,
        style: 'background: var(--color-surface-muted); color: var(--color-text-muted);',
      }),
    ),
    h(
      'div',
      { class: 'field' },
      h('label', { class: 'field__label', for: 'quick-valor' }, 'Valor pago (R$)'),
      (inputValor = h('input', {
        id: 'quick-valor',
        class: 'input input--mono',
        type: 'number',
        step: '0.01',
        min: '1',
        value: String(dados.valorPago),
        placeholder: 'Ex: 187',
        onInput: atualizarPreview,
      })),
      (previewM3 = h(
        'span',
        { class: 'field__hint' },
        `Equivale a cerca de ${m3(dados.valorPago / tarifa)} de água.`,
      )),
    ),
    h(
      'div',
      {
        style: 'margin-top: auto; display: grid; gap: var(--space-3); padding-top: var(--space-2);',
      },
      h('button', { type: 'submit', class: 'btn btn--block btn--lg' }, 'Enviar leitura'),
      h(
        'p',
        {
          style:
            'font-size: var(--text-xs); color: var(--color-text-subtle); margin: 0; line-height: 1.45;',
        },
        'Se pular um dia ou uma semana, tudo bem. O Crivo continua com o que já tem.',
      ),
    ),
  );

  const cardLancar = h(
    'article',
    { class: 'card enter', style: '--i: 1;' },
    h('div', { class: 'card__header' }, h('h2', { class: 'card__title' }, 'Lançar leitura')),
    formLeitura,
  );

  // ── Card 3: Unidades Parecidas ───────────────────────────
  const maxUnidadeVal = Math.max(...dados.unidadesParecidas.map((u) => u.valorPago), 200);
  const linhasUnidades = dados.unidadesParecidas.map((u) => {
    const pctWidth = Math.min(100, Math.round((u.valorPago / maxUnidadeVal) * 100));
    return h(
      'div',
      { class: `unit-bench ${u.destaque ? 'unit-bench--highlight' : ''}` },
      h(
        'div',
        { class: 'unit-bench__top' },
        h(
          'span',
          {
            style: u.destaque
              ? 'font-weight: var(--weight-semibold); color: var(--tinta-900);'
              : '',
          },
          u.nome,
        ),
        h(
          'span',
          {
            class: 'mono',
            style: u.destaque
              ? 'font-size: var(--text-md); font-weight: var(--weight-bold); color: var(--color-overuse);'
              : 'font-size: var(--text-md); font-weight: var(--weight-medium);',
          },
          brl(u.valorPago),
        ),
      ),
      h(
        'div',
        { class: 'unit-bench__track' },
        h('div', { class: 'unit-bench__fill', style: `width: ${pctWidth}%;` }),
      ),
    );
  });

  const cardUnidades = h(
    'article',
    { class: 'card enter', style: '--i: 2;' },
    h(
      'div',
      { class: 'card__header' },
      h('h2', { class: 'card__title' }, 'Unidades parecidas'),
      h(
        'a',
        {
          href: '/app/unidades',
          class: 'btn btn--subtle',
          style: 'min-height: 2rem; font-size: var(--text-xs);',
          onClick: (e: MouseEvent) => {
            e.preventDefault();
            router.navigate('/app/unidades');
          },
        },
        'Ver unidades →',
      ),
    ),
    h('div', null, ...linhasUnidades),
    h('p', { class: 'card__note' }, 'Comparação anônima entre unidades de porte semelhante.'),
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
    h(
      'div',
      { class: 'card__header' },
      h('h2', { class: 'card__title' }, 'Alertas'),
      h(
        'a',
        {
          href: '/app/alertas',
          class: 'btn btn--subtle',
          style: 'min-height: 2rem; font-size: var(--text-xs);',
          onClick: (e: MouseEvent) => {
            e.preventDefault();
            router.navigate('/app/alertas');
          },
        },
        'Ver todos →',
      ),
    ),
    h('div', null, ...itensAlertas),
  );

  // ── Grade Bento Simétrica e Coesa ────────────────────────
  const gridPrincipal = h('div', { class: 'grid grid--main-aside' }, cardResultado, cardLancar);
  const gridSecundario = h('div', { class: 'grid grid--main-aside' }, cardUnidades, cardAlertas);

  return h('div', { class: 'page' }, header, gridPrincipal, gridSecundario);
}
