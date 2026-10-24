/**
 * Tipagens do domínio do Crivo (Exclusivo para Gestão Hídrica).
 */

export type TipoPredio = 'condominio' | 'escola' | 'saude' | 'comercio';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
}

export interface Predio {
  id: string;
  nome: string;
  tipo: TipoPredio;
  cidade: string;
  estado: string;
  quantidadeUnidades: number;
  tarifaVigenteAgua: number; // R$/m³ (ex: Saneago)
  criadoEm: string;
}

export interface Unidade {
  id: string;
  nome: string; // Ex: "Apto 302", "Bloco A - Refeitório"
  ocupantesEstimados: number;
  areaM2?: number;
  consumoUltimoMes?: number; // em R$
  destaque?: boolean; // Para destacar na lista de comparativo
}

export interface UnidadeComparada {
  nome: string;
  valorPago: number;
  destaque?: boolean;
  nota?: string;
}

export interface Leitura {
  id: string;
  unidadeId?: string;
  data: string; // AAAA-MM-DD
  valorPago: number; // R$
  volumeM3?: number; // m³
  observacoes?: string;
  criadoEm: string;
}

export interface ResultadoMes {
  mes: string; // AAAA-MM
  valorPago: number;
  esperado: number;
  reajusteTarifa: number;
  usoAcimaDoEsperado: number;
  mesesSeguidosAlta: number;
  mensagem: string;
  tomMensagem: 'alerta' | 'ok' | 'neutro';
  unidadesParecidas: UnidadeComparada[];
  alertasDesteMes: AlertaResumo[];
}

export interface AlertaResumo {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'alta' | 'tarifa' | 'noturno' | 'info';
  criadoEm: string;
}

export interface AlertaCompleto extends AlertaResumo {
  unidade?: string;
  status: 'pendente' | 'lido' | 'resolvido';
  impactoEstimado?: string;
}

export interface HistoricoItem {
  mes: string; // AAAA-MM
  valorPago: number;
  esperado: number;
  reajusteTarifa: number;
  usoAcima: number;
  variacaoMesAnteriorPct?: number;
  alertaAtivo?: boolean;
}

export interface NovaLeituraPayload {
  data: string;
  valorPago: number;
  volumeM3?: number;
  unidadeId?: string;
  observacoes?: string;
}

export interface LoginPayload {
  email: string;
  senha?: string;
}

export interface CriarContaPayload {
  nome: string;
  email: string;
  senha?: string;
  nomePredio: string;
  tipoPredio: TipoPredio;
}
