import { h } from '../core/dom';
import { icon } from '../core/icons';
import { store } from '../core/store';

type AbaLgpd = 'privacidade' | 'faq' | 'politicas';

export function PaginaLgpd(): HTMLElement {
  let abaAtiva: AbaLgpd = 'privacidade';
  let consentimentoRegistrado = true;

  const container = h('div', { class: 'page-container page-institutional' });

  // ── Renderização das Abas ─────────────────────────────────
  const renderizar = () => {
    container.replaceChildren();

    // Hero Header
    const hero = h(
      'section',
      { class: 'info-hero' },
      h('div', { class: 'info-hero__badge' }, icon('escudo'), h('span', null, 'Governança & Conformidade')),
      h('h1', { class: 'info-hero__title' }, 'Central de Informações'),
      h(
        'p',
        { class: 'info-hero__subtitle' },
        'FAQ, políticas públicas e privacidade LGPD reunidos em um único lugar.',
      ),
    );

    // Nav Tabs Pills
    const btnFaq = h(
      'button',
      {
        class: `info-tab-btn ${abaAtiva === 'faq' ? 'is-active' : ''}`,
        onClick: () => {
          abaAtiva = 'faq';
          renderizar();
        },
      },
      icon('info'),
      h('span', null, 'FAQ'),
    );

    const btnPoliticas = h(
      'button',
      {
        class: `info-tab-btn ${abaAtiva === 'politicas' ? 'is-active' : ''}`,
        onClick: () => {
          abaAtiva = 'politicas';
          renderizar();
        },
      },
      icon('documento'),
      h('span', null, 'Políticas Públicas e Diretrizes'),
    );

    const btnPrivacidade = h(
      'button',
      {
        class: `info-tab-btn ${abaAtiva === 'privacidade' ? 'is-active' : ''}`,
        onClick: () => {
          abaAtiva = 'privacidade';
          renderizar();
        },
      },
      icon('cadeado'),
      h('span', null, 'Privacidade e LGPD'),
    );

    const tabsNav = h('nav', { class: 'info-tabs', 'aria-label': 'Navegação da Central de Informações' }, btnFaq, btnPoliticas, btnPrivacidade);

    // Área de Conteúdo
    let tabContent: HTMLElement;
    if (abaAtiva === 'privacidade') {
      tabContent = criarAbaPrivacidade();
    } else if (abaAtiva === 'faq') {
      tabContent = criarAbaFaq();
    } else {
      tabContent = criarAbaPoliticas();
    }

    container.append(hero, tabsNav, tabContent);
  };

  // ── Conteúdo: Privacidade e LGPD ──────────────────────────
  const criarAbaPrivacidade = (): HTMLElement => {
    // Banner de consentimento
    const bannerTitulo = h(
      'div',
      { class: 'consent-banner__header' },
      icon('alertas'),
      h('h2', { class: 'consent-banner__title' }, 'Atualização de Consentimento em Destaque'),
    );

    const bannerDesc = h(
      'p',
      { class: 'consent-banner__desc' },
      'A versão atual do termo LGPD reforça trilhas de auditoria, retenção e direitos do titular. Revise os pontos abaixo e mantenha seu consentimento atualizado.',
    );

    const bulletList = h(
      'ul',
      { class: 'consent-banner__list' },
      h('li', null, 'Novos detalhes sobre dados técnicos de hidrômetros e telemetria utilizados para segurança e rastreabilidade.'),
      h('li', null, 'Especificação de prazo de anonimização após encerramento do vínculo contratual do condomínio.'),
      h('li', null, 'Canal do encarregado de dados (DPO) destacado para solicitações e exercício de direitos formais.'),
    );

    const statusConsentimento = h(
      'div',
      { class: 'consent-banner__status' },
      h(
        'span',
        { class: consentimentoRegistrado ? 'status-pill status-pill--ok' : 'status-pill status-pill--warn' },
        icon(consentimentoRegistrado ? 'ok' : 'alertas'),
        h('span', null, consentimentoRegistrado ? 'Consentimento ativo registrado para este usuário.' : 'Consentimento pendente de confirmação.'),
      ),
      h(
        'button',
        {
          class: 'btn btn--outline btn--sm',
          onClick: () => {
            consentimentoRegistrado = true;
            store.addToast('Consentimento e aceite aos termos da LGPD atualizados com sucesso!', 'sucesso');
            renderizar();
          },
        },
        'Revalidar Consentimento',
      ),
    );

    const banner = h(
      'section',
      { class: 'consent-banner' },
      bannerTitulo,
      bannerDesc,
      bulletList,
      statusConsentimento,
    );

    // Grid 2x2
    const cardEscopo = h(
      'article',
      { class: 'info-card' },
      h('h3', { class: 'info-card__title' }, 'Escopo e Compromisso'),
      h(
        'p',
        { class: 'info-card__text' },
        'Esta política se aplica a todos os usuários da plataforma Crivo (administradores, síndicos, condôminos e prestadores técnicos). O Crivo adota princípios de finalidade, necessidade, transparência, segurança e prevenção previstos na Lei Federal nº 13.709/2018 (LGPD).',
      ),
    );

    const cardDados = h(
      'article',
      { class: 'info-card' },
      h('h3', { class: 'info-card__title' }, 'Dados Coletados'),
      h(
        'ul',
        { class: 'info-card__list' },
        h('li', null, h('strong', null, 'Identificação e contato: '), 'nome, usuário, e-mail e perfil de acesso institucional.'),
        h('li', null, h('strong', null, 'Dados de consumo hídrico: '), 'leituras de hidrômetro em m³, timestamps, vazão horária e histórico de medições.'),
        h('li', null, h('strong', null, 'Dados operacionais e auditoria: '), 'logs de autenticação, fotografias anexadas de medidores e eventos de resolução de alertas.'),
        h('li', null, h('strong', null, 'Metadados condominiais: '), 'identificação de bloco, unidade e parâmetros das bandas tarifárias locais.'),
      ),
    );

    const cardFinalidades = h(
      'article',
      { class: 'info-card' },
      h('h3', { class: 'info-card__title' }, 'Finalidades do Tratamento'),
      h(
        'ul',
        { class: 'info-card__list' },
        h('li', null, 'Autenticação, controle de acesso e gestão segura de sessões do gestor condominial.'),
        h('li', null, 'Monitoramento analítico de consumo, detecção precoce de vazamentos contínuos e anomalias de vazão.'),
        h('li', null, 'Geração de indicadores preditivos e decomposição explicável da fatura (Total = Esperado + Tarifa + Uso Acima).'),
        h('li', null, 'Rastreabilidade, prevenção a desperdícios hídricos e suporte a auditorias financeiras condominiais.'),
        h('li', null, 'Atendimento a obrigações regulatórias, sanitárias e padrões de governança institucional.'),
      ),
    );

    const cardBases = h(
      'article',
      { class: 'info-card' },
      h('h3', { class: 'info-card__title' }, 'Bases Legais'),
      h(
        'ul',
        { class: 'info-card__list' },
        h('li', null, h('strong', null, 'Art. 7º, I: '), 'consentimento livre e esclarecido do titular.'),
        h('li', null, h('strong', null, 'Art. 7º, II: '), 'cumprimento de obrigação legal ou regulatória de saneamento.'),
        h('li', null, h('strong', null, 'Art. 7º, III e V: '), 'execução de contrato de monitoria e procedimentos condominiais.'),
        h('li', null, h('strong', null, 'Art. 7º, IX: '), 'legítimo interesse do condomínio na redução de desperdício coletivo e proteção ao patrimônio.'),
      ),
    );

    const grid = h('section', { class: 'info-grid' }, cardEscopo, cardDados, cardFinalidades, cardBases);

    // Seção Direitos do Titular & Canal DPO
    const cardDireitos = h(
      'article',
      { class: 'info-card info-card--highlight' },
      h('h3', { class: 'info-card__title' }, icon('escudo'), h('span', null, 'Direitos dos Titulares (Art. 18 da LGPD)')),
      h(
        'p',
        { class: 'info-card__text' },
        'Você, como titular de dados, pode exercer a qualquer momento perante o Crivo:',
      ),
      h(
        'ul',
        { class: 'info-card__list' },
        h('li', null, 'Confirmação da existência de tratamento e acesso irrestrito aos relatórios de medição do seu condomínio.'),
        h('li', null, 'Correção de dados incompletos, inexatos ou desatualizados na base cadastral.'),
        h('li', null, 'Anonimização de registros históricos agregados ou eliminação de fotos após encerramento do contrato.'),
        h('li', null, 'Portabilidade das séries temporais de consumo em padrão aberto (CSV / JSON).'),
        h('li', null, 'Revogação do consentimento nos termos da legislação aplicável.'),
      ),
    );

    const cardDpo = h(
      'article',
      { class: 'info-card' },
      h('h3', { class: 'info-card__title' }, icon('usuario'), h('span', null, 'Encarregado pelo Tratamento de Dados (DPO)')),
      h(
        'p',
        { class: 'info-card__text' },
        'Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de informações no Crivo, entre em contato direto com a comissão de privacidade:',
      ),
      h(
        'div',
        { class: 'dpo-contact' },
        h('div', { class: 'dpo-contact__item' }, h('strong', null, 'Instituição: '), 'UniEVANGÉLICA — Centro Universitário de Anápolis'),
        h('div', { class: 'dpo-contact__item' }, h('strong', null, 'Canal Oficial: '), 'dpo@crivo.ai'),
        h('div', { class: 'dpo-contact__item' }, h('strong', null, 'Prazo de Resposta: '), 'Até 15 dias corridos conforme diretriz da ANPD'),
      ),
    );

    const rowExtra = h('section', { class: 'info-grid info-grid--unequal' }, cardDireitos, cardDpo);

    return h('div', { class: 'tab-pane' }, banner, grid, rowExtra);
  };

  // ── Conteúdo: FAQ ─────────────────────────────────────────
  const criarAbaFaq = (): HTMLElement => {
    const faqs = [
      {
        q: 'O Crivo monitora hábitos privados dos moradores nos apartamentos?',
        a: 'Não. O monitoramento do Crivo atua estritamente sobre a telemetria do hidrômetro (volume acumulado em m³ e vazão agregada). O objetivo único é identificar anomalias mecânicas e hidráulicas — como torneiras pingando, vazamentos em caixas acopladas ou picos anômalos de consumo —, sem qualquer inferência sobre a vida íntima dos moradores.',
      },
      {
        q: 'Por que o sistema solicita fotos do hidrômetro?',
        a: 'O envio de fotografias durante o lançamento manual de leitura é uma salvaguarda de auditoria contábil. Ele permite que o gestor ou síndico valide visualmente os dígitos contra eventuais erros de digitação e comprove o número exato apurado perante a assembleia condominial.',
      },
      {
        q: 'Os dados de consumo são compartilhados com as concessionárias de saneamento?',
        a: 'Não. Os dados pertencem integralmente ao condomínio contratante e aos respectivos condôminos. O Crivo não comercializa, não monetiza e não compartilha dados de telemetria com concessionárias nem com birôs de crédito ou terceiros.',
      },
      {
        q: 'Por quanto tempo as leituras e fotografias ficam armazenadas?',
        a: 'As medições horárias e diárias são mantidas durante a vigência do contrato para composição do histórico analítico e sazonalidade dos modelos preditivos. Fotos enviadas são mantidas por 12 meses para fins de auditoria e, em seguida, purgadas automaticamente.',
      },
      {
        q: 'Como posso solicitar a retificação ou exclusão de meus dados?',
        a: 'O titular ou o síndico representante pode requerer a retificação de medições ou exclusão de dados cadastrais enviando uma solicitação direta ao Encarregado de Dados no endereço dpo@crivo.ai.',
      },
    ];

    const faqItems = faqs.map((item) => {
      return h(
        'details',
        { class: 'faq-card' },
        h('summary', { class: 'faq-card__question' }, h('span', null, item.q), icon('proximo')),
        h('div', { class: 'faq-card__answer' }, h('p', null, item.a)),
      );
    });

    return h('div', { class: 'tab-pane' }, h('div', { class: 'faq-list' }, ...faqItems));
  };

  // ── Conteúdo: Políticas e Diretrizes ──────────────────────
  const criarAbaPoliticas = (): HTMLElement => {
    return h(
      'div',
      { class: 'tab-pane' },
      h(
        'section',
        { class: 'info-card' },
        h('h3', { class: 'info-card__title' }, icon('escudo'), h('span', null, 'Diretriz de Segurança da Informação')),
        h(
          'p',
          { class: 'info-card__text' },
          'Todas as conexões e tráfego de dados entre o navegador do usuário, a API RESTful e os dispositivos de telemetria utilizam criptografia de ponta a ponta via protocolo TLS 1.3 / HTTPS. As credenciais de acesso contam com hash criptográfico e a persistência de dados sensíveis adota segregação lógica por condomínio.',
        ),
      ),
      h(
        'section',
        { class: 'info-card', style: 'margin-top: var(--space-4);' },
        h('h3', { class: 'info-card__title' }, icon('documento'), h('span', null, 'Política de Retenção e Descarte de Dados')),
        h(
          'p',
          { class: 'info-card__text' },
          'Encerrada a relação contratual ou extinto o condomínio na base da plataforma, os dados de identificação pessoal dos usuários são anonimizados irreversivelmente ou eliminados de forma segura em até 90 dias úteis, mantendo-se estritamente dados estatísticos descaracterizados para pesquisa científica e calibragem dos modelos de machine learning.',
        ),
      ),
    );
  };

  renderizar();
  return container;
}
