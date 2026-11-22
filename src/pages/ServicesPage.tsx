import { ArrowRight } from 'lucide-react';
import { AppLink } from '../contexts/RouterContext';
import { useSite } from '../contexts/SiteContext';
import { StudioImage } from '../components/StudioImage';

export function ServicesPage() {
  const { site, loading } = useSite();

  if (loading || !site) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-20">
        <div className="h-64 bg-white/5 rounded-lg animate-pulse" />
      </div>
    );
  }

  const activeServices = site.services
    .filter((s) => s.active)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-14 sm:py-20 space-y-14">
      <header className="max-w-3xl space-y-4">
        <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#C9A45C]">
          Especialidades & Processo
        </p>
        <h1
          className="font-display text-4xl sm:text-5xl font-medium text-[#F5F3EF]"
          style={{ textWrap: 'balance' }}
        >
          Serviços de Tatuagem Autoral
        </h1>
        <p className="text-base text-[#A19D95] leading-relaxed">
          Cada atendimento é estruturado para oferecer clareza técnica, segurança sanitária
          e resultado duradouro na pele.
        </p>
      </header>

      <div className="space-y-10">
        {activeServices.map((srv, idx) => (
          <article
            key={srv.id}
            className="grid grid-cols-1 lg:grid-cols-12 bg-[#111115] border border-white/10 rounded-lg overflow-hidden"
          >
            <div className="lg:col-span-5 aspect-[4/3] lg:aspect-auto bg-[#070709]">
              <StudioImage
                src={srv.imageUrl}
                alt={srv.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <p className="font-mono-tabular text-xs text-[#C9A45C]">
                  0{idx + 1}. Modalidade
                </p>
                <h2 className="font-display text-3xl font-medium text-[#F5F3EF]">
                  {srv.title}
                </h2>
                <p className="text-base text-[#A19D95] leading-relaxed">
                  {srv.description}
                </p>
              </div>
              <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="text-xs text-[#A19D95]">{srv.sessionInfo}</span>
                <AppLink
                  to="/contato"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#C9A45C] hover:text-[#D9B771] transition-colors whitespace-nowrap"
                >
                  Consultar disponibilidade
                  <ArrowRight className="w-4 h-4" />
                </AppLink>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
