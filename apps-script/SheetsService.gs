/**
 * SheetsService.gs — Persistência central nas 18 abas do Google Sheets
 */

function openSpreadsheet_(sheetId) {
  return SpreadsheetApp.openById(sheetId);
}

function ensureSheetsStructure_(sheetId) {
  var ss = openSpreadsheet_(sheetId);
  var tabNames = Object.keys(SHEET_SCHEMAS);
  for (var i = 0; i < tabNames.length; i++) {
    var name = tabNames[i];
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    var expectedHeaders = SHEET_SCHEMAS[name];
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
      sheet.setFrozenRows(1);
    }
  }
  return tabNames.length;
}

function getSheet_(sheetId, tabName) {
  var ss = openSpreadsheet_(sheetId);
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    ensureSheetsStructure_(sheetId);
    sheet = ss.getSheetByName(tabName);
  }
  return sheet;
}

function readRowsAsObjects_(sheetId, tabName) {
  var sheet = getSheet_(sheetId, tabName);
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol === 0) return [];
  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = values[0];
  var list = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    if (row.join('') === '') continue;
    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      obj[headers[c]] = unsanitizeCell_(row[c]);
    }
    list.push(obj);
  }
  return list;
}

function replaceTabRows_(sheetId, tabName, rowsMatrix) {
  var sheet = getSheet_(sheetId, tabName);
  var headers = SHEET_SCHEMAS[tabName];
  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  if (rowsMatrix.length > 0) {
    sheet.getRange(2, 1, rowsMatrix.length, headers.length).setValues(rowsMatrix);
  }
}

function appendLog_(sheetId, actor, action, target, status, details) {
  try {
    var sheet = getSheet_(sheetId, 'LOGS');
    sheet.appendRow([
      generateId_('log'),
      nowMaceioIso_(),
      sanitizeCell_(actor || 'sistema', 100),
      sanitizeCell_(action || '', 80),
      sanitizeCell_(target || '', 80),
      sanitizeCell_(status || 'ok', 20),
      sanitizeCell_(details || '', 400)
    ]);
  } catch (e) {
    // Nunca interrompe operação principal se log falhar
  }
}

function saveJsonSection_(sheetId, tabName, id, jsonObj) {
  var sheet = getSheet_(sheetId, tabName);
  var now = nowMaceioIso_();
  var serialized = JSON.stringify(jsonObj);
  var rows = readRowsAsObjects_(sheetId, tabName);
  var foundRow = -1;
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].id === id) {
      foundRow = i + 2;
      break;
    }
  }
  if (foundRow > 0) {
    sheet.getRange(foundRow, 1, 1, 3).setValues([[sanitizeCell_(id), serialized, now]]);
  } else {
    sheet.appendRow([sanitizeCell_(id), serialized, now]);
  }
  return jsonObj;
}

