import { Router, type Request, type Response } from 'express';
import { studioRepo } from '../appsScriptClient.ts';
import { checkRateLimit, sanitizeText } from '../security.ts';

export const publicRouter = Router();

publicRouter.get('/health', async (_req: Request, res: Response) => {
  try {
    const status = await studioRepo.checkHealth();
    res.json({
      success: true,
      message: 'Serviço operacional',
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        integration: status,
      },
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar integridade do serviço',
      error: 'HEALTH_CHECK_FAILED',
    });
  }
});

publicRouter.get('/site', async (req: Request, res: Response) => {
  try {
    const refresh = req.query.refresh === 'true';
    const bundle = await studioRepo.getSiteBundle(refresh);
    res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');
    res.json({
      success: true,
      message: 'Conteúdo do site carregado',
      data: bundle,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Não foi possível carregar os dados do site',
      error: 'SITE_LOAD_FAILED',
    });
  }
});

publicRouter.get('/config', async (_req, res) => {
  const bundle = await studioRepo.getSiteBundle();
  res.json({ success: true, message: 'Configurações carregadas', data: bundle.config });
});

publicRouter.get('/gallery', async (_req, res) => {
  const bundle = await studioRepo.getSiteBundle();
  res.json({ success: true, message: 'Galeria carregada', data: bundle.gallery });
});

publicRouter.get('/portfolio', async (_req, res) => {
  const bundle = await studioRepo.getSiteBundle();
  res.json({ success: true, message: 'Portfólio carregado', data: bundle.portfolio });
});

publicRouter.get('/banners', async (_req, res) => {
  const bundle = await studioRepo.getSiteBundle();
  res.json({ success: true, message: 'Banners carregados', data: bundle.banners });
});

publicRouter.get('/services', async (_req, res) => {
  const bundle = await studioRepo.getSiteBundle();
  res.json({ success: true, message: 'Serviços carregados', data: bundle.services });
});

publicRouter.get('/prices', async (_req, res) => {
  const bundle = await studioRepo.getSiteBundle();
  res.json({
    success: true,
    message: 'Referências de valores carregadas',
    data: { items: bundle.prices, disclaimer: bundle.priceDisclaimer },
  });
});

publicRouter.get('/testimonials', async (_req, res) => {
  const bundle = await studioRepo.getSiteBundle();
  res.json({
    success: true,
    message: 'Depoimentos carregados',
    data: bundle.testimonials.filter((t) => t.published),
  });
});

publicRouter.get('/contacts', async (_req, res) => {
  const bundle = await studioRepo.getSiteBundle();
  res.json({ success: true, message: 'Contatos carregados', data: bundle.contacts });
});

publicRouter.post('/contacts', async (req: Request, res: Response) => {
  const clientIp = req.ip || 'unknown';
  const rate = checkRateLimit(`contact:${clientIp}`, 5, 10 * 60 * 1000);
  if (!rate.allowed) {
    res.status(429).json({
      success: false,
      message: `Muitas solicitações enviadas. Aguarde ${rate.retryAfterSeconds}s antes de tentar novamente.`,
      error: 'RATE_LIMITED',
    });
    return;
  }

  const name = sanitizeText(req.body?.name, 120);
  const contactChannel = sanitizeText(req.body?.contactChannel, 160);
  const idea = sanitizeText(req.body?.idea, 1500);
  const placement = sanitizeText(req.body?.placement, 120);
  const sizeEstimate = sanitizeText(req.body?.sizeEstimate, 80);

  if (name.length < 2 || contactChannel.length < 4 || idea.length < 10) {
    res.status(400).json({
      success: false,
      message:
        'Preencha nome, contato (WhatsApp ou e-mail) e uma descrição da sua ideia (mínimo 10 caracteres).',
      error: 'INVALID_CONTACT_PAYLOAD',
    });
    return;
  }

  try {
    const saved = await studioRepo.submitContact({
      name,
      contactChannel,
      idea,
      placement: placement || 'A definir',
      sizeEstimate: sizeEstimate || 'A definir',
    });
    res.status(201).json({
      success: true,
      message: 'Solicitação enviada com sucesso. Retornaremos em breve.',
      data: { id: saved.id, createdAt: saved.createdAt },
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Não foi possível registrar sua solicitação.',
      error: 'CONTACT_SUBMIT_FAILED',
    });
  }
});

publicRouter.get('/social', async (_req, res) => {
  const bundle = await studioRepo.getSiteBundle();
  res.json({
    success: true,
    message: 'Redes sociais carregadas',
    data: bundle.socialLinks.filter((s) => s.active),
  });
});

publicRouter.get('/music', async (_req, res) => {
  const bundle = await studioRepo.getSiteBundle();
  res.json({ success: true, message: 'Música ambiente carregada', data: bundle.music });
});

publicRouter.get('/menu', async (_req, res) => {
  const bundle = await studioRepo.getSiteBundle();
  res.json({ success: true, message: 'Menu carregado', data: bundle.menu });
});

publicRouter.get('/theme', async (_req, res) => {
  const bundle = await studioRepo.getSiteBundle();
  res.json({ success: true, message: 'Tema carregado', data: bundle.theme });
});

publicRouter.get('/seo', async (_req, res) => {
  const bundle = await studioRepo.getSiteBundle();
  res.json({ success: true, message: 'SEO carregado', data: bundle.seo });
});

publicRouter.get('/media/:fileId', async (req: Request, res: Response) => {
  const rawFileId = req.params.fileId;
  const fileId = Array.isArray(rawFileId) ? rawFileId[0] : rawFileId;
  if (!fileId || !/^[a-zA-Z0-9_-]{8,100}$/.test(fileId)) {
    res.status(400).json({
      success: false,
      message: 'Identificador de mídia inválido.',
      error: 'INVALID_FILE_ID',
    });
    return;
  }

  try {
    const fileData = await studioRepo.fetchDriveFileProxy(fileId);
    if (!fileData) {
      res.status(404).json({
        success: false,
        message: 'Arquivo não encontrado.',
        error: 'MEDIA_NOT_FOUND',
      });
      return;
    }
    res.setHeader('Content-Type', fileData.contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(fileData.buffer);
  } catch {
    res.status(502).json({
      success: false,
      message: 'Não foi possível carregar o arquivo do Drive.',
      error: 'MEDIA_PROXY_ERROR',
    });
  }
});
