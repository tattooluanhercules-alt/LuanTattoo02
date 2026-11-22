import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';
import type { AdminUserSession, SiteBundle } from '../types/studio';

interface SiteContextValue {
  site: SiteBundle | null;
  loading: boolean;
  error: string | null;
  refreshSite: (forceRemote?: boolean) => Promise<void>;
  adminSession: AdminUserSession | null;
  loginAdmin: (email: string, password: string) => Promise<void>;
  bootstrapAdmin: (email: string, password: string) => Promise<void>;
  logoutAdmin: () => Promise<void>;
}

const SiteContext = createContext<SiteContextValue | undefined>(undefined);

function applyDocumentSeoAndTheme(bundle: SiteBundle) {
  if (bundle.seo?.siteTitle) {
    document.title = bundle.seo.siteTitle;
  }
  const updateMeta = (selector: string, content: string) => {
    if (!content) return;
    const el = document.querySelector(selector);
    if (el) el.setAttribute('content', content);
  };

  updateMeta('meta[name="description"]', bundle.seo?.metaDescription || '');
  updateMeta('meta[property="og:title"]', bundle.seo?.ogTitle || bundle.seo?.siteTitle || '');
  updateMeta(
    'meta[property="og:description"]',
    bundle.seo?.ogDescription || bundle.seo?.metaDescription || ''
  );
  updateMeta('meta[name="twitter:title"]', bundle.seo?.ogTitle || bundle.seo?.siteTitle || '');
  updateMeta(
    'meta[name="twitter:description"]',
    bundle.seo?.ogDescription || bundle.seo?.metaDescription || ''
  );

  if (bundle.theme) {
    const root = document.documentElement;
    root.style.setProperty('--bg-canvas', bundle.theme.backgroundColor);
    root.style.setProperty('--bg-surface', bundle.theme.surfaceColor);
    root.style.setProperty('--text-primary', bundle.theme.textColor);
    root.style.setProperty('--accent-gold', bundle.theme.accentColor);
  }
}

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [site, setSite] = useState<SiteBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminSession, setAdminSession] = useState<AdminUserSession | null>(null);

  const refreshSite = useCallback(async (forceRemote = false) => {
    try {
      const data = await apiClient.getSite(forceRemote);
      setSite(data);
      setError(null);
      applyDocumentSeoAndTheme(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os dados do estúdio.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSite(false);
  }, [refreshSite]);

  const loginAdmin = useCallback(async (email: string, password: string) => {
    const { token, session } = await apiClient.login(email, password);
    apiClient.setAuthToken(token);
    setAdminSession(session);
  }, []);

  const bootstrapAdmin = useCallback(async (email: string, password: string) => {
    const { token, session } = await apiClient.bootstrapAdmin(email, password);
    apiClient.setAuthToken(token);
    setAdminSession(session);
  }, []);

  const logoutAdmin = useCallback(async () => {
    try {
      await apiClient.logout();
    } catch {
      // Clear local memory session regardless of network response
    } finally {
      apiClient.setAuthToken(null);
      setAdminSession(null);
    }
  }, []);

  return (
    <SiteContext.Provider
      value={{
        site,
        loading,
        error,
        refreshSite,
        adminSession,
        loginAdmin,
        bootstrapAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) {
    throw new Error('useSite deve ser usado dentro de SiteProvider');
  }
  return ctx;
}
