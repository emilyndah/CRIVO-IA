/**
 * Helper mínimo para criar DOM de forma SEGURA.
 *
 * - Texto sempre vira TextNode (sem interpretação de HTML) → previne XSS.
 * - Props perigosas (innerHTML, outerHTML, srcdoc) são bloqueadas.
 * - href/src só aceitam URLs relativas, http(s), mailto e tel.
 */

export type Child = Node | string | number | false | null | undefined | Child[];

type EventHandler = (event: Event) => void;

export type Props = {
  class?: string | false | null;
  dataset?: Record<string, string>;
  style?: string;
  [key: string]: unknown;
};

const BLOCKED_PROPS = new Set(['innerHTML', 'outerHTML', 'srcdoc']);
const DOM_PROPERTIES = new Set(['value', 'checked', 'disabled', 'selected', 'indeterminate']);
const URL_ATTRS = new Set(['href', 'src', 'action', 'formaction']);
const SAFE_URL = /^(?:\/(?!\/)|\.{0,2}\/|#|https?:|mailto:|tel:)/i;

export function isSafeUrl(url: string): boolean {
  return SAFE_URL.test(url.trim());
}

function applyProps(el: Element, props: Props): void {
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false) continue;

    if (BLOCKED_PROPS.has(key)) {
      throw new Error(`[dom] A prop "${key}" é bloqueada por segurança.`);
    }

    if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value as EventHandler);
      continue;
    }

    if (key === 'class') {
      el.setAttribute('class', String(value));
      continue;
    }

    if (key === 'dataset' && el instanceof HTMLElement) {
      Object.assign(el.dataset, value);
      continue;
    }

    if (DOM_PROPERTIES.has(key) && key in el) {
      (el as unknown as Record<string, unknown>)[key] = value;
      continue;
    }

    const str = value === true ? '' : String(value);
    if (URL_ATTRS.has(key) && !isSafeUrl(str)) {
      console.warn(`[dom] URL insegura bloqueada em "${key}":`, str);
      continue;
    }
    el.setAttribute(key, str);
  }
}

function appendChildren(parent: Node, children: Child[]): void {
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    if (Array.isArray(child)) {
      appendChildren(parent, child);
    } else if (child instanceof Node) {
      parent.appendChild(child);
    } else {
      parent.appendChild(document.createTextNode(String(child)));
    }
  }
}

/** Cria um elemento HTML. */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props?: Props | null,
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (props) applyProps(el, props);
  appendChildren(el, children);
  return el;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Cria um elemento SVG (usado por ícones e decorações). */
export function s<K extends keyof SVGElementTagNameMap>(
  tag: K,
  props?: Props | null,
  ...children: Child[]
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  if (props) applyProps(el, props);
  appendChildren(el, children);
  return el;
}

/** Substitui todo o conteúdo de um elemento. */
export function mount(target: Element, ...children: Child[]): void {
  target.replaceChildren();
  appendChildren(target, children);
}

export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Executa no próximo frame (útil para disparar transições CSS após montar). */
export const nextFrame = (fn: () => void): void => {
  requestAnimationFrame(() => requestAnimationFrame(fn));
};
