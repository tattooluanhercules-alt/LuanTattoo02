import crypto from 'node:crypto';
import type { AdminUserSession, DriveFolderName } from '../src/types/studio.ts';
import { DRIVE_FOLDER_NAMES, getServerConfig } from './config.ts';

const revokedTokens = new Map<string, number>();

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitBucket>();

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = rateLimitStore.get(key);

  if (!bucket || now >= bucket.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= maxRequests) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.startsWith('scrypt$')) {
    return false;
  }
  const parts = storedHash.split('$');
  if (parts.length !== 3) {
    return false;
  }
  const [, salt, originalHex] = parts;
  if (!salt || !originalHex) {
    return false;
  }
  const derivedBuffer = crypto.scryptSync(password, salt, 64);
  const originalBuffer = Buffer.from(originalHex, 'hex');
  if (derivedBuffer.length !== originalBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(derivedBuffer, originalBuffer);
}

interface TokenPayload {
  jti: string;
  email: string;
  role: 'admin';
  iat: number;
  exp: number;
}

export function issueSessionToken(email: string, ttlMs = 1000 * 60 * 60 * 8): {
  token: string;
  session: AdminUserSession;
} {
  const { sessionSecret } = getServerConfig();
  const now = Date.now();
  const payload: TokenPayload = {
    jti: crypto.randomUUID(),
    email: email.toLowerCase(),
    role: 'admin',
    iat: now,
    exp: now + ttlMs,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', sessionSecret)
    .update(encodedPayload)
    .digest('base64url');

  return {
    token: `${encodedPayload}.${signature}`,
    session: {
      email: payload.email,
      role: 'admin',
      issuedAt: new Date(payload.iat).toISOString(),
      expiresAt: new Date(payload.exp).toISOString(),
    },
  };
}

export function verifySessionToken(token: string | undefined): AdminUserSession | null {
  if (!token || typeof token !== 'string') {
    return null;
  }
  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }
  const [encodedPayload, providedSig] = parts;
  if (!encodedPayload || !providedSig) {
    return null;
  }

  const { sessionSecret } = getServerConfig();
  const expectedSig = crypto
    .createHmac('sha256', sessionSecret)
    .update(encodedPayload)
    .digest('base64url');

  const sigA = Buffer.from(providedSig, 'utf8');
  const sigB = Buffer.from(expectedSig, 'utf8');
  if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as TokenPayload;
    if (!parsed.jti || !parsed.email || parsed.role !== 'admin') {
      return null;
    }
    if (Date.now() >= parsed.exp) {
      return null;
    }
    const revokedUntil = revokedTokens.get(parsed.jti);
    if (revokedUntil && Date.now() < revokedUntil) {
      return null;
    }
    return {
      email: parsed.email,
      role: 'admin',
      issuedAt: new Date(parsed.iat).toISOString(),
      expiresAt: new Date(parsed.exp).toISOString(),
    };
  } catch {
    return null;
  }
}

export function revokeSessionToken(token: string | undefined): void {
  if (!token) return;
  const parts = token.split('.');
  if (parts.length !== 2) return;
  try {
    const parsed = JSON.parse(
      Buffer.from(parts[0], 'base64url').toString('utf8')
    ) as TokenPayload;
    if (parsed.jti && parsed.exp) {
      revokedTokens.set(parsed.jti, parsed.exp);
    }
  } catch {
    // Ignore malformed tokens on logout
  }
}

export function sanitizeText(value: unknown, maxLength = 2000): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

export function isSafeUrl(url: string): boolean {
  if (!url) return true;
  const trimmed = url.trim();
  if (trimmed.startsWith('/')) {
    return !trimmed.startsWith('//');
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function sanitizeUrl(value: unknown, maxLength = 1000): string {
  const str = sanitizeText(value, maxLength);
  return isSafeUrl(str) ? str : '';
}

export function isValidDriveFolder(folder: string): folder is DriveFolderName {
  return (DRIVE_FOLDER_NAMES as readonly string[]).includes(folder);
}

export function sanitizeFilename(name: string): string {
  const cleaned = name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .slice(0, 120);
  return cleaned || `arquivo_${Date.now()}`;
}

export interface UploadValidationResult {
  valid: boolean;
  error?: string;
  mimeType?: string;
  sizeBytes?: number;
  safeName?: string;
}

const ALLOWED_UPLOAD_TYPES: Record<string, { maxBytes: number }> = {
  'image/jpeg': { maxBytes: 5 * 1024 * 1024 },
  'image/png': { maxBytes: 5 * 1024 * 1024 },
  'image/webp': { maxBytes: 5 * 1024 * 1024 },
  'image/avif': { maxBytes: 5 * 1024 * 1024 },
  'audio/mpeg': { maxBytes: 15 * 1024 * 1024 },
  'audio/mp3': { maxBytes: 15 * 1024 * 1024 },
  'audio/wav': { maxBytes: 15 * 1024 * 1024 },
  'audio/ogg': { maxBytes: 15 * 1024 * 1024 },
  'audio/mp4': { maxBytes: 15 * 1024 * 1024 },
  'video/mp4': { maxBytes: 25 * 1024 * 1024 },
  'video/webm': { maxBytes: 25 * 1024 * 1024 },
  'application/pdf': { maxBytes: 10 * 1024 * 1024 },
};

export function validateUploadPayload(
  filename: unknown,
  mimeType: unknown,
  base64Content: unknown
): UploadValidationResult {
  if (typeof filename !== 'string' || !filename.trim()) {
    return { valid: false, error: 'Nome de arquivo obrigatório.' };
  }
  if (typeof mimeType !== 'string' || !ALLOWED_UPLOAD_TYPES[mimeType]) {
    return {
      valid: false,
      error:
        'Formato de arquivo não permitido. Utilize JPG, PNG, WEBP, AVIF, MP3, WAV, OGG, MP4, WEBM ou PDF.',
    };
  }
  if (typeof base64Content !== 'string' || !base64Content.trim()) {
    return { valid: false, error: 'Conteúdo do arquivo ausente.' };
  }

  const normalizedB64 = base64Content.includes(',')
    ? base64Content.split(',')[1]
    : base64Content;

  let buffer: Buffer;
  try {
    buffer = Buffer.from(normalizedB64, 'base64');
  } catch {
    return { valid: false, error: 'Codificação do arquivo inválida.' };
  }

  const maxBytes = ALLOWED_UPLOAD_TYPES[mimeType].maxBytes;
  if (buffer.byteLength === 0) {
    return { valid: false, error: 'O arquivo enviado está vazio.' };
  }
  if (buffer.byteLength > maxBytes) {
    return {
      valid: false,
      error: `Arquivo excede o limite de ${(maxBytes / (1024 * 1024)).toFixed(0)} MB para este formato.`,
    };
  }

  return {
    valid: true,
    mimeType,
    sizeBytes: buffer.byteLength,
    safeName: sanitizeFilename(filename),
  };
}
