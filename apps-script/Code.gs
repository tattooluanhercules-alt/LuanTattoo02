/**
 * Code.gs — Ponto de entrada Web App do Google Apps Script
 * Responsável por rotear requisições autenticadas para Google Drive e Google Sheets.
 */

function doGet() {
  return jsonResponse_(true, 'Serviço Luan Hércules Tattoo Apps Script ativo.', {
    service: 'luanhtattoo-apps-script',
    timezone: STUDIO_TIMEZONE,
    timestamp: nowMaceioIso_()
  });
}

function doPost(e) {
  try {
    var rawBody = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    var body = JSON.parse(rawBody);
    var cfg = getAppConfig_(body.driveFolderId, body.sheetId);

    var auth = authorizeRequest_(body, cfg);
    if (!auth.ok) {
      return jsonResponse_(false, 'Não autorizado.', null, auth.error);
    }

    var action = auth.action;
    var payload = body.payload || {};
    var actor = String(payload.actor || 'backend');
    var data = null;

    switch (action) {
      case 'healthCheck':
        var folders = listFoldersService_(cfg.driveFolderId);
        var sheetsCount = ensureSheetsStructure_(cfg.sheetId);
        data = {
          driveConnected: true,
          sheetsConnected: true,
          folderCount: folders.length,
          sheetCount: sheetsCount
        };
        break;

      case 'syncWorkspace':
        var syncedFolders = ensureDriveFolders_(cfg.driveFolderId);
        var syncedSheets = ensureSheetsStructure_(cfg.sheetId);
        appendLog_(cfg.sheetId, actor, 'SYNC_WORKSPACE', 'INTEGRACAO', 'ok', 'Estrutura verificada.');
        data = {
          driveConnected: true,
          sheetsConnected: true,
          folderCount: syncedFolders.length,
          sheetCount: syncedSheets
        };
        break;

      case 'getWorkspaceStatus':
        data = {
          driveFolderId: cfg.driveFolderId,
          sheetId: cfg.sheetId,
          folders: listFoldersService_(cfg.driveFolderId)
        };
        break;

      case 'getConfig':
        data = getConfigService_(cfg.sheetId);
        break;
      case 'saveConfig':
        data = saveConfigService_(cfg.sheetId, payload);
        appendLog_(cfg.sheetId, actor, 'SAVE_CONFIG', 'CONFIGURACOES', 'ok', 'Configuração salva.');
        break;

      case 'getSiteContent':
        data = getSiteContentService_(cfg.sheetId);
        break;
      case 'saveSiteContent':
        if (payload.config) saveConfigService_(cfg.sheetId, { data: payload.config });
        data = { saved: true };
        appendLog_(cfg.sheetId, actor, 'SAVE_SITE_CONTENT', 'INTEGRACAO', 'ok', 'Conteúdo sincronizado.');
        break;

      case 'listFiles':
        data = listFilesService_(cfg.driveFolderId, payload.folderName || '', cfg.sheetId);
        break;
      case 'getFile':
        data = getFileService_(cfg.driveFolderId, payload);
        break;
      case 'uploadFile':
        data = uploadFileService_(cfg.driveFolderId, cfg.sheetId, payload);
        appendLog_(cfg.sheetId, actor, 'UPLOAD_FILE', payload.folderName, 'ok', data.file.name);
        break;
      case 'renameFile':
        data = renameFileService_(cfg.driveFolderId, cfg.sheetId, payload);
        appendLog_(cfg.sheetId, actor, 'RENAME_FILE', payload.fileId, 'ok', data.file.name);
        break;
      case 'deleteFile':
        data = deleteFileService_(cfg.driveFolderId, cfg.sheetId, payload);
        appendLog_(cfg.sheetId, actor, 'DELETE_FILE', payload.fileId, 'ok', 'Arquivo movido para lixeira.');
        break;
      case 'createFolder':
        data = createFolderService_(cfg.driveFolderId, payload);
        break;
      case 'listFolders':
        data = listFoldersService_(cfg.driveFolderId);
        break;

      case 'getGallery':
        data = getGalleryService_(cfg.sheetId);
        break;
      case 'saveGallery':
        data = saveGalleryService_(cfg.sheetId, payload);
        appendLog_(cfg.sheetId, actor, 'SAVE_GALLERY', 'GALERIA', 'ok', 'Galeria atualizada.');
        break;

      case 'getPortfolio':
        data = getPortfolioService_(cfg.sheetId);
        break;
      case 'savePortfolio':
        data = savePortfolioService_(cfg.sheetId, payload);
        appendLog_(cfg.sheetId, actor, 'SAVE_PORTFOLIO', 'PORTFOLIO', 'ok', 'Portfólio atualizado.');
        break;

      case 'getBanners':
        data = getBannersService_(cfg.sheetId);
        break;
      case 'saveBanners':
        data = saveBannersService_(cfg.sheetId, payload);
        appendLog_(cfg.sheetId, actor, 'SAVE_BANNERS', 'BANNERS', 'ok', 'Banners atualizados.');
        break;

      case 'getServices':
        data = getServicesService_(cfg.sheetId);
        break;
      case 'saveServices':
        data = saveServicesService_(cfg.sheetId, payload);
        appendLog_(cfg.sheetId, actor, 'SAVE_SERVICES', 'SERVICOS', 'ok', 'Serviços atualizados.');
        break;

      case 'getPrices':
        data = getPricesService_(cfg.sheetId);
        break;
      case 'savePrices':
        data = savePricesService_(cfg.sheetId, payload);
        appendLog_(cfg.sheetId, actor, 'SAVE_PRICES', 'PRECOS', 'ok', 'Preços atualizados.');
        break;

      case 'getContacts':
        data = getContactsService_(cfg.sheetId);
        break;
      case 'saveContacts':
        data = saveContactsService_(cfg.sheetId, payload);
        appendLog_(cfg.sheetId, actor, 'SAVE_CONTACTS', 'CONTATOS', 'ok', 'Contatos atualizados.');
        break;
      case 'saveContactSubmission':
        data = saveContactSubmissionService_(cfg.sheetId, payload);
        appendLog_(cfg.sheetId, 'visitante', 'NEW_CONTACT', 'CONTATOS', 'ok', 'Solicitação registrada.');
        break;

      case 'getSocialLinks':
        data = getSocialLinksService_(cfg.sheetId);
        break;
      case 'saveSocialLinks':
        data = saveSocialLinksService_(cfg.sheetId, payload);
        appendLog_(cfg.sheetId, actor, 'SAVE_SOCIAL', 'REDES_SOCIAIS', 'ok', 'Redes atualizadas.');
        break;

      case 'getMusic':
        data = getMusicService_(cfg.sheetId);
        break;
      case 'saveMusic':
        data = saveMusicService_(cfg.sheetId, payload);
        appendLog_(cfg.sheetId, actor, 'SAVE_MUSIC', 'MUSICAS', 'ok', 'Música atualizada.');
        break;

      case 'saveMenu':
        data = saveMenuService_(cfg.sheetId, payload);
        appendLog_(cfg.sheetId, actor, 'SAVE_MENU', 'MENU', 'ok', 'Menu atualizado.');
        break;
      case 'saveTestimonials':
        data = saveTestimonialsService_(cfg.sheetId, payload);
        appendLog_(cfg.sheetId, actor, 'SAVE_TESTIMONIALS', 'CACHE', 'ok', 'Depoimentos atualizados.');
        break;

      case 'getTheme':
        data = getThemeService_(cfg.sheetId);
        break;
      case 'saveTheme':
        data = saveThemeService_(cfg.sheetId, payload);
        appendLog_(cfg.sheetId, actor, 'SAVE_THEME', 'TEMA', 'ok', 'Tema atualizado.');
        break;

      case 'getSEO':
        data = getSeoService_(cfg.sheetId);
        break;
      case 'saveSEO':
        data = saveSeoService_(cfg.sheetId, payload);
        appendLog_(cfg.sheetId, actor, 'SAVE_SEO', 'SEO', 'ok', 'SEO atualizado.');
        break;

      case 'checkAdminExists':
        data = checkAdminExistsService_(cfg.sheetId);
        break;
      case 'getAdminUserByEmail':
        data = getAdminUserByEmailService_(cfg.sheetId, payload);
        break;
      case 'saveAdminUser':
        data = saveAdminUserService_(cfg.sheetId, payload);
        appendLog_(cfg.sheetId, payload.email, 'CREATE_ADMIN', 'USUARIOS', 'ok', 'Admin registrado.');
        break;
      case 'updateAdminPassword':
        data = updateAdminPasswordService_(cfg.sheetId, payload);
        appendLog_(cfg.sheetId, payload.email, 'UPDATE_PASSWORD', 'USUARIOS', 'ok', 'Senha atualizada.');
        break;
    }

    return jsonResponse_(true, 'Operação realizada com sucesso.', data);
  } catch (err) {
    return jsonResponse_(
      false,
      'Não foi possível concluir a operação.',
      null,
      err && err.message ? err.message : 'Erro interno no Apps Script'
    );
  }
}
