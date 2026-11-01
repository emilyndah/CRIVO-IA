import { h } from '../core/dom';
import { icon } from '../core/icons';
import { store } from '../core/store';

type AbaAutores = 'autores' | 'mentores' | 'licenca' | 'citar';

export function PaginaAutores(): HTMLElement {
  let abaAtiva: AbaAutores = 'autores';

  const container = h('div', { class: 'page-container page-institutional' });

  const renderizar = () => {
    container.replaceChildren();

    // Hero Header
    const badgeInstitucional = h(
      'div',
      { class: 'info-hero__badge' },
      icon('graduacao'),
      h('span', null, 'UniEVANGÉLICA — Bacharelado em Inteligência Artificial'),
    );

    const badgesLicenca = h(
      'div',
      { class: 'info-hero__pills' },
      h('span', { class: 'pill-badge' }, 'v1.0.0'),
      h('span', { class: 'pill-badge' }, icon('escudo'), h('span', null, 'Protegido pela Lei de Software nº 9.609/1998')),
      h('span', { class: 'pill-badge' }, icon('documento'), h('span', null, 'Licença Acadêmica / MIT')),
      h('span', { class: 'pill-badge' }, icon('cadeado'), h('span', null, 'Conformidade LGPD')),
    );

    const hero = h(
      'section',
      { class: 'info-hero' },
      badgeInstitucional,
      h('h1', { class: 'info-hero__title' }, 'CRIVO — Inteligência Hídrica Condominial'),
      h(
        'p',
        { class: 'info-hero__subtitle' },
        'Plataforma inteligente para telemetria hídrica, detecção precoce de vazamentos e decomposição explicável de contas condominiais.',
      ),
      badgesLicenca,
    );

    // Nav Tabs Pills
    const btnAutores = h(
      'button',
      {
        class: `info-tab-btn ${abaAtiva === 'autores' ? 'is-active' : ''}`,
        onClick: () => {
          abaAtiva = 'autores';
          renderizar();
        },
      },
      icon('usuario'),
      h('span', null, 'Autores e Desenvolvedores'),
    );

    const btnMentores = h(
      'button',
      {
        class: `info-tab-btn ${abaAtiva === 'mentores' ? 'is-active' : ''}`,
        onClick: () => {
          abaAtiva = 'mentores';
          renderizar();
        },
      },
      icon('graduacao'),
      h('span', null, 'Corpo Docente & Mentores'),
    );

    const btnLicenca = h(
      'button',
      {
        class: `info-tab-btn ${abaAtiva === 'licenca' ? 'is-active' : ''}`,
        onClick: () => {
          abaAtiva = 'licenca';
          renderizar();
        },
      },
      icon('documento'),
      h('span', null, 'Licença e Termos de Uso'),
    );

    const btnCitar = h(
      'button',
      {
        class: `info-tab-btn ${abaAtiva === 'citar' ? 'is-active' : ''}`,
        onClick: () => {
          abaAtiva = 'citar';
          renderizar();
        },
      },
      icon('copiar'),
      h('span', null, 'Como Citar'),
    );

    const tabsNav = h('nav', { class: 'info-tabs', 'aria-label': 'Navegação de Autoria e Licença' }, btnAutores, btnMentores, btnLicenca, btnCitar);

    let tabContent: HTMLElement;
    if (abaAtiva === 'autores') {
      tabContent = criarAbaAutores();
    } else if (abaAtiva === 'mentores') {
      tabContent = criarAbaMentores();
    } else if (abaAtiva === 'licenca') {
      tabContent = criarAbaLicenca();
    } else {
      tabContent = criarAbaComoCitar();
    }

    container.append(hero, tabsNav, tabContent);
  };

  // ── Aba 1: Autores e Desenvolvedores ───────────────────────
  const criarAbaAutores = (): HTMLElement => {
    const introSection = h(
      'div',
      { class: 'authors-intro' },
      h('h2', { class: 'section-heading' }, icon('usuario'), h('span', null, 'Autoria Moral e Engenharia de Software')),
      h(
        'p',
        { class: 'authors-intro__text' },
        'A concepção computacional, arquitetura técnica, engenharia de dados, design system e desenvolvimento de software foram idealizados e executados pelos pesquisadores:',
      ),
    );

    // Cards dos 3 membros com os SVGs oficiais
    const time = [
      {
        nome: 'Jordan',
        tag: 'AUTOR E DESIGNER DE PRODUTO',
        funcao: 'Design e Prototipação',
        svg: '/team/jordan.svg',
        descricao:
          'Concepção da identidade visual, fluxo do usuário, design system oficial de 23 cores, arquitetura de telas e prototipação de alta fidelidade das interfaces do Crivo.',
        filiacao: 'Universidade Evangélica de Goiás (UniEVANGÉLICA)',
        contato: 'jordan@crivo.ai',
      },
      {
        nome: 'Emily',
        tag: 'AUTORA E ENGENHEIRA DE REQUISITOS',
        funcao: 'Pesquisa e Documentação',
        svg: '/team/emily.svg',
        descricao:
          'Investigação técnica com administradoras e síndicos, levantamento de requisitos de negócio, elaboração do Relatório Técnico do Marco 1 e fundamentação teórica de conformidade LGPD.',
        filiacao: 'Universidade Evangélica de Goiás (UniEVANGÉLICA)',
        contato: 'emily@crivo.ai',
      },
      {
        nome: 'Samuell',
        tag: 'AUTOR E ENGENHEIRO DE SOFTWARE',
        funcao: 'Desenvolvimento e Programação',
        svg: '/team/samuell.svg',
        descricao:
          'Arquitetura do sistema frontend SPA em TypeScript/Vite, modelagem preditiva de consumo diário em Python, algoritmos de detecção de vazão noturna e motor de decomposição explicável da fatura.',
        filiacao: 'Universidade Evangélica de Goiás (UniEVANGÉLICA)',
        contato: 'samuell@crivo.ai',
      },
    ];

    const cardsTeam = time.map((m) => {
      const avatarImg = h('img', {
        src: m.svg,
        alt: `Retrato de ${m.nome}`,
        class: 'author-card__avatar-img',
        loading: 'lazy',
      });

      const avatarWrap = h('div', { class: 'author-card__avatar' }, avatarImg);

      return h(
        'article',
        { class: 'author-card' },
        h('div', { class: 'author-card__badge' }, m.tag),
        h(
          'div',
          { class: 'author-card__main' },
          avatarWrap,
          h(
            'div',
            { class: 'author-card__meta' },
            h('h3', { class: 'author-card__name' }, m.nome),
            h('div', { class: 'author-card__role' }, m.funcao),
          ),
        ),
        h('p', { class: 'author-card__bio' }, m.descricao),
        h(
          'div',
          { class: 'author-card__footer' },
          h('div', { class: 'author-card__detail' }, icon('graduacao'), h('span', null, m.filiacao)),
          h('div', { class: 'author-card__detail' }, icon('documento'), h('span', null, m.contato)),
        ),
      );
    });

    const gridTeam = h('div', { class: 'authors-grid' }, ...cardsTeam);

    // Titularidade e Propriedade Intelectual
    const cardPropriedade = h(
      'section',
      { class: 'info-card info-card--legal', style: 'margin-top: var(--space-6);' },
      h('h3', { class: 'info-card__title' }, icon('escudo'), h('span', null, 'Titularidade Patrimonial e Propriedade Intelectual')),
      h(
        'p',
        { class: 'info-card__text' },
        'A titularidade dos direitos morais de autor pertence a Jordan, Emily e Samuell, nos termos do Art. 2º da Lei Federal nº 9.609/1998 (Proteção da Propriedade Intelectual de Programa de Computador) e subsidiariamente da Lei nº 9.610/1998 (Direitos Autorais). O projeto foi concebido e estruturado no âmbito do Bacharelado em Inteligência Artificial da UniEVANGÉLICA.',
      ),
    );

    return h('div', { class: 'tab-pane' }, introSection, gridTeam, cardPropriedade);
  };

  // ── Aba 2: Corpo Docente & Mentores ───────────────────────
  const criarAbaMentores = (): HTMLElement => {
    return h(
      'div',
      { class: 'tab-pane' },
      h(
        'section',
        { class: 'info-card' },
        h('h3', { class: 'info-card__title' }, icon('graduacao'), h('span', null, 'Coordenação e Corpo Docente')),
        h(
          'p',
          { class: 'info-card__text' },
          'O projeto Crivo é orientado pelos docentes do Bacharelado em Inteligência Artificial do Centro Universitário de Anápolis (UniEVANGÉLICA), integrando competências de Visão Computacional, Engenharia de Software, Aprendizado de Máquina Supervisionado e Metodologia Científica.',
        ),
        h(
          'div',
          { class: 'institution-meta', style: 'margin-top: var(--space-4);' },
          h('div', { class: 'author-card__detail' }, h('strong', null, 'Instituição: '), 'UniEVANGÉLICA — Centro Universitário de Anápolis (Goiás, Brasil)'),
          h('div', { class: 'author-card__detail' }, h('strong', null, 'Curso: '), 'Bacharelado em Inteligência Artificial — 3º Período'),
          h('div', { class: 'author-card__detail' }, h('strong', null, 'Módulo: '), 'Projeto Integrador · Marco 1 & Marco 2 (Monitoria e Inteligência de Consumo)'),
        ),
      ),
    );
  };

  // ── Aba 3: Licença e Termos de Uso ────────────────────────
  const criarAbaLicenca = (): HTMLElement => {
    return h(
      'div',
      { class: 'tab-pane' },
      h(
        'section',
        { class: 'info-card' },
        h('h3', { class: 'info-card__title' }, icon('documento'), h('span', null, 'Licença Open Source Acadêmica (MIT License)')),
        h(
          'p',
          { class: 'info-card__text' },
          'O código-fonte do sistema Crivo é disponibilizado sob a licença permissiva MIT, assegurando total transparência para fins de avaliação acadêmica, pesquisa científica e reprodução dos experimentos de telemetria.',
        ),
        h(
          'pre',
          { class: 'code-block' },
          `MIT License

Copyright (c) 2026 Jordan, Emily, Samuell - UniEVANGÉLICA

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
        ),
      ),
    );
  };

  // ── Aba 4: Como Citar ─────────────────────────────────────
  const criarAbaComoCitar = (): HTMLElement => {
    const textoAbnt =
      'CRIVO. Inteligência e Gestão de Consumo de Água para Condomínios. Autoria: Jordan; Emily; Samuell. Anápolis: UniEVANGÉLICA, 2026. Disponível em: <https://github.com/emilyndah/CRIVO-IA>.';

    const textoBibtex = `@software{crivo2026,
  author    = {Jordan and Emily and Samuell},
  title     = {CRIVO: Inteligência e Gestão no Consumo de Água para Condomínios},
  year      = {2026},
  publisher = {GitHub},
  institution = {UniEVANGÉLICA - Centro Universitário de Anápolis},
  url       = {https://github.com/emilyndah/CRIVO-IA}
}`;

    const copiarTexto = async (texto: string, label: string) => {
      try {
        await navigator.clipboard.writeText(texto);
        store.addToast(`${label} copiado para a área de transferência!`, 'sucesso');
      } catch {
        store.addToast('Não foi possível copiar automaticamente.', 'erro');
      }
    };

    return h(
      'div',
      { class: 'tab-pane' },
      h(
        'section',
        { class: 'info-card' },
        h('h3', { class: 'info-card__title' }, icon('documento'), h('span', null, 'Referência no Formato ABNT')),
        h('blockquote', { class: 'citation-quote' }, textoAbnt),
        h(
          'button',
          {
            class: 'btn btn--outline btn--sm',
            onClick: () => copiarTexto(textoAbnt, 'Citação ABNT'),
          },
          icon('copiar'),
          h('span', null, 'Copiar Citação ABNT'),
        ),
      ),
      h(
        'section',
        { class: 'info-card', style: 'margin-top: var(--space-4);' },
        h('h3', { class: 'info-card__title' }, icon('copiar'), h('span', null, 'Entrada BibTeX para LaTeX / Artigos Científicos')),
        h('pre', { class: 'code-block' }, textoBibtex),
        h(
          'button',
          {
            class: 'btn btn--primary btn--sm',
            onClick: () => copiarTexto(textoBibtex, 'BibTeX'),
          },
          icon('copiar'),
          h('span', null, 'Copiar BibTeX'),
        ),
      ),
    );
  };

  renderizar();
  return container;
}
