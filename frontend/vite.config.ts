/// <reference types="vitest/config" />
import { defineConfig, loadEnv, type Plugin } from 'vite';

/**
 * Injeta a origem da API na Content-Security-Policy do index.html.
 * Assim o `connect-src` libera apenas o próprio site e o backend FastAPI configurado.
 */
function cspApiOrigin(apiUrl: string | undefined): Plugin {
  let origin = '';
  if (apiUrl) {
    try {
      origin = new URL(apiUrl).origin;
    } catch {
      console.warn(`[crivo] VITE_API_URL inválida: "${apiUrl}". Ignorando na CSP.`);
    }
  }
  return {
    name: 'crivo-csp-api-origin',
    transformIndexHtml: (html) => html.replace('__API_ORIGIN__', origin),
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [cspApiOrigin(env.VITE_API_URL)],
    server: { port: 5173, strictPort: true },
    preview: { port: 4173 },
    build: {
      target: 'es2022',
      sourcemap: false,
    },
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts'],
    },
  };
});
