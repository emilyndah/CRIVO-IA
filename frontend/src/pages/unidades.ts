import { h, mount } from '../core/dom';
import { brl } from '../core/format';
import { icon } from '../core/icons';
import { store } from '../core/store';
import { api } from '../services/api';
import type { Unidade } from '../services/types';

export async function PaginaUnidades(): Promise<HTMLElement> {
  let unidades: Unidade[] = [];
  const predio = store.predio;

  try {
    unidades = await api.listarUnidades();
  } catch (err) {
    console.error('Erro ao listar unidades:', err);
  }

  const containerLista = h('div', { class: 'rows' });
  const valorCountUnidades = h(
    'div',
    { class: 'summary-strip__value mono' },
    String(unidades.length),
  );

  const renderLista = () => {
    valorCountUnidades.textContent = String(unidades.length);

    if (unidades.length === 0) {
      mount(
        containerLista,
        h(
          'div',
          { class: 'empty' },
          h('p', null, 'Nenhuma unidade cadastrada. Adicione apartamentos ou setores ao lado.'),
        ),
      );
      return;
    }

    const rows = unidades.map((u) => {
      const btnExcluir = h(
        'button',
        {
          class: 'btn btn--danger btn--icon',
          'aria-label': `Excluir unidade ${u.nome}`,
          onClick: async () => {
            if (confirm(`Remover a unidade "${u.nome}"?`)) {
              await api.excluirUnidade(u.id);
              unidades = unidades.filter((item) => item.id !== u.id);
              renderLista();
              store.addToast(`Unidade "${u.nome}" removida.`);
            }
          },
        },
        icon('lixeira'),
      );

      return h(
        'div',
        { class: `row ${u.destaque ? 'row--highlight' : ''}`, style: 'padding: var(--space-4) 0;' },
        h(
          'div',
          { class: 'row__main' },
          h(
            'div',
            {
              style:
                'font-size: var(--text-md); font-weight: var(--weight-semibold); color: var(--tinta-900);',
            },
            u.nome,
          ),
          h(
            'div',
            {
              style: 'font-size: var(--text-xs); color: var(--color-text-muted); margin-top: 2px;',
            },
            `${u.ocupantesEstimados} moradores · ${u.areaM2 || 60} m²`,
          ),
        ),
        u.consumoUltimoMes
          ? h(
              'div',
              { style: 'text-align: right; margin-right: var(--space-2);' },
              h(
                'div',
                {
                  class: 'mono',
                  style: 'font-size: var(--text-md); font-weight: var(--weight-bold);',
                },
                brl(u.consumoUltimoMes),
              ),
              h(
                'div',
                { style: 'font-size: var(--text-xs); color: var(--color-text-subtle);' },
                'último mês',
              ),
            )
          : null,
        btnExcluir,
      );
    });

    mount(containerLista, ...rows);
  };

  renderLista();

  // ── Faixa Limpa do Edifício ──────────────────────────────
  const faixaImovel = h(
    'section',
    { class: 'summary-strip' },
    h(
      'div',
      { class: 'summary-strip__item' },
      h('span', { class: 'summary-strip__label' }, 'Imóvel'),
      h('div', { class: 'summary-strip__value' }, predio?.nome || 'Condomínio Exemplo'),
    ),
    h(
      'div',
      { class: 'summary-strip__item' },
      h('span', { class: 'summary-strip__label' }, 'Localidade'),
      h(
        'div',
        { class: 'summary-strip__value' },
        `${predio?.cidade || 'Anápolis'} – ${predio?.estado || 'GO'}`,
      ),
    ),
    h(
      'div',
      { class: 'summary-strip__item' },
      h('span', { class: 'summary-strip__label' }, 'Unidades na amostra'),
      valorCountUnidades,
    ),
    h(
      'div',
      { class: 'summary-strip__item' },
      h('span', { class: 'summary-strip__label' }, 'Tarifa de água'),
      h(
        'div',
        { class: 'summary-strip__value mono', style: 'color: var(--color-brand-strong);' },
        `${brl(predio?.tarifaVigenteAgua ?? 10.0)} / m³`,
      ),
    ),
  );

  // ── Formulário Lateral Limpo ─────────────────────────────
  let inputNome: HTMLInputElement;
  let inputPessoas: HTMLInputElement;
  let inputArea: HTMLInputElement;

  const formNovaUnidade = h(
    'form',
    {
      class: 'card',
      onSubmit: async (e: Event) => {
        e.preventDefault();
        const nome = inputNome.value.trim();
        if (!nome) return;

        const pessoas = parseInt(inputPessoas.value, 10) || 1;
        const area = parseFloat(inputArea.value) || 60;

        try {
          const criada = await api.criarUnidade({
            nome,
            ocupantesEstimados: pessoas,
            areaM2: area,
          });
          unidades.push(criada);
          inputNome.value = '';
          renderLista();
          store.addToast(`Unidade "${nome}" adicionada!`, 'sucesso');
        } catch {
          store.addToast('Erro ao criar unidade.', 'erro');
        }
      },
    },
    h('div', { class: 'card__header' }, h('h2', { class: 'card__title' }, 'Nova unidade')),
    h(
      'div',
      { class: 'field' },
      h('label', { class: 'field__label' }, 'Identificação'),
      (inputNome = h('input', { class: 'input', placeholder: 'Ex: Apto 403', required: true })),
    ),
    h(
      'div',
      { class: 'grid grid--2', style: 'margin-top: var(--space-4);' },
      h(
        'div',
        { class: 'field' },
        h('label', { class: 'field__label' }, 'Moradores'),
        (inputPessoas = h('input', {
          class: 'input input--mono',
          type: 'number',
          min: '1',
          value: '3',
          required: true,
        })),
      ),
      h(
        'div',
        { class: 'field' },
        h('label', { class: 'field__label' }, 'Área (m²)'),
        (inputArea = h('input', {
          class: 'input input--mono',
          type: 'number',
          value: '68',
        })),
      ),
    ),
    h(
      'div',
      { style: 'margin-top: auto; padding-top: var(--space-5);' },
      h(
        'button',
        { type: 'submit', class: 'btn btn--block btn--lg' },
        icon('mais'),
        'Adicionar unidade',
      ),
    ),
  );

  const cardListaUnidades = h(
    'article',
    { class: 'card' },
    h('div', { class: 'card__header' }, h('h2', { class: 'card__title' }, 'Unidades cadastradas')),
    containerLista,
  );

  return h(
    'div',
    { class: 'page' },
    h(
      'header',
      { class: 'page-header' },
      h(
        'div',
        null,
        h('h1', { class: 'page-header__title' }, 'Unidades e Imóvel'),
        h(
          'p',
          { class: 'page-header__subtitle' },
          'Gerencie os apartamentos ou setores usados para comparar o consumo.',
        ),
      ),
    ),
    faixaImovel,
    h('div', { class: 'grid grid--main-aside' }, cardListaUnidades, formNovaUnidade),
  );
}
