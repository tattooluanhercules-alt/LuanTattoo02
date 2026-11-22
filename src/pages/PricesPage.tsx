import { ArrowRight, Info } from 'lucide-react';
import { AppLink } from '../contexts/RouterContext';
import { useSite } from '../contexts/SiteContext';

export function PricesPage() {
  const { site, loading } = useSite();

  if (loading || !site) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-20">
        <div className="h-64 bg-white/5 rounded-lg animate-pulse" />
      </div>
    );
  }

  const activePrices = site.prices
    .filter((p) => p.active)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-14 sm:py-20 space-y-12">
      <header className="max-w-3xl space-y-4">
        <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#C9A45C]">
          Orçamentos & Referências (BRL)
        </p>
        <h1
          className="font-display text-4xl sm:text-5xl font-medium text-[#F5F3EF]"
          style={{ textWrap: 'balance' }}
        >
          Critérios de Investimento
        </h1>
        <p className="text-base text-[#A19D95] leading-relaxed">
          Trabalhamos com orçamento individualizado para refletir com justiça o tempo de
          criação e execução exigido por cada projeto.
        </p>
      </header>

      <div className="bg-[#111115] border border-[#C9A45C]/30 rounded-lg p-5 sm:p-6 flex items-start gap-3.5">
        <Info className="w-5 h-5 text-[#C9A45C] shrink-0 mt-0.5" />
        <p className="text-sm text-[#F5F3EF]/90 leading-relaxed">
          {site.priceDisclaimer}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {activePrices.map((tier) => (
          <div
            key={tier.id}
            className="bg-[#111115] border border-white/10 rounded-lg p-7 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <h2 className="font-display text-2xl font-medium text-[#F5F3EF]">
                {tier.title}
              </h2>
              <p className="text-sm font-semibold text-[#C9A45C] tabular-nums">
                {tier.estimateLabel}
              </p>
              <p className="text-sm text-[#A19D95] leading-relaxed">
                {tier.description}
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 space-y-4">
              {tier.notes && (
                <p className="text-xs text-[#A19D95] leading-relaxed">{tier.notes}</p>
              )}
              <AppLink
                to="/contato"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#F5F3EF] hover:text-[#C9A45C] transition-colors"
              >
                Solicitar orçamento desta faixa
                <ArrowRight className="w-3.5 h-3.5" />
              </AppLink>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
