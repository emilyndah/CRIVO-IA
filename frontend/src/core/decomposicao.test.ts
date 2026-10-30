import { describe, expect, it } from 'vitest';
import { decompor, gerarMensagem } from './decomposicao';

describe('decompor', () => {
  it('decompõe caso canônico do Figma (R$ 187, esperado R$ 165, tarifa R$ 8)', () => {
    const res = decompor({ valorPago: 187, esperado: 165, reajusteTarifa: 8 });

    expect(res.total).toBe(187);
    expect(res.esperado).toBe(165);
    expect(res.tarifa).toBe(8);
    expect(res.usoAcima).toBe(14);
    expect(res.economia).toBe(0);
    expect(res.aumento).toBe(22);

    // Soma das porcentagens deve dar aproximadamente 100%
    const somaPct = res.pct.esperado + res.pct.tarifa + res.pct.usoAcima;
    expect(Math.round(somaPct)).toBe(100);
  });

  it('lida com economia (consumo abaixo do esperado)', () => {
    const res = decompor({ valorPago: 140, esperado: 165, reajusteTarifa: 0 });

    expect(res.total).toBe(140);
    expect(res.esperado).toBe(140);
    expect(res.usoAcima).toBe(0);
    expect(res.economia).toBe(25);
  });
});

describe('gerarMensagem', () => {
  it('gera frase exata do Figma para 3 meses seguidos de alta', () => {
    const d = decompor({ valorPago: 187, esperado: 165, reajusteTarifa: 8 });
    const msg = gerarMensagem(d, 3);

    expect(msg.tom).toBe('alerta');
    expect(msg.texto).toContain('Sua conta subiu R$ 22');
    expect(msg.texto).toContain('R$ 8 foi tarifa');
    expect(msg.texto).toContain('R$ 14 foi uso');
    expect(msg.texto).toContain('É o 3º mês seguido de alta, vale checar vazamento');
  });

  it('informa reajuste tarifário puro quando não há uso anômalo', () => {
    const d = decompor({ valorPago: 173, esperado: 165, reajusteTarifa: 8 });
    const msg = gerarMensagem(d, 0);

    expect(msg.tom).toBe('neutro');
    expect(msg.texto).toContain('foi só o reajuste de tarifa');
  });

  it('parabeniza quando há economia', () => {
    const d = decompor({ valorPago: 140, esperado: 165, reajusteTarifa: 0 });
    const msg = gerarMensagem(d, 0);

    expect(msg.tom).toBe('ok');
    expect(msg.texto).toContain('a menos que o esperado');
  });
});
