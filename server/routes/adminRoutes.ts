import { Router, type NextFunction, type Request, type Response } from 'express';
import { studioRepo } from '../appsScriptClient.ts';
import {
  checkRateLimit,
  isSafeUrl,
  isValidDriveFolder,
  issueSessionToken,
  revokeSessionToken,
  sanitizeFilename,
  sanitizeText,
  sanitizeUrl,
  validateUploadPayload,
  verifySessionToken,
} from '../security.ts';
import type {
  AdminUserSession,
  BannerItem,
  ContactInfo,
  GalleryItem,
  MenuItem,
  MusicConfig,
  PortfolioItem,
  PriceItem,
  SeoConfig,
  ServiceItem,
  SocialLinkItem,
  StudioConfig,
  TestimonialItem,
  ThemeConfig,
} from '../../src/types/studio.ts';

interface AuthenticatedRequest extends Request {
  adminSession?: AdminUserSession;
  bearerToken?: string;
}

function extractBearerToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (!header || typeof header !== 'string') return undefined;
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return undefined;
  return token.trim();
}

export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const token = extractBearerToken(req);
  const session = verifySessionToken(token);
  if (!session) {
    res.status(401).json({
      success: false,
      message: 'Sessão administrativa ausente ou expirada. Faça login novamente.',
      error: 'UNAUTHORIZED',
    });
    return;
  }
  req.adminSession = session;
  req.bearerToken = token;
  next();
}

function sanitizeMediaUrl(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim().slice(0, 2_000_000);
  if (
    /^data:(image\/(jpeg|png|webp|avif)|audio\/(mpeg|mp3|wav|ogg|mp4)|video\/(mp4|webm));base64,[A-Za-z0-9+/=]+$/.test(
      trimmed
    )
  ) {
    return trimmed;
  }
  return isSafeUrl(trimmed) ? trimmed : '';
}

export const adminRouter = Router();

// --- Auth & Bootstrap ---
adminRouter.get('/bootstrap-status', async (_req: Request, res: Response) => {
  try {
    const status = await studioRepo.isBootstrapRequired();
    res.json({
      success: true,
      message: 'Status de inicialização verificado',
      data: status,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar estado inicial do administrador.',
      error: 'BOOTSTRAP_STATUS_ERROR',
    });
  }
});

adminRouter.post('/bootstrap', async (req: Request, res: Response) => {
  const rate = checkRateLimit(`bootstrap:${req.ip || 'ip'}`, 5, 15 * 60 * 1000);
  if (!rate.allowed) {
    res.status(429).json({
      success: false,
      message: `Muitas tentativas. Aguarde ${rate.retryAfterSeconds}s.`,
      error: 'RATE_LIMITED',
    });
    return;
  }

  const email = sanitizeText(req.body?.email, 160).toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (password.length < 8 || password.length > 128) {
    res.status(400).json({
      success: false,
      message: 'A senha deve conter entre 8 e 128 caracteres.',
      error: 'WEAK_PASSWORD',
    });
    return;
  }

  try {
    const user = await studioRepo.bootstrapAdmin(email, password);
    const { token, session } = issueSessionToken(user.email);
    res.status(201).json({
      success: true,
      message: 'Administrador inicial configurado com sucesso.',
      data: { token, session },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err instanceof Error ? err.message : 'Falha ao configurar administrador.',
      error: 'BOOTSTRAP_FAILED',
    });
  }
});

adminRouter.post('/login', async (req: Request, res: Response) => {
  const rate = checkRateLimit(`login:${req.ip || 'ip'}`, 8, 10 * 60 * 1000);
  if (!rate.allowed) {
    res.status(429).json({
      success: false,
      message: `Limite de tentativas atingido. Aguarde ${rate.retryAfterSeconds}s.`,
      error: 'RATE_LIMITED',
    });
    return;
  }

  const email = sanitizeText(req.body?.email, 160).toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: 'Informe e-mail e senha para entrar.',
      error: 'MISSING_CREDENTIALS',
    });
    return;
  }

  const authenticatedEmail = await studioRepo.authenticateAdmin(email, password);
  if (!authenticatedEmail) {
    res.status(401).json({
      success: false,
      message: 'E-mail ou senha inválidos.',
      error: 'INVALID_CREDENTIALS',
    });
    return;
  }

  const { token, session } = issueSessionToken(authenticatedEmail);
  res.json({
    success: true,
    message: 'Login realizado com sucesso.',
    data: { token, session },
  });
});

