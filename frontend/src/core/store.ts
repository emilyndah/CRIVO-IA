import { api } from '../services/api';
import type { Predio, Usuario } from '../services/types';

export interface ToastItem {
  id: string;
  mensagem: string;
  tipo?: 'sucesso' | 'erro' | 'info';
}

type Listener = () => void;

class Store {
  public usuario: Usuario | null = null;
  public predio: Predio | null = null;
  public mesAtivo = '2026-08';
  public alertasNaoLidos = 2;
  public toasts: ToastItem[] = [];

  private listeners = new Set<Listener>();

  public subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  public notify(): void {
    this.listeners.forEach((fn) => fn());
  }

  public async carregarSessao(): Promise<void> {
    try {
      this.usuario = await api.obterSessao();
      if (this.usuario) {
        this.predio = await api.obterPredio();
        const alertas = await api.listarAlertas();
        this.alertasNaoLidos = alertas.filter((a) => a.status === 'pendente').length;
      }
    } catch (e) {
      console.error('[Store] Falha ao carregar sessão:', e);
      this.usuario = null;
    }
    this.notify();
  }

  public setMesAtivo(mes: string): void {
    this.mesAtivo = mes;
    this.notify();
  }

  public addToast(mensagem: string, tipo: 'sucesso' | 'erro' | 'info' = 'sucesso'): void {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const toast: ToastItem = { id, mensagem, tipo };
    this.toasts.push(toast);
    this.notify();

    setTimeout(() => {
      this.removeToast(id);
    }, 4000);
  }

  public removeToast(id: string): void {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }
}

export const store = new Store();
