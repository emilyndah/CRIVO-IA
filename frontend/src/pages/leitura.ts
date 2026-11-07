import { h } from '../core/dom';
import { brl, hojeISO, m3 } from '../core/format';
import { router } from '../core/router';
import { store } from '../core/store';
import { api } from '../services/api';
import type { Unidade } from '../services/types';

export async function PaginaLeitura(): Promise<HTMLElement> {
  let unidades: Unidade[] = [];
  try {
    unidades = await api.listarUnidades();
  } catch (err) {
    console.error('Erro ao listar unidades:', err);
  }

  const predio = store.predio;
  const tarifa = predio?.tarifaVigenteAgua ?? 10.0;

  let inputData: HTMLInputElement;
  let selectUnidade: HTMLSelectElement;
  let inputValor: HTMLInputElement;
  let inputVolume: HTMLInputElement;
  let inputObs: HTMLInputElement;
  let resumoConversao: HTMLElement;

  const atualizarConversao = () => {
    const val = parseFloat(inputValor.value.replace(',', '.')) || 0;
    const vol = parseFloat(inputVolume.value.replace(',', '.')) || 0;

    if (val > 0 && vol === 0) {
      resumoConversao.textContent = `Aproximadamente ${m3(val / tarifa)} de água com a tarifa atual de ${brl(tarifa)}/m³.`;
    } else if (vol > 0 && val === 0) {
      resumoConversao.textContent = `Aproximadamente ${brl(vol * tarifa)} calculados pela tarifa de ${brl(tarifa)}/m³.`;
    } else {
      resumoConversao.textContent = `Tarifa atual considerada: ${brl(tarifa)} por m³.`;
    }
  };

  const form = h(
    'form',
    {
      class: 'card',
      onSubmit: async (e: Event) => {
        e.preventDefault();
        const valor = parseFloat(inputValor.value.replace(',', '.'));
        const volume = parseFloat(inputVolume.value.replace(',', '.'));

        if (isNaN(valor) && isNaN(volume)) {
          store.addToast('Informe o valor em R$ ou o volume em m³.', 'erro');
          return;
        }

        const valorFinal = !isNaN(valor) ? valor : volume * tarifa;

        try {
          await api.lancarLeitura({
            data: inputData.value || hojeISO(),
            unidadeId: selectUnidade.value || undefined,
            valorPago: valorFinal,
            volumeM3: !isNaN(volume) ? volume : valorFinal / tarifa,
            observacoes: inputObs.value.trim() || undefined,
          });

          store.addToast(`Leitura de ${brl(valorFinal)} registrada com sucesso!`, 'sucesso');
          router.navigate('/app/resultado');
        } catch {
          store.addToast('Erro ao salvar leitura.', 'erro');
        }
      },
    },
    h('div', { class: 'card__header' }, h('h2', { class: 'card__title' }, 'Dados da leitura')),
    h(
      'div',
      { class: 'grid grid--2' },
      h(
        'div',
        { class: 'field' },
        h('label', { class: 'field__label', for: 'lei-data' }, 'Data da leitura'),
        (inputData = h('input', {
          id: 'lei-data',
          type: 'date',
          class: 'input',
          value: hojeISO(),
          required: true,
        })),
      ),
      h(
        'div',
        { class: 'field' },
        h('label', { class: 'field__label', for: 'lei-und' }, 'Unidade ou hidrômetro'),
        (selectUnidade = h(
          'select',
          { id: 'lei-und', class: 'select' },
          h('option', { value: '' }, 'Medição Geral do Edifício'),
          ...unidades.map((u) => h('option', { value: u.id }, u.nome)),
        )),
      ),
    ),
    h(
      'div',
      { class: 'grid grid--2', style: 'margin-top: var(--space-4);' },
      h(
        'div',
        { class: 'field' },
        h('label', { class: 'field__label', for: 'lei-valor' }, 'Valor da conta (R$)'),
        (inputValor = h('input', {
          id: 'lei-valor',
          type: 'number',
          step: '0.01',
          class: 'input input--mono',
          placeholder: 'Ex: 187,00',
          onInput: atualizarConversao,
        })),
        h('span', { class: 'field__hint' }, 'Valor cobrado no boleto ou estimativa.'),
      ),
      h(
        'div',
        { class: 'field' },
        h('label', { class: 'field__label', for: 'lei-vol' }, 'Volume no hidrômetro (m³)'),
        (inputVolume = h('input', {
          id: 'lei-vol',
          type: 'number',
          step: '0.1',
          class: 'input input--mono',
          placeholder: 'Ex: 18,7',
          onInput: atualizarConversao,
        })),
        h('span', { class: 'field__hint' }, 'Opcional se você já informou o valor em R$.'),
      ),
    ),
    h(
      'div',
      { class: 'field', style: 'margin-top: var(--space-4);' },
      h('label', { class: 'field__label', for: 'lei-obs' }, 'Observações (opcional)'),
      (inputObs = h('input', {
        id: 'lei-obs',
        type: 'text',
        class: 'input',
        placeholder: 'Ex: Leitura semanal da portaria',
      })),
    ),
    (resumoConversao = h(
      'div',
      {
        class: 'callout callout--ok',
        style: 'margin-top: var(--space-5); font-size: var(--text-sm);',
      },
      `Tarifa atual considerada: ${brl(tarifa)} por m³.`,
    )),
    h(
      'div',
      {
        style:
          'margin-top: auto; padding-top: var(--space-5); display: flex; gap: var(--space-3); justify-content: flex-end;',
      },
      h(
        'button',
        {
          type: 'button',
          class: 'btn btn--ghost btn--lg',
          onClick: () => router.navigate('/app/resultado'),
        },
        'Cancelar',
      ),
      h('button', { type: 'submit', class: 'btn btn--lg' }, 'Salvar leitura'),
    ),
  );

  const cardDicas = h(
    'aside',
    { class: 'card' },
    h('div', { class: 'card__header' }, h('h2', { class: 'card__title' }, 'Como o Crivo analisa')),
    h(
      'div',
      { class: 'stack' },
      h(
        'div',
        { class: 'alert-item' },
        h('div', { class: 'alert-item__title' }, 'Valor ou volume, você escolhe'),
        h(
          'div',
          { class: 'alert-item__desc' },
          'Basta preencher um dos dois campos. O sistema converte automaticamente.',
        ),
      ),
      h(
        'div',
        { class: 'alert-item' },
        h('div', { class: 'alert-item__title' }, 'Separação automática da tarifa'),
        h(
          'div',
          { class: 'alert-item__desc' },
          'Mostramos quanto do aumento veio de reajuste e quanto foi consumo real.',
        ),
      ),
      h(
        'div',
        { class: 'alert-item alert-item--alta' },
        h('div', { class: 'alert-item__title' }, 'Aviso rápido de vazamento'),
        h(
          'div',
          { class: 'alert-item__desc' },
          'Se o consumo passar do padrão esperado para o prédio, um alerta é gerado.',
        ),
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
        h('h1', { class: 'page-header__title' }, 'Lançar leitura'),
        h(
          'p',
          { class: 'page-header__subtitle' },
          'Registre o valor da fatura ou a medição do hidrômetro em menos de 1 minuto.',
        ),
      ),
    ),
    h('div', { class: 'grid grid--main-aside' }, form, cardDicas),
  );
}