adminRouter.post('/logout', (req: AuthenticatedRequest, res: Response) => {
  const token = extractBearerToken(req);
  revokeSessionToken(token);
  res.json({
    success: true,
    message: 'Sessão encerrada com segurança.',
  });
});

adminRouter.get('/session', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    message: 'Sessão ativa.',
    data: { session: req.adminSession },
  });
});

adminRouter.post(
  '/change-password',
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    const currentPassword =
      typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : '';
    const newPassword =
      typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';

    if (newPassword.length < 8 || newPassword.length > 128) {
      res.status(400).json({
        success: false,
        message: 'A nova senha deve ter entre 8 e 128 caracteres.',
        error: 'WEAK_PASSWORD',
      });
      return;
    }

    try {
      await studioRepo.changeAdminPassword(
        req.adminSession!.email,
        currentPassword,
        newPassword
      );
      res.json({
        success: true,
        message: 'Senha atualizada com sucesso.',
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : 'Erro ao alterar senha.',
        error: 'PASSWORD_CHANGE_FAILED',
      });
    }
  }
);

// --- Dashboard & Sync ---
adminRouter.get('/dashboard', requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const [integration, bundle, media, submissions] = await Promise.all([
      studioRepo.checkHealth(),
      studioRepo.getSiteBundle(),
      studioRepo.listFiles(),
      Promise.resolve(studioRepo.getSubmissions()),
    ]);

    res.json({
      success: true,
      message: 'Dashboard carregado',
      data: {
        integration,
        metrics: {
          imagesCount: media.files.filter((f) => f.mimeType.startsWith('image/')).length,
          portfolioCount: bundle.portfolio.length,
          galleryCount: bundle.gallery.length,
          servicesCount: bundle.services.length,
          submissionsCount: submissions.length,
          totalFilesCount: media.files.length,
        },
        logs: studioRepo.getLogs().slice(0, 20),
        submissions,
      },
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Não foi possível carregar os dados do painel.',
      error: 'DASHBOARD_ERROR',
    });
  }
});

adminRouter.post('/sync', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const status = await studioRepo.syncWorkspace(req.adminSession!.email);
    res.json({
      success: true,
      message: 'Sincronização executada com sucesso.',
      data: status,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err instanceof Error ? err.message : 'Falha na sincronização.',
      error: 'SYNC_FAILED',
    });
  }
});

// --- Drive Media Management ---
adminRouter.get('/files', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const folder = sanitizeText(req.query.folder, 64);
  if (folder && !isValidDriveFolder(folder)) {
    res.status(400).json({
      success: false,
      message: 'Pasta do Google Drive inválida.',
      error: 'INVALID_FOLDER',
    });
    return;
  }
  const result = await studioRepo.listFiles(folder || undefined);
  res.json({
    success: true,
    message: 'Arquivos listados com sucesso',
    data: result,
  });
});

adminRouter.post('/upload', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const rate = checkRateLimit(`upload:${req.adminSession!.email}`, 25, 10 * 60 * 1000);
  if (!rate.allowed) {
    res.status(429).json({
      success: false,
      message: `Muitos envios seguidos. Aguarde ${rate.retryAfterSeconds}s.`,
      error: 'RATE_LIMITED',
    });
    return;
  }

  const folderName = sanitizeText(req.body?.folderName, 64) || '12_ARQUIVOS_GERAIS';
  if (!isValidDriveFolder(folderName)) {
    res.status(400).json({
      success: false,
      message: 'Pasta de destino inválida.',
      error: 'INVALID_FOLDER',
    });
    return;
  }

  const validation = validateUploadPayload(
    req.body?.name,
    req.body?.mimeType,
    req.body?.base64Content
  );
  if (!validation.valid || !validation.safeName || !validation.mimeType || !validation.sizeBytes) {
    res.status(400).json({
      success: false,
      message: validation.error || 'Arquivo inválido.',
      error: 'INVALID_UPLOAD',
    });
    return;
  }

  try {
    const file = await studioRepo.uploadFile({
      name: validation.safeName,
      mimeType: validation.mimeType,
      sizeBytes: validation.sizeBytes,
      base64Content: String(req.body.base64Content),
      folderName,
      sectionBinding: sanitizeText(req.body?.sectionBinding, 100) || undefined,
      actorEmail: req.adminSession!.email,
    });
    res.status(201).json({
      success: true,
      message: 'Arquivo enviado com sucesso.',
      data: { file },
    });
  } catch (err) {
    res.status(502).json({
      success: false,
      message: err instanceof Error ? err.message : 'Falha no envio do arquivo.',
      error: 'UPLOAD_FAILED',
    });
  }
});

