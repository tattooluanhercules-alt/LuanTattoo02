import React, { useEffect, useState } from 'react';
import { ArrowLeft, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { AppLink } from '../../contexts/RouterContext';
import { useSite } from '../../contexts/SiteContext';
import { apiClient } from '../../services/apiClient';

export function AdminAuthScreen() {
  const { loginAdmin, bootstrapAdmin } = useSite();
  const [checking, setChecking] = useState(true);
  const [bootstrapRequired, setBootstrapRequired] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiClient
      .getBootstrapStatus()
      .then((res) => {
        if (!active) return;
        setBootstrapRequired(res.bootstrapRequired);
        if (res.configuredAdminEmail) {
          setEmail(res.configuredAdminEmail);
        }
      })
      .catch(() => {
        if (!active) return;
        setBootstrapRequired(false);
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (bootstrapRequired && password !== confirmPassword) {
      setError('A confirmação de senha não confere.');
      return;
    }

    setSubmitting(true);
    try {
      if (bootstrapRequired) {
        await bootstrapAdmin(email, password);
      } else {
        await loginAdmin(email, password);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Não foi possível autenticar.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-[#F5F3EF] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <AppLink
            to="/"
            className="inline-flex items-center gap-2 text-xs text-[#A19D95] hover:text-[#F5F3EF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao site
          </AppLink>
          <span className="font-display text-sm tracking-wider text-[#C9A45C]">
            LUAN HÉRCULES TATTOO
          </span>
        </div>

        <div className="bg-[#111115] border border-white/10 rounded-lg p-7 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-md bg-[#C9A45C]/15 border border-[#C9A45C]/30 flex items-center justify-center text-[#C9A45C]">
              {bootstrapRequired ? (
                <KeyRound className="w-5 h-5" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>
            <h1 className="font-display text-3xl font-medium text-[#F5F3EF]">
              {checking
                ? 'Verificando acesso...'
                : bootstrapRequired
                ? 'Configurar Primeiro Administrador'
                : 'Acesso Administrativo'}
            </h1>
            <p className="text-xs text-[#A19D95] leading-relaxed">
              {bootstrapRequired
                ? 'Nenhum administrador cadastrado ainda. Defina o e-mail e uma senha forte para assumir o controle do painel.'
                : 'Entre com suas credenciais administrativas para gerenciar conteúdos, portfólio e mídia no Google Drive.'}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-md border border-red-500/30 bg-red-500/10 text-xs text-red-200"
            >
              {error}
            </div>
          )}

          {!checking && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="admin-email" className="block text-xs font-medium text-[#F5F3EF]">
                  E-mail do Administrador
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu-email@dominio.com"
                  className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF] focus:outline-none focus:border-[#C9A45C]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="admin-password" className="block text-xs font-medium text-[#F5F3EF]">
                  Senha {bootstrapRequired ? '(mínimo 8 caracteres)' : ''}
                </label>
                <input
                  id="admin-password"
                  type="password"
                  required
                  minLength={bootstrapRequired ? 8 : 1}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF] focus:outline-none focus:border-[#C9A45C]"
                />
              </div>

              {bootstrapRequired && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="admin-password-confirm"
                    className="block text-xs font-medium text-[#F5F3EF]"
                  >
                    Confirmar Senha
                  </label>
                  <input
                    id="admin-password-confirm"
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF] focus:outline-none focus:border-[#C9A45C]"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-[#C9A45C] text-[#070709] text-sm font-semibold hover:bg-[#D9B771] disabled:opacity-50 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                {submitting
                  ? 'Validando...'
                  : bootstrapRequired
                  ? 'Criar Administrador e Entrar'
                  : 'Entrar no Painel'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
