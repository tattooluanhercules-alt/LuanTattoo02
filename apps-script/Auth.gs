/**
 * Auth.gs — Validação de segredo de integração e controle de ações permitidas
 */

var ALLOWED_ACTIONS = [
  'healthCheck',
  'syncWorkspace',
  'getConfig',
  'saveConfig',
  'getSiteContent',
  'saveSiteContent',
  'listFiles',
  'getFile',
  'uploadFile',
  'deleteFile',
  'renameFile',
  'createFolder',
  'listFolders',
  'getGallery',
  'saveGallery',
  'getPortfolio',
  'savePortfolio',
  'getBanners',
  'saveBanners',
  'getServices',
  'saveServices',
  'getPrices',
  'savePrices',
  'getContacts',
  'saveContacts',
  'saveContactSubmission',
  'getSocialLinks',
  'saveSocialLinks',
  'getMusic',
  'saveMusic',
  'saveMenu',
  'saveTestimonials',
  'getTheme',
  'saveTheme',
  'getSEO',
  'saveSEO',
  'getWorkspaceStatus',
  'checkAdminExists',
  'getAdminUserByEmail',
  'saveAdminUser',
  'updateAdminPassword'
];

function constantTimeEquals_(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length === 0 || b.length === 0) return false;
  var maxLen = Math.max(a.length, b.length);
  var diff = a.length ^ b.length;
  for (var i = 0; i < maxLen; i++) {
    var ca = i < a.length ? a.charCodeAt(i) : 0;
    var cb = i < b.length ? b.charCodeAt(i) : 0;
    diff |= ca ^ cb;
  }
  return diff === 0;
}

function authorizeRequest_(body, cfg) {
  if (!cfg.secret) {
    return {
      ok: false,
      error: 'APPS_SCRIPT_SECRET não configurado nas Propriedades do Script.'
    };
  }
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Corpo da requisição inválido.' };
  }
  if (!constantTimeEquals_(String(body.secret || ''), String(cfg.secret))) {
    return { ok: false, error: 'Falha de autenticação na integração.' };
  }
  var action = String(body.action || '');
  if (ALLOWED_ACTIONS.indexOf(action) === -1) {
    return { ok: false, error: 'Operação não permitida: ' + action };
  }
  return { ok: true, action: action };
}
