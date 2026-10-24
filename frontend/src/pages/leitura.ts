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
  const tarifa = predio?.tarifaVigenteAgua ?? 10.0; // R$/m³

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
      const volEst = val / tarifa;
      resumoConversao.textContent = `Aproximadamente ${m3(volEst)} com a tarifa de ${brl(tarifa)}/m³ da Saneago.`;
    } else if (vol > 0 && val === 0) {
      const valEst = vol * tarifa;
      resumoConversao.textContent = `Aproximadamente ${brl(valEst)} calculados pela tarifa de ${brl(tarifa)}/m³.`;
    } else {
      resumoConversao.textContent = `Tarifa de referência: ${brl(tarifa)}/m³ homologada pela AGR.`;
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
        h('label', { class: 'field__label', for: 'lei-und' }, 'Unidade / Ponto de consumo'),
        (selectUnidade = h(
          'select',
          { id: 'lei-und', class: 'select' },
          h('option', { value: '' }, 'Medição Geral do Edifício (Hidrômetro Principal)'),
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
        h('label', { class: 'field__label', for: 'lei-valor' }, 'Valor pago ou cobrado (R$)'),
        (inputValor = h('input', {
          id: 'lei-valor',
          type: 'number',
          step: '0.01',
          class: 'input input--mono',
          placeholder: 'Ex: 187.00',
          onInput: atualizarConversao,
        })),
        h('span', { class: 'field__hint' }, 'Pode ser o valor total da conta ou estimativa parcial.'),
      ),
      h(
        'div',
        { class: 'field' },
        h('label', { class: 'field__label', for: 'lei-vol' }, 'Volume medido no hidrômetro (m³)'),
        (inputVolume = h('input', {
          id: 'lei-vol',
          type: 'number',
          step: '0.1',
          class: 'input input--mono',
          placeholder: 'Ex: 18.7',
          onInput: atualizarConversao,
        })),
        h('span', { class: 'field__hint' }, 'Opcional. Se preencher, o Crivo calcula o custo exato.'),
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
        placeholder: 'Ex: leitura semanal do zelador, hidrômetro do bloco B',
      })),
    ),
    (resumoConversao = h(
      'p',
      {
        class: 'card__note',
        style: 'margin-top: var(--space-4); font-size: var(--text-sm); color: var(--color-brand-strong);',
      },
      `Tarifa de referência: ${brl(tarifa)}/m³ homologada pela AGR.`,
    )),
    h(
      'div',
      { style: 'margin-top: var(--space-6); display: flex; gap: var(--space-3); justify-content: flex-end;' },
      h(
        'button',
        {
          type: 'button',
          class: 'btn btn--ghost',
          onClick: () => router.navigate('/app/resultado'),
        },
        'Cancelar',
      ),
      h('button', { type: 'submit', class: 'btn' }, 'Salvar leitura'),
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
        h('h1', { class: 'page-header__title' }, 'Lançar leitura manual'),
        h(
          'p',
          { class: 'page-header__subtitle' },
          'Registre a leitura periódica do hidrômetro ou fatura em menos de 1 minuto.',
        ),
      ),
    ),
    form,
  );
}
