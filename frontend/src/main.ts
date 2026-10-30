// Tipografia self-hosted (sem chamadas a servidores de terceiros)
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';

// Sistema de estilos do Crivo
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/layout.css';

import { AppShell } from './components/AppShell';
import { initToastRegion } from './components/Toast';
import { router } from './core/router';
import { store } from './core/store';
import { PaginaAlertas } from './pages/alertas';
import { PaginaCadastro } from './pages/cadastro';
import { PaginaHistorico } from './pages/historico';
import { PaginaLeitura } from './pages/leitura';
import { PaginaLogin } from './pages/login';
import { PaginaResultado } from './pages/resultado';
import { PaginaUnidades } from './pages/unidades';

const appRoot = document.getElementById('app');
if (!appRoot) {
  throw new Error('Elemento raiz #app não encontrado no documento.');
}

// Inicializa o contêiner de toasts
initToastRegion();
router.setTarget(appRoot);

// Helper para envolver páginas protegidas com o AppShell
async function wrapWithShell(
  path: string,
  pageFactory: () => Promise<HTMLElement> | HTMLElement,
): Promise<HTMLElement> {
  if (!store.usuario) {
    window.history.replaceState({}, '', '/entrar');
    return PaginaLogin();
  }
  const page = await pageFactory();
  return AppShell({ activePath: path, content: page });
}

// ── Configuração das Rotas ─────────────────────────────────
router
  .on('/', () => {
    if (store.usuario) {
      window.history.replaceState({}, '', '/app/resultado');
      return wrapWithShell('/app/resultado', PaginaResultado);
    }
    window.history.replaceState({}, '', '/entrar');
    return PaginaLogin();
  })
  .on('/entrar', () => PaginaLogin())
  .on('/criar-conta', () => PaginaCadastro())
  .on('/app', () => wrapWithShell('/app/resultado', PaginaResultado))
  .on('/app/resultado', () => wrapWithShell('/app/resultado', PaginaResultado))
  .on('/app/leitura', () => wrapWithShell('/app/leitura', PaginaLeitura))
  .on('/app/unidades', () => wrapWithShell('/app/unidades', PaginaUnidades))
  .on('/app/alertas', () => wrapWithShell('/app/alertas', PaginaAlertas))
  .on('/app/historico', () => wrapWithShell('/app/historico', PaginaHistorico));

// Inicialização da aplicação
async function iniciar() {
  await store.carregarSessao();
  const path = window.location.pathname;
  await router.resolve(path);
}

iniciar().catch((err) => {
  console.error('[Crivo] Erro fatal durante a inicialização:', err);
});
