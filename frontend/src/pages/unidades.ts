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

  const renderLista = () => {
    if (unidades.length === 0) {
      mount(
        containerLista,
        h(
          'div',
          { class: 'empty' },
          h('p', null, 'Nenhuma unidade cadastrada. Adicione apartamentos ou setores abaixo.'),
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
        { class: `row ${u.destaque ? 'row--highlight' : ''}` },
        h(
          'div',
          { class: 'row__main' },
          h('div', { style: 'font-weight: var(--weight-medium);' }, u.nome),
          h(
            'div',
            { style: 'font-size: var(--text-xs); color: var(--color-text-subtle);' },
            `${u.ocupantesEstimados} pessoas · ${u.areaM2 || 60} m²`,
          ),
        ),
        u.consumoUltimoMes
          ? h(
              'div',
              { style: 'text-align: right; margin-right: var(--space-3);' },
              h('div', { class: 'mono' }, brl(u.consumoUltimoMes)),
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

  // ── Formulário para Nova Unidade ──────────────────────────
  let inputNome: HTMLInputElement;
  let inputPessoas: HTMLInputElement;
  let inputArea: HTMLInputElement;

  const formNovaUnidade = h(
    'form',
    {
      class: 'card card--soft',
      style: 'margin-top: var(--space-6);',
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
    h('h3', { class: 'card__title', style: 'margin-bottom: var(--space-3);' }, 'Adicionar nova unidade'),
    h(
      'div',
      { class: 'grid grid--3' },
      h(
        'div',
        { class: 'field' },
        h('label', { class: 'field__label' }, 'Identificação'),
        (inputNome = h('input', { class: 'input', placeholder: 'Ex: Apto 403', required: true })),
      ),
      h(
        'div',
        { class: 'field' },
        h('label', { class: 'field__label' }, 'Moradores / Ocupantes'),
        (inputPessoas = h('input', {
          class: 'input',
          type: 'number',
          min: '1',
          value: '3',
          required: true,
        })),
      ),
      h(
        'div',
        { class: 'field' },
        h('label', { class: 'field__label' }, 'Área estimada (m²)'),
        (inputArea = h('input', {
          class: 'input',
          type: 'number',
          value: '68',
        })),
      ),
    ),
    h(
      'div',
      { style: 'margin-top: var(--space-4); display: flex; justify-content: flex-end;' },
      h('button', { type: 'submit', class: 'btn' }, icon('mais'), 'Adicionar unidade'),
    ),
  );

  // ── Configurações do Imóvel ──────────────────────────────
  const cardPredio = h(
    'article',
    { class: 'card', style: 'margin-bottom: var(--space-6);' },
    h('h2', { class: 'card__title', style: 'margin-bottom: var(--space-4);' }, 'Perfil do Edifício'),
    h(
      'div',
      { class: 'grid grid--2' },
      h(
        'div',
        null,
        h('div', { class: 'field__label' }, 'Nome do imóvel'),
        h('div', { style: 'font-size: var(--text-lg); font-weight: var(--weight-semibold);' }, predio?.nome || 'Condomínio Exemplo'),
        h('div', { style: 'font-size: var(--text-sm); color: var(--color-text-subtle);' }, `${predio?.cidade || 'Anápolis'} – ${predio?.estado || 'GO'}`),
      ),
      h(
        'div',
        null,
        h('div', { class: 'field__label' }, 'Tarifa Vigente de Água'),
        h('div', { class: 'mono', style: 'font-size: var(--text-lg); font-weight: var(--weight-bold); color: var(--color-brand-strong);' }, `${brl(predio?.tarifaVigenteAgua ?? 10.0)} / m³`),
        h('div', { style: 'font-size: var(--text-xs); color: var(--color-text-subtle);' }, 'Estrutura tarifária oficial Saneago / AGR'),
      ),
    ),
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
          'Gerencie as unidades e parâmetros construtivos para calibração da linha de base.',
        ),
      ),
    ),
    cardPredio,
    h(
      'article',
      { class: 'card' },
      h('h2', { class: 'card__title', style: 'margin-bottom: var(--space-4);' }, 'Unidades cadastradas'),
      containerLista,
      formNovaUnidade,
    ),
  );
}
