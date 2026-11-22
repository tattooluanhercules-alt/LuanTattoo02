import { useCallback, useEffect, useState } from 'react';
import {
  ExternalLink,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Music,
  Shield,
  X,
} from 'lucide-react';
import { AppLink } from '../contexts/RouterContext';
import { useSite } from '../contexts/SiteContext';
import { apiClient } from '../services/apiClient';
import type {
  AuditLogEntry,
  ContactSubmission,
  IntegrationStatus,
} from '../types/studio';
import { AdminAuthScreen } from './admin/AdminAuthScreen';
import { DashboardTab } from './admin/DashboardTab';
import { ContentTab } from './admin/ContentTab';
import { MediaTab } from './admin/MediaTab';
import { MusicTab } from './admin/MusicTab';
import { SecurityTab } from './admin/SecurityTab';

type AdminTab = 'dashboard' | 'content' | 'media' | 'music' | 'security';

const NAV_ITEMS: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'content', label: 'Conteúdo do Site', icon: FileText },
  { id: 'media', label: 'Mídia & Drive', icon: FolderOpen },
  { id: 'music', label: 'Música Ambiente', icon: Music },
  { id: 'security', label: 'Segurança & Conta', icon: Shield },
];

export function AdminPage() {
  const { adminSession, logoutAdmin } = useSite();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<{
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
  } | null>(null);
  const [loadingDash, setLoadingDash] = useState(false);

  const loadDashboard = useCallback(async () => {
    if (!adminSession) return;
    setLoadingDash(true);
    try {
      const data = await apiClient.getDashboard();
      setDashboardData(data);
    } catch {
      // Handled gracefully
    } finally {
      setLoadingDash(false);
    }
  }, [adminSession]);

  useEffect(() => {
    if (adminSession) {
      loadDashboard();
    }
  }, [adminSession, loadDashboard]);

  if (!adminSession) {
    return <AdminAuthScreen />;
  }

  const activeLabel = NAV_ITEMS.find((i) => i.id === activeTab)?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-[#070709] text-[#F5F3EF] flex flex-col lg:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r border-white/10 bg-[#0A0A0E] shrink-0">
        <div className="h-16 px-6 flex items-center border-b border-white/10">
          <span className="font-display text-lg font-semibold tracking-wider text-[#F5F3EF]">
            LUAN HÉRCULES
          </span>
        </div>

        <nav aria-label="Menu Administrativo" className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#C9A45C] text-[#070709]'
                    : 'text-[#A19D95] hover:text-[#F5F3EF] hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <p className="text-[11px] text-[#A19D95] truncate px-2">{adminSession.email}</p>
          <button
            type="button"
            onClick={logoutAdmin}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-md text-xs text-[#A19D95] hover:text-[#F5F3EF] hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-4 sm:px-8 border-b border-white/10 bg-[#0A0A0E] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label="Menu administrativo"
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-white/10 text-[#F5F3EF]"
            >
              {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <p className="text-xs text-[#A19D95] truncate">
              Painel Administrativo <span aria-hidden="true">/</span>{' '}
              <span className="text-[#F5F3EF] font-medium">{activeLabel}</span>
            </p>
          </div>

          <AppLink
            to="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-white/15 text-xs font-medium text-[#F5F3EF] hover:bg-white/5 transition-colors whitespace-nowrap shrink-0"
          >
            Ver Site
            <ExternalLink className="w-3.5 h-3.5" />
          </AppLink>
        </header>

        {mobileNavOpen && (
          <nav className="lg:hidden border-b border-white/10 bg-[#0B0B10] p-3 flex flex-wrap gap-2">
            {NAV_ITEMS.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileNavOpen(false);
                  }}
                  className={`px-3 py-2 rounded-md text-xs font-medium ${
                    active
                      ? 'bg-[#C9A45C] text-[#070709]'
                      : 'bg-[#111115] text-[#A19D95] border border-white/10'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}

        <main className="flex-1 p-4 sm:p-8 max-w-[1200px] w-full mx-auto">
          {activeTab === 'dashboard' &&
            (loadingDash || !dashboardData ? (
              <div className="space-y-4">
                <div className="h-24 bg-white/5 rounded-lg animate-pulse" />
                <div className="h-64 bg-white/5 rounded-lg animate-pulse" />
              </div>
            ) : (
              <DashboardTab
                integration={dashboardData.integration}
                metrics={dashboardData.metrics}
                logs={dashboardData.logs}
                submissions={dashboardData.submissions}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onRefreshDashboard={loadDashboard}
              />
            ))}
          {activeTab === 'content' && <ContentTab />}
          {activeTab === 'media' && <MediaTab />}
          {activeTab === 'music' && <MusicTab />}
          {activeTab === 'security' && <SecurityTab />}
        </main>
      </div>
    </div>
  );
}
