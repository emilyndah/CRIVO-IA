import { describe, expect, it } from 'vitest';
import { brl, dataCurta, m3, nomeMes, porcentagem } from './format';

describe('formatadores', () => {
  it('formata moeda BRL sem centavos por padrão', () => {
    expect(brl(187)).toBe('R$ 187');
    expect(brl(0)).toBe('R$ 0');
  });

  it('formata moeda BRL com centavos sob demanda', () => {
    expect(brl(187.5, { centavos: true })).toBe('R$ 187,50');
  });

  it('formata volume em metros cúbicos (m³)', () => {
    expect(m3(14)).toBe('14 m³');
    expect(m3(14.5)).toBe('14,5 m³');
  });

  it('formata porcentagem pt-BR', () => {
    expect(porcentagem(6.8)).toBe('6,8%');
  });

  it('converte ano-mês para nome do mês', () => {
    expect(nomeMes('2026-08')).toBe('agosto');
    expect(nomeMes('2026-01')).toBe('janeiro');
  });

  it('formata data curta', () => {
    expect(dataCurta('2026-08-25')).toBe('25 ago');
  });
});
