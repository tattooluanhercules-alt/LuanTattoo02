import React, { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { apiClient } from '../../services/apiClient';
import type {
  BannerItem,
  ContactInfo,
  DriveFileRecord,
  GalleryItem,
  MenuItem,
  PortfolioItem,
  PriceItem,
  SeoConfig,
  ServiceItem,
  SocialLinkItem,
  StudioConfig,
  TestimonialItem,
  ThemeConfig,
} from '../../types/studio';

type SubSection =
  | 'geral'
  | 'portfolio'
  | 'galeria'
  | 'servicos'
  | 'precos'
  | 'contatos'
  | 'redes'
  | 'banners'
  | 'depoimentos'
  | 'menu_seo_tema';

const SUBSECTION_LABELS: { id: SubSection; label: string }[] = [
  { id: 'geral', label: 'Início, Sobre & Rodapé' },
  { id: 'portfolio', label: 'Portfólio' },
  { id: 'galeria', label: 'Galeria' },
  { id: 'servicos', label: 'Serviços' },
  { id: 'precos', label: 'Preços' },
  { id: 'contatos', label: 'Contatos' },
  { id: 'redes', label: 'Redes Sociais' },
  { id: 'banners', label: 'Banners' },
  { id: 'depoimentos', label: 'Depoimentos' },
  { id: 'menu_seo_tema', label: 'Menus, SEO & Tema' },
];

export function ContentTab() {
  const { site, refreshSite } = useSite();
  const [section, setSection] = useState<SubSection>('geral');
  const [driveImages, setDriveImages] = useState<DriveFileRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );

  // Local editable states synced from site bundle
  const [config, setConfig] = useState<StudioConfig | null>(site?.config || null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(site?.portfolio || []);
  const [gallery, setGallery] = useState<GalleryItem[]>(site?.gallery || []);
  const [services, setServices] = useState<ServiceItem[]>(site?.services || []);
  const [prices, setPrices] = useState<PriceItem[]>(site?.prices || []);
  const [contacts, setContacts] = useState<ContactInfo | null>(site?.contacts || null);
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>(
    site?.socialLinks || []
  );
  const [banners, setBanners] = useState<BannerItem[]>(site?.banners || []);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(
    site?.testimonials || []
  );
  const [menu, setMenu] = useState<MenuItem[]>(site?.menu || []);
  const [seo, setSeo] = useState<SeoConfig | null>(site?.seo || null);
  const [theme, setTheme] = useState<ThemeConfig | null>(site?.theme || null);
  const [specialtiesInput, setSpecialtiesInput] = useState(
    (site?.config.aboutSpecialties || []).join(', ')
  );

  useEffect(() => {
    if (!site) return;
    setConfig(site.config);
    setSpecialtiesInput(site.config.aboutSpecialties.join(', '));
    setPortfolio(site.portfolio);
    setGallery(site.gallery);
    setServices(site.services);
    setPrices(site.prices);
    setContacts(site.contacts);
    setSocialLinks(site.socialLinks);
    setBanners(site.banners);
    setTestimonials(site.testimonials);
    setMenu(site.menu);
    setSeo(site.seo);
    setTheme(site.theme);
  }, [site]);

  useEffect(() => {
    apiClient
      .listFiles()
      .then((res) =>
        setDriveImages(res.files.filter((f) => f.mimeType.startsWith('image/')))
      )
      .catch(() => {});
  }, []);

  const saveAction = async (fn: () => Promise<void>, successText: string) => {
    setSaving(true);
    setFeedback(null);
    try {
      await fn();
      await refreshSite(true);
      setFeedback({ type: 'ok', text: successText });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Erro ao salvar alterações.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!config || !contacts || !seo || !theme) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-medium text-[#F5F3EF]">
          Gerenciamento de Conteúdo
        </h2>
        <p className="text-sm text-[#A19D95]">
          Edite textos, imagens, portfólio, serviços, preços, contatos, menus, SEO e aparência.
        </p>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {SUBSECTION_LABELS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setSection(tab.id);
              setFeedback(null);
            }}
            className={`px-3.5 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              section === tab.id
                ? 'bg-[#C9A45C] text-[#070709]'
                : 'bg-[#111115] text-[#A19D95] border border-white/10 hover:text-[#F5F3EF]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {feedback && (
        <div
          role="status"
          className={`p-3.5 rounded-md border text-xs ${
            feedback.type === 'ok'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-red-500/30 bg-red-500/10 text-red-200'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* 1. Geral: Início, Sobre & Rodapé */}
      {section === 'geral' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveAction(
              () =>
                apiClient.saveSection('config', {
                  ...config,
                  aboutSpecialties: specialtiesInput
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                }),
              'Página inicial, seção Sobre e rodapé salvos com sucesso.'
            );
          }}
          className="bg-[#111115] border border-white/10 rounded-lg p-6 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs text-[#A19D95]">Nome do Estúdio</label>
              <input
                type="text"
                value={config.studioName}
                onChange={(e) => setConfig({ ...config, studioName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs text-[#A19D95]">Subtítulo / Kicker Hero</label>
              <input
                type="text"
                value={config.tagline}
                onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs text-[#A19D95]">Título Principal (Hero)</label>
            <input
              type="text"
              value={config.heroTitle}
              onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs text-[#A19D95]">Frase de Apresentação</label>
            <textarea
              rows={2}
              value={config.heroSubtitle}
              onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs text-[#A19D95]">Botão Primário</label>
              <input
                type="text"
                value={config.heroCtaPrimary}
                onChange={(e) => setConfig({ ...config, heroCtaPrimary: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs text-[#A19D95]">Botão Secundário</label>
              <input
                type="text"
                value={config.heroCtaSecondary}
                onChange={(e) => setConfig({ ...config, heroCtaSecondary: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs text-[#A19D95]">Mídia do Hero (URL ou Drive)</label>
              <input
                type="text"
                value={config.heroMediaUrl}
                onChange={(e) => setConfig({ ...config, heroMediaUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF]"
              />
              {driveImages.length > 0 && (
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) setConfig({ ...config, heroMediaUrl: e.target.value });
                  }}
                  className="w-full px-3 py-1.5 rounded bg-[#070709] border border-white/10 text-xs text-[#A19D95]"
                >
                  <option value="">Escolher imagem da biblioteca...</option>
                  {driveImages.map((img) => (
                    <option key={img.id} value={img.publicUrl}>
                      {img.folderName} / {img.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-[#A19D95]">Imagem da Seção Sobre</label>
              <input
                type="text"
                value={config.aboutImageUrl}
                onChange={(e) => setConfig({ ...config, aboutImageUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF]"
              />
              {driveImages.length > 0 && (
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) setConfig({ ...config, aboutImageUrl: e.target.value });
                  }}
                  className="w-full px-3 py-1.5 rounded bg-[#070709] border border-white/10 text-xs text-[#A19D95]"
                >
                  <option value="">Escolher imagem da biblioteca...</option>
                  {driveImages.map((img) => (
                    <option key={img.id} value={img.publicUrl}>
                      {img.folderName} / {img.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-white/10">
            <label className="block text-xs text-[#A19D95]">Título da Seção Sobre</label>
            <input
              type="text"
              value={config.aboutTitle}
              onChange={(e) => setConfig({ ...config, aboutTitle: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs text-[#A19D95]">História do Tatuador</label>
            <textarea
              rows={4}
              value={config.aboutStory}
              onChange={(e) => setConfig({ ...config, aboutStory: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs text-[#A19D95]">Experiência & Protocolo</label>
            <textarea
              rows={3}
              value={config.aboutExperience}
              onChange={(e) => setConfig({ ...config, aboutExperience: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs text-[#A19D95]">
                Especialidades (separadas por vírgula)
              </label>
              <input
                type="text"
                value={specialtiesInput}
                onChange={(e) => setSpecialtiesInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs text-[#A19D95]">Texto do Rodapé</label>
              <input
                type="text"
                value={config.footerText}
                onChange={(e) => setConfig({ ...config, footerText: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#C9A45C] text-[#070709] text-xs font-semibold hover:bg-[#D9B771] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar Início, Sobre e Rodapé'}
          </button>
        </form>
      )}

      {/* 2. Portfólio */}
      {section === 'portfolio' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-[#A19D95]">
              Gerencie os projetos exibidos na página inicial e no portfólio.
            </p>
            <button
              type="button"
              onClick={() =>
                setPortfolio([
                  ...portfolio,
                  {
                    id: `port-${Date.now()}`,
                    title: 'Novo Trabalho',
                    category: 'Fine Line',
                    description: '',
                    imageUrl: driveImages[0]?.publicUrl || '',
                    featured: true,
                    isPlaceholder: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                ])
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-white/15 text-xs font-medium text-[#F5F3EF] hover:bg-white/5"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Trabalho
            </button>
          </div>

          {portfolio.map((item, idx) => (
            <div
              key={item.id}
              className="bg-[#111115] border border-white/10 rounded-lg p-5 space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => {
                    const next = [...portfolio];
                    next[idx] = { ...item, title: e.target.value };
                    setPortfolio(next);
                  }}
                  placeholder="Título"
                  className="px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
                />
                <input
                  type="text"
                  value={item.category}
                  onChange={(e) => {
                    const next = [...portfolio];
                    next[idx] = { ...item, category: e.target.value };
                    setPortfolio(next);
                  }}
                  placeholder="Categoria (ex.: Fine Line)"
                  className="px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
                />
                <input
                  type="text"
                  value={item.imageUrl}
                  onChange={(e) => {
                    const next = [...portfolio];
                    next[idx] = { ...item, imageUrl: e.target.value, isPlaceholder: false };
                    setPortfolio(next);
                  }}
                  placeholder="URL da imagem"
                  className="px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
                />
              </div>

              <textarea
                rows={2}
                value={item.description}
                onChange={(e) => {
                  const next = [...portfolio];
                  next[idx] = { ...item, description: e.target.value };
                  setPortfolio(next);
                }}
                placeholder="Descrição"
                className="w-full px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4 text-xs text-[#A19D95]">
                  <label className="inline-flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={item.featured}
                      onChange={(e) => {
                        const next = [...portfolio];
                        next[idx] = { ...item, featured: e.target.checked };
                        setPortfolio(next);
                      }}
                      className="accent-[#C9A45C]"
                    />
                    Destaque na Home
                  </label>
                  <label className="inline-flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={Boolean(item.isPlaceholder)}
                      onChange={(e) => {
                        const next = [...portfolio];
                        next[idx] = { ...item, isPlaceholder: e.target.checked };
                        setPortfolio(next);
                      }}
                      className="accent-[#C9A45C]"
                    />
                    Marcar como referência editorial
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setPortfolio(portfolio.filter((p) => p.id !== item.id))
                  }
                  className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remover
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            disabled={saving}
            onClick={() =>
              saveAction(
                () => apiClient.saveSection('portfolio', { items: portfolio }),
                'Portfólio atualizado com sucesso.'
              )
            }
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#C9A45C] text-[#070709] text-xs font-semibold hover:bg-[#D9B771]"
          >
            <Save className="w-4 h-4" />
            Salvar Portfólio
          </button>
        </div>
      )}

      {/* 3. Galeria */}
      {section === 'galeria' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-[#A19D95]">
              Gerencie as imagens complementares exibidas na galeria.
            </p>
            <button
              type="button"
              onClick={() =>
                setGallery([
                  ...gallery,
                  {
                    id: `gal-${Date.now()}`,
                    title: 'Nova Foto',
                    category: 'Estúdio',
                    imageUrl: driveImages[0]?.publicUrl || '',
                    caption: '',
                    order: gallery.length + 1,
                    isPlaceholder: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                ])
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-white/15 text-xs font-medium text-[#F5F3EF] hover:bg-white/5"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Imagem
            </button>
          </div>

          {gallery.map((item, idx) => (
            <div
              key={item.id}
              className="bg-[#111115] border border-white/10 rounded-lg p-5 space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => {
                    const next = [...gallery];
                    next[idx] = { ...item, title: e.target.value };
                    setGallery(next);
                  }}
                  placeholder="Título"
                  className="px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
                />
                <input
                  type="text"
                  value={item.category}
                  onChange={(e) => {
                    const next = [...gallery];
                    next[idx] = { ...item, category: e.target.value };
                    setGallery(next);
                  }}
                  placeholder="Categoria"
                  className="px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
                />
                <input
                  type="text"
                  value={item.imageUrl}
                  onChange={(e) => {
                    const next = [...gallery];
                    next[idx] = { ...item, imageUrl: e.target.value, isPlaceholder: false };
                    setGallery(next);
                  }}
                  placeholder="URL da imagem"
                  className="px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  value={item.caption}
                  onChange={(e) => {
                    const next = [...gallery];
                    next[idx] = { ...item, caption: e.target.value };
                    setGallery(next);
                  }}
                  placeholder="Legenda"
                  className="flex-1 px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
                />
                <button
                  type="button"
                  onClick={() => setGallery(gallery.filter((g) => g.id !== item.id))}
                  className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remover
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            disabled={saving}
            onClick={() =>
              saveAction(
                () => apiClient.saveSection('gallery', { items: gallery }),
                'Galeria salva com sucesso.'
              )
            }
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#C9A45C] text-[#070709] text-xs font-semibold hover:bg-[#D9B771]"
          >
            <Save className="w-4 h-4" />
            Salvar Galeria
          </button>
        </div>
      )}

      {/* 4. Serviços */}
      {section === 'servicos' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-[#A19D95]">
              Edite os serviços prestados pelo estúdio.
            </p>
            <button
              type="button"
              onClick={() =>
                setServices([
                  ...services,
                  {
                    id: `srv-${Date.now()}`,
                    title: 'Novo Serviço',
                    description: '',
                    imageUrl: driveImages[0]?.publicUrl || '',
                    sessionInfo: '',
                    order: services.length + 1,
                    active: true,
                    updatedAt: new Date().toISOString(),
                  },
                ])
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-white/15 text-xs font-medium text-[#F5F3EF]"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Serviço
            </button>
          </div>

          {services.map((srv, idx) => (
            <div
              key={srv.id}
              className="bg-[#111115] border border-white/10 rounded-lg p-5 space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={srv.title}
                  onChange={(e) => {
                    const next = [...services];
                    next[idx] = { ...srv, title: e.target.value };
                    setServices(next);
                  }}
                  placeholder="Título do serviço"
                  className="px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
                />
                <input
                  type="text"
                  value={srv.imageUrl}
                  onChange={(e) => {
                    const next = [...services];
                    next[idx] = { ...srv, imageUrl: e.target.value };
                    setServices(next);
                  }}
                  placeholder="URL da imagem"
                  className="px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
                />
              </div>
              <textarea
                rows={2}
                value={srv.description}
                onChange={(e) => {
                  const next = [...services];
                  next[idx] = { ...srv, description: e.target.value };
                  setServices(next);
                }}
                placeholder="Descrição do serviço"
                className="w-full px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
              />
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  value={srv.sessionInfo}
                  onChange={(e) => {
                    const next = [...services];
                    next[idx] = { ...srv, sessionInfo: e.target.value };
                    setServices(next);
                  }}
                  placeholder="Informação de atendimento"
                  className="flex-1 px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
                />
                <button
                  type="button"
                  onClick={() => setServices(services.filter((s) => s.id !== srv.id))}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            disabled={saving}
            onClick={() =>
              saveAction(
                () => apiClient.saveSection('services', { items: services }),
                'Serviços salvos com sucesso.'
              )
            }
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#C9A45C] text-[#070709] text-xs font-semibold"
          >
            <Save className="w-4 h-4" />
            Salvar Serviços
          </button>
        </div>
      )}

      {/* 5. Preços */}
      {section === 'precos' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-[#A19D95]">
              Configure faixas de orçamento (BRL) e observações de avaliação.
            </p>
            <button
              type="button"
              onClick={() =>
                setPrices([
                  ...prices,
                  {
                    id: `prc-${Date.now()}`,
                    title: 'Nova Categoria',
                    description: '',
                    estimateLabel: 'Sob avaliação',
                    notes: '',
                    order: prices.length + 1,
                    active: true,
                    updatedAt: new Date().toISOString(),
                  },
                ])
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-white/15 text-xs font-medium text-[#F5F3EF]"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Faixa
            </button>
          </div>

          {prices.map((prc, idx) => (
            <div
              key={prc.id}
              className="bg-[#111115] border border-white/10 rounded-lg p-5 space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={prc.title}
                  onChange={(e) => {
                    const next = [...prices];
                    next[idx] = { ...prc, title: e.target.value };
                    setPrices(next);
                  }}
                  placeholder="Nome da faixa"
                  className="px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
                />
                <input
                  type="text"
                  value={prc.estimateLabel}
                  onChange={(e) => {
                    const next = [...prices];
                    next[idx] = { ...prc, estimateLabel: e.target.value };
                    setPrices(next);
                  }}
                  placeholder="Ex.: A partir de R$ 400 ou Sob orçamento"
                  className="px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
                />
              </div>
              <textarea
                rows={2}
                value={prc.description}
                onChange={(e) => {
                  const next = [...prices];
                  next[idx] = { ...prc, description: e.target.value };
                  setPrices(next);
                }}
                placeholder="Descrição"
                className="w-full px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
              />
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  value={prc.notes}
                  onChange={(e) => {
                    const next = [...prices];
                    next[idx] = { ...prc, notes: e.target.value };
                    setPrices(next);
                  }}
                  placeholder="Observações"
                  className="flex-1 px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
                />
                <button
                  type="button"
                  onClick={() => setPrices(prices.filter((p) => p.id !== prc.id))}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            disabled={saving}
            onClick={() =>
              saveAction(
                () => apiClient.saveSection('prices', { items: prices }),
                'Tabela de valores salva com sucesso.'
              )
            }
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#C9A45C] text-[#070709] text-xs font-semibold"
          >
            <Save className="w-4 h-4" />
            Salvar Preços
          </button>
        </div>
      )}

      {/* 6. Contatos */}
      {section === 'contatos' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveAction(
              () => apiClient.saveSection('contacts', contacts),
              'Canais de contato atualizados com sucesso.'
            );
          }}
          className="bg-[#111115] border border-white/10 rounded-lg p-6 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs text-[#A19D95]">
                WhatsApp com DDI (ex.: 5582999999999)
              </label>
              <input
                type="text"
                value={contacts.whatsappNumber}
                onChange={(e) =>
                  setContacts({ ...contacts, whatsappNumber: e.target.value })
                }
                placeholder="Somente números com DDI"
                className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs text-[#A19D95]">Instagram (@usuario)</label>
              <input
                type="text"
                value={contacts.instagramHandle}
                onChange={(e) =>
                  setContacts({ ...contacts, instagramHandle: e.target.value })
                }
                placeholder="@luanherculestattoo"
                className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs text-[#A19D95]">E-mail público</label>
              <input
                type="email"
                value={contacts.email}
                onChange={(e) => setContacts({ ...contacts, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs text-[#A19D95]">Cidade / Estado</label>
              <input
                type="text"
                value={contacts.cityState}
                onChange={(e) => setContacts({ ...contacts, cityState: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs text-[#A19D95]">Endereço completo</label>
              <input
                type="text"
                value={contacts.address}
                onChange={(e) => setContacts({ ...contacts, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs text-[#A19D95]">Horário de Atendimento</label>
              <input
                type="text"
                value={contacts.businessHours}
                onChange={(e) =>
                  setContacts({ ...contacts, businessHours: e.target.value })
                }
                placeholder="Ex.: Seg a Sáb · 10h às 19h (com agendamento)"
                className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs text-[#A19D95]">
              Mensagem padrão de WhatsApp
            </label>
            <input
              type="text"
              value={contacts.whatsappMessage}
              onChange={(e) =>
                setContacts({ ...contacts, whatsappMessage: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs text-[#A19D95]">Aviso de Agendamento</label>
            <textarea
              rows={2}
              value={contacts.bookingNotice}
              onChange={(e) =>
                setContacts({ ...contacts, bookingNotice: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF]"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#C9A45C] text-[#070709] text-xs font-semibold"
          >
            <Save className="w-4 h-4" />
            Salvar Contatos
          </button>
        </form>
      )}

      {/* 7. Redes Sociais */}
      {section === 'redes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-[#A19D95]">
              Cadastre links oficiais de Instagram, WhatsApp, TikTok, Facebook ou YouTube.
            </p>
            <button
              type="button"
              onClick={() =>
                setSocialLinks([
                  ...socialLinks,
                  {
                    id: `soc-${Date.now()}`,
                    platform: 'Instagram',
                    label: 'Instagram',
                    url: '',
                    active: true,
                    order: socialLinks.length + 1,
                    updatedAt: new Date().toISOString(),
                  },
                ])
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-white/15 text-xs font-medium text-[#F5F3EF]"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Rede Social
            </button>
          </div>

          {socialLinks.map((soc, idx) => (
            <div
              key={soc.id}
              className="bg-[#111115] border border-white/10 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center"
            >
              <select
                value={soc.platform}
                onChange={(e) => {
                  const next = [...socialLinks];
                  next[idx] = {
                    ...soc,
                    platform: e.target.value as SocialLinkItem['platform'],
                  };
                  setSocialLinks(next);
                }}
                className="px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
              >
                <option value="Instagram">Instagram</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="TikTok">TikTok</option>
                <option value="Facebook">Facebook</option>
                <option value="YouTube">YouTube</option>
                <option value="Outro">Outro</option>
              </select>
              <input
                type="text"
                value={soc.label}
                onChange={(e) => {
                  const next = [...socialLinks];
                  next[idx] = { ...soc, label: e.target.value };
                  setSocialLinks(next);
                }}
                placeholder="Rótulo"
                className="px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
              />
              <input
                type="url"
                value={soc.url}
                onChange={(e) => {
                  const next = [...socialLinks];
                  next[idx] = { ...soc, url: e.target.value };
                  setSocialLinks(next);
                }}
                placeholder="https://..."
                className="px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
              />
              <div className="flex items-center justify-between gap-2">
                <label className="inline-flex items-center gap-1.5 text-xs text-[#A19D95]">
                  <input
                    type="checkbox"
                    checked={soc.active}
                    onChange={(e) => {
                      const next = [...socialLinks];
                      next[idx] = { ...soc, active: e.target.checked };
                      setSocialLinks(next);
                    }}
                    className="accent-[#C9A45C]"
                  />
                  Ativo
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setSocialLinks(socialLinks.filter((s) => s.id !== soc.id))
                  }
                  className="text-xs text-red-400"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            disabled={saving}
            onClick={() =>
              saveAction(
                () => apiClient.saveSection('social', { items: socialLinks }),
                'Redes sociais salvas com sucesso.'
              )
            }
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#C9A45C] text-[#070709] text-xs font-semibold"
          >
            <Save className="w-4 h-4" />
            Salvar Redes Sociais
          </button>
        </div>
      )}

      {/* 8. Banners */}
      {section === 'banners' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-[#A19D95]">
              Gerencie os banners visuais associados às seções do site.
            </p>
            <button
              type="button"
              onClick={() =>
                setBanners([
                  ...banners,
                  {
                    id: `ban-${Date.now()}`,
                    title: 'Novo Banner',
                    subtitle: '',
                    imageUrl: driveImages[0]?.publicUrl || '',
                    linkUrl: '/contato',
                    active: true,
                    placement: 'hero',
                    updatedAt: new Date().toISOString(),
                  },
                ])
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-white/15 text-xs font-medium text-[#F5F3EF]"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Banner
            </button>
          </div>
          {banners.map((ban, idx) => (
            <div
              key={ban.id}
              className="bg-[#111115] border border-white/10 rounded-lg p-4 space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={ban.title}
                  onChange={(e) => {
                    const next = [...banners];
                    next[idx] = { ...ban, title: e.target.value };
                    setBanners(next);
                  }}
                  placeholder="Título"
                  className="px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
                />
                <input
                  type="text"
                  value={ban.imageUrl}
                  onChange={(e) => {
                    const next = [...banners];
                    next[idx] = { ...ban, imageUrl: e.target.value };
                    setBanners(next);
                  }}
                  placeholder="URL da imagem"
                  className="px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
                />
                <select
                  value={ban.placement}
                  onChange={(e) => {
                    const next = [...banners];
                    next[idx] = {
                      ...ban,
                      placement: e.target.value as BannerItem['placement'],
                    };
                    setBanners(next);
                  }}
                  className="px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
                >
                  <option value="hero">Hero</option>
                  <option value="sobre">Sobre</option>
                  <option value="portfolio">Portfólio</option>
                  <option value="contato">Contato</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-xs text-[#A19D95]">
                  <input
                    type="checkbox"
                    checked={ban.active}
                    onChange={(e) => {
                      const next = [...banners];
                      next[idx] = { ...ban, active: e.target.checked };
                      setBanners(next);
                    }}
                    className="accent-[#C9A45C]"
                  />
                  Banner ativo
                </label>
                <button
                  type="button"
                  onClick={() => setBanners(banners.filter((b) => b.id !== ban.id))}
                  className="text-xs text-red-400"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            disabled={saving}
            onClick={() =>
              saveAction(
                () => apiClient.saveSection('banners', { items: banners }),
                'Banners salvos com sucesso.'
              )
            }
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#C9A45C] text-[#070709] text-xs font-semibold"
          >
            <Save className="w-4 h-4" />
            Salvar Banners
          </button>
        </div>
      )}

      {/* 9. Depoimentos */}
      {section === 'depoimentos' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-[#A19D95]">
              Cadastre apenas relatos reais de clientes atendidos no estúdio.
            </p>
            <button
              type="button"
              onClick={() =>
                setTestimonials([
                  ...testimonials,
                  {
                    id: `dep-${Date.now()}`,
                    clientName: '',
                    projectLabel: '',
                    quote: '',
                    published: true,
                    createdAt: new Date().toISOString(),
                  },
                ])
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-white/15 text-xs font-medium text-[#F5F3EF]"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Depoimento
            </button>
          </div>

          {testimonials.length === 0 ? (
            <div className="bg-[#111115] border border-white/10 rounded-lg p-6 text-xs text-[#A19D95]">
              Nenhum depoimento cadastrado. A seção permanece oculta no site público até você publicar o primeiro relato real.
            </div>
          ) : (
            testimonials.map((dep, idx) => (
              <div
                key={dep.id}
                className="bg-[#111115] border border-white/10 rounded-lg p-4 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={dep.clientName}
                    onChange={(e) => {
                      const next = [...testimonials];
                      next[idx] = { ...dep, clientName: e.target.value };
                      setTestimonials(next);
                    }}
                    placeholder="Nome do cliente"
                    className="px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
                  />
                  <input
                    type="text"
                    value={dep.projectLabel}
                    onChange={(e) => {
                      const next = [...testimonials];
                      next[idx] = { ...dep, projectLabel: e.target.value };
                      setTestimonials(next);
                    }}
                    placeholder="Trabalho realizado (ex.: Fine Line no antebraço)"
                    className="px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
                  />
                </div>
                <textarea
                  rows={2}
                  value={dep.quote}
                  onChange={(e) => {
                    const next = [...testimonials];
                    next[idx] = { ...dep, quote: e.target.value };
                    setTestimonials(next);
                  }}
                  placeholder="Depoimento real"
                  className="w-full px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
                />
                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-2 text-xs text-[#A19D95]">
                    <input
                      type="checkbox"
                      checked={dep.published}
                      onChange={(e) => {
                        const next = [...testimonials];
                        next[idx] = { ...dep, published: e.target.checked };
                        setTestimonials(next);
                      }}
                      className="accent-[#C9A45C]"
                    />
                    Publicado no site
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setTestimonials(testimonials.filter((t) => t.id !== dep.id))
                    }
                    className="text-xs text-red-400"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))
          )}

          <button
            type="button"
            disabled={saving}
            onClick={() =>
              saveAction(
                () => apiClient.saveSection('testimonials', { items: testimonials }),
                'Depoimentos salvos com sucesso.'
              )
            }
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#C9A45C] text-[#070709] text-xs font-semibold"
          >
            <Save className="w-4 h-4" />
            Salvar Depoimentos
          </button>
        </div>
      )}

      {/* 10. Menus, SEO & Tema */}
      {section === 'menu_seo_tema' && (
        <div className="space-y-6">
          <div className="bg-[#111115] border border-white/10 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-semibold text-[#F5F3EF]">Itens do Menu Superior</h3>
            <div className="space-y-2">
              {menu.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => {
                      const next = [...menu];
                      next[idx] = { ...item, label: e.target.value };
                      setMenu(next);
                    }}
                    className="px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
                  />
                  <input
                    type="text"
                    value={item.path}
                    onChange={(e) => {
                      const next = [...menu];
                      next[idx] = { ...item, path: e.target.value };
                      setMenu(next);
                    }}
                    className="px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#A19D95] font-mono-tabular"
                  />
                  <label className="inline-flex items-center gap-2 text-xs text-[#A19D95]">
                    <input
                      type="checkbox"
                      checked={item.visible}
                      onChange={(e) => {
                        const next = [...menu];
                        next[idx] = { ...item, visible: e.target.checked };
                        setMenu(next);
                      }}
                      className="accent-[#C9A45C]"
                    />
                    Visível no menu
                  </label>
                </div>
              ))}
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                saveAction(
                  () => apiClient.saveSection('menu', { items: menu }),
                  'Menu atualizado com sucesso.'
                )
              }
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#C9A45C] text-[#070709] text-xs font-semibold"
            >
              <Save className="w-4 h-4" />
              Salvar Menu
            </button>
          </div>

          <div className="bg-[#111115] border border-white/10 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-semibold text-[#F5F3EF]">SEO & Open Graph</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-[#A19D95]">Título SEO (title)</label>
                <input
                  type="text"
                  value={seo.siteTitle}
                  onChange={(e) => setSeo({ ...seo, siteTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[#A19D95]">Domínio Canônico</label>
                <input
                  type="url"
                  value={seo.canonicalDomain}
                  onChange={(e) => setSeo({ ...seo, canonicalDomain: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#A19D95]">Meta Description</label>
              <textarea
                rows={2}
                value={seo.metaDescription}
                onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                className="w-full px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#A19D95]">Palavras-chave</label>
              <input
                type="text"
                value={seo.keywords}
                onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                className="w-full px-3 py-2 rounded bg-[#070709] border border-white/15 text-xs text-[#F5F3EF]"
              />
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                saveAction(
                  () => apiClient.saveSection('seo', seo),
                  'Configurações de SEO salvas.'
                )
              }
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#C9A45C] text-[#070709] text-xs font-semibold"
            >
              <Save className="w-4 h-4" />
              Salvar SEO
            </button>
          </div>

          <div className="bg-[#111115] border border-white/10 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-semibold text-[#F5F3EF]">Cores do Tema</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="block text-xs text-[#A19D95]">Fundo Principal</label>
                <input
                  type="color"
                  value={theme.backgroundColor}
                  onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                  className="w-full h-10 rounded bg-transparent cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-[#A19D95]">Superfície Cards</label>
                <input
                  type="color"
                  value={theme.surfaceColor}
                  onChange={(e) => setTheme({ ...theme, surfaceColor: e.target.value })}
                  className="w-full h-10 rounded bg-transparent cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-[#A19D95]">Texto Principal</label>
                <input
                  type="color"
                  value={theme.textColor}
                  onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
                  className="w-full h-10 rounded bg-transparent cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-[#A19D95]">Destaque (Dourado)</label>
                <input
                  type="color"
                  value={theme.accentColor}
                  onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                  className="w-full h-10 rounded bg-transparent cursor-pointer"
                />
              </div>
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                saveAction(
                  () => apiClient.saveSection('theme', theme),
                  'Tema salvo com sucesso.'
                )
              }
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#C9A45C] text-[#070709] text-xs font-semibold"
            >
              <Save className="w-4 h-4" />
              Salvar Tema
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