adminRouter.patch('/files/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const rawId = req.params.id;
  const id = sanitizeText(Array.isArray(rawId) ? rawId[0] : rawId, 120);
  const newName = req.body?.name ? sanitizeFilename(String(req.body.name)) : '';
  const sectionBinding =
    req.body?.sectionBinding !== undefined
      ? sanitizeText(req.body.sectionBinding, 100)
      : undefined;

  if (!id || (!newName && sectionBinding === undefined)) {
    res.status(400).json({
      success: false,
      message: 'Informe um novo nome ou vínculo de seção para atualizar.',
      error: 'INVALID_FILE_UPDATE',
    });
    return;
  }

  try {
    const updated = await studioRepo.renameFile(
      id,
      newName,
      sectionBinding,
      req.adminSession!.email
    );
    if (!updated) {
      res.status(404).json({
        success: false,
        message: 'Arquivo não encontrado.',
        error: 'FILE_NOT_FOUND',
      });
      return;
    }
    res.json({
      success: true,
      message: 'Arquivo atualizado com sucesso.',
      data: { file: updated },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err instanceof Error ? err.message : 'Erro ao atualizar arquivo.',
      error: 'FILE_UPDATE_FAILED',
    });
  }
});

adminRouter.delete('/files/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const rawId = req.params.id;
  const id = sanitizeText(Array.isArray(rawId) ? rawId[0] : rawId, 120);
  const confirmed = req.body?.confirm === true || req.query.confirm === 'true';

  if (!confirmed) {
    res.status(400).json({
      success: false,
      message: 'Confirmação explícita obrigatória para excluir arquivos.',
      error: 'CONFIRMATION_REQUIRED',
    });
    return;
  }

  try {
    const deleted = await studioRepo.deleteFile(id, req.adminSession!.email);
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Arquivo não encontrado.',
        error: 'FILE_NOT_FOUND',
      });
      return;
    }
    res.json({
      success: true,
      message: 'Arquivo excluído com sucesso.',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err instanceof Error ? err.message : 'Erro ao excluir arquivo.',
      error: 'FILE_DELETE_FAILED',
    });
  }
});

// --- Content Section Updates (All Protected) ---
adminRouter.put('/content/config', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const b = req.body || {};
  const current = (await studioRepo.getSiteBundle()).config;
  const updated: StudioConfig = {
    ...current,
    studioName: sanitizeText(b.studioName, 100) || current.studioName,
    tagline: sanitizeText(b.tagline, 140) || current.tagline,
    heroTitle: sanitizeText(b.heroTitle, 220) || current.heroTitle,
    heroSubtitle: sanitizeText(b.heroSubtitle, 400),
    heroCtaPrimary: sanitizeText(b.heroCtaPrimary, 60) || current.heroCtaPrimary,
    heroCtaSecondary: sanitizeText(b.heroCtaSecondary, 60) || current.heroCtaSecondary,
    heroMediaUrl: sanitizeMediaUrl(b.heroMediaUrl) || current.heroMediaUrl,
    heroMediaType: b.heroMediaType === 'video' ? 'video' : 'image',
    aboutTitle: sanitizeText(b.aboutTitle, 220) || current.aboutTitle,
    aboutStory: sanitizeText(b.aboutStory, 3000),
    aboutExperience: sanitizeText(b.aboutExperience, 1500),
    aboutSpecialties: Array.isArray(b.aboutSpecialties)
      ? b.aboutSpecialties
          .map((item: unknown) => sanitizeText(item, 60))
          .filter(Boolean)
          .slice(0, 12)
      : current.aboutSpecialties,
    aboutImageUrl: sanitizeMediaUrl(b.aboutImageUrl) || current.aboutImageUrl,
    footerText: sanitizeText(b.footerText, 300),
    currency: 'BRL',
    timezone: 'America/Maceio',
    updatedAt: new Date().toISOString(),
  };

  try {
    const data = await studioRepo.updateSection(
      'config',
      updated,
      req.adminSession!.email,
      'saveConfig'
    );
    res.json({ success: true, message: 'Configurações gerais salvas.', data });
  } catch (err) {
    res.status(502).json({
      success: false,
      message: err instanceof Error ? err.message : 'Erro ao salvar configurações.',
      error: 'SAVE_CONFIG_FAILED',
    });
  }
});

