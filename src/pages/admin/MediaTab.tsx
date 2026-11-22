import React, { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  Edit3,
  FileAudio,
  FileText,
  Film,
  Folder,
  Trash2,
  Upload,
} from 'lucide-react';
import type {
  DriveFileRecord,
  DriveFolderInfo,
  DriveFolderName,
} from '../../types/studio';
import { apiClient } from '../../services/apiClient';
import { StudioImage } from '../../components/StudioImage';
import { ConfirmDialog } from '../../components/ConfirmDialog';

const FOLDER_OPTIONS: DriveFolderName[] = [
  '01_CONFIGURACOES',
  '02_LOGOTIPOS',
  '03_GALERIA',
  '04_MUSICAS',
  '05_BANNERS',
  '06_VIDEOS',
  '07_PORTFOLIO',
  '08_DOCUMENTOS',
  '09_FOTOS_PERFIL',
  '10_BACKGROUND',
  '11_ICONS',
  '12_ARQUIVOS_GERAIS',
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function MediaTab() {
  const [files, setFiles] = useState<DriveFileRecord[]>([]);
  const [folders, setFolders] = useState<DriveFolderInfo[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadFolder, setUploadFolder] = useState<DriveFolderName>('07_PORTFOLIO');
  const [sectionBinding, setSectionBinding] = useState('');
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editBinding, setEditBinding] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<DriveFileRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadFiles = async (folder = selectedFolder) => {
    setLoading(true);
    try {
      const res = await apiClient.listFiles(folder || undefined);
      setFiles(res.files);
      setFolders(res.folders);
    } catch (err) {
      setMessage({
        type: 'err',
        text: err instanceof Error ? err.message : 'Erro ao listar arquivos.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles('');
  }, []);

  const handleFolderFilter = (folderName: string) => {
    setSelectedFolder(folderName);
    loadFiles(folderName);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessage(null);

    if (file.size > 25 * 1024 * 1024) {
      setMessage({
        type: 'err',
        text: 'Arquivo excede o limite máximo de 25 MB.',
      });
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const base64Content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Falha ao ler o arquivo selecionado.'));
        reader.readAsDataURL(file);
      });

      await apiClient.uploadFile({
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        base64Content,
        folderName: uploadFolder,
        sectionBinding: sectionBinding.trim() || undefined,
      });

      setSectionBinding('');
      setMessage({
        type: 'ok',
        text: `Arquivo "${file.name}" enviado com sucesso para ${uploadFolder}.`,
      });
      await loadFiles(selectedFolder);
    } catch (err) {
      setMessage({
        type: 'err',
        text: err instanceof Error ? err.message : 'Erro ao enviar arquivo.',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRenameSave = async (id: string) => {
    try {
      await apiClient.updateFile(id, {
        name: editName.trim() || undefined,
        sectionBinding: editBinding.trim(),
      });
      setEditingId(null);
      setMessage({ type: 'ok', text: 'Metadados do arquivo atualizados.' });
      await loadFiles(selectedFolder);
    } catch (err) {
      setMessage({
        type: 'err',
        text: err instanceof Error ? err.message : 'Erro ao atualizar arquivo.',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiClient.deleteFile(deleteTarget.id);
      setMessage({
        type: 'ok',
        text: `Arquivo "${deleteTarget.name}" excluído.`,
      });
      setDeleteTarget(null);
      await loadFiles(selectedFolder);
    } catch (err) {
      setMessage({
        type: 'err',
        text: err instanceof Error ? err.message : 'Erro ao excluir arquivo.',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyUrl = async (file: DriveFileRecord) => {
    try {
      await navigator.clipboard.writeText(file.publicUrl);
      setCopiedId(file.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback silencioso caso clipboard esteja bloqueado
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl font-medium text-[#F5F3EF]">
          Gerenciamento de Mídia (Google Drive)
        </h2>
        <p className="text-sm text-[#A19D95]">
          Envie, organize nas 12 pastas oficiais, renomeie e vincule mídias às seções do site.
        </p>
      </div>

      {message && (
        <div
          role="status"
          className={`p-3.5 rounded-md border text-xs ${
            message.type === 'ok'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-red-500/30 bg-red-500/10 text-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Upload Box */}
      <div className="bg-[#111115] border border-white/10 rounded-lg p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-semibold text-[#F5F3EF]">Enviar Novo Arquivo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5">
            <label htmlFor="upload-folder" className="block text-xs text-[#A19D95]">
              Pasta de Destino no Drive
            </label>
            <select
              id="upload-folder"
              value={uploadFolder}
              onChange={(e) => setUploadFolder(e.target.value as DriveFolderName)}
              className="w-full px-3 py-2.5 rounded-md bg-[#070709] border border-white/15 text-xs text-[#F5F3EF] focus:outline-none focus:border-[#C9A45C]"
            >
              {FOLDER_OPTIONS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="upload-binding" className="block text-xs text-[#A19D95]">
              Seção Vinculada (opcional)
            </label>
            <input
              id="upload-binding"
              type="text"
              value={sectionBinding}
              onChange={(e) => setSectionBinding(e.target.value)}
              placeholder="Ex.: Hero, Portfólio, Música"
              className="w-full px-3 py-2.5 rounded-md bg-[#070709] border border-white/15 text-xs text-[#F5F3EF] focus:outline-none focus:border-[#C9A45C]"
            />
          </div>

          <div>
            <label className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#C9A45C] text-[#070709] text-xs font-semibold hover:bg-[#D9B771] cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              {uploading ? 'Enviando...' : 'Selecionar e Enviar'}
              <input
                type="file"
                disabled={uploading}
                accept="image/jpeg,image/png,image/webp,image/avif,audio/*,video/mp4,video/webm,application/pdf"
                onChange={handleFileUpload}
                className="sr-only"
              />
            </label>
          </div>
        </div>
        <p className="text-[11px] text-[#A19D95]">
          Limites: Imagens até 5 MB (JPG, PNG, WEBP, AVIF) · Áudio até 15 MB · Vídeo até 25 MB · PDF até 10 MB.
        </p>
      </div>

      {/* Folder Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleFolderFilter('')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            selectedFolder === ''
              ? 'bg-[#C9A45C] text-[#070709]'
              : 'bg-[#111115] text-[#A19D95] border border-white/10 hover:text-[#F5F3EF]'
          }`}
        >
          <Folder className="w-3.5 h-3.5" />
          Todas ({folders.reduce((acc, f) => acc + f.fileCount, 0)})
        </button>
        {folders.map((folder) => (
          <button
            key={folder.name}
            type="button"
            onClick={() => handleFolderFilter(folder.name)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors font-mono-tabular ${
              selectedFolder === folder.name
                ? 'bg-[#C9A45C] text-[#070709]'
                : 'bg-[#111115] text-[#A19D95] border border-white/10 hover:text-[#F5F3EF]'
            }`}
          >
            <span>{folder.name}</span>
            <span>({folder.fileCount})</span>
          </button>
        ))}
      </div>

      {/* Files Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-56 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="bg-[#111115] border border-white/10 rounded-lg p-12 text-center space-y-2">
          <p className="text-base font-medium text-[#F5F3EF]">
            Nenhum arquivo nesta pasta
          </p>
          <p className="text-xs text-[#A19D95]">
            Utilize o formulário acima para enviar imagens, músicas, vídeos ou documentos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {files.map((file) => {
            const isImage = file.mimeType.startsWith('image/');
            const isAudio = file.mimeType.startsWith('audio/');
            const isVideo = file.mimeType.startsWith('video/');

            return (
              <div
                key={file.id}
                className="bg-[#111115] border border-white/10 rounded-lg overflow-hidden flex flex-col"
              >
                <div className="h-44 bg-[#070709] flex items-center justify-center overflow-hidden border-b border-white/10">
                  {isImage ? (
                    <StudioImage
                      src={file.publicUrl}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : isAudio ? (
                    <FileAudio className="w-10 h-10 text-[#C9A45C]" />
                  ) : isVideo ? (
                    <Film className="w-10 h-10 text-[#C9A45C]" />
                  ) : (
                    <FileText className="w-10 h-10 text-[#A19D95]" />
                  )}
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  {editingId === file.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        aria-label="Novo nome do arquivo"
                        className="w-full px-2.5 py-1.5 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
                      />
                      <input
                        type="text"
                        value={editBinding}
                        onChange={(e) => setEditBinding(e.target.value)}
                        placeholder="Vínculo (ex.: Hero)"
                        aria-label="Seção vinculada"
                        className="w-full px-2.5 py-1.5 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleRenameSave(file.id)}
                          className="px-3 py-1 rounded bg-[#C9A45C] text-[#070709] text-xs font-semibold"
                        >
                          Salvar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 rounded border border-white/15 text-xs text-[#A19D95]"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-[#F5F3EF] truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="font-mono-tabular text-[11px] text-[#A19D95]">
                        {file.folderName} · {formatBytes(file.sizeBytes)}
                      </p>
                      {file.sectionBinding && (
                        <p className="text-[11px] text-[#C9A45C]">
                          Seção: {file.sectionBinding}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(file)}
                      className="inline-flex items-center gap-1 text-[11px] text-[#A19D95] hover:text-[#F5F3EF] transition-colors"
                    >
                      {copiedId === file.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          URL copiada
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copiar URL
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(file.id);
                          setEditName(file.name);
                          setEditBinding(file.sectionBinding || '');
                        }}
                        aria-label={`Renomear ${file.name}`}
                        className="p-1.5 rounded text-[#A19D95] hover:text-[#F5F3EF] hover:bg-white/5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(file)}
                        aria-label={`Excluir ${file.name}`}
                        className="p-1.5 rounded text-[#A19D95] hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Excluir arquivo do repositório"
        message={`Deseja realmente remover "${deleteTarget?.name}"? Se este arquivo estiver vinculado a alguma página do site, atualize a referência após a exclusão.`}
        confirmLabel="Excluir definitivamente"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
