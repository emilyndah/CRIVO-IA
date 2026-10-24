import type {
  AlertaCompleto,
  HistoricoItem,
  Predio,
  ResultadoMes,
  Unidade,
  Usuario,
} from '../types';

export const MOCK_USUARIO: Usuario = {
  id: 'usr-1',
  nome: 'Samuel Faleiro',
  email: 'samuel@crivo.ia',
  cargo: 'Síndico / Gestor Predial',
};

export const MOCK_PREDIO: Predio = {
  id: 'prd-1',
  nome: 'Condomínio Exemplo',
  tipo: 'condominio',
  cidade: 'Anápolis',
  estado: 'GO',
  quantidadeUnidades: 64,
  tarifaVigenteAgua: 10.0, // R$ 10,00 por m³ (Saneago)
  criadoEm: '2026-06-01T08:00:00Z',
};

export const MOCK_RESULTADO_AGOSTO: ResultadoMes = {
  mes: '2026-08',
  valorPago: 187,
  esperado: 165,
  reajusteTarifa: 8,
  usoAcimaDoEsperado: 14,
  mesesSeguidosAlta: 3,
  mensagem:
    'Sua conta subiu R$ 22. R$ 8 foi tarifa, R$ 14 foi uso. É o 3º mês seguido de alta, vale checar vazamento.',
  tomMensagem: 'alerta',
  unidadesParecidas: [
    {
      nome: 'Apto 101',
      valorPago: 160,
    },
    {
      nome: 'Apto 202',
      valorPago: 171,
    },
    {
      nome: 'Apto 302, acima das parecidas',
      valorPago: 187,
      destaque: true,
      nota: 'Dados de exemplo.',
    },
  ],
  alertasDesteMes: [
    {
      id: 'alt-1',
      titulo: 'Uso alto 3 meses seguidos',
      descricao: 'Água, desde junho. Possível vazamento.',
      tipo: 'alta',
      criadoEm: '2026-08-25T10:00:00Z',
    },
    {
      id: 'alt-2',
      titulo: 'Reajuste de tarifa aplicado',
      descricao: 'Já considerado no cálculo deste mês.',
      tipo: 'tarifa',
      criadoEm: '2026-08-01T00:00:00Z',
    },
  ],
};

export const MOCK_UNIDADES: Unidade[] = [
  { id: 'und-101', nome: 'Apto 101', ocupantesEstimados: 3, areaM2: 68, consumoUltimoMes: 160 },
  { id: 'und-102', nome: 'Apto 102', ocupantesEstimados: 2, areaM2: 68, consumoUltimoMes: 148 },
  { id: 'und-201', nome: 'Apto 201', ocupantesEstimados: 4, areaM2: 75, consumoUltimoMes: 175 },
  { id: 'und-202', nome: 'Apto 202', ocupantesEstimados: 3, areaM2: 68, consumoUltimoMes: 171 },
  { id: 'und-301', nome: 'Apto 301', ocupantesEstimados: 2, areaM2: 68, consumoUltimoMes: 155 },
  {
    id: 'und-302',
    nome: 'Apto 302',
    ocupantesEstimados: 3,
    areaM2: 68,
    consumoUltimoMes: 187,
    destaque: true,
  },
  { id: 'und-401', nome: 'Apto 401', ocupantesEstimados: 1, areaM2: 50, consumoUltimoMes: 112 },
  { id: 'und-402', nome: 'Apto 402', ocupantesEstimados: 2, areaM2: 68, consumoUltimoMes: 145 },
  {
    id: 'und-area-comum',
    nome: 'Área Comum (Churrasqueira/Jardim)',
    ocupantesEstimados: 0,
    areaM2: 240,
    consumoUltimoMes: 340,
  },
];

export const MOCK_ALERTAS: AlertaCompleto[] = [
  {
    id: 'alt-1',
    titulo: 'Uso alto 3 meses seguidos',
    descricao: 'Água, desde junho. Possível vazamento.',
    tipo: 'alta',
    unidade: 'Apto 302',
    status: 'pendente',
    impactoEstimado: '+R$ 14 no mês',
    criadoEm: '2026-08-25T10:00:00Z',
  },
  {
    id: 'alt-2',
    titulo: 'Reajuste de tarifa aplicado',
    descricao: 'Reajuste AGR/Saneago homologado. Já considerado no cálculo deste mês.',
    tipo: 'tarifa',
    status: 'lido',
    impactoEstimado: '+R$ 8 na fatura',
    criadoEm: '2026-08-01T00:00:00Z',
  },
  {
    id: 'alt-3',
    titulo: 'Vazão noturna anômala detectada',
    descricao:
      'Consumo contínuo de 48 L/h identificado na madrugada entre 02h e 05h (Baseline + 2σ).',
    tipo: 'noturno',
    unidade: 'Área Comum (Churrasqueira/Jardim)',
    status: 'pendente',
    impactoEstimado: '~350 litros de água desperdiçados',
    criadoEm: '2026-08-18T06:15:00Z',
  },
  {
    id: 'alt-4',
    titulo: 'Aumento corrigido por temperatura',
    descricao:
      'Semana com pico de 33°C em Anápolis. O consumo esperado foi ajustado e compensado pelo modelo.',
    tipo: 'info',
    status: 'lido',
    criadoEm: '2026-08-10T14:30:00Z',
  },
];

export const MOCK_HISTORICO: HistoricoItem[] = [
  {
    mes: '2026-08',
    valorPago: 187,
    esperado: 165,
    reajusteTarifa: 8,
    usoAcima: 14,
    variacaoMesAnteriorPct: 6.8,
    alertaAtivo: true,
  },
  {
    mes: '2026-07',
    valorPago: 175,
    esperado: 162,
    reajusteTarifa: 5,
    usoAcima: 8,
    variacaoMesAnteriorPct: 4.1,
    alertaAtivo: true,
  },
  {
    mes: '2026-06',
    valorPago: 168,
    esperado: 160,
    reajusteTarifa: 0,
    usoAcima: 8,
    variacaoMesAnteriorPct: 5.0,
    alertaAtivo: true,
  },
  {
    mes: '2026-05',
    valorPago: 160,
    esperado: 160,
    reajusteTarifa: 0,
    usoAcima: 0,
    variacaoMesAnteriorPct: -1.2,
    alertaAtivo: false,
  },
  {
    mes: '2026-04',
    valorPago: 162,
    esperado: 160,
    reajusteTarifa: 0,
    usoAcima: 2,
    variacaoMesAnteriorPct: 1.2,
    alertaAtivo: false,
  },
  {
    mes: '2026-03',
    valorPago: 158,
    esperado: 160,
    reajusteTarifa: 0,
    usoAcima: 0,
    variacaoMesAnteriorPct: 0.0,
    alertaAtivo: false,
  },
];