adminRouter.put('/content/portfolio', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : null;
  if (!items) {
    res.status(400).json({ success: false, message: 'Lista inválida.', error: 'INVALID_PAYLOAD' });
    return;
  }
  const now = new Date().toISOString();
  const sanitized: PortfolioItem[] = items.slice(0, 80).map((item: Record<string, unknown>, idx: number) => ({
    id: sanitizeText(item.id, 64) || `port-${idx + 1}`,
    title: sanitizeText(item.title, 140) || 'Projeto sem título',
    category: sanitizeText(item.category, 60) || 'Autoral',
    description: sanitizeText(item.description, 800),
    imageUrl: sanitizeMediaUrl(item.imageUrl),
    driveFileId: sanitizeText(item.driveFileId, 120) || undefined,
    featured: Boolean(item.featured),
    isPlaceholder: Boolean(item.isPlaceholder),
    createdAt: sanitizeText(item.createdAt, 40) || now,
    updatedAt: now,
  }));

  try {
    const data = await studioRepo.updateSection(
      'portfolio',
      sanitized,
      req.adminSession!.email,
      'savePortfolio'
    );
    res.json({ success: true, message: 'Portfólio salvo com sucesso.', data });
  } catch (err) {
    res.status(502).json({
      success: false,
      message: err instanceof Error ? err.message : 'Erro ao salvar portfólio.',
      error: 'SAVE_PORTFOLIO_FAILED',
    });
  }
});

adminRouter.put('/content/gallery', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : null;
  if (!items) {
    res.status(400).json({ success: false, message: 'Lista inválida.', error: 'INVALID_PAYLOAD' });
    return;
  }
  const now = new Date().toISOString();
  const sanitized: GalleryItem[] = items.slice(0, 120).map((item: Record<string, unknown>, idx: number) => ({
    id: sanitizeText(item.id, 64) || `gal-${idx + 1}`,
    title: sanitizeText(item.title, 140) || 'Imagem sem título',
    category: sanitizeText(item.category, 60) || 'Geral',
    imageUrl: sanitizeMediaUrl(item.imageUrl),
    driveFileId: sanitizeText(item.driveFileId, 120) || undefined,
    caption: sanitizeText(item.caption, 400),
    order: typeof item.order === 'number' ? item.order : idx + 1,
    isPlaceholder: Boolean(item.isPlaceholder),
    createdAt: sanitizeText(item.createdAt, 40) || now,
    updatedAt: now,
  }));

  try {
    const data = await studioRepo.updateSection(
      'gallery',
      sanitized,
      req.adminSession!.email,
      'saveGallery'
    );
    res.json({ success: true, message: 'Galeria salva com sucesso.', data });
  } catch (err) {
    res.status(502).json({
      success: false,
      message: err instanceof Error ? err.message : 'Erro ao salvar galeria.',
      error: 'SAVE_GALLERY_FAILED',
    });
  }
});

