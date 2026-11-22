import React, { useState } from 'react';
import { KeyRound, LogOut, ShieldCheck } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { apiClient } from '../../services/apiClient';

export function SecurityTab() {
  const { adminSession, logoutAdmin } = useSite();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'err', text: 'A confirmação da nova senha não confere.' });
      return;
    }

    setSaving(true);
    try {
      await apiClient.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setStatus({ type: 'ok', text: 'Senha administrativa atualizada com segurança.' });
    } catch (err) {
      setStatus({
        type: 'err',
        text: err instanceof Error ? err.message : 'Falha ao atualizar senha.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="font-display text-3xl font-medium text-[#F5F3EF]">
          Segurança & Sessão
        </h2>
        <p className="text-sm text-[#A19D95]">
          Gerencie sua sessão autenticada e atualize a senha de acesso ao painel.
        </p>
      </div>

      {/* Active Session Card */}
      <div className="bg-[#111115] border border-white/10 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            Sessão Autenticada Ativa
          </div>
          <p className="text-sm font-medium text-[#F5F3EF]">{adminSession?.email}</p>
          {adminSession?.expiresAt && (
            <p className="font-mono-tabular text-xs text-[#A19D95]">
              Expira em: {new Date(adminSession.expiresAt).toLocaleString('pt-BR')}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={logoutAdmin}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-white/15 text-xs font-medium text-[#F5F3EF] hover:bg-white/5 transition-colors whitespace-nowrap"
        >
          <LogOut className="w-3.5 h-3.5" />
          Encerrar Sessão
        </button>
      </div>

      {/* Change Password Form */}
      <form
        onSubmit={handlePasswordChange}
        className="bg-[#111115] border border-white/10 rounded-lg p-6 space-y-4"
      >
        <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
          <KeyRound className="w-4 h-4 text-[#C9A45C]" />
          <h3 className="text-sm font-semibold text-[#F5F3EF]">Alterar Senha</h3>
        </div>

        {status && (
          <div
            role="status"
            className={`p-3.5 rounded-md border text-xs ${
              status.type === 'ok'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                : 'border-red-500/30 bg-red-500/10 text-red-200'
            }`}
          >
            {status.text}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs text-[#A19D95]">Senha atual</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs text-[#A19D95]">Nova senha (mín. 8)</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs text-[#A19D95]">Confirmar nova senha</label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#C9A45C] text-[#070709] text-xs font-semibold hover:bg-[#D9B771] disabled:opacity-50 transition-colors"
        >
          {saving ? 'Atualizando...' : 'Salvar Nova Senha'}
        </button>
      </form>
    </div>
  );
}
