import { ArrowRight } from 'lucide-react';
import { AppLink } from '../contexts/RouterContext';
import { useSite } from '../contexts/SiteContext';
import { StudioImage } from '../components/StudioImage';

export function AboutPage() {
  const { site, loading } = useSite();

  if (loading || !site) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-20">
        <div className="h-64 bg-white/5 rounded-lg animate-pulse" />
      </div>
    );
  }

  const { config, gallery } = site;
  const studioPhotos = gallery.slice(0, 2);

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-14 sm:py-20 space-y-16">
      <header className="max-w-3xl space-y-4">
        <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#C9A45C]">
          Trajetória & Estúdio
        </p>
        <h1
          className="font-display text-4xl sm:text-5xl font-medium text-[#F5F3EF] leading-tight"
          style={{ textWrap: 'balance' }}
        >
          {config.aboutTitle}
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5">
          <div className="aspect-[3/4] rounded-lg overflow-hidden border border-white/10 bg-[#111115]">
            <StudioImage
              src={config.aboutImageUrl}
              alt="Ateliê Luan Hércules Tattoo"
              eager
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-medium text-[#F5F3EF]">
              História e Método Criativo
            </h2>
            <p className="text-base text-[#A19D95] leading-relaxed whitespace-pre-line">
              {config.aboutStory}
            </p>
          </div>

          <div className="pt-6 border-t border-white/10 space-y-4">
            <h2 className="font-display text-2xl font-medium text-[#F5F3EF]">
              Experiência e Protocolo de Estúdio
            </h2>
            <p className="text-base text-[#A19D95] leading-relaxed whitespace-pre-line">
              {config.aboutExperience}
            </p>
          </div>

          {config.aboutSpecialties.length > 0 && (
            <div className="pt-6 border-t border-white/10 space-y-3">
              <h2 className="font-display text-2xl font-medium text-[#F5F3EF]">
                Especialidades
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#F5F3EF]">
                {config.aboutSpecialties.map((spec, idx) => (
                  <span key={spec} className="inline-flex items-center gap-4">
                    {idx > 0 && (
                      <span aria-hidden="true" className="text-[#C9A45C]">
                        ·
                      </span>
                    )}
                    <span>{spec}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4">
            <AppLink
              to="/contato"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#C9A45C] text-[#070709] text-sm font-semibold hover:bg-[#D9B771] transition-colors"
            >
              Agendar avaliação
              <ArrowRight className="w-4 h-4" />
            </AppLink>
          </div>
        </div>
      </div>

      {studioPhotos.length > 0 && (
        <section className="pt-12 border-t border-white/10 space-y-6">
          <h2 className="font-display text-2xl font-medium text-[#F5F3EF]">
            Registros do Estúdio
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {studioPhotos.map((photo) => (
              <figure
                key={photo.id}
                className="bg-[#111115] border border-white/10 rounded-lg overflow-hidden"
              >
                <div className="aspect-[16/10] overflow-hidden bg-[#070709]">
                  <StudioImage
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <figcaption className="p-4 text-xs text-[#A19D95]">
                  <span className="text-[#F5F3EF] font-medium">{photo.title}</span>
                  {photo.caption && <span> · {photo.caption}</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
