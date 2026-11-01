import { AppFooter } from '../components/AppFooter';
import { DecompBar } from '../components/DecompBar';
import { Logo } from '../components/Logo';
import { decompor } from '../core/decomposicao';
import { h, s } from '../core/dom';
import { brl } from '../core/format';
import { router } from '../core/router';
import { store } from '../core/store';
import { api } from '../services/api';

export function PaginaLogin(): HTMLElement {
  let inputEmail: HTMLInputElement;
  let inputSenha: HTMLInputElement;
  let formError: HTMLElement;

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    formError.style.display = 'none';

    const email = inputEmail.value.trim();
    if (!email) {
      formError.textContent = 'Informe o seu e-mail.';
      formError.style.display = 'block';
      return;
    }

    try {
      await api.login({ email, senha: inputSenha.value });
      await store.carregarSessao();
      store.addToast(`Bem-vindo ao Crivo!`, 'sucesso');
      router.navigate('/app/resultado');
    } catch {
      formError.textContent = 'Não foi possível entrar. Verifique seu e-mail e senha.';
      formError.style.display = 'block';
    }
  };

  // ── Painel Esquerdo (Brand) ──────────────────────────────
  const demoDecomp = decompor({ valorPago: 187, esperado: 165, reajusteTarifa: 8 });

  const painelEsquerdo = h(
    'div',
    { class: 'auth__panel' },
    h(
      'div',
      null,
      Logo({ variant: 'white', height: 40, showLink: false }),
      h('h2', { class: 'auth__headline', style: 'margin-top: var(--space-8);' }, 'Entenda por que a conta subiu.'),
      h(
        'p',
        { class: 'auth__lead' },
        'O Crivo separa o reajuste de tarifa do uso real do seu condomínio ou escola. Você descobre o vazamento antes do susto no boleto.',
      ),
    ),
    h(
      'div',
      { class: 'auth__demo' },
      h(
        'div',
        { style: 'display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-2);' },
        h('span', { style: 'font-size: var(--text-xs); color: var(--nevoa-400); text-transform: uppercase; letter-spacing: 0.05em;' }, 'Agosto · Gestão Hídrica'),
        h('span', { class: 'auth__demo-value' }, brl(187)),
      ),
      DecompBar({
        decomposicao: demoDecomp,
        tamanho: 'sm',
        mostrarLegenda: true,
        estiloLegenda: 'inline',
      }),
    ),
    h(
      'div',
      { class: 'auth__credit' },
      'UniEVANGÉLICA · Bacharelado em IA · 3º Período · 2026/2',
    ),
    s(
      'svg',
      { class: 'waves', viewBox: '0 0 1200 400', preserveAspectRatio: 'none' },
      s('path', { d: 'M0,150 C300,50 600,250 900,120 C1050,60 1150,180 1200,150 L1200,400 L0,400 Z' }),
      s('path', { d: 'M0,200 C250,120 550,280 850,160 C1000,100 1120,240 1200,200 L1200,400 L0,400 Z' }),
      s('path', { d: 'M0,260 C200,200 500,320 800,220 C950,170 1100,280 1200,260 L1200,400 L0,400 Z' }),
    ),
  );

  // ── Painel Direito (Formulário) ──────────────────────────
  const formWrap = h(
    'div',
    { class: 'auth__form-wrap' },
    h(
      'div',
      { class: 'auth__form' },
      h('h1', null, 'Acesse sua conta'),
      h('p', null, 'Informe suas credenciais para gerenciar seus edifícios.'),
      (formError = h('div', { class: 'form-error', style: 'display: none;' })),
      h(
        'form',
        { onSubmit: handleSubmit },
        h(
          'div',
          { class: 'field' },
          h('label', { class: 'field__label', for: 'login-email' }, 'E-mail profissional'),
          (inputEmail = h('input', {
            id: 'login-email',
            type: 'email',
            class: 'input',
            placeholder: 'seu.email@exemplo.com',
            value: 'samuel@crivo.ia',
            required: true,
          })),
        ),
        h(
          'div',
          { class: 'field', style: 'margin-top: var(--space-4);' },
          h('label', { class: 'field__label', for: 'login-senha' }, 'Senha'),
          (inputSenha = h('input', {
            id: 'login-senha',
            type: 'password',
            class: 'input',
            placeholder: '••••••••',
            value: 'demo123',
            required: true,
          })),
        ),
        h(
          'div',
          { style: 'margin-top: var(--space-6);' },
          h('button', { type: 'submit', class: 'btn btn--block btn--lg' }, 'Entrar no sistema'),
        ),
      ),
      h(
        'p',
        { class: 'auth__switch' },
        'Ainda não tem conta? ',
        h('a', { href: '/criar-conta' }, 'Criar conta'),
      ),
    ),
  );

  return h(
    'div',
    { class: 'auth-wrapper' },
    h('div', { class: 'auth' }, painelEsquerdo, formWrap),
    AppFooter(),
  );
}
