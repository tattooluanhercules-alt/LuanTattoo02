import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AppLink, useRouter } from '../contexts/RouterContext';
import { useSite } from '../contexts/SiteContext';
import { AmbientMusicPlayer } from '../components/AmbientMusicPlayer';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { site } = useSite();
  const { currentPath } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const visibleMenu = (site?.menu || [])
    .filter((item) => item.visible && item.path !== '/contato')
    .sort((a, b) => a.order - b.order)
    .slice(0, 5);

  const activeSocials = (site?.socialLinks || [])
    .filter((s) => s.active && s.url)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-[#F5F3EF]">
      {/* Header — Strict 3-zone contract */}
      <header className="sticky top-0 z-40 h-16 border-b border-white/10 bg-[#070709]/92 backdrop-blur-md">
        <div className="max-w-[1280px] mx-auto h-full px-4 sm:px-8 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <AppLink
            to="/"
            className="font-display text-lg sm:text-xl font-semibold tracking-wider text-[#F5F3EF] whitespace-nowrap shrink-0 hover:text-[#C9A45C] transition-colors"
          >
            {site?.config.studioName || 'LUAN HÉRCULES TATTOO'}
          </AppLink>

          {/* Zone 2: 4–5 single-line navigation links */}
          <nav
            aria-label="Navegação principal"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#A19D95]"
          >
            {visibleMenu.map((item) => {
              const active = currentPath === item.path;
              return (
                <AppLink
                  key={item.id}
                  to={item.path}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b ${
                    active
                      ? 'text-[#F5F3EF] border-[#C9A45C]'
                      : 'border-transparent hover:text-[#F5F3EF]'
                  }`}
                >
                  {item.label}
                </AppLink>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary CTA + mobile toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <AppLink
              to="/contato"
              className="hidden sm:inline-flex items-center justify-center px-5 py-2 text-xs font-semibold tracking-wide bg-[#C9A45C] text-[#070709] rounded-md hover:bg-[#D9B771] transition-colors whitespace-nowrap shrink-0"
            >
              Agendar
            </AppLink>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-md border border-white/10 text-[#F5F3EF] hover:bg-white/5 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/10 bg-[#0B0B0F] px-4 py-5 space-y-2">
            {(site?.menu || [])
              .filter((m) => m.visible)
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <AppLink
                  key={item.id}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    currentPath === item.path
                      ? 'bg-[#17171D] text-[#C9A45C]'
                      : 'text-[#F5F3EF] hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </AppLink>
              ))}
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0A0A0D]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-white/10">
            <div className="md:col-span-5 space-y-4">
              <p className="font-display text-2xl font-semibold tracking-wider text-[#F5F3EF]">
                {site?.config.studioName || 'LUAN HÉRCULES TATTOO'}
              </p>
              <p className="text-sm text-[#A19D95] leading-relaxed max-w-md">
                {site?.config.footerText}
              </p>
              {site?.music && <AmbientMusicPlayer music={site.music} />}
            </div>

            <div className="md:col-span-3 space-y-3">
              <p className="text-xs font-semibold tracking-wider text-[#C9A45C]">
                Navegação
              </p>
              <ul className="space-y-2 text-sm text-[#A19D95]">
                {(site?.menu || [])
                  .filter((m) => m.visible)
                  .sort((a, b) => a.order - b.order)
                  .map((item) => (
                    <li key={item.id}>
                      <AppLink
                        to={item.path}
                        className="hover:text-[#F5F3EF] transition-colors"
                      >
                        {item.label}
                      </AppLink>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="md:col-span-4 space-y-3">
              <p className="text-xs font-semibold tracking-wider text-[#C9A45C]">
                Atendimento & Canais
              </p>
              <div className="space-y-2 text-sm text-[#A19D95]">
                {site?.contacts.cityState || site?.contacts.address ? (
                  <p>
                    {[site.contacts.address, site.contacts.cityState]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                ) : (
                  <p>Endereço ainda não cadastrado no painel administrativo.</p>
                )}
                {site?.contacts.businessHours && <p>{site.contacts.businessHours}</p>}
                {site?.contacts.email && (
                  <p>
                    <a
                      href={`mailto:${site.contacts.email}`}
                      className="hover:text-[#F5F3EF] transition-colors"
                    >
                      {site.contacts.email}
                    </a>
                  </p>
                )}
                {activeSocials.length > 0 && (
                  <div className="flex flex-wrap gap-4 pt-2">
                    {activeSocials.map((soc) => (
                      <a
                        key={soc.id}
                        href={soc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-[#F5F3EF] hover:text-[#C9A45C] underline underline-offset-4 transition-colors"
                      >
                        {soc.label || soc.platform}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#A19D95]">
            <p>
              © {new Date().getFullYear()} {site?.config.studioName || 'Luan Hércules Tattoo'}.
              Todos os direitos reservados.
            </p>
            <AppLink
              to="/admin"
              className="hover:text-[#F5F3EF] transition-colors"
            >
              Painel Administrativo
            </AppLink>
          </div>
        </div>
      </footer>
    </div>
  );
}
