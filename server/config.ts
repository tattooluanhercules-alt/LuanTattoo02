import crypto from 'node:crypto';

const runtimeFallbackSecret = crypto.randomBytes(32).toString('hex');

export const DRIVE_FOLDER_NAMES = [
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
  '12_ARQUIVOS_GERAIS',
] as const;

export function getServerConfig() {
  const appsScriptUrl = (process.env.APPS_SCRIPT_URL || '').trim();
  const appsScriptSecret = (process.env.APPS_SCRIPT_SECRET || '').trim();
  const driveFolderId =
    (process.env.GOOGLE_DRIVE_FOLDER_ID || '').trim() ||
    '1m5ImibAKuM0OAWwFXoBLgbwECSyaIP9T';
  const sheetId =
    (process.env.GOOGLE_SHEET_ID || '').trim() ||
    '1zsZD5dgyqOCosqxjFHn0qp0Y0xQT-CPuB3o_hQ9rosE';
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPasswordHash = (process.env.ADMIN_PASSWORD_HASH || '').trim();
  const sessionSecret =
    (process.env.SESSION_SECRET || '').trim() || runtimeFallbackSecret;
  const appUrl =
    (process.env.APP_URL || '').trim() || 'https://luanhtattoo.vercel.app';

  return {
    appsScriptUrl,
    appsScriptSecret,
    driveFolderId,
    sheetId,
    adminEmail,
    adminPasswordHash,
    sessionSecret,
    appUrl,
    isAppsScriptConfigured: Boolean(appsScriptUrl && appsScriptSecret),
  };
}
