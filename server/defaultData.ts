import type {
  AuditLogEntry,
  BannerItem,
  ContactInfo,
  ContactSubmission,
  DriveFileRecord,
  GalleryItem,
  MenuItem,
  MusicConfig,
  PortfolioItem,
  PriceItem,
  SeoConfig,
  ServiceItem,
  SiteBundle,
  SitePageItem,
  SocialLinkItem,
  StudioConfig,
  TestimonialItem,
  ThemeConfig,
} from '../src/types/studio.ts';

const NOW_ISO = new Date().toISOString();

export const INITIAL_HERO_IMAGE =
  '/src/assets/images/hero_studio_atmosphere_1795374160399.jpg';
export const INITIAL_ABOUT_IMAGE =
  '/src/assets/images/about_artist_workspace_1795374160164.jpg';
export const INITIAL_STUDY_ONE =
  '/src/assets/images/editorial_ink_study_one_1795374161101.jpg';
export const INITIAL_STUDY_TWO =
  '/src/assets/images/editorial_ink_study_two_1795374160240.jpg';
export const INITIAL_CRAFT_DETAIL =
  '/src/assets/images/studio_craft_detail_1795374160515.jpg';

export const PRICE_DISCLAIMER_TEXT =
  'Os valores são referências iniciais para planejamento. O orçamento definitivo varia conforme tamanho em centímetros, anatomia do local, nível de detalhamento, tempo estimado de sessão e complexidade do projeto.';

