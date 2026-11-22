import crypto from 'node:crypto';
import type {
  ApiResponse,
  AuditLogEntry,
  ContactSubmission,
  DriveFileRecord,
  DriveFolderInfo,
  DriveFolderName,
  IntegrationStatus,
  SiteBundle,
} from '../src/types/studio.ts';
import { DRIVE_FOLDER_NAMES, getServerConfig } from './config.ts';
import { createInitialStudioState } from './defaultData.ts';
import { hashPassword, verifyPassword } from './security.ts';

interface StoredAdminUser {
  id: string;
  email: string;
  passwordHash: string;
  role: 'admin';
  createdAt: string;
  updatedAt: string;
}

class StudioRepository {
  private state = createInitialStudioState();
  private claimedAdmin: StoredAdminUser | null = null;
  private lastRemoteSyncAt: number = 0;
  private lastSyncIso: string | null = null;
  private remoteReachable = false;
  private driveConnected = false;
  private sheetsConnected = false;
  private readonly cacheTtlMs = 30_000;

  private addLog(
    actor: string,
    action: string,
    target: string,
    status: 'ok' | 'erro',
    details: string
  ) {
    const entry: AuditLogEntry = {
      id: `log-${crypto.randomUUID().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      actor,
      action,
      target,
      status,
      details: details.slice(0, 400),
    };
    this.state.logs = [entry, ...this.state.logs].slice(0, 100);
  }

  private async callAppsScript<T>(
    action: string,
    payload: Record<string, unknown> = {}
  ): Promise<ApiResponse<T> | null> {
    const cfg = getServerConfig();
    if (!cfg.isAppsScriptConfigured) {
      return null;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12_000);

    try {
      const response = await fetch(cfg.appsScriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          secret: cfg.appsScriptSecret,
          driveFolderId: cfg.driveFolderId,
          sheetId: cfg.sheetId,
          payload,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        this.remoteReachable = false;
        this.addLog(
          'backend',
          `APPS_SCRIPT_${action}`,
          'INTEGRACAO',
          'erro',
          `HTTP ${response.status} ao consultar Apps Script`
        );
        return null;
      }

      const json = (await response.json()) as ApiResponse<T>;
      this.remoteReachable = true;
      if (json.success) {
        this.lastSyncIso = new Date().toISOString();
      }
      return json;
    } catch (error) {
      this.remoteReachable = false;
      const reason =
        error instanceof Error && error.name === 'AbortError'
          ? 'Tempo limite excedido (12s)'
          : 'Falha de rede ao conectar ao Apps Script';
      this.addLog('backend', `APPS_SCRIPT_${action}`, 'INTEGRACAO', 'erro', reason);
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async checkHealth(): Promise<IntegrationStatus> {
    const cfg = getServerConfig();
    if (!cfg.isAppsScriptConfigured) {
      return {
        appsScriptConfigured: false,
        appsScriptReachable: false,
        driveConnected: false,
        sheetsConnected: false,
        driveFolderId: cfg.driveFolderId,
        sheetId: cfg.sheetId,
        lastSyncAt: this.lastSyncIso,
        mode: 'local-cache',
        message:
          'Apps Script aguardando configuração de APPS_SCRIPT_URL e APPS_SCRIPT_SECRET nas variáveis de ambiente. Operando em cache seguro local.',
      };
    }

    const res = await this.callAppsScript<{
      driveConnected: boolean;
      sheetsConnected: boolean;
      folderCount?: number;
      sheetCount?: number;
    }>('healthCheck');

    if (res && res.success && res.data) {
      this.driveConnected = Boolean(res.data.driveConnected);
      this.sheetsConnected = Boolean(res.data.sheetsConnected);
      return {
        appsScriptConfigured: true,
        appsScriptReachable: true,
        driveConnected: this.driveConnected,
        sheetsConnected: this.sheetsConnected,
        driveFolderId: cfg.driveFolderId,
        sheetId: cfg.sheetId,
        lastSyncAt: this.lastSyncIso,
        mode: 'apps-script',
        message: 'Integração ativa com Google Apps Script, Drive e Sheets.',
      };
    }

    return {
      appsScriptConfigured: true,
      appsScriptReachable: false,
      driveConnected: false,
      sheetsConnected: false,
      driveFolderId: cfg.driveFolderId,
      sheetId: cfg.sheetId,
      lastSyncAt: this.lastSyncIso,
      mode: 'local-cache',
      message:
        'Não foi possível contatar o Apps Script no momento. Exibindo dados em cache para manter o site online.',
    };
  }

  async getSiteBundle(forceRefresh = false): Promise<SiteBundle> {
    const cfg = getServerConfig();
    const isCacheFresh = Date.now() - this.lastRemoteSyncAt < this.cacheTtlMs;

    if (cfg.isAppsScriptConfigured && (forceRefresh || !isCacheFresh)) {
      const remote = await this.callAppsScript<Partial<SiteBundle>>('getSiteContent');
      if (remote && remote.success && remote.data) {
        this.state.site = {
          ...this.state.site,
          ...remote.data,
          lastUpdated: new Date().toISOString(),
          source: 'apps-script',
        };
        this.lastRemoteSyncAt = Date.now();
        this.sheetsConnected = true;
        return this.state.site;
      }
    }

    return {
      ...this.state.site,
      source: this.remoteReachable ? 'apps-script' : 'cache',
    };
  }

  async updateSection<K extends keyof SiteBundle>(
    section: K,
    value: SiteBundle[K],
    actorEmail: string,
    remoteAction: string
  ): Promise<SiteBundle[K]> {
    this.state.site = {
      ...this.state.site,
      [section]: value,
      lastUpdated: new Date().toISOString(),
    };

    const cfg = getServerConfig();
    if (cfg.isAppsScriptConfigured) {
      const res = await this.callAppsScript(remoteAction, {
        data: value,
        actor: actorEmail,
      });
      if (!res || !res.success) {
        this.addLog(
          actorEmail,
          remoteAction,
          String(section),
          'erro',
          res?.error || 'Alteração salva no cache local; falha ao gravar no Sheets.'
        );
        throw new Error(
          res?.message ||
            'Não foi possível sincronizar esta alteração com o Google Sheets.'
        );
      }
    }

    this.addLog(
      actorEmail,
      remoteAction,
      String(section),
      'ok',
      `Seção ${String(section)} atualizada com sucesso.`
    );
    return this.state.site[section];
  }

  async submitContact(
    submission: Omit<ContactSubmission, 'id' | 'createdAt' | 'status'>
  ): Promise<ContactSubmission> {
    const created: ContactSubmission = {
      ...submission,
      id: `msg-${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
      status: 'novo',
    };
    this.state.submissions = [created, ...this.state.submissions].slice(0, 200);

    const cfg = getServerConfig();
    if (cfg.isAppsScriptConfigured) {
      await this.callAppsScript('saveContactSubmission', { submission: created });
    }

    this.addLog(
      'visitante',
      'SUBMIT_CONTACT',
      'CONTATOS',
      'ok',
      `Solicitação recebida de ${created.name}`
    );
    return created;
  }

  getSubmissions(): ContactSubmission[] {
    return this.state.submissions;
  }

  async listFiles(folderFilter?: string): Promise<{
    files: DriveFileRecord[];
    folders: DriveFolderInfo[];
  }> {
    const cfg = getServerConfig();
    if (cfg.isAppsScriptConfigured) {
      const res = await this.callAppsScript<{
        files: DriveFileRecord[];
        folders: DriveFolderInfo[];
      }>('listFiles', { folderName: folderFilter || '' });
      if (res && res.success && res.data) {
        this.state.files = res.data.files || this.state.files;
        this.driveConnected = true;
        return {
          files: this.state.files,
          folders: res.data.folders || this.buildLocalFolders(),
        };
      }
    }

    const filtered = folderFilter
      ? this.state.files.filter((f) => f.folderName === folderFilter)
      : this.state.files;
    return {
      files: filtered,
      folders: this.buildLocalFolders(),
    };
  }

  private buildLocalFolders(): DriveFolderInfo[] {
    return DRIVE_FOLDER_NAMES.map((name) => ({
      name,
      id: `folder-${name}`,
      fileCount: this.state.files.filter((f) => f.folderName === name).length,
    }));
  }

  async uploadFile(input: {
    name: string;
    mimeType: string;
    sizeBytes: number;
    base64Content: string;
    folderName: DriveFolderName;
    sectionBinding?: string;
    actorEmail: string;
  }): Promise<DriveFileRecord> {
    const cfg = getServerConfig();
    if (cfg.isAppsScriptConfigured) {
      const res = await this.callAppsScript<{ file: DriveFileRecord }>('uploadFile', {
        name: input.name,
        mimeType: input.mimeType,
        base64Content: input.base64Content,
        folderName: input.folderName,
        sectionBinding: input.sectionBinding || '',
        actor: input.actorEmail,
      });
      if (!res || !res.success || !res.data?.file) {
        this.addLog(
          input.actorEmail,
          'UPLOAD_FILE',
          input.folderName,
          'erro',
          res?.error || 'Falha ao enviar arquivo ao Google Drive'
        );
        throw new Error(res?.message || 'Erro ao enviar arquivo para o Google Drive.');
      }
      const created = {
        ...res.data.file,
        publicUrl: `/api/media/${res.data.file.id}`,
      };
      this.state.files = [created, ...this.state.files];
      this.addLog(
        input.actorEmail,
        'UPLOAD_FILE',
        input.folderName,
        'ok',
        `Arquivo ${created.name} enviado ao Drive.`
      );
      return created;
    }

    // Local preview fallback when Apps Script is not yet configured
    const cleanB64 = input.base64Content.includes(',')
      ? input.base64Content.split(',')[1]
      : input.base64Content;
    const id = `local-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    const record: DriveFileRecord = {
      id,
      name: input.name,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      folderName: input.folderName,
      publicUrl: `data:${input.mimeType};base64,${cleanB64}`,
      thumbnailUrl: input.mimeType.startsWith('image/')
        ? `data:${input.mimeType};base64,${cleanB64}`
        : undefined,
      sectionBinding: input.sectionBinding,
      createdAt: now,
      updatedAt: now,
    };
    this.state.files = [record, ...this.state.files];
    this.addLog(
      input.actorEmail,
      'UPLOAD_FILE_LOCAL',
      input.folderName,
      'ok',
      `Arquivo ${record.name} armazenado em cache de visualização (aguardando Apps Script).`
    );
    return record;
  }

  async renameFile(
    id: string,
    newName: string,
    sectionBinding: string | undefined,
    actorEmail: string
  ): Promise<DriveFileRecord | null> {
    const cfg = getServerConfig();
    if (cfg.isAppsScriptConfigured && !id.startsWith('local-')) {
      const res = await this.callAppsScript<{ file: DriveFileRecord }>('renameFile', {
        fileId: id,
        newName,
        sectionBinding,
        actor: actorEmail,
      });
      if (!res || !res.success) {
        throw new Error(res?.message || 'Erro ao renomear arquivo no Drive.');
      }
    }

    const idx = this.state.files.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    this.state.files[idx] = {
      ...this.state.files[idx],
      name: newName || this.state.files[idx].name,
      sectionBinding:
        sectionBinding !== undefined
          ? sectionBinding
          : this.state.files[idx].sectionBinding,
      updatedAt: new Date().toISOString(),
    };
    this.addLog(
      actorEmail,
      'RENAME_FILE',
      id,
      'ok',
      `Arquivo renomeado para ${this.state.files[idx].name}.`
    );
    return this.state.files[idx];
  }

  async deleteFile(id: string, actorEmail: string): Promise<boolean> {
    const cfg = getServerConfig();
    if (cfg.isAppsScriptConfigured && !id.startsWith('local-')) {
      const res = await this.callAppsScript('deleteFile', {
        fileId: id,
        confirm: true,
        actor: actorEmail,
      });
      if (!res || !res.success) {
        throw new Error(res?.message || 'Erro ao excluir arquivo no Drive.');
      }
    }

    const before = this.state.files.length;
    this.state.files = this.state.files.filter((f) => f.id !== id);
    const removed = this.state.files.length < before;
    if (removed) {
      this.addLog(actorEmail, 'DELETE_FILE', id, 'ok', `Arquivo ${id} removido.`);
    }
    return removed;
  }

  async syncWorkspace(actorEmail: string): Promise<IntegrationStatus> {
    const cfg = getServerConfig();
    if (!cfg.isAppsScriptConfigured) {
      throw new Error(
        'Configure APPS_SCRIPT_URL e APPS_SCRIPT_SECRET antes de executar a sincronização remota.'
      );
    }
    const res = await this.callAppsScript<{
      driveConnected: boolean;
      sheetsConnected: boolean;
    }>('syncWorkspace', { actor: actorEmail });
    if (!res || !res.success) {
      throw new Error(res?.message || 'Falha ao sincronizar workspace no Google.');
    }
    this.addLog(
      actorEmail,
      'SYNC_WORKSPACE',
      'INTEGRACAO',
      'ok',
      'Pastas do Drive e abas do Sheets verificadas e sincronizadas.'
    );
    return this.checkHealth();
  }

  getLogs(): AuditLogEntry[] {
    return this.state.logs;
  }

  // --- Admin Auth State ---
  async isBootstrapRequired(): Promise<{
    bootstrapRequired: boolean;
    configuredAdminEmail: string;
  }> {
    const cfg = getServerConfig();
    if (cfg.adminPasswordHash) {
      return {
        bootstrapRequired: false,
        configuredAdminEmail: cfg.adminEmail,
      };
    }
    if (this.claimedAdmin) {
      return {
        bootstrapRequired: false,
        configuredAdminEmail: this.claimedAdmin.email,
      };
    }
    if (cfg.isAppsScriptConfigured) {
      const res = await this.callAppsScript<{ hasUsers: boolean; email?: string }>(
        'checkAdminExists'
      );
      if (res && res.success && res.data?.hasUsers) {
        return {
          bootstrapRequired: false,
          configuredAdminEmail: res.data.email || cfg.adminEmail,
        };
      }
    }
    return {
      bootstrapRequired: true,
      configuredAdminEmail: cfg.adminEmail,
    };
  }

  async bootstrapAdmin(email: string, password: string): Promise<StoredAdminUser> {
    const status = await this.isBootstrapRequired();
    if (!status.bootstrapRequired) {
      throw new Error('O administrador inicial já foi configurado.');
    }
    const cfg = getServerConfig();
    const targetEmail = (cfg.adminEmail || email).trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      throw new Error('Informe um e-mail administrativo válido.');
    }

    const passwordHash = hashPassword(password);
    const now = new Date().toISOString();
    const user: StoredAdminUser = {
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      email: targetEmail,
      passwordHash,
      role: 'admin',
      createdAt: now,
      updatedAt: now,
    };
    this.claimedAdmin = user;

    if (cfg.isAppsScriptConfigured) {
      await this.callAppsScript('saveAdminUser', {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        role: 'admin',
      });
    }

    this.addLog(
      user.email,
      'ADMIN_BOOTSTRAP',
      'USUARIOS',
      'ok',
      'Administrador inicial cadastrado com hash seguro.'
    );
    return user;
  }

  async authenticateAdmin(email: string, password: string): Promise<string | null> {
    const cfg = getServerConfig();
    const normalizedEmail = email.trim().toLowerCase();

    // Env-configured credentials take precedence
    if (cfg.adminPasswordHash) {
      const expectedEmail = cfg.adminEmail || normalizedEmail;
      if (
        normalizedEmail === expectedEmail &&
        verifyPassword(password, cfg.adminPasswordHash)
      ) {
        this.addLog(normalizedEmail, 'LOGIN', 'USUARIOS', 'ok', 'Autenticação via env.');
        return normalizedEmail;
      }
      this.addLog(normalizedEmail, 'LOGIN', 'USUARIOS', 'erro', 'Credenciais inválidas.');
      return null;
    }

    // Remote Apps Script USUARIOS check
    if (cfg.isAppsScriptConfigured) {
      const res = await this.callAppsScript<{ user: StoredAdminUser | null }>(
        'getAdminUserByEmail',
        { email: normalizedEmail }
      );
      if (
        res &&
        res.success &&
        res.data?.user &&
        verifyPassword(password, res.data.user.passwordHash)
      ) {
        this.claimedAdmin = res.data.user;
        this.addLog(
          normalizedEmail,
          'LOGIN',
          'USUARIOS',
          'ok',
          'Autenticação via Sheets.'
        );
        return normalizedEmail;
      }
    }

    // In-memory claimed admin fallback
    if (
      this.claimedAdmin &&
      this.claimedAdmin.email === normalizedEmail &&
      verifyPassword(password, this.claimedAdmin.passwordHash)
    ) {
      this.addLog(normalizedEmail, 'LOGIN', 'USUARIOS', 'ok', 'Autenticação local.');
      return normalizedEmail;
    }

    this.addLog(normalizedEmail, 'LOGIN', 'USUARIOS', 'erro', 'Tentativa de login recusada.');
    return null;
  }

  async changeAdminPassword(
    email: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const cfg = getServerConfig();
    if (cfg.adminPasswordHash) {
      throw new Error(
        'A senha está fixada pela variável ADMIN_PASSWORD_HASH do ambiente. Atualize-a nas configurações da Vercel.'
      );
    }
    const verified = await this.authenticateAdmin(email, currentPassword);
    if (!verified) {
      throw new Error('A senha atual informada não confere.');
    }
    const newHash = hashPassword(newPassword);
    const now = new Date().toISOString();
    if (this.claimedAdmin) {
      this.claimedAdmin = {
        ...this.claimedAdmin,
        passwordHash: newHash,
        updatedAt: now,
      };
    }
    if (cfg.isAppsScriptConfigured) {
      await this.callAppsScript('updateAdminPassword', {
        email: email.toLowerCase(),
        passwordHash: newHash,
      });
    }
    this.addLog(email, 'CHANGE_PASSWORD', 'USUARIOS', 'ok', 'Senha alterada com sucesso.');
  }

  async fetchDriveFileProxy(fileId: string): Promise<{
    buffer: Buffer;
    contentType: string;
  } | null> {
    const cfg = getServerConfig();
    if (cfg.isAppsScriptConfigured) {
      const res = await this.callAppsScript<{
        base64: string;
        mimeType: string;
      }>('getFile', { fileId, includeContent: true });
      if (res && res.success && res.data?.base64) {
        return {
          buffer: Buffer.from(res.data.base64, 'base64'),
          contentType: res.data.mimeType || 'application/octet-stream',
        };
      }
    }
    return null;
  }
}

export const studioRepo = new StudioRepository();