function readJsonSection_(sheetId, tabName, id) {
  var rows = readRowsAsObjects_(sheetId, tabName);
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].id === id && rows[i].json_data) {
      try {
        return JSON.parse(rows[i].json_data);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}

// --- Seções do Site ---
function getConfigService_(sheetId) {
  return readJsonSection_(sheetId, 'CONFIGURACOES', 'cfg-principal');
}

function saveConfigService_(sheetId, payload) {
  return saveJsonSection_(sheetId, 'CONFIGURACOES', 'cfg-principal', payload.data || payload);
}

function getGalleryService_(sheetId) {
  var rows = readRowsAsObjects_(sheetId, 'GALERIA');
  return rows.map(function (r) {
    return {
      id: r.id,
      title: r.titulo,
      category: r.categoria,
      imageUrl: r.image_url,
      driveFileId: r.drive_file_id || undefined,
      caption: r.legenda,
      order: Number(r.ordem || 1),
      isPlaceholder: r.is_placeholder === true || r.is_placeholder === 'true',
      createdAt: r.criado_em,
      updatedAt: r.atualizado_em
    };
  });
}

function saveGalleryService_(sheetId, payload) {
  var items = (payload && payload.data) || [];
  var now = nowMaceioIso_();
  var matrix = items.map(function (it, idx) {
    return [
      sanitizeCell_(it.id || generateId_('gal')),
      sanitizeCell_(it.title, 140),
      sanitizeCell_(it.category, 60),
      sanitizeCell_(it.imageUrl, 1000),
      sanitizeCell_(it.driveFileId || '', 120),
      sanitizeCell_(it.caption || '', 400),
      Number(it.order || idx + 1),
      Boolean(it.isPlaceholder),
      sanitizeCell_(it.createdAt || now, 40),
      now
    ];
  });
  replaceTabRows_(sheetId, 'GALERIA', matrix);
  return items;
}

function getPortfolioService_(sheetId) {
  var rows = readRowsAsObjects_(sheetId, 'PORTFOLIO');
  return rows.map(function (r) {
    return {
      id: r.id,
      title: r.titulo,
      category: r.categoria,
      description: r.descricao,
      imageUrl: r.image_url,
      driveFileId: r.drive_file_id || undefined,
      featured: r.destaque === true || r.destaque === 'true',
      isPlaceholder: r.is_placeholder === true || r.is_placeholder === 'true',
      createdAt: r.criado_em,
      updatedAt: r.atualizado_em
    };
  });
}

function savePortfolioService_(sheetId, payload) {
  var items = (payload && payload.data) || [];
  var now = nowMaceioIso_();
  var matrix = items.map(function (it) {
    return [
      sanitizeCell_(it.id || generateId_('port')),
      sanitizeCell_(it.title, 140),
      sanitizeCell_(it.category, 60),
      sanitizeCell_(it.description || '', 800),
      sanitizeCell_(it.imageUrl, 1000),
      sanitizeCell_(it.driveFileId || '', 120),
      Boolean(it.featured),
      Boolean(it.isPlaceholder),
      sanitizeCell_(it.createdAt || now, 40),
      now
    ];
  });
  replaceTabRows_(sheetId, 'PORTFOLIO', matrix);
  return items;
}

function getBannersService_(sheetId) {
  var rows = readRowsAsObjects_(sheetId, 'BANNERS');
  return rows.map(function (r) {
    return {
      id: r.id,
      title: r.titulo,
      subtitle: r.subtitulo,
      imageUrl: r.image_url,
      driveFileId: r.drive_file_id || undefined,
      linkUrl: r.link_url,
      active: r.ativo === true || r.ativo === 'true',
      placement: r.posicao || 'hero',
      updatedAt: r.atualizado_em
    };
  });
}

function saveBannersService_(sheetId, payload) {
  var items = (payload && payload.data) || [];
  var now = nowMaceioIso_();
  var matrix = items.map(function (it) {
    return [
      sanitizeCell_(it.id || generateId_('ban')),
      sanitizeCell_(it.title, 140),
      sanitizeCell_(it.subtitle || '', 280),
      sanitizeCell_(it.imageUrl, 1000),
      sanitizeCell_(it.driveFileId || '', 120),
      sanitizeCell_(it.linkUrl || '/contato', 300),
      Boolean(it.active),
      sanitizeCell_(it.placement || 'hero', 30),
      now
    ];
  });
  replaceTabRows_(sheetId, 'BANNERS', matrix);
  return items;
}

function getServicesService_(sheetId) {
  var rows = readRowsAsObjects_(sheetId, 'SERVICOS');
  return rows.map(function (r) {
    return {
      id: r.id,
      title: r.titulo,
      description: r.descricao,
      imageUrl: r.image_url,
      driveFileId: r.drive_file_id || undefined,
      sessionInfo: r.info_sessao,
      order: Number(r.ordem || 1),
      active: r.ativo === true || r.ativo === 'true',
      updatedAt: r.atualizado_em
    };
  });
}

function saveServicesService_(sheetId, payload) {
  var items = (payload && payload.data) || [];
  var now = nowMaceioIso_();
  var matrix = items.map(function (it, idx) {
    return [
      sanitizeCell_(it.id || generateId_('srv')),
      sanitizeCell_(it.title, 140),
      sanitizeCell_(it.description || '', 1000),
      sanitizeCell_(it.imageUrl || '', 1000),
      sanitizeCell_(it.driveFileId || '', 120),
      sanitizeCell_(it.sessionInfo || '', 240),
      Number(it.order || idx + 1),
      Boolean(it.active),
      now
    ];
  });
  replaceTabRows_(sheetId, 'SERVICOS', matrix);
  return items;
}

function getPricesService_(sheetId) {
  var rows = readRowsAsObjects_(sheetId, 'PRECOS');
  return rows.map(function (r) {
    return {
      id: r.id,
      title: r.titulo,
      description: r.descricao,
      estimateLabel: r.estimativa,
      notes: r.observacoes,
      order: Number(r.ordem || 1),
      active: r.ativo === true || r.ativo === 'true',
      updatedAt: r.atualizado_em
    };
  });
}

function savePricesService_(sheetId, payload) {
  var items = (payload && payload.data) || [];
  var now = nowMaceioIso_();
  var matrix = items.map(function (it, idx) {
    return [
      sanitizeCell_(it.id || generateId_('prc')),
      sanitizeCell_(it.title, 140),
      sanitizeCell_(it.description || '', 600),
      sanitizeCell_(it.estimateLabel || '', 120),
      sanitizeCell_(it.notes || '', 300),
      Number(it.order || idx + 1),
      Boolean(it.active),
      now
    ];
  });
  replaceTabRows_(sheetId, 'PRECOS', matrix);
  return items;
}

function getContactsService_(sheetId) {
  var rows = readRowsAsObjects_(sheetId, 'CONTATOS');
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].id === 'cnt-principal' && rows[i].json_data) {
      try {
        return JSON.parse(rows[i].json_data);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}

function saveContactsService_(sheetId, payload) {
  var data = payload.data || payload;
  var sheet = getSheet_(sheetId, 'CONTATOS');
  var now = nowMaceioIso_();
  var rows = readRowsAsObjects_(sheetId, 'CONTATOS');
  var foundRow = -1;
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].id === 'cnt-principal') {
      foundRow = i + 2;
      break;
    }
  }
  var serialized = JSON.stringify(data);
  if (foundRow > 0) {
    sheet.getRange(foundRow, 1, 1, 5).setValues([['cnt-principal', 'config', serialized, rows[foundRow - 2].criado_em || now, now]]);
  } else {
    sheet.appendRow(['cnt-principal', 'config', serialized, now, now]);
  }
  return data;
}

