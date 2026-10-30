import { decompor, gerarMensagem } from '../core/decomposicao';
import {
  MOCK_ALERTAS,
  MOCK_HISTORICO,
  MOCK_PREDIO,
  MOCK_RESULTADO_AGOSTO,
  MOCK_UNIDADES,
  MOCK_USUARIO,
} from './mock/data';
import type {
  AlertaCompleto,
  CriarContaPayload,
  HistoricoItem,
  LoginPayload,
  NovaLeituraPayload,
  Predio,
  ResultadoMes,
  Unidade,
  Usuario,
} from './types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function delay(ms = 120): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Estado em memória para persistência da sessão mock durante a navegação
let sessaoAtual: Usuario | null = MOCK_USUARIO;
let predioAtual: Predio = { ...MOCK_PREDIO };
const unidadesAtuais: Unidade[] = [...MOCK_UNIDADES];
const alertasAtuais: AlertaCompleto[] = [...MOCK_ALERTAS];
const leiturasSalvas: NovaLeituraPayload[] = [];

/**
 * Cliente de API com alternância transparente entre Mock e FastAPI real.
 */
export const api = {
  // ── Sessão / Auth ──────────────────────────────────────
  async obterSessao(): Promise<Usuario | null> {
    if (USE_MOCK) {
      await delay(60);
      return sessaoAtual;
    }
    const res = await fetch(`${API_URL}/api/v1/auth/me`, { credentials: 'include' });
    if (!res.ok) return null;
    return res.json();
  },

  async login(payload: LoginPayload): Promise<Usuario> {
    if (USE_MOCK) {
      await delay(180);
      sessaoAtual = {
        ...MOCK_USUARIO,
        email: payload.email,
      };
      return sessaoAtual;
    }
    const res = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Credenciais inválidas');
    return res.json();
  },

  async criarConta(payload: CriarContaPayload): Promise<Usuario> {
    if (USE_MOCK) {
      await delay(200);
      sessaoAtual = {
        id: 'usr-novo',
        nome: payload.nome,
        email: payload.email,
        cargo: 'Gestor Predial',
      };
      predioAtual = {
        id: 'prd-novo',
        nome: payload.nomePredio,
        tipo: payload.tipoPredio,
        cidade: 'Anápolis',
        estado: 'GO',
        quantidadeUnidades: 1,
        tarifaVigenteAgua: 10.0,
        criadoEm: new Date().toISOString(),
      };
      return sessaoAtual;
    }
    const res = await fetch(`${API_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Erro ao criar conta');
    return res.json();
  },

  async logout(): Promise<void> {
    if (USE_MOCK) {
      await delay(60);
      sessaoAtual = null;
      return;
    }
    await fetch(`${API_URL}/api/v1/auth/logout`, { method: 'POST', credentials: 'include' });
  },

  // ── Prédio ─────────────────────────────────────────────
  async obterPredio(): Promise<Predio> {
    if (USE_MOCK) {
      await delay(50);
      return predioAtual;
    }
    const res = await fetch(`${API_URL}/api/v1/predio`, { credentials: 'include' });
    if (!res.ok) throw new Error('Não foi possível carregar os dados do prédio');
    return res.json();
  },

  async atualizarPredio(dados: Partial<Predio>): Promise<Predio> {
    if (USE_MOCK) {
      await delay(100);
      predioAtual = { ...predioAtual, ...dados };
      return predioAtual;
    }
    const res = await fetch(`${API_URL}/api/v1/predio`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Erro ao atualizar dados do prédio');
    return res.json();
  },

  // ── Resultado do Mês ───────────────────────────────────
  async obterResultadoMes(mes = '2026-08'): Promise<ResultadoMes> {
    if (USE_MOCK) {
      await delay(100);
      if (mes === '2026-08') {
        return MOCK_RESULTADO_AGOSTO;
      }
      // Se for outro mês, sintetiza a partir do histórico
      const hist = MOCK_HISTORICO.find((h) => h.mes === mes);
      const valor = hist ? hist.valorPago : 160;
      const esp = hist ? hist.esperado : 160;
      const tar = hist ? hist.reajusteTarifa : 0;
      const d = decompor({ valorPago: valor, esperado: esp, reajusteTarifa: tar });
      const msg = gerarMensagem(d, d.usoAcima > 0 ? 1 : 0);

      return {
        mes,
        valorPago: valor,
        esperado: esp,
        reajusteTarifa: tar,
        usoAcimaDoEsperado: d.usoAcima,
        mesesSeguidosAlta: d.usoAcima > 0 ? 1 : 0,
        mensagem: msg.texto,
        tomMensagem: msg.tom,
        unidadesParecidas: MOCK_RESULTADO_AGOSTO.unidadesParecidas,
        alertasDesteMes: [],
      };
    }
    const res = await fetch(`${API_URL}/api/v1/resultado/${mes}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Erro ao buscar resultado do mês');
    return res.json();
  },

  // ── Lançamento de Leitura ──────────────────────────────
  async lancarLeitura(payload: NovaLeituraPayload): Promise<{ ok: boolean; id: string }> {
    if (USE_MOCK) {
      await delay(200);
      leiturasSalvas.push(payload);

      // Atualiza o valor pago se a leitura for do mês corrente
      if (payload.data.startsWith('2026-08')) {
        MOCK_RESULTADO_AGOSTO.valorPago = payload.valorPago;
        const d = decompor({
          valorPago: payload.valorPago,
          esperado: MOCK_RESULTADO_AGOSTO.esperado,
          reajusteTarifa: MOCK_RESULTADO_AGOSTO.reajusteTarifa,
        });
        MOCK_RESULTADO_AGOSTO.usoAcimaDoEsperado = d.usoAcima;
        const msg = gerarMensagem(d, MOCK_RESULTADO_AGOSTO.mesesSeguidosAlta);
        MOCK_RESULTADO_AGOSTO.mensagem = msg.texto;
        MOCK_RESULTADO_AGOSTO.tomMensagem = msg.tom;
      }

      return { ok: true, id: `lei-${Date.now()}` };
    }
    const res = await fetch(`${API_URL}/api/v1/leituras`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Erro ao salvar leitura');
    return res.json();
  },

  // ── Unidades ───────────────────────────────────────────
  async listarUnidades(): Promise<Unidade[]> {
    if (USE_MOCK) {
      await delay(80);
      return [...unidadesAtuais];
    }
    const res = await fetch(`${API_URL}/api/v1/unidades`, { credentials: 'include' });
    if (!res.ok) throw new Error('Erro ao listar unidades');
    return res.json();
  },

  async criarUnidade(unidade: Omit<Unidade, 'id'>): Promise<Unidade> {
    if (USE_MOCK) {
      await delay(120);
      const nova: Unidade = {
        id: `und-${Date.now()}`,
        ...unidade,
      };
      unidadesAtuais.push(nova);
      predioAtual.quantidadeUnidades = unidadesAtuais.length;
      return nova;
    }
    const res = await fetch(`${API_URL}/api/v1/unidades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(unidade),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Erro ao criar unidade');
    return res.json();
  },

  async excluirUnidade(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay(100);
      const idx = unidadesAtuais.findIndex((u) => u.id === id);
      if (idx !== -1) unidadesAtuais.splice(idx, 1);
      predioAtual.quantidadeUnidades = unidadesAtuais.length;
      return;
    }
    await fetch(`${API_URL}/api/v1/unidades/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  },

  // ── Alertas ────────────────────────────────────────────
  async listarAlertas(): Promise<AlertaCompleto[]> {
    if (USE_MOCK) {
      await delay(80);
      return [...alertasAtuais];
    }
    const res = await fetch(`${API_URL}/api/v1/alertas`, { credentials: 'include' });
    if (!res.ok) throw new Error('Erro ao buscar alertas');
    return res.json();
  },

  async marcarAlertaLido(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay(50);
      const al = alertasAtuais.find((a) => a.id === id);
      if (al) al.status = 'lido';
      return;
    }
    await fetch(`${API_URL}/api/v1/alertas/${id}/lido`, {
      method: 'PATCH',
      credentials: 'include',
    });
  },

  // ── Histórico ──────────────────────────────────────────
  async listarHistorico(): Promise<HistoricoItem[]> {
    if (USE_MOCK) {
      await delay(100);
      return [...MOCK_HISTORICO];
    }
    const res = await fetch(`${API_URL}/api/v1/historico`, { credentials: 'include' });
    if (!res.ok) throw new Error('Erro ao carregar histórico');
    return res.json();
  },
};