adminRouter.put('/content/banners', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : null;
  if (!items) {
    res.status(400).json({ success: false, message: 'Lista inválida.', error: 'INVALID_PAYLOAD' });
    return;
  }
  const now = new Date().toISOString();
  const sanitized: BannerItem[] = items.slice(0, 20).map((item: Record<string, unknown>, idx: number) => ({
    id: sanitizeText(item.id, 64) || `ban-${idx + 1}`,
    title: sanitizeText(item.title, 140),
    subtitle: sanitizeText(item.subtitle, 280),
    imageUrl: sanitizeMediaUrl(item.imageUrl),
    driveFileId: sanitizeText(item.driveFileId, 120) || undefined,
    linkUrl: sanitizeUrl(item.linkUrl, 300) || '/contato',
    active: Boolean(item.active),
    placement:
      item.placement === 'sobre' ||
      item.placement === 'portfolio' ||
      item.placement === 'contato'
        ? item.placement
        : 'hero',
    updatedAt: now,
  }));

  try {
    const data = await studioRepo.updateSection(
      'banners',
      sanitized,
      req.adminSession!.email,
      'saveBanners'
    );
    res.json({ success: true, message: 'Banners salvos com sucesso.', data });
  } catch (err) {
    res.status(502).json({
      success: false,
      message: err instanceof Error ? err.message : 'Erro ao salvar banners.',
      error: 'SAVE_BANNERS_FAILED',
    });
  }
});

adminRouter.put('/content/services', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : null;
  if (!items) {
    res.status(400).json({ success: false, message: 'Lista inválida.', error: 'INVALID_PAYLOAD' });
    return;
  }
  const now = new Date().toISOString();
  const sanitized: ServiceItem[] = items.slice(0, 30).map((item: Record<string, unknown>, idx: number) => ({
    id: sanitizeText(item.id, 64) || `srv-${idx + 1}`,
    title: sanitizeText(item.title, 140) || 'Serviço',
    description: sanitizeText(item.description, 1000),
    imageUrl: sanitizeMediaUrl(item.imageUrl),
    driveFileId: sanitizeText(item.driveFileId, 120) || undefined,
    sessionInfo: sanitizeText(item.sessionInfo, 240),
    order: typeof item.order === 'number' ? item.order : idx + 1,
    active: Boolean(item.active),
    updatedAt: now,
  }));

  try {
    const data = await studioRepo.updateSection(
      'services',
      sanitized,
      req.adminSession!.email,
      'saveServices'
    );
    res.json({ success: true, message: 'Serviços salvos com sucesso.', data });
  } catch (err) {
    res.status(502).json({
      success: false,
      message: err instanceof Error ? err.message : 'Erro ao salvar serviços.',
      error: 'SAVE_SERVICES_FAILED',
    });
  }
});

adminRouter.put('/content/prices', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : null;
  if (!items) {
    res.status(400).json({ success: false, message: 'Lista inválida.', error: 'INVALID_PAYLOAD' });
    return;
  }
  const now = new Date().toISOString();
  const sanitized: PriceItem[] = items.slice(0, 30).map((item: Record<string, unknown>, idx: number) => ({
    id: sanitizeText(item.id, 64) || `prc-${idx + 1}`,
    title: sanitizeText(item.title, 140) || 'Categoria',
    description: sanitizeText(item.description, 600),
    estimateLabel: sanitizeText(item.estimateLabel, 120),
    notes: sanitizeText(item.notes, 300),
    order: typeof item.order === 'number' ? item.order : idx + 1,
    active: Boolean(item.active),
    updatedAt: now,
  }));

  try {
    const data = await studioRepo.updateSection(
      'prices',
      sanitized,
      req.adminSession!.email,
      'savePrices'
    );
    res.json({ success: true, message: 'Tabela de referências salva.', data });
  } catch (err) {
    res.status(502).json({
      success: false,
      message: err instanceof Error ? err.message : 'Erro ao salvar preços.',
      error: 'SAVE_PRICES_FAILED',
    });
  }
});