function saveContactSubmissionService_(sheetId, payload) {
  var sub = payload.submission || payload;
  var sheet = getSheet_(sheetId, 'CONTATOS');
  var now = nowMaceioIso_();
  sheet.appendRow([
    sanitizeCell_(sub.id || generateId_('msg')),
    'solicitacao',
    JSON.stringify(sub),
    sanitizeCell_(sub.createdAt || now, 40),
    now
  ]);
  return sub;
}

function getSocialLinksService_(sheetId) {
  var rows = readRowsAsObjects_(sheetId, 'REDES_SOCIAIS');
  return rows.map(function (r) {
    return {
      id: r.id,
      platform: r.plataforma,
      label: r.rotulo,
      url: r.url,
      active: r.ativo === true || r.ativo === 'true',
      order: Number(r.ordem || 1),
      updatedAt: r.atualizado_em
    };
  });
}

function saveSocialLinksService_(sheetId, payload) {
  var items = (payload && payload.data) || [];
  var now = nowMaceioIso_();
  var matrix = items.map(function (it, idx) {
    return [
      sanitizeCell_(it.id || generateId_('soc')),
      sanitizeCell_(it.platform || 'Outro', 40),
      sanitizeCell_(it.label || '', 80),
      sanitizeCell_(it.url || '', 400),
      Boolean(it.active),
      Number(it.order || idx + 1),
      now
    ];
  });
  replaceTabRows_(sheetId, 'REDES_SOCIAIS', matrix);
  return items;
}

function getMusicService_(sheetId) {
  var rows = readRowsAsObjects_(sheetId, 'MUSICAS');
  if (!rows.length) return null;
  var r = rows[0];
  return {
    id: r.id,
    enabled: r.ativado === true || r.ativado === 'true',
    title: r.titulo,
    artist: r.artista,
    audioUrl: r.audio_url,
    driveFileId: r.drive_file_id || undefined,
    initialVolume: Number(r.volume_inicial || 0.35),
    loop: r.loop === true || r.loop === 'true',
    manualPlayOnly: true,
    updatedAt: r.atualizado_em
  };
}

function saveMusicService_(sheetId, payload) {
  var m = payload.data || payload;
  var now = nowMaceioIso_();
  replaceTabRows_(sheetId, 'MUSICAS', [[
    'mus-principal',
    Boolean(m.enabled),
    sanitizeCell_(m.title || 'Ambiente do Estúdio', 120),
    sanitizeCell_(m.artist || 'Luan Hércules Tattoo', 120),
    sanitizeCell_(m.audioUrl || '', 1000),
    sanitizeCell_(m.driveFileId || '', 120),
    Number(m.initialVolume || 0.35),
    Boolean(m.loop),
    true,
    now
  ]]);
  return m;
}

