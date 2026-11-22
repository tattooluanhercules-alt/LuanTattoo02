/**
 * Utils.gs — Funções utilitárias, padronização JSON e sanitização de planilha
 */

function jsonResponse_(success, message, data, error) {
  var body = {
    success: Boolean(success),
    message: String(message || '')
  };
  if (data !== undefined && data !== null) {
    body.data = data;
  }
  if (!success && error) {
    body.error = String(error);
  }
  return ContentService.createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}

function nowMaceioIso_() {
  return Utilities.formatDate(new Date(), STUDIO_TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

function generateId_(prefix) {
  var raw = Utilities.getUuid().replace(/-/g, '').substring(0, 10);
  return (prefix || 'id') + '-' + raw;
}

/**
 * Previne Formula Injection em células do Google Sheets (=, +, -, @)
 */
function sanitizeCell_(value, maxLength) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean' || typeof value === 'number') return value;
  var str = String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
  if (maxLength && str.length > maxLength) {
    str = str.substring(0, maxLength);
  }
  if (/^[=+\-@]/.test(str)) {
    str = "'" + str;
  }
  return str;
}

function unsanitizeCell_(value) {
  if (typeof value !== 'string') return value;
  if (value.length > 1 && value.charAt(0) === "'" && /^[=+\-@]/.test(value.charAt(1))) {
    return value.substring(1);
  }
  return value;
}

function validateRequired_(obj, keys) {
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (obj[k] === undefined || obj[k] === null || obj[k] === '') {
      return 'Parâmetro obrigatório ausente: ' + k;
    }
  }
  return null;
}
