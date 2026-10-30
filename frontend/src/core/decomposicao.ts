import { brl, ordinal } from './format';

/**
 * Decomposição da conta (núcleo do Crivo).
 *
 * O backend calcula o "esperado" (regressão ajustada pelo clima e perfil do prédio)
 * e o "reajuste de tarifa" (AGR/Saneago). O front apenas organiza as três partes
 * para exibição e gera a frase em linguagem natural.
 *
 *   valor pago = esperado + reajuste de tarifa + uso acima do esperado
 */

export interface EntradaDecomposicao {
  valorPago: number;
  esperado: number;
  reajusteTarifa: number;
}

export interface Decomposicao {
  total: number;
  /** Parte esperada efetivamente paga (pode ser menor que o esperado se houve economia). */
  esperado: number;
  tarifa: number;
  usoAcima: number;
  /** Quanto ficou abaixo de esperado + tarifa (economia). */
  economia: number;
  /** Diferença entre o pago e o esperado: o "quanto subiu". */
  aumento: number;
  pct: { esperado: number; tarifa: number; usoAcima: number };
}

const arred = (n: number): number => Math.round(n * 100) / 100;

export function decompor({ valorPago, esperado, reajusteTarifa }: EntradaDecomposicao): Decomposicao {
  const total = Math.max(0, valorPago);
  const tarifa = Math.min(Math.max(0, reajusteTarifa), total);
  const usoAcima = arred(Math.max(0, total - esperado - tarifa));
  const economia = arred(Math.max(0, esperado + tarifa - total));
  const parteEsperada = arred(Math.max(0, total - tarifa - usoAcima));

  const pct = (v: number): number => (total > 0 ? (v / total) * 100 : 0);

  return {
    total: arred(total),
    esperado: parteEsperada,
    tarifa: arred(tarifa),
    usoAcima,
    economia,
    aumento: arred(total - esperado),
    pct: { esperado: pct(parteEsperada), tarifa: pct(tarifa), usoAcima: pct(usoAcima) },
  };
}

export type Tom = 'alerta' | 'ok' | 'neutro';

export interface Mensagem {
  texto: string;
  tom: Tom;
}

/**
 * Frase curta, em reais, com uma ação clara. Sem jargão técnico.
 * Ex.: "Sua conta subiu R$ 22. R$ 8 foi tarifa, R$ 14 foi uso. É o 3º mês seguido de alta, vale checar vazamento."
 */
export function gerarMensagem(d: Decomposicao, mesesSeguidosAlta = 0): Mensagem {
  const tarifa = Math.round(d.tarifa);
  const uso = Math.round(d.usoAcima);
  const economia = Math.round(d.economia);

  if (uso > 0) {
    const subiu = tarifa + uso;
    const partes =
      tarifa > 0
        ? `${brl(tarifa)} foi tarifa, ${brl(uso)} foi uso.`
        : `Tudo isso foi uso acima do esperado.`;
    const acao =
      mesesSeguidosAlta >= 3
        ? `É o ${ordinal(mesesSeguidosAlta)} mês seguido de alta, vale checar vazamento.`
        : mesesSeguidosAlta === 2
          ? 'É o 2º mês seguido de alta. Vale olhar torneiras e descargas.'
          : 'Vale ficar de olho nas próximas leituras.';
    return { texto: `Sua conta subiu ${brl(subiu)}. ${partes} ${acao}`, tom: 'alerta' };
  }

  if (tarifa > 0 && economia === 0) {
    return {
      texto: `Sua conta subiu ${brl(tarifa)}, e foi só o reajuste de tarifa. Seu uso ficou dentro do esperado.`,
      tom: 'neutro',
    };
  }

  if (economia > 0) {
    return {
      texto: `Você pagou ${brl(economia)} a menos que o esperado para o seu perfil. Bom trabalho.`,
      tom: 'ok',
    };
  }

  return { texto: 'Sua conta ficou dentro do esperado. Nada a fazer este mês.', tom: 'ok' };
}