function saveMenuService_(sheetId, payload) {
  var items = (payload && payload.data) || [];
  var now = nowMaceioIso_();
  var matrix = items.map(function (it, idx) {
    return [
      sanitizeCell_(it.id || generateId_('mnu')),
      sanitizeCell_(it.label, 40),
      sanitizeCell_(it.path, 120),
      Number(it.order || idx + 1),
      Boolean(it.visible),
      now
    ];
  });
  replaceTabRows_(sheetId, 'MENU', matrix);
  return items;
}

function getMenuService_(sheetId) {
  var rows = readRowsAsObjects_(sheetId, 'MENU');
  return rows.map(function (r) {
    return {
      id: r.id,
      label: r.rotulo,
      path: r.caminho,
      order: Number(r.ordem || 1),
      visible: r.visivel === true || r.visivel === 'true'
    };
  });
}

function getThemeService_(sheetId) {
  var rows = readRowsAsObjects_(sheetId, 'TEMA');
  if (!rows.length) return null;
  var r = rows[0];
  return {
    id: r.id,
    backgroundColor: r.background_color,
    surfaceColor: r.surface_color,
    textColor: r.text_color,
    accentColor: r.accent_color,
    borderRadius: r.border_radius || 'subtle',
    updatedAt: r.atualizado_em
  };
}

function saveThemeService_(sheetId, payload) {
  var t = payload.data || payload;
  var now = nowMaceioIso_();
  replaceTabRows_(sheetId, 'TEMA', [[
    'thm-principal',
    sanitizeCell_(t.backgroundColor || '#070709', 20),
    sanitizeCell_(t.surfaceColor || '#111115', 20),
    sanitizeCell_(t.textColor || '#F5F3EF', 20),
    sanitizeCell_(t.accentColor || '#C9A45C', 20),
    sanitizeCell_(t.borderRadius || 'subtle', 20),
    now
  ]]);
  return t;
}

function getSeoService_(sheetId) {
  var rows = readRowsAsObjects_(sheetId, 'SEO');
  if (!rows.length) return null;
  var r = rows[0];
  return {
    id: r.id,
    siteTitle: r.site_title,
    metaDescription: r.meta_description,
    ogTitle: r.og_title,
    ogDescription: r.og_description,
    ogImageUrl: r.og_image_url,
    canonicalDomain: r.canonical_domain,
    keywords: r.keywords,
    updatedAt: r.atualizado_em
  };
}

function saveSeoService_(sheetId, payload) {
  var s = payload.data || payload;
  var now = nowMaceioIso_();
  replaceTabRows_(sheetId, 'SEO', [[
    'seo-principal',
    sanitizeCell_(s.siteTitle || '', 120),
    sanitizeCell_(s.metaDescription || '', 220),
    sanitizeCell_(s.ogTitle || '', 120),
    sanitizeCell_(s.ogDescription || '', 220),
    sanitizeCell_(s.ogImageUrl || '', 1000),
    sanitizeCell_(s.canonicalDomain || 'https://luanhtattoo.vercel.app', 200),
    sanitizeCell_(s.keywords || '', 300),
    now
  ]]);
  return s;
}

function saveTestimonialsService_(sheetId, payload) {
  return saveJsonSection_(sheetId, 'CACHE', 'depoimentos', (payload && payload.data) || []);
}

function getTestimonialsService_(sheetId) {
  return readJsonSection_(sheetId, 'CACHE', 'depoimentos');
}

// --- Mídias & Usuários ---
function readMidiasBindingsMap_(sheetId) {
  var rows = readRowsAsObjects_(sheetId, 'MIDIAS');
  var map = {};
  for (var i = 0; i < rows.length; i++) {
    map[rows[i].id] = rows[i].vinculo_secao || '';
  }
  return map;
}

function upsertMidiaRow_(sheetId, record) {
  var sheet = getSheet_(sheetId, 'MIDIAS');
  sheet.appendRow([
    sanitizeCell_(record.id),
    sanitizeCell_(record.name, 140),
    sanitizeCell_(record.mimeType, 80),
    Number(record.sizeBytes || 0),
    sanitizeCell_(record.folderName, 60),
    sanitizeCell_(record.sectionBinding || '', 100),
    sanitizeCell_(record.createdAt),
    sanitizeCell_(record.updatedAt)
  ]);
}