adminRouter.put('/content/testimonials', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : null;
  if (!items) {
    res.status(400).json({ success: false, message: 'Lista inválida.', error: 'INVALID_PAYLOAD' });
    return;
  }
  const now = new Date().toISOString();
  const sanitized: TestimonialItem[] = items.slice(0, 40).map((item: Record<string, unknown>, idx: number) => ({
    id: sanitizeText(item.id, 64) || `dep-${idx + 1}`,
    clientName: sanitizeText(item.clientName, 100),
    projectLabel: sanitizeText(item.projectLabel, 120),
    quote: sanitizeText(item.quote, 600),
    published: Boolean(item.published),
    createdAt: sanitizeText(item.createdAt, 40) || now,
  }));

  try {
    const data = await studioRepo.updateSection(
      'testimonials',
      sanitized,
      req.adminSession!.email,
      'saveTestimonials'
    );
    res.json({ success: true, message: 'Depoimentos salvos com sucesso.', data });
  } catch (err) {
    res.status(502).json({
      success: false,
      message: err instanceof Error ? err.message : 'Erro ao salvar depoimentos.',
      error: 'SAVE_TESTIMONIALS_FAILED',
    });
  }
});

adminRouter.put('/content/contacts', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const b = req.body || {};
  const updated: ContactInfo = {
    id: 'cnt-principal',
    whatsappNumber: sanitizeText(b.whatsappNumber, 40).replace(/[^0-9+()\s-]/g, ''),
    whatsappMessage: sanitizeText(b.whatsappMessage, 300),
    instagramHandle: sanitizeText(b.instagramHandle, 80),
    email: sanitizeText(b.email, 160),
    address: sanitizeText(b.address, 260),
    cityState: sanitizeText(b.cityState, 120),
    businessHours: sanitizeText(b.businessHours, 200),
    bookingNotice: sanitizeText(b.bookingNotice, 400),
    updatedAt: new Date().toISOString(),
  };

  try {
    const data = await studioRepo.updateSection(
      'contacts',
      updated,
      req.adminSession!.email,
      'saveContacts'
    );
    res.json({ success: true, message: 'Contatos salvos com sucesso.', data });
  } catch (err) {
    res.status(502).json({
      success: false,
      message: err instanceof Error ? err.message : 'Erro ao salvar contatos.',
      error: 'SAVE_CONTACTS_FAILED',
    });
  }
});

adminRouter.put('/content/social', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : null;
  if (!items) {
    res.status(400).json({ success: false, message: 'Lista inválida.', error: 'INVALID_PAYLOAD' });
    return;
  }
  const now = new Date().toISOString();
  const allowedPlatforms = ['Instagram', 'WhatsApp', 'TikTok', 'Facebook', 'YouTube', 'Outro'];
  const sanitized: SocialLinkItem[] = items.slice(0, 20).map((item: Record<string, unknown>, idx: number) => ({
    id: sanitizeText(item.id, 64) || `soc-${idx + 1}`,
    platform: allowedPlatforms.includes(String(item.platform))
      ? (item.platform as SocialLinkItem['platform'])
      : 'Outro',
    label: sanitizeText(item.label, 80),
    url: sanitizeUrl(item.url, 400),
    active: Boolean(item.active),
    order: typeof item.order === 'number' ? item.order : idx + 1,
    updatedAt: now,
  }));

  try {
    const data = await studioRepo.updateSection(
      'socialLinks',
      sanitized,
      req.adminSession!.email,
      'saveSocialLinks'
    );
    res.json({ success: true, message: 'Redes sociais salvas.', data });
  } catch (err) {
    res.status(502).json({
      success: false,
      message: err instanceof Error ? err.message : 'Erro ao salvar redes sociais.',
      error: 'SAVE_SOCIAL_FAILED',
    });
  }
});

adminRouter.put('/content/music', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const b = req.body || {};
  const vol = typeof b.initialVolume === 'number' ? b.initialVolume : 0.35;
  const updated: MusicConfig = {
    id: 'mus-principal',
    enabled: Boolean(b.enabled),
    title: sanitizeText(b.title, 120) || 'Ambiente do Estúdio',
    artist: sanitizeText(b.artist, 120) || 'Luan Hércules Tattoo',
    audioUrl: sanitizeMediaUrl(b.audioUrl),
    driveFileId: sanitizeText(b.driveFileId, 120) || undefined,
    initialVolume: Math.max(0, Math.min(1, vol)),
    loop: Boolean(b.loop),
    manualPlayOnly: true, // Sempre exige interação do usuário (política do navegador)
    updatedAt: new Date().toISOString(),
  };

  try {
    const data = await studioRepo.updateSection(
      'music',
      updated,
      req.adminSession!.email,
      'saveMusic'
    );
    res.json({ success: true, message: 'Configuração de música salva.', data });
  } catch (err) {
    res.status(502).json({
      success: false,
      message: err instanceof Error ? err.message : 'Erro ao salvar música.',
      error: 'SAVE_MUSIC_FAILED',
    });
  }
});

