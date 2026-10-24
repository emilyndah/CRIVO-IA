import { mount } from './dom';

export type RouteHandler = (params: Record<string, string>) => HTMLElement | Promise<HTMLElement>;

interface Route {
  pattern: RegExp;
  paramNames: string[];
  handler: RouteHandler;
}

class Router {
  private routes: Route[] = [];
  private currentPath = '';
  private target: HTMLElement | null = null;
  private isResolving = false;

  constructor() {
    window.addEventListener('popstate', () => {
      this.resolve(window.location.pathname);
    });

    // Intercepta cliques em links internos
    document.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Ignora links externos, âncoras locais simples, mailto, tel
      if (
        href.startsWith('http') ||
        href.startsWith('//') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        target.getAttribute('target') === '_blank'
      ) {
        return;
      }

      e.preventDefault();
      this.navigate(href);
    });
  }

  public setTarget(target: HTMLElement): void {
    this.target = target;
  }

  public on(path: string, handler: RouteHandler): this {
    const paramNames: string[] = [];
    const escaped = path
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/:([a-zA-Z0-9_]+)/g, (_, paramName) => {
        paramNames.push(paramName);
        return '([^/]+)';
      });

    this.routes.push({
      pattern: new RegExp(`^${escaped}$`),
      paramNames,
      handler,
    });
    return this;
  }

  public navigate(path: string): void {
    if (this.currentPath === path) return;
    window.history.pushState({}, '', path);
    this.resolve(path);
  }

  public replace(path: string): void {
    window.history.replaceState({}, '', path);
    this.resolve(path);
  }

  public async resolve(path: string): Promise<HTMLElement | null> {
    if (this.isResolving) {
      return null;
    }
    this.isResolving = true;
    this.currentPath = path;

    try {
      for (const route of this.routes) {
        const match = path.match(route.pattern);
        if (match) {
          const params: Record<string, string> = {};
          route.paramNames.forEach((name, index) => {
            params[name] = match[index + 1] || '';
          });

          const el = await route.handler(params);
          if (this.target && el) {
            mount(this.target, el);
            window.scrollTo(0, 0);
          }
          return el;
        }
      }

      console.warn('[Router] Rota não encontrada:', path);
      return null;
    } finally {
      this.isResolving = false;
    }
  }

  public getCurrentPath(): string {
    return this.currentPath || window.location.pathname;
  }
}

export const router = new Router();
