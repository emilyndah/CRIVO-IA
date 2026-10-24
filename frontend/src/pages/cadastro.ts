import { Logo } from '../components/Logo';
import { h, s } from '../core/dom';
import { icon } from '../core/icons';
import { router } from '../core/router';
import { store } from '../core/store';
import { api } from '../services/api';
import type { TipoPredio } from '../services/types';

export function PaginaCadastro(): HTMLElement {
  let inputNome: HTMLInputElement;
  let inputEmail: HTMLInputElement;
  let inputSenha: HTMLInputElement;
  let inputPredio: HTMLInputElement;
  let tipoSelecionado: TipoPredio = 'condominio';
  let formError: HTMLElement;

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    formError.style.display = 'none';

    const nome = inputNome.value.trim();
    const email = inputEmail.value.trim();
    const nomePredio = inputPredio.value.trim();

    if (!nome || !email || !nomePredio) {
      formError.textContent = 'Por favor, preencha todos os campos obrigatórios.';
      formError.style.display = 'block';
      return;
    }

    try {
      await api.criarConta({
        nome,
        email,
        senha: inputSenha.value,
        nomePredio,
        tipoPredio: tipoSelecionado,
      });
      await store.carregarSessao();
      store.addToast(`Conta criada com sucesso! Bem-vindo, ${nome}.`, 'sucesso');
      router.navigate('/app/resultado');
    } catch {
      formError.textContent = 'Erro ao criar conta. Tente novamente.';
      formError.style.display = 'block';
    }
  };

  // ── Painel Esquerdo (Brand) ──────────────────────────────
  const painelEsquerdo = h(
    'div',
    { class: 'auth__panel' },
    h(
      'div',
      null,
      Logo({ variant: 'white', height: 40, showLink: false }),
      h(
        'h2',
        { class: 'auth__headline', style: 'margin-top: var(--space-8);' },
        'Comece com o valor da próxima conta.',
      ),
      h(
        'p',
        { class: 'auth__lead' },
        'Crie sua conta, cadastre o imóvel e receba o primeiro resultado de diagnóstico hídrico em poucos segundos.',
      ),
    ),
    h(
      'div',
      { class: 'auth__demo' },
      h(
        'h3',
        { style: 'font-size: var(--text-md); color: var(--branco); margin-bottom: var(--space-2);' },
        'Alinhado aos ODS da ONU',
      ),
      h(
        'p',
        { style: 'font-size: var(--text-xs); color: var(--nevoa-400); line-height: 1.6;' },
        'ODS 6 (Água Potável e Eficiência) · ODS 11 (Cidades Sustentáveis). Menos desperdício e mais transparência.',
      ),
    ),
    h('div', { class: 'auth__credit' }, 'UniEVANGÉLICA · Anápolis / GO · 2026'),
    s(
      'svg',
      { class: 'waves', viewBox: '0 0 1200 400', preserveAspectRatio: 'none' },
      s('path', { d: 'M0,150 C300,50 600,250 900,120 C1050,60 1150,180 1200,150 L1200,400 L0,400 Z' }),
      s('path', { d: 'M0,200 C250,120 550,280 850,160 C1000,100 1120,240 1200,200 L1200,400 L0,400 Z' }),
    ),
  );

  // ── Seletor de Tipologia ─────────────────────────────────
  const tipologias: { tipo: TipoPredio; titulo: string; ic: 'condominio' | 'escola' | 'saude' | 'comercio' }[] = [
    { tipo: 'condominio', titulo: 'Condomínio', ic: 'condominio' },
    { tipo: 'escola', titulo: 'Escola', ic: 'escola' },
    { tipo: 'saude', titulo: 'Posto de Saúde', ic: 'saude' },
    { tipo: 'comercio', titulo: 'Empresa / Loja', ic: 'comercio' },
  ];

  const cardsTipologia = tipologias.map((t) => {
    const radio = h('input', {
      type: 'radio',
      name: 'tipoPredio',
      value: t.tipo,
      checked: t.tipo === tipoSelecionado,
      onChange: () => {
        tipoSelecionado = t.tipo;
      },
    });

    return h(
      'label',
      { class: 'choice' },
      radio,
      icon(t.ic, 'choice__icon'),
      h('div', { class: 'choice__title' }, t.titulo),
    );
  });

  // ── Painel Direito (Formulário) ──────────────────────────
  const formWrap = h(
    'div',
    { class: 'auth__form-wrap' },
    h(
      'div',
      { class: 'auth__form' },
      h('h1', null, 'Crie sua conta'),
      h('p', null, 'Monitore o consumo hídrico e acabe com o susto no boleto.'),
      (formError = h('div', { class: 'form-error', style: 'display: none;' })),
      h(
        'form',
        { onSubmit: handleSubmit },
        h(
          'div',
          { class: 'field' },
          h('label', { class: 'field__label', for: 'cad-nome' }, 'Seu nome completo'),
          (inputNome = h('input', {
            id: 'cad-nome',
            type: 'text',
            class: 'input',
            placeholder: 'Ex: Carlos Eduardo Mendes',
            required: true,
          })),
        ),
        h(
          'div',
          { class: 'field', style: 'margin-top: var(--space-4);' },
          h('label', { class: 'field__label', for: 'cad-email' }, 'E-mail'),
          (inputEmail = h('input', {
            id: 'cad-email',
            type: 'email',
            class: 'input',
            placeholder: 'carlos@condominio.com',
            required: true,
          })),
        ),
        h(
          'div',
          { class: 'field', style: 'margin-top: var(--space-4);' },
          h('label', { class: 'field__label', for: 'cad-senha' }, 'Senha'),
          (inputSenha = h('input', {
            id: 'cad-senha',
            type: 'password',
            class: 'input',
            placeholder: 'Mínimo de 6 caracteres',
            required: true,
          })),
        ),
        h(
          'div',
          { class: 'field', style: 'margin-top: var(--space-4);' },
          h('label', { class: 'field__label', for: 'cad-predio' }, 'Nome do condomínio ou prédio'),
          (inputPredio = h('input', {
            id: 'cad-predio',
            type: 'text',
            class: 'input',
            placeholder: 'Ex: Residencial Parque das Flores',
            required: true,
          })),
        ),
        h(
          'div',
          { class: 'field', style: 'margin-top: var(--space-4);' },
          h('label', { class: 'field__label' }, 'Tipo de imóvel'),
          h('div', { class: 'choice-grid' }, ...cardsTipologia),
        ),
        h(
          'div',
          { style: 'margin-top: var(--space-6);' },
          h('button', { type: 'submit', class: 'btn btn--block btn--lg' }, 'Criar conta e começar'),
        ),
      ),
      h(
        'p',
        { class: 'auth__switch' },
        'Já possui uma conta? ',
        h('a', { href: '/entrar' }, 'Entrar'),
      ),
    ),
  );

  return h('div', { class: 'auth' }, painelEsquerdo, formWrap);
}
