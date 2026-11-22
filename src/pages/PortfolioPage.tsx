import { useMemo, useState } from 'react';
import { Expand } from 'lucide-react';
import { useSite } from '../contexts/SiteContext';
import { StudioImage } from '../components/StudioImage';
import { LightboxModal } from '../components/LightboxModal';

interface UnifiedVisualItem {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  isPlaceholder?: boolean;
}

export function PortfolioPage() {
  const { site, loading } = useSite();
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [visibleCount, setVisibleCount] = useState(9);
  const [selectedItem, setSelectedItem] = useState<UnifiedVisualItem | null>(null);

  const items = useMemo<UnifiedVisualItem[]>(() => {
    if (!site) return [];
    const portfolioItems: UnifiedVisualItem[] = site.portfolio.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      description: p.description,
      imageUrl: p.imageUrl,
      isPlaceholder: p.isPlaceholder,
    }));
    const galleryItems: UnifiedVisualItem[] = site.gallery.map((g) => ({
      id: g.id,
      title: g.title,
      category: g.category,
      description: g.caption,
      imageUrl: g.imageUrl,
      isPlaceholder: g.isPlaceholder,
    }));
    return [...portfolioItems, ...galleryItems];
  }, [site]);

  const categories = useMemo(() => {
    const set = new Set<string>(['Todas']);
    items.forEach((it) => {
      if (it.category) set.add(it.category);
    });
    return Array.from(set);
  }, [items]);

  const filtered = useMemo(() => {
    if (activeCategory === 'Todas') return items;
    return items.filter((it) => it.category === activeCategory);
  }, [items, activeCategory]);

  const visibleItems = filtered.slice(0, visibleCount);

  if (loading || !site) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="aspect-[4/5] bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-14 sm:py-20 space-y-12">
      <header className="max-w-3xl space-y-4">
        <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#C9A45C]">
          Portfólio & Galeria
        </p>
        <h1
          className="font-display text-4xl sm:text-5xl font-medium text-[#F5F3EF]"
          style={{ textWrap: 'balance' }}
        >
          Obras, Estudos e Composições
        </h1>
        <p className="text-base text-[#A19D95] leading-relaxed">
          Explore trabalhos selecionados e estudos do estúdio. Clique em qualquer peça para
          visualizar em alta resolução.
        </p>
      </header>

      {/* Interactive Category Filters */}
      <div
        role="tablist"
        aria-label="Filtrar por categoria"
        className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-6"
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setActiveCategory(cat);
                setVisibleCount(9);
              }}
              className={`px-4 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#C9A45C] text-[#070709]'
                  : 'bg-[#111115] text-[#A19D95] border border-white/10 hover:text-[#F5F3EF]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#111115] border border-white/10 rounded-lg p-12 text-center space-y-2">
          <p className="font-display text-2xl text-[#F5F3EF]">
            Nenhum item nesta categoria
          </p>
          <p className="text-sm text-[#A19D95]">
            Cadastre novos trabalhos pelo painel administrativo em /admin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleItems.map((item) => (
            <article
              key={item.id}
              className="group bg-[#111115] border border-white/10 rounded-lg overflow-hidden flex flex-col"
            >
              <button
                type="button"
                onClick={() => setSelectedItem(item)}
                className="relative aspect-[4/5] w-full overflow-hidden bg-[#070709] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C]"
              >
                <StudioImage
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <span className="absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded bg-black/70 text-[#F5F3EF] opacity-0 group-hover:opacity-100 transition-opacity">
                  <Expand className="w-4 h-4" />
                </span>
              </button>
              <div className="p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#A19D95]">
                  <span className="text-[#C9A45C]">{item.category}</span>
                  {item.isPlaceholder && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>Referência editorial</span>
                    </>
                  )}
                </div>
                <h2 className="font-display text-xl font-medium text-[#F5F3EF]">
                  {item.title}
                </h2>
                {item.description && (
                  <p className="text-xs text-[#A19D95] leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {visibleCount < filtered.length && (
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 6)}
            className="px-6 py-3 rounded-md border border-white/15 text-sm font-medium text-[#F5F3EF] hover:bg-white/5 transition-colors"
          >
            Carregar mais trabalhos
          </button>
        </div>
      )}

      <LightboxModal
        open={Boolean(selectedItem)}
        imageUrl={selectedItem?.imageUrl || ''}
        title={selectedItem?.title || ''}
        category={selectedItem?.category}
        description={selectedItem?.description}
        isPlaceholder={selectedItem?.isPlaceholder}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
