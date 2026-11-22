/**
 * Config.gs — Configurações centrais e esquemas do Google Drive e Google Sheets
 * Projeto: LUAN HÉRCULES TATTOO
 */

var DEFAULT_DRIVE_FOLDER_ID = '1m5ImibAKuM0OAWwFXoBLgbwECSyaIP9T';
var DEFAULT_SHEET_ID = '1zsZD5dgyqOCosqxjFHn0qp0Y0xQT-CPuB3o_hQ9rosE';
var STUDIO_TIMEZONE = 'America/Maceio';

var DRIVE_FOLDERS = [
  '01_CONFIGURACOES',
  '02_LOGOTIPOS',
  '03_GALERIA',
  '04_MUSICAS',
  '05_BANNERS',
  '06_VIDEOS',
  '07_PORTFOLIO',
  '08_DOCUMENTOS',
  '09_FOTOS_PERFIL',
  '10_BACKGROUND',
  '11_ICONS',
  '12_ARQUIVOS_GERAIS'
];

var PUBLIC_MEDIA_FOLDERS = [
  '02_LOGOTIPOS',
  '03_GALERIA',
  '04_MUSICAS',
  '05_BANNERS',
  '06_VIDEOS',
  '07_PORTFOLIO',
  '09_FOTOS_PERFIL',
  '10_BACKGROUND',
  '11_ICONS'
];

var SHEET_SCHEMAS = {
  CONFIGURACOES: ['id', 'json_data', 'atualizado_em'],
  PAGINAS: ['id', 'slug', 'titulo', 'subtitulo', 'corpo', 'visivel', 'atualizado_em'],
  GALERIA: ['id', 'titulo', 'categoria', 'image_url', 'drive_file_id', 'legenda', 'ordem', 'is_placeholder', 'criado_em', 'atualizado_em'],
  PORTFOLIO: ['id', 'titulo', 'categoria', 'descricao', 'image_url', 'drive_file_id', 'destaque', 'is_placeholder', 'criado_em', 'atualizado_em'],
  BANNERS: ['id', 'titulo', 'subtitulo', 'image_url', 'drive_file_id', 'link_url', 'ativo', 'posicao', 'atualizado_em'],
  SERVICOS: ['id', 'titulo', 'descricao', 'image_url', 'drive_file_id', 'info_sessao', 'ordem', 'ativo', 'atualizado_em'],
  PRECOS: ['id', 'titulo', 'descricao', 'estimativa', 'observacoes', 'ordem', 'ativo', 'atualizado_em'],
  CONTATOS: ['id', 'tipo', 'json_data', 'criado_em', 'atualizado_em'],
  REDES_SOCIAIS: ['id', 'plataforma', 'rotulo', 'url', 'ativo', 'ordem', 'atualizado_em'],
  MUSICAS: ['id', 'ativado', 'titulo', 'artista', 'audio_url', 'drive_file_id', 'volume_inicial', 'loop', 'reproducao_manual', 'atualizado_em'],
  MENU: ['id', 'rotulo', 'caminho', 'ordem', 'visivel', 'atualizado_em'],
  SEO: ['id', 'site_title', 'meta_description', 'og_title', 'og_description', 'og_image_url', 'canonical_domain', 'keywords', 'atualizado_em'],
  TEMA: ['id', 'background_color', 'surface_color', 'text_color', 'accent_color', 'border_radius', 'atualizado_em'],
  MIDIAS: ['id', 'nome', 'mime_type', 'tamanho_bytes', 'pasta', 'vinculo_secao', 'criado_em', 'atualizado_em'],
  USUARIOS: ['id', 'email', 'password_hash', 'role', 'criado_em', 'atualizado_em'],
  INTEGRACAO: ['chave', 'valor', 'atualizado_em'],
  LOGS: ['id', 'timestamp', 'ator', 'acao', 'alvo', 'status', 'detalhes'],
  CACHE: ['chave', 'json_data', 'atualizado_em']
};

function getAppConfig_(overrideDriveId, overrideSheetId) {
  var props = PropertiesService.getScriptProperties();
  return {
    secret: props.getProperty('APPS_SCRIPT_SECRET') || '',
    driveFolderId: overrideDriveId || props.getProperty('GOOGLE_DRIVE_FOLDER_ID') || DEFAULT_DRIVE_FOLDER_ID,
    sheetId: overrideSheetId || props.getProperty('GOOGLE_SHEET_ID') || DEFAULT_SHEET_ID
  };
}
