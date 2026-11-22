import React, { useEffect, useState } from 'react';
import { Music, Save } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { apiClient } from '../../services/apiClient';
import type { DriveFileRecord, MusicConfig } from '../../types/studio';

export function MusicTab() {
  const { site, refreshSite } = useSite();
  const [form, setForm] = useState<MusicConfig>(
    site?.music || {
      id: 'mus-principal',
      enabled: false,
      title: 'Ambiente do Estúdio',
      artist: 'Luan Hércules Tattoo',
      audioUrl: '',
      initialVolume: 0.35,
      loop: true,
      manualPlayOnly: true,
      updatedAt: new Date().toISOString(),
    }
  );
  const [audioFiles, setAudioFiles] = useState<DriveFileRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (site?.music) setForm(site.music);
  }, [site?.music]);

  useEffect(() => {
    apiClient
      .listFiles('04_MUSICAS')
      .then((res) => setAudioFiles(res.files))
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      await apiClient.saveSection('music', { ...form, manualPlayOnly: true });
      await refreshSite(true);
      setStatus({ type: 'ok', text: 'Configurações de música ambiente salvas.' });
    } catch (err) {
      setStatus({
        type: 'err',
        text: err instanceof Error ? err.message : 'Erro ao salvar música.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="font-display text-3xl font-medium text-[#F5F3EF]">
          Música Ambiente do Site
        </h2>
        <p className="text-sm text-[#A19D95]">
          Configure uma trilha discreta opcional. Em respeito às políticas dos navegadores,
          o áudio nunca inicia automaticamente com som sem clique do visitante.
        </p>
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

      <form
        onSubmit={handleSave}
        className="bg-[#111115] border border-white/10 rounded-lg p-6 space-y-5"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Music className="w-5 h-5 text-[#C9A45C]" />
            <div>
              <p className="text-sm font-medium text-[#F5F3EF]">Exibir player no site</p>
              <p className="text-xs text-[#A19D95]">
                Ativa o controlador discreto no rodapé quando uma faixa estiver configurada.
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
            aria-label="Ativar música ambiente"
            className="w-4 h-4 accent-[#C9A45C]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs text-[#A19D95]">Título da Faixa</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs text-[#A19D95]">Artista / Créditos</label>
            <input
              type="text"
              value={form.artist}
              onChange={(e) => setForm({ ...form, artist: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF]"
            />
          </div>
        </div>

        {audioFiles.length > 0 && (
          <div className="space-y-1.5">
            <label className="block text-xs text-[#A19D95]">
              Selecionar arquivo da pasta 04_MUSICAS
            </label>
            <select
              value={form.audioUrl}
              onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF]"
            >
              <option value="">-- Selecionar arquivo enviado --</option>
              {audioFiles.map((f) => (
                <option key={f.id} value={f.publicUrl}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs text-[#A19D95]">
            URL direta do áudio (MP3 / OGG / WAV)
          </label>
          <input
            type="text"
            value={form.audioUrl}
            onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
            placeholder="/api/media/... ou https://..."
            className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center pt-2">
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs text-[#A19D95]">
              <span>Volume inicial</span>
              <span className="font-mono-tabular text-[#F5F3EF]">
                {Math.round(form.initialVolume * 100)}%
              </span>
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={form.initialVolume}
              onChange={(e) =>
                setForm({ ...form, initialVolume: parseFloat(e.target.value) })
              }
              className="w-full accent-[#C9A45C]"
            />
          </div>

          <label className="flex items-center gap-2.5 text-xs text-[#F5F3EF] cursor-pointer">
            <input
              type="checkbox"
              checked={form.loop}
              onChange={(e) => setForm({ ...form, loop: e.target.checked })}
              className="w-4 h-4 accent-[#C9A45C]"
            />
            Repetir faixa continuamente (loop)
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#C9A45C] text-[#070709] text-xs font-semibold hover:bg-[#D9B771] disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar Configurações de Música'}
        </button>
      </form>
    </div>
  );
}
