import { useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { AppLink } from '../contexts/RouterContext';
import { useSite } from '../contexts/SiteContext';
import { StudioImage } from '../components/StudioImage';
import { LightboxModal } from '../components/LightboxModal';
import type { PortfolioItem } from '../types/studio';

export function HomePage() {
  const { site, loading } = useSite();
  const [selectedWork, setSelectedWork] = useState<PortfolioItem | null>(null);

  if (loading || !site) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-24 space-y-8">
        <div className="h-12 w-2/3 bg-white/5 rounded animate-pulse" />
        <div className="h-96 w-full bg-white/5 rounded-lg animate-pulse" />
      </div>
    );
  }

  const { config, portfolio, services, testimonials, contacts, socialLinks } = site;
  const featuredWorks = portfolio.filter((p) => p.featured).slice(0, 3);
  const activeServices = services.filter((s) => s.active).slice(0, 3);
  const publishedTestimonials = testimonials.filter((t) => t.published);
  const activeSocials = socialLinks.filter((s) => s.active && s.url);

  const cleanWhatsappDigits = contacts.whatsappNumber.replace(/\D/g, '');
  const whatsappUrl = cleanWhatsappDigits
    ? `https://wa.me/${cleanWhatsappDigits}?text=${encodeURIComponent(
        contacts.whatsappMessage || 'Olá, gostaria de agendar uma tatuagem.'
      )}`
    : null;

  return (
    <div>
      {/* 1. Split Hero — Left Typographic Hierarchy / Right Studio Atmosphere */}
      <section className="border-b border-white/10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 flex flex-col justify-between space-y-8"
            >
              <div className="space-y-6">
                <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#C9A45C]">
                  {config.tagline}
                </p>
                <h1
                  className="font-display text-4xl sm:text-5xl lg:text-[3.75rem] font-medium leading-[1.06] tracking-tight text-[#F5F3EF]"
                  style={{ textWrap: 'balance' }}
                >
                  {config.heroTitle}
                </h1>
                <p className="text-base sm:text-lg text-[#A19D95] leading-relaxed max-w-xl">
                  {config.heroSubtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <AppLink
                  to="/contato"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md bg-[#C9A45C] text-[#070709] text-sm font-semibold hover:bg-[#D9B771] transition-colors whitespace-nowrap"
                >
                  {config.heroCtaPrimary}
                  <ArrowRight className="w-4 h-4" />
                </AppLink>
                <AppLink
                  to="/portfolio"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md border border-white/15 text-[#F5F3EF] text-sm font-medium hover:bg-white/5 transition-colors whitespace-nowrap"
                >
                  {config.heroCtaSecondary}
                </AppLink>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6"
            >
              <div className="relative h-80 sm:h-[420px] lg:h-full lg:min-h-[480px] rounded-lg overflow-hidden border border-white/10 bg-[#111115]">
                {config.heroMediaType === 'video' && config.heroMediaUrl ? (
                  <video
                    src={config.heroMediaUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <StudioImage
                    src={config.heroMediaUrl}
                    alt={config.studioName}
                    eager
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />
                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-xs text-[#F5F3EF]/90">
                  <span>{config.studioName}</span>
                  <span>Atendimento privado com hora marcada</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Full-width Studio Pillars Row */}
          <div className="mt-14 pt-10 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-1.5">
              <p className="text-xs text-[#C9A45C]">01. Direção Artística</p>
              <p className="text-sm font-medium text-[#F5F3EF]">Desenho Sob Medida</p>
              <p className="text-xs text-[#A19D95] leading-relaxed">
                Cada composição é projetada para respeitar linhas anatômicas e leitura no tempo.
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-[#C9A45C]">02. Biossegurança</p>
              <p className="text-sm font-medium text-[#F5F3EF]">Protocolo Rigoroso</p>
              <p className="text-xs text-[#A19D95] leading-relaxed">
                Materiais descartáveis certificados, bancada esterilizada e ambiente controlado.
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-[#C9A45C]">03. Experiência</p>
              <p className="text-sm font-medium text-[#F5F3EF]">Sessão Privada</p>
              <p className="text-xs text-[#A19D95] leading-relaxed">
                Horários reservados sem fluxo simultâneo para foco total durante a execução.
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-[#C9A45C]">04. Pós-Procedimento</p>
              <p className="text-sm font-medium text-[#F5F3EF]">Acompanhamento</p>
              <p className="text-xs text-[#A19D95] leading-relaxed">
                Orientações detalhadas de cicatrização e revisão após a recuperação completa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Portfolio */}
      <section className="border-b border-white/10 bg-[#0A0A0E]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-16 sm:py-24 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#C9A45C]">
                Seleção do Estúdio
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-medium text-[#F5F3EF]">
                Trabalhos em Destaque
              </h2>
            </div>
            <AppLink
              to="/portfolio"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#C9A45C] hover:text-[#D9B771] transition-colors whitespace-nowrap"
            >
              Ver portfólio completo
              <ArrowUpRight className="w-4 h-4" />
            </AppLink>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredWorks.map((work) => (
              <article
                key={work.id}
                className="group bg-[#111115] border border-white/10 rounded-lg overflow-hidden flex flex-col"
              >
                <button
                  type="button"
                  onClick={() => setSelectedWork(work)}
                  className="relative aspect-[4/5] w-full overflow-hidden bg-[#070709] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C]"
                >
                  <StudioImage
                    src={work.imageUrl}
                    alt={work.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                </button>
                <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-[#A19D95]">
                      <span className="text-[#C9A45C]">{work.category}</span>
                      {work.isPlaceholder && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Referência editorial</span>
                        </>
                      )}
                    </div>
                    <h3 className="font-display text-xl font-medium text-[#F5F3EF]">
                      {work.title}
                    </h3>
                    <p className="text-xs text-[#A19D95] leading-relaxed line-clamp-2">
                      {work.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. About Preview */}
      <section className="border-b border-white/10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <div className="aspect-[3/4] rounded-lg overflow-hidden border border-white/10 bg-[#111115]">
                <StudioImage
                  src={config.aboutImageUrl}
                  alt="Mesa de criação de Luan Hércules Tattoo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="lg:col-span-7 space-y-6">
              <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#C9A45C]">
                Sobre o Artista
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl font-medium text-[#F5F3EF] leading-tight"
                style={{ textWrap: 'balance' }}
              >
                {config.aboutTitle}
              </h2>
              <p className="text-base text-[#A19D95] leading-relaxed">
                {config.aboutStory}
              </p>
              {config.aboutSpecialties.length > 0 && (
                <div className="pt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#F5F3EF]">
                  <span className="text-[#A19D95]">Especialidades:</span>
                  {config.aboutSpecialties.map((spec, idx) => (
                    <span key={spec} className="inline-flex items-center gap-3">
                      {idx > 0 && (
                        <span aria-hidden="true" className="text-[#C9A45C]">
                          ·
                        </span>
                      )}
                      <span>{spec}</span>
                    </span>
                  ))}
                </div>
              )}
              <div className="pt-2">
                <AppLink
                  to="/sobre"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#C9A45C] hover:text-[#D9B771] transition-colors"
                >
                  Conhecer a história completa
                  <ArrowRight className="w-4 h-4" />
                </AppLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Services */}
      <section className="border-b border-white/10 bg-[#0A0A0E]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-16 sm:py-24 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#C9A45C]">
                Modalidades de Atendimento
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-medium text-[#F5F3EF]">
                Serviços do Estúdio
              </h2>
            </div>
            <AppLink
              to="/servicos"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#C9A45C] hover:text-[#D9B771] transition-colors whitespace-nowrap"
            >
              Detalhes e valores
              <ArrowUpRight className="w-4 h-4" />
            </AppLink>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {activeServices.map((srv, index) => (
              <div
                key={srv.id}
                className="bg-[#111115] border border-white/10 rounded-lg p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <p className="font-mono-tabular text-xs text-[#C9A45C]">
                    0{index + 1}.
                  </p>
                  <h3 className="font-display text-2xl font-medium text-[#F5F3EF]">
                    {srv.title}
                  </h3>
                  <p className="text-sm text-[#A19D95] leading-relaxed">
                    {srv.description}
                  </p>
                </div>
                {srv.sessionInfo && (
                  <p className="pt-4 border-t border-white/10 text-xs text-[#A19D95]">
                    {srv.sessionInfo}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Testimonials (only when real entries exist — never fabricated) */}
      {publishedTestimonials.length > 0 && (
        <section className="border-b border-white/10">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-16 sm:py-24 space-y-10">
            <div className="space-y-2">
              <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#C9A45C]">
                Experiências Reais
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-medium text-[#F5F3EF]">
                Depoimentos de Clientes
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {publishedTestimonials.map((item) => (
                <blockquote
                  key={item.id}
                  className="bg-[#111115] border border-white/10 rounded-lg p-6 space-y-4 flex flex-col justify-between"
                >
                  <p className="text-sm text-[#F5F3EF]/90 leading-relaxed">
                    “{item.quote}”
                  </p>
                  <footer className="pt-3 border-t border-white/10 text-xs text-[#A19D95]">
                    <span className="font-medium text-[#F5F3EF]">{item.clientName}</span>
                    {item.projectLabel && (
                      <>
                        <span aria-hidden="true"> · </span>
                        <span>{item.projectLabel}</span>
                      </>
                    )}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Contact & Booking CTA */}
      <section>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-16 sm:py-24">
          <div className="bg-[#111115] border border-white/10 rounded-lg p-8 sm:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#C9A45C]">
                Agenda & Orçamento
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl font-medium text-[#F5F3EF]"
                style={{ textWrap: 'balance' }}
              >
                Pronto para tirar sua próxima ideia do papel?
              </h2>
              <p className="text-sm sm:text-base text-[#A19D95] leading-relaxed">
                {contacts.bookingNotice}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 shrink-0">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md bg-[#C9A45C] text-[#070709] text-sm font-semibold hover:bg-[#D9B771] transition-colors whitespace-nowrap"
                >
                  Chamar no WhatsApp
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              )}
              <AppLink
                to="/contato"
                className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-md text-sm font-semibold transition-colors whitespace-nowrap ${
                  whatsappUrl
                    ? 'border border-white/15 text-[#F5F3EF] hover:bg-white/5'
                    : 'bg-[#C9A45C] text-[#070709] hover:bg-[#D9B771]'
                }`}
              >
                Enviar projeto
                <ArrowRight className="w-4 h-4" />
              </AppLink>
            </div>
          </div>
          {activeSocials.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[#A19D95]">
              <span>Acompanhe também:</span>
              {activeSocials.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F5F3EF] hover:text-[#C9A45C] transition-colors"
                >
                  {s.label || s.platform}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <LightboxModal
        open={Boolean(selectedWork)}
        imageUrl={selectedWork?.imageUrl || ''}
        title={selectedWork?.title || ''}
        category={selectedWork?.category}
        description={selectedWork?.description}
        isPlaceholder={selectedWork?.isPlaceholder}
        onClose={() => setSelectedWork(null)}
      />
    </div>
  );
}
