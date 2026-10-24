/** Formatadores pt-BR. Valores em reais e m³ usam IBM Plex Mono na interface. */

const brlInteiro = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const brlCentavos = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

/** Normaliza o espaço especial do Intl para espaço comum (evita surpresas em testes/cópia). */
const normalizar = (s: string): string => s.replace(/\u00a0|\u202f/g, ' ');

/** "R$ 187" (ou "R$ 187,40" com centavos). */
export function brl(valor: number, opts: { centavos?: boolean } = {}): string {
  const fmt = opts.centavos ? brlCentavos : brlInteiro;
  return normalizar(fmt.format(valor));
}

/** "+R$ 22" / "−R$ 5" / "R$ 0" */
export function brlComSinal(valor: number): string {
  const arred = Math.round(valor);
  if (arred === 0) return brl(0);
  return `${arred > 0 ? '+' : '−'}${brl(Math.abs(arred))}`;
}

/** "14 m³" / "14,5 m³" */
export function m3(valor: number): string {
  return `${normalizar(numero.format(valor))} m³`;
}

export function porcentagem(valor: number): string {
  return `${normalizar(numero.format(valor))}%`;
}

const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
] as const;

/** Recebe "AAAA-MM" e devolve [ano, índice do mês 0-11]. */
function parseMes(mes: string): [number, number] {
  const [ano, m] = mes.split('-').map(Number);
  if (!ano || !m || m < 1 || m > 12) throw new Error(`Mês inválido: ${mes}`);
  return [ano, m - 1];
}

/** "2026-08" → "agosto" */
export function nomeMes(mes: string): string {
  return MESES[parseMes(mes)[1]] ?? mes;
}

/** "2026-08" → "ago" */
export function mesCurto(mes: string): string {
  return nomeMes(mes).slice(0, 3);
}

/** "2026-08" → "agosto de 2026" */
export function mesAno(mes: string): string {
  const [ano] = parseMes(mes);
  return `${nomeMes(mes)} de ${ano}`;
}

/** Soma (ou subtrai) meses de "AAAA-MM". */
export function deslocarMes(mes: string, delta: number): string {
  const [ano, idx] = parseMes(mes);
  const d = new Date(Date.UTC(ano, idx + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** "2026-08-12" → "12 ago" */
export function dataCurta(iso: string): string {
  const [ano, mes, dia] = iso.slice(0, 10).split('-');
  if (!ano || !mes || !dia) return iso;
  return `${Number(dia)} ${mesCurto(`${ano}-${mes}`)}`;
}

/** Data local de hoje em "AAAA-MM-DD" (para inputs type=date). */
export function hojeISO(): string {
  const d = new Date();
  const off = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - off).toISOString().slice(0, 10);
}

/** "1º", "2º", "3º"… */
export const ordinal = (n: number): string => `${n}º`;

/** Primeira letra maiúscula. */
export const capitalizar = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
