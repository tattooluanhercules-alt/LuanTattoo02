import type {
  AdminUserSession,
  ApiResponse,
  AuditLogEntry,
  ContactSubmission,
  DriveFileRecord,
  DriveFolderInfo,
  IntegrationStatus,
  SiteBundle,
} from '../types/studio';

class ApiClient {
  private authToken: string | null = null;

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
    requireAuth = false
  ): Promise<ApiResponse<T>> {
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }
    if (requireAuth && this.authToken) {
      headers.set('Authorization', `Bearer ${this.authToken}`);
    }

    const response = await fetch(path, {
      ...options,
      headers,
    });

    const json = (await response.json()) as ApiResponse<T>;
    if (!response.ok || !json.success) {
      throw new Error(json.message || 'Erro ao comunicar com o servidor.');
    }
    return json;
  }

  async getSite(refresh = false): Promise<SiteBundle> {
    const res = await this.request<SiteBundle>(
      refresh ? '/api/site?refresh=true' : '/api/site'
    );
    return res.data!;
  }

  async submitContact(payload: {
    name: string;
    contactChannel: string;
    idea: string;
    placement: string;
    sizeEstimate: string;
  }): Promise<{ id: string; createdAt: string }> {
    const res = await this.request<{ id: string; createdAt: string }>('/api/contacts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data!;
  }

  async getBootstrapStatus(): Promise<{
    bootstrapRequired: boolean;
    configuredAdminEmail: string;
  }> {
    const res = await this.request<{
      bootstrapRequired: boolean;
      configuredAdminEmail: string;
    }>('/api/admin/bootstrap-status');
    return res.data!;
  }

  async bootstrapAdmin(
    email: string,
    password: string
  ): Promise<{ token: string; session: AdminUserSession }> {
    const res = await this.request<{ token: string; session: AdminUserSession }>(
      '/api/admin/bootstrap',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    return res.data!;
  }

  async login(
    email: string,
    password: string
  ): Promise<{ token: string; session: AdminUserSession }> {
    const res = await this.request<{ token: string; session: AdminUserSession }>(
      '/api/admin/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    return res.data!;
  }

  async logout(): Promise<void> {
    await this.request('/api/admin/logout', { method: 'POST' }, true);
  }

  async verifySession(): Promise<AdminUserSession> {
    const res = await this.request<{ session: AdminUserSession }>(
      '/api/admin/session',
      {},
      true
    );
    return res.data!.session;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.request(
      '/api/admin/change-password',
      {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      },
      true
    );
  }

  async getDashboard(): Promise<{
    integration: IntegrationStatus;
    metrics: {
      imagesCount: number;
      portfolioCount: number;
      galleryCount: number;
      servicesCount: number;
      submissionsCount: number;
      totalFilesCount: number;
    };
    logs: AuditLogEntry[];
    submissions: ContactSubmission[];
  }> {
    const res = await this.request<{
      integration: IntegrationStatus;
      metrics: {
        imagesCount: number;
        portfolioCount: number;
        galleryCount: number;
        servicesCount: number;
        submissionsCount: number;
        totalFilesCount: number;
      };
      logs: AuditLogEntry[];
      submissions: ContactSubmission[];
    }>('/api/admin/dashboard', {}, true);
    return res.data!;
  }

  async syncWorkspace(): Promise<IntegrationStatus> {
    const res = await this.request<IntegrationStatus>(
      '/api/admin/sync',
      { method: 'POST' },
      true
    );
    return res.data!;
  }

  async listFiles(folder?: string): Promise<{
    files: DriveFileRecord[];
    folders: DriveFolderInfo[];
  }> {
    const qs = folder ? `?folder=${encodeURIComponent(folder)}` : '';
    const res = await this.request<{
      files: DriveFileRecord[];
      folders: DriveFolderInfo[];
    }>(`/api/admin/files${qs}`, {}, true);
    return res.data!;
  }

  async uploadFile(payload: {
    name: string;
    mimeType: string;
    base64Content: string;
    folderName: string;
    sectionBinding?: string;
  }): Promise<DriveFileRecord> {
    const res = await this.request<{ file: DriveFileRecord }>(
      '/api/admin/upload',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      true
    );
    return res.data!.file;
  }

  async updateFile(
    id: string,
    payload: { name?: string; sectionBinding?: string }
  ): Promise<DriveFileRecord> {
    const res = await this.request<{ file: DriveFileRecord }>(
      `/api/admin/files/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      true
    );
    return res.data!.file;
  }

  async deleteFile(id: string): Promise<void> {
    await this.request(
      `/api/admin/files/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
        body: JSON.stringify({ confirm: true }),
      },
      true
    );
  }

  async saveSection<T>(endpoint: string, payload: unknown): Promise<T> {
    const res = await this.request<T>(
      `/api/admin/content/${endpoint}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      true
    );
    return res.data!;
  }
}

export const apiClient = new ApiClient();