adminRouter.put('/content/menu', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : null;
  if (!items) {
    res.status(400).json({ success: false, message: 'Lista inválida.', error: 'INVALID_PAYLOAD' });
    return;
  }
  const sanitized: MenuItem[] = items.slice(0, 12).map((item: Record<string, unknown>, idx: number) => ({
    id: sanitizeText(item.id, 64) || `mnu-${idx + 1}`,
    label: sanitizeText(item.label, 40) || 'Link',
    path: sanitizeUrl(item.path, 120) || '/',
    order: typeof item.order === 'number' ? item.order : idx + 1,
    visible: Boolean(item.visible),
  }));

  try {
    const data = await studioRepo.updateSection(
      'menu',
      sanitized,
      req.adminSession!.email,
      'saveMenu'
    );
    res.json({ success: true, message: 'Menu salvo com sucesso.', data });
  } catch (err) {
    res.status(502).json({
      success: false,
      message: err instanceof Error ? err.message : 'Erro ao salvar menu.',
      error: 'SAVE_MENU_FAILED',
    });
  }
});

adminRouter.put('/content/seo', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const b = req.body || {};
  const updated: SeoConfig = {
    id: 'seo-principal',
    siteTitle: sanitizeText(b.siteTitle, 120),
    metaDescription: sanitizeText(b.metaDescription, 220),
    ogTitle: sanitizeText(b.ogTitle, 120),
    ogDescription: sanitizeText(b.ogDescription, 220),
    ogImageUrl: sanitizeMediaUrl(b.ogImageUrl),
    canonicalDomain: sanitizeUrl(b.canonicalDomain, 200) || 'https://luanhtattoo.vercel.app',
    keywords: sanitizeText(b.keywords, 300),
    updatedAt: new Date().toISOString(),
  };

  try {
    const data = await studioRepo.updateSection(
      'seo',
      updated,
      req.adminSession!.email,
      'saveSEO'
    );
    res.json({ success: true, message: 'Configurações de SEO salvas.', data });
  } catch (err) {
    res.status(502).json({
      success: false,
      message: err instanceof Error ? err.message : 'Erro ao salvar SEO.',
      error: 'SAVE_SEO_FAILED',
    });
  }
});

adminRouter.put('/content/theme', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const b = req.body || {};
  const hexRegex = /^#[0-9A-Fa-f]{6}$/;
  const current = (await studioRepo.getSiteBundle()).theme;
  const updated: ThemeConfig = {
    id: 'thm-principal',
    backgroundColor: hexRegex.test(String(b.backgroundColor))
      ? String(b.backgroundColor)
      : current.backgroundColor,
    surfaceColor: hexRegex.test(String(b.surfaceColor))
      ? String(b.surfaceColor)
      : current.surfaceColor,
    textColor: hexRegex.test(String(b.textColor)) ? String(b.textColor) : current.textColor,
    accentColor: hexRegex.test(String(b.accentColor))
      ? String(b.accentColor)
      : current.accentColor,
    borderRadius:
      b.borderRadius === 'sharp' || b.borderRadius === 'editorial'
        ? b.borderRadius
        : 'subtle',
    updatedAt: new Date().toISOString(),
  };

  try {
    const data = await studioRepo.updateSection(
      'theme',
      updated,
      req.adminSession!.email,
      'saveTheme'
    );
    res.json({ success: true, message: 'Tema atualizado com sucesso.', data });
  } catch (err) {
    res.status(502).json({
      success: false,
      message: err instanceof Error ? err.message : 'Erro ao salvar tema.',
      error: 'SAVE_THEME_FAILED',
    });
  }
});
