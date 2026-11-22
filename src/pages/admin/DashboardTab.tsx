import { useState } from 'react';
import {
  CheckCircle2,
  Database,
  FolderOpen,
  HardDrive,
  RefreshCw,
  AlertCircle,
  FileText,
  Music,
  Shield,
} from 'lucide-react';
import type {
  AuditLogEntry,
  ContactSubmission,
  IntegrationStatus,
} from '../../types/studio';
import { apiClient } from '../../services/apiClient';

interface DashboardTabProps {
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
  onNavigateTab: (tab: 'content' | 'media' | 'music' | 'security') => void;
  onRefreshDashboard: () => Promise<void>;
}

export function DashboardTab({
  integration,
  metrics,
  logs,
  submissions,
  onNavigateTab,
  onRefreshDashboard,
}: DashboardTabProps) {
  const [syncing, setSyncing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );

  const handleSync = async () => {
    setSyncing(true);
    setFeedback(null);
    try {
      await apiClient.syncWorkspace();
      await onRefreshDashboard();
      setFeedback({
        type: 'ok',
        text: 'Workspace sincronizado: pastas do Drive e abas do Sheets verificadas.',
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        text:
          err instanceof Error
            ? err.message
            : 'Não foi possível sincronizar o workspace.',
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-medium text-[#F5F3EF]">
            Visão Geral do Estúdio
          </h2>
          <p className="text-sm text-[#A19D95]">
            Acompanhe o estado das integrações, estatísticas de conteúdo e registros recentes.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSync}
          disabled={syncing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#C9A45C] text-[#070709] text-xs font-semibold hover:bg-[#D9B771] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Sincronizando...' : 'Sincronizar Drive e Sheets'}
        </button>
      </div>

      {feedback && (
        <div
          role="status"
          className={`p-4 rounded-md border text-xs flex items-center gap-2.5 ${
            feedback.type === 'ok'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-200'
          }`}
        >
          {feedback.type === 'ok' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Integration Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#111115] border border-white/10 rounded-lg p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#A19D95]">
            <span>Google Apps Script</span>
            {integration.appsScriptReachable ? (
              <span className="text-emerald-400 font-medium">Conectado</span>
            ) : (
              <span className="text-amber-400 font-medium">Modo Cache Local</span>
            )}
          </div>
          <p className="text-sm font-medium text-[#F5F3EF]">
            {integration.appsScriptConfigured
              ? integration.appsScriptReachable
                ? 'Comunicação ativa'
                : 'Configurado (sem resposta)'
              : 'Aguardando URL/Secret'}
          </p>
          <p className="text-xs text-[#A19D95] leading-relaxed">{integration.message}</p>
        </div>

        <div className="bg-[#111115] border border-white/10 rounded-lg p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#A19D95]">
            <span className="inline-flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-[#C9A45C]" />
              Google Drive
            </span>
            <span
              className={
                integration.driveConnected ? 'text-emerald-400 font-medium' : 'text-[#A19D95]'
              }
            >
              {integration.driveConnected ? 'Operacional' : 'Em cache'}
            </span>
          </div>
          <p className="font-mono-tabular text-xs text-[#F5F3EF] break-all">
            Pasta ID: {integration.driveFolderId}
          </p>
          <p className="text-xs text-[#A19D95]">
            Estrutura organizada em 12 pastas dedicadas.
          </p>
        </div>

        <div className="bg-[#111115] border border-white/10 rounded-lg p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#A19D95]">
            <span className="inline-flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#C9A45C]" />
              Google Sheets
            </span>
            <span
              className={
                integration.sheetsConnected ? 'text-emerald-400 font-medium' : 'text-[#A19D95]'
              }
            >
              {integration.sheetsConnected ? 'Operacional' : 'Em cache'}
            </span>
          </div>
          <p className="font-mono-tabular text-xs text-[#F5F3EF] break-all">
            Planilha ID: {integration.sheetId}
          </p>
          <p className="text-xs text-[#A19D95]">
            18 abas estruturadas para conteúdo e auditoria.
          </p>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Imagens cadastradas', value: metrics.imagesCount },
          { label: 'Obras no portfólio', value: metrics.portfolioCount },
          { label: 'Itens na galeria', value: metrics.galleryCount },
          { label: 'Serviços ativos', value: metrics.servicesCount },
          { label: 'Solicitações recebidas', value: metrics.submissionsCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[#111115] border border-white/10 rounded-lg p-4 space-y-1"
          >
            <p className="text-xs text-[#A19D95]">{stat.label}</p>
            <p className="font-mono-tabular text-2xl font-semibold text-[#F5F3EF]">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Shortcuts */}
      <div className="bg-[#111115] border border-white/10 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[#F5F3EF]">Atalhos Administrativos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => onNavigateTab('content')}
            className="flex items-center gap-3 p-3.5 rounded-md bg-[#070709] border border-white/10 hover:border-[#C9A45C]/50 text-left transition-colors"
          >
            <FileText className="w-4 h-4 text-[#C9A45C] shrink-0" />
            <div>
              <p className="text-xs font-medium text-[#F5F3EF]">Editar Conteúdos</p>
              <p className="text-[11px] text-[#A19D95]">Home, Sobre, Portfólio e Preços</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('media')}
            className="flex items-center gap-3 p-3.5 rounded-md bg-[#070709] border border-white/10 hover:border-[#C9A45C]/50 text-left transition-colors"
          >
            <FolderOpen className="w-4 h-4 text-[#C9A45C] shrink-0" />
            <div>
              <p className="text-xs font-medium text-[#F5F3EF]">Biblioteca do Drive</p>
              <p className="text-[11px] text-[#A19D95]">Upload e pastas de mídia</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('music')}
            className="flex items-center gap-3 p-3.5 rounded-md bg-[#070709] border border-white/10 hover:border-[#C9A45C]/50 text-left transition-colors"
          >
            <Music className="w-4 h-4 text-[#C9A45C] shrink-0" />
            <div>
              <p className="text-xs font-medium text-[#F5F3EF]">Música Ambiente</p>
              <p className="text-[11px] text-[#A19D95]">Player e volume inicial</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('security')}
            className="flex items-center gap-3 p-3.5 rounded-md bg-[#070709] border border-white/10 hover:border-[#C9A45C]/50 text-left transition-colors"
          >
            <Shield className="w-4 h-4 text-[#C9A45C] shrink-0" />
            <div>
              <p className="text-xs font-medium text-[#F5F3EF]">Sessão & Senha</p>
              <p className="text-[11px] text-[#A19D95]">Credenciais administrativas</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Contact Submissions */}
      <div className="bg-[#111115] border border-white/10 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#F5F3EF]">
            Solicitações de Agendamento Recentes
          </h3>
          <span className="font-mono-tabular text-xs text-[#A19D95]">
            {submissions.length} registro(s)
          </span>
        </div>
        {submissions.length === 0 ? (
          <p className="p-6 text-xs text-[#A19D95]">
            Nenhuma solicitação recebida pelo formulário público até o momento.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-[#A19D95]">
                <tr>
                  <th className="px-5 py-3 font-medium">Data</th>
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Contato</th>
                  <th className="px-5 py-3 font-medium">Local / Tamanho</th>
                  <th className="px-5 py-3 font-medium">Ideia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3 font-mono-tabular text-[#A19D95] whitespace-nowrap">
                      {new Date(sub.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-5 py-3 font-medium text-[#F5F3EF]">{sub.name}</td>
                    <td className="px-5 py-3 text-[#C9A45C]">{sub.contactChannel}</td>
                    <td className="px-5 py-3 text-[#A19D95]">
                      {sub.placement} · {sub.sizeEstimate}
                    </td>
                    <td className="px-5 py-3 text-[#A19D95] max-w-xs truncate">{sub.idea}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Logs */}
      <div className="bg-[#111115] border border-white/10 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#F5F3EF]">Últimas Alterações</h3>
          <span className="font-mono-tabular text-xs text-[#A19D95]">
            {logs.length} evento(s)
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-[#A19D95]">
              <tr>
                <th className="px-5 py-3 font-medium">Horário</th>
                <th className="px-5 py-3 font-medium">Ator</th>
                <th className="px-5 py-3 font-medium">Ação</th>
                <th className="px-5 py-3 font-medium">Alvo</th>
                <th className="px-5 py-3 font-medium">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3 font-mono-tabular text-[#A19D95] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-5 py-3 text-[#F5F3EF]">{log.actor}</td>
                  <td className="px-5 py-3 font-mono-tabular text-[#C9A45C]">{log.action}</td>
                  <td className="px-5 py-3 text-[#A19D95]">{log.target}</td>
                  <td className="px-5 py-3 text-[#A19D95]">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