export function createInitialStudioState(): {
  site: SiteBundle;
  files: DriveFileRecord[];
  submissions: ContactSubmission[];
  logs: AuditLogEntry[];
} {
  const config: StudioConfig = {
    id: 'cfg-principal',
    studioName: 'LUAN HÉRCULES TATTOO',
    tagline: 'Estúdio Autoral de Tatuagem',
    heroTitle: 'Arte autoral desenhada para permanecer com você.',
    heroSubtitle:
      'Projetos exclusivos concebidos individualmente — equilíbrio entre composição anatômica, técnica apurada e ambiente privado.',
    heroCtaPrimary: 'Solicitar Agendamento',
    heroCtaSecondary: 'Explorar Portfólio',
    heroMediaUrl: INITIAL_HERO_IMAGE,
    heroMediaType: 'image',
    aboutTitle: 'Traço autoral, estudo anatômico e respeito ao processo.',
    aboutStory:
      'Cada trabalho no Luan Hércules Tattoo nasce a partir de uma conversa atenta sobre significado, proporção e leitura corporal. Este texto institucional é totalmente editável pelo painel administrativo para contar a trajetória real do artista, suas referências visuais e sua visão de estúdio.',
    aboutExperience:
      'Atendimento individualizado com hora marcada, materiais descartáveis certificados e acompanhamento completo do pós-procedimento. Atualize suas especialidades e tempo de atuação diretamente no painel.',
    aboutSpecialties: ['Fine Line', 'Blackwork', 'Projetos Autorais', 'Botânica & Geometria'],
    aboutImageUrl: INITIAL_ABOUT_IMAGE,
    footerText: 'Luan Hércules Tattoo · Estúdio autoral com atendimento mediante agendamento.',
    currency: 'BRL',
    timezone: 'America/Maceio',
    updatedAt: NOW_ISO,
  };

  const pages: SitePageItem[] = [
    {
      id: 'pag-home',
      slug: 'home',
      title: 'Início',
      subtitle: 'Estúdio Autoral de Tatuagem',
      body: 'Apresentação principal do estúdio Luan Hércules Tattoo.',
      visible: true,
      updatedAt: NOW_ISO,
    },
    {
      id: 'pag-sobre',
      slug: 'sobre',
      title: 'Sobre o Artista',
      subtitle: 'História, método e estética do estúdio',
      body: 'Espaço destinado à biografia oficial, formação artística e filosofia de trabalho de Luan Hércules.',
      visible: true,
      updatedAt: NOW_ISO,
    },
    {
      id: 'pag-portfolio',
      slug: 'portfolio',
      title: 'Portfólio & Galeria',
      subtitle: 'Estudos, composições e trabalhos selecionados',
      body: 'Os estudos exibidos inicialmente são referências editoriais do estúdio. Substitua-os pelas fotografias reais de tatuagens no painel administrativo.',
      visible: true,
      updatedAt: NOW_ISO,
    },
    {
      id: 'pag-servicos',
      slug: 'servicos',
      title: 'Serviços & Atendimento',
      subtitle: 'Da concepção do desenho à cicatrização',
      body: 'Conheça as modalidades de atendimento, consultoria estética e acompanhamento.',
      visible: true,
      updatedAt: NOW_ISO,
    },
    {
      id: 'pag-precos',
      slug: 'precos',
      title: 'Orçamentos & Referências',
      subtitle: 'Transparência em cada etapa do projeto',
      body: PRICE_DISCLAIMER_TEXT,
      visible: true,
      updatedAt: NOW_ISO,
    },
    {
      id: 'pag-contato',
      slug: 'contato',
      title: 'Contato & Agendamento',
      subtitle: 'Envie sua ideia para avaliação',
      body: 'Preencha o formulário com referência, tamanho aproximado e região do corpo para iniciar seu atendimento.',
      visible: true,
      updatedAt: NOW_ISO,
    },
  ];

  const portfolio: PortfolioItem[] = [
    {
      id: 'port-estudo-01',
      title: 'Estudo Editorial I — Botânica Anatômica',
      category: 'Fine Line',
      description:
        'Espaço reservado editorial em papel algodão. Cadastre as fotografias reais dos trabalhos realizados através do painel /admin.',
      imageUrl: INITIAL_STUDY_ONE,
      featured: true,
      isPlaceholder: true,
      createdAt: NOW_ISO,
      updatedAt: NOW_ISO,
    },
    {
      id: 'port-estudo-02',
      title: 'Estudo Editorial II — Geometria em Nanquim',
      category: 'Blackwork',
      description:
        'Espaço reservado editorial para trabalhos em alto contraste e composição geométrica. Substituível no gerenciamento de portfólio.',
      imageUrl: INITIAL_STUDY_TWO,
      featured: true,
      isPlaceholder: true,
      createdAt: NOW_ISO,
      updatedAt: NOW_ISO,
    },
    {
      id: 'port-estudo-03',
      title: 'Estudo Editorial III — Bancada & Precisão',
      category: 'Autoral',
      description:
        'Registro conceitual de ambiente e instrumentação do estúdio até a inclusão dos projetos autorais definitivos.',
      imageUrl: INITIAL_CRAFT_DETAIL,
      featured: true,
      isPlaceholder: true,
      createdAt: NOW_ISO,
      updatedAt: NOW_ISO,
    },
  ];

  const gallery: GalleryItem[] = [
    {
      id: 'gal-01',
      title: 'Estudo de Linha Fina sobre Algodão',
      category: 'Fine Line',
      imageUrl: INITIAL_STUDY_ONE,
      caption: 'Referência editorial — substitua pelas fotos reais na aba Galeria do painel.',
      order: 1,
      isPlaceholder: true,
      createdAt: NOW_ISO,
      updatedAt: NOW_ISO,
    },
    {
      id: 'gal-02',
      title: 'Estudo Geométrico em Nanquim',
      category: 'Blackwork',
      imageUrl: INITIAL_STUDY_TWO,
      caption: 'Referência editorial — substitua pelas fotos reais na aba Galeria do painel.',
      order: 2,
      isPlaceholder: true,
      createdAt: NOW_ISO,
      updatedAt: NOW_ISO,
    },
    {
      id: 'gal-03',
      title: 'Ateliê de Criação',
      category: 'Estúdio',
      imageUrl: INITIAL_ABOUT_IMAGE,
      caption: 'Mesa de desenho e pesquisa visual.',
      order: 3,
      isPlaceholder: true,
      createdAt: NOW_ISO,
      updatedAt: NOW_ISO,
    },
    {
      id: 'gal-04',
      title: 'Arquitetura e Iluminação do Estúdio',
      category: 'Estúdio',
      imageUrl: INITIAL_HERO_IMAGE,
      caption: 'Ambiente privado preparado para sessões com tranquilidade.',
      order: 4,
      isPlaceholder: true,
      createdAt: NOW_ISO,
      updatedAt: NOW_ISO,
    },
  ];

  const banners: BannerItem[] = [
    {
      id: 'ban-hero',
      title: 'Luan Hércules Tattoo',
      subtitle: 'Agenda aberta mediante avaliação de projeto.',
      imageUrl: INITIAL_HERO_IMAGE,
      linkUrl: '/contato',
      active: true,
      placement: 'hero',
      updatedAt: NOW_ISO,
    },
  ];

  const services: ServiceItem[] = [
    {
      id: 'srv-01',
      title: 'Projetos Autorais Exclusivos',
      description:
        'Criação de arte única desenvolvida especificamente para a anatomia e intenção de cada cliente, sem repetição de desenhos.',
      imageUrl: INITIAL_STUDY_ONE,
      sessionInfo: 'Inclui consultoria de composição e ajustes prévios.',
      order: 1,
      active: true,
      updatedAt: NOW_ISO,
    },
    {
      id: 'srv-02',
      title: 'Fine Line & Blackwork',
      description:
        'Execução focada em precisão de traço, contraste equilibrado e envelhecimento harmônico do pigmento na pele.',
      imageUrl: INITIAL_STUDY_TWO,
      sessionInfo: 'Sessões com duração planejada conforme complexidade.',
      order: 2,
      active: true,
      updatedAt: NOW_ISO,
    },
    {
      id: 'srv-03',
      title: 'Consultoria, Reforma & Cobertura',
      description:
        'Avaliação técnica presencial ou por imagem para ressignificar trabalhos antigos com soluções estéticas viáveis.',
      imageUrl: INITIAL_CRAFT_DETAIL,
      sessionInfo: 'Mediante análise prévia da área existente.',
      order: 3,
      active: true,
      updatedAt: NOW_ISO,
    },
  ];

  const prices: PriceItem[] = [
    {
      id: 'prc-01',
      title: 'Projetos Minimalistas & Delicados',
      description:
        'Peças de pequeno porte com leitura limpa e posicionamento estratégico. Valor inicial configurável pelo painel.',
      estimateLabel: 'Sob avaliação (configure o valor inicial no painel)',
      notes: 'Taxa mínima de bancada e materiais estéreis aplicada. Valores em BRL.',
      order: 1,
      active: true,
      updatedAt: NOW_ISO,
    },
    {
      id: 'prc-02',
      title: 'Composições Médias & Autorais',
      description:
        'Projetos exclusivos entre 10 cm e 20 cm com estudo de sombreamento, textura ou botânica.',
      estimateLabel: 'Sob orçamento personalizado',
      notes: 'O valor considera desenho autoral exclusivo e tempo de bancada.',
      order: 2,
      active: true,
      updatedAt: NOW_ISO,
    },
    {
      id: 'prc-03',
      title: 'Fechamentos & Sessões Estendidas',
      description:
        'Projetos amplos em múltiplas etapas com planejamento anatômico contínuo.',
      estimateLabel: 'Por sessão ou projeto completo',
      notes: 'Definição de cronograma e condições diretamente na avaliação.',
      order: 3,
      active: true,
      updatedAt: NOW_ISO,
    },
  ];

  // Sem depoimentos fictícios: começa vazio até o administrador cadastrar relatos reais.
  const testimonials: TestimonialItem[] = [];

  // Sem endereço, telefone ou WhatsApp inventados: campos vazios até cadastro no painel.
  const contacts: ContactInfo = {
    id: 'cnt-principal',
    whatsappNumber: '',
    whatsappMessage:
      'Olá, Luan! Gostaria de solicitar uma avaliação para um projeto de tatuagem.',
    instagramHandle: '',
    email: '',
    address: '',
    cityState: '',
    businessHours: '',
    bookingNotice:
      'Atendimento exclusivamente com hora marcada. Preencha os dados de contato no painel administrativo para ativar botões diretos de WhatsApp e endereço.',
    updatedAt: NOW_ISO,
  };

  const socialLinks: SocialLinkItem[] = [];

  const music: MusicConfig = {
    id: 'mus-principal',
    enabled: false,
    title: 'Ambiente do Estúdio',
    artist: 'Luan Hércules Tattoo',
    audioUrl: '',
    initialVolume: 0.35,
    loop: true,
    manualPlayOnly: true,
    updatedAt: NOW_ISO,
  };

  const menu: MenuItem[] = [
    { id: 'mnu-1', label: 'Início', path: '/', order: 1, visible: true },
    { id: 'mnu-2', label: 'Sobre', path: '/sobre', order: 2, visible: true },
    { id: 'mnu-3', label: 'Portfólio', path: '/portfolio', order: 3, visible: true },
    { id: 'mnu-4', label: 'Serviços', path: '/servicos', order: 4, visible: true },
    { id: 'mnu-5', label: 'Preços', path: '/precos', order: 5, visible: true },
    { id: 'mnu-6', label: 'Contato', path: '/contato', order: 6, visible: true },
  ];

  const seo: SeoConfig = {
    id: 'seo-principal',
    siteTitle: 'Luan Hércules Tattoo – Estúdio Autoral de Tatuagem',
    metaDescription:
      'Estúdio autoral de tatuagem focado em projetos exclusivos, traço preciso e atendimento individualizado com hora marcada.',
    ogTitle: 'Luan Hércules Tattoo – Estúdio Autoral de Tatuagem',
    ogDescription:
      'Conheça o portfólio, serviços e solicite seu orçamento personalizado no estúdio Luan Hércules Tattoo.',
    ogImageUrl: INITIAL_HERO_IMAGE,
    canonicalDomain: 'https://luanhtattoo.vercel.app',
    keywords: 'tatuagem autoral, estúdio de tatuagem, fine line, blackwork, Luan Hércules Tattoo',
    updatedAt: NOW_ISO,
  };

  const theme: ThemeConfig = {
    id: 'thm-principal',
    backgroundColor: '#070709',
    surfaceColor: '#111115',
    textColor: '#F5F3EF',
    accentColor: '#C9A45C',
    borderRadius: 'subtle',
    updatedAt: NOW_ISO,
  };

  const files: DriveFileRecord[] = [
    {
      id: 'local-hero-studio',
      name: 'hero_studio_atmosphere.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 245000,
      folderName: '05_BANNERS',
      publicUrl: INITIAL_HERO_IMAGE,
      thumbnailUrl: INITIAL_HERO_IMAGE,
      sectionBinding: 'Hero Principal',
      createdAt: NOW_ISO,
      updatedAt: NOW_ISO,
    },
    {
      id: 'local-about-workspace',
      name: 'about_artist_workspace.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 212000,
      folderName: '09_FOTOS_PERFIL',
      publicUrl: INITIAL_ABOUT_IMAGE,
      thumbnailUrl: INITIAL_ABOUT_IMAGE,
      sectionBinding: 'Seção Sobre',
      createdAt: NOW_ISO,
      updatedAt: NOW_ISO,
    },
    {
      id: 'local-study-one',
      name: 'editorial_ink_study_one.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 198000,
      folderName: '07_PORTFOLIO',
      publicUrl: INITIAL_STUDY_ONE,
      thumbnailUrl: INITIAL_STUDY_ONE,
      sectionBinding: 'Portfólio Editorial',
      createdAt: NOW_ISO,
      updatedAt: NOW_ISO,
    },
    {
      id: 'local-study-two',
      name: 'editorial_ink_study_two.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 184000,
      folderName: '03_GALERIA',
      publicUrl: INITIAL_STUDY_TWO,
      thumbnailUrl: INITIAL_STUDY_TWO,
      sectionBinding: 'Galeria Editorial',
      createdAt: NOW_ISO,
      updatedAt: NOW_ISO,
    },
    {
      id: 'local-craft-detail',
      name: 'studio_craft_detail.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 204000,
      folderName: '12_ARQUIVOS_GERAIS',
      publicUrl: INITIAL_CRAFT_DETAIL,
      thumbnailUrl: INITIAL_CRAFT_DETAIL,
      sectionBinding: 'Serviços',
      createdAt: NOW_ISO,
      updatedAt: NOW_ISO,
    },
  ];

  const logs: AuditLogEntry[] = [
    {
      id: 'log-init',
      timestamp: NOW_ISO,
      actor: 'sistema',
      action: 'INITIALIZE_DEFAULT_STATE',
      target: 'CONFIGURACOES',
      status: 'ok',
      details: 'Estrutura inicial preparada sem dados pessoais fictícios.',
    },
  ];

  return {
    site: {
      config,
      pages,
      portfolio,
      gallery,
      banners,
      services,
      prices,
      testimonials,
      contacts,
      socialLinks,
      music,
      menu,
      seo,
      theme,
      priceDisclaimer: PRICE_DISCLAIMER_TEXT,
      lastUpdated: NOW_ISO,
      source: 'cache',
    },
    files,
    submissions: [],
    logs,
  };
}