function updateMidiaRow_(sheetId, id, newName, sectionBinding) {
  var sheet = getSheet_(sheetId, 'MIDIAS');
  var rows = readRowsAsObjects_(sheetId, 'MIDIAS');
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].id === id) {
      var rowIndex = i + 2;
      if (newName) sheet.getRange(rowIndex, 2).setValue(sanitizeCell_(newName, 140));
      if (sectionBinding !== undefined) {
        sheet.getRange(rowIndex, 6).setValue(sanitizeCell_(sectionBinding, 100));
      }
      sheet.getRange(rowIndex, 8).setValue(nowMaceioIso_());
      break;
    }
  }
}

function removeMidiaRow_(sheetId, id) {
  var sheet = getSheet_(sheetId, 'MIDIAS');
  var rows = readRowsAsObjects_(sheetId, 'MIDIAS');
  for (var i = rows.length - 1; i >= 0; i--) {
    if (rows[i].id === id) {
      sheet.deleteRow(i + 2);
      break;
    }
  }
}

function checkAdminExistsService_(sheetId) {
  var rows = readRowsAsObjects_(sheetId, 'USUARIOS');
  return {
    hasUsers: rows.length > 0,
    email: rows.length > 0 ? rows[0].email : ''
  };
}

function getAdminUserByEmailService_(sheetId, payload) {
  var email = String((payload && payload.email) || '').trim().toLowerCase();
  var rows = readRowsAsObjects_(sheetId, 'USUARIOS');
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].email || '').toLowerCase() === email) {
      return {
        user: {
          id: rows[i].id,
          email: rows[i].email,
          passwordHash: rows[i].password_hash,
          role: rows[i].role || 'admin',
          createdAt: rows[i].criado_em,
          updatedAt: rows[i].atualizado_em
        }
      };
    }
  }
  return { user: null };
}

function saveAdminUserService_(sheetId, payload) {
  var sheet = getSheet_(sheetId, 'USUARIOS');
  var now = nowMaceioIso_();
  sheet.appendRow([
    sanitizeCell_(payload.id || generateId_('usr')),
    sanitizeCell_(String(payload.email || '').toLowerCase(), 160),
    sanitizeCell_(payload.passwordHash || '', 260),
    'admin',
    now,
    now
  ]);
  return { saved: true };
}

function updateAdminPasswordService_(sheetId, payload) {
  var email = String((payload && payload.email) || '').trim().toLowerCase();
  var sheet = getSheet_(sheetId, 'USUARIOS');
  var rows = readRowsAsObjects_(sheetId, 'USUARIOS');
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].email || '').toLowerCase() === email) {
      var rowIdx = i + 2;
      sheet.getRange(rowIdx, 3).setValue(sanitizeCell_(payload.passwordHash, 260));
      sheet.getRange(rowIdx, 6).setValue(nowMaceioIso_());
      return { updated: true };
    }
  }
  throw new Error('Usuário administrador não encontrado na planilha.');
}

function getSiteContentService_(sheetId) {
  var bundle = {};
  var cfg = getConfigService_(sheetId);
  if (cfg) bundle.config = cfg;
  var gallery = getGalleryService_(sheetId);
  if (gallery.length) bundle.gallery = gallery;
  var portfolio = getPortfolioService_(sheetId);
  if (portfolio.length) bundle.portfolio = portfolio;
  var banners = getBannersService_(sheetId);
  if (banners.length) bundle.banners = banners;
  var services = getServicesService_(sheetId);
  if (services.length) bundle.services = services;
  var prices = getPricesService_(sheetId);
  if (prices.length) bundle.prices = prices;
  var contacts = getContactsService_(sheetId);
  if (contacts) bundle.contacts = contacts;
  var social = getSocialLinksService_(sheetId);
  if (social.length) bundle.socialLinks = social;
  var music = getMusicService_(sheetId);
  if (music) bundle.music = music;
  var menu = getMenuService_(sheetId);
  if (menu.length) bundle.menu = menu;
  var theme = getThemeService_(sheetId);
  if (theme) bundle.theme = theme;
  var seo = getSeoService_(sheetId);
  if (seo) bundle.seo = seo;
  var testimonials = getTestimonialsService_(sheetId);
  if (testimonials) bundle.testimonials = testimonials;
  return bundle;
}
