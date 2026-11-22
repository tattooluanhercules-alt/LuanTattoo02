import { ArrowUpRight, Clock, Mail, MapPin, MessageCircle } from 'lucide-react';
import { BookingForm } from '../components/BookingForm';
import { useSite } from '../contexts/SiteContext';

export function ContactPage() {
  const { site, loading } = useSite();

  if (loading || !site) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-20">
        <div className="h-80 bg-white/5 rounded-lg animate-pulse" />
      </div>
    );
  }

  const { contacts, socialLinks } = site;
  const activeSocials = socialLinks
    .filter((s) => s.active && s.url)
    .sort((a, b) => a.order - b.order);

  const cleanWhatsapp = contacts.whatsappNumber.replace(/\D/g, '');
  const whatsappUrl = cleanWhatsapp
    ? `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
        contacts.whatsappMessage || 'Olá! Gostaria de solicitar um orçamento.'
      )}`
    : null;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-14 sm:py-20 space-y-12">
      <header className="max-w-3xl space-y-4">
        <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#C9A45C]">
          Agendamento & Atendimento
        </p>
        <h1
          className="font-display text-4xl sm:text-5xl font-medium text-[#F5F3EF]"
          style={{ textWrap: 'balance' }}
        >
          Fale com o Estúdio
        </h1>
        <p className="text-base text-[#A19D95] leading-relaxed">
          {contacts.bookingNotice}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#111115] border border-white/10 rounded-lg p-6 sm:p-8 space-y-6">
            <h2 className="font-display text-2xl font-medium text-[#F5F3EF]">
              Canais Diretos
            </h2>

            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-md bg-[#C9A45C] text-[#070709] text-sm font-semibold hover:bg-[#D9B771] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Agendar pelo WhatsApp
                <ArrowUpRight className="w-4 h-4" />
              </a>
            ) : (
              <div className="p-4 rounded-md border border-white/10 bg-[#070709] text-xs text-[#A19D95]">
                WhatsApp direto ainda não cadastrado. Utilize o formulário ao lado para enviar
                sua solicitação.
              </div>
            )}

            <div className="space-y-4 pt-2 text-sm text-[#A19D95]">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#C9A45C] shrink-0 mt-1" />
                <div>
                  <p className="text-xs font-medium text-[#F5F3EF]">Localização</p>
                  <p>
                    {contacts.address || contacts.cityState
                      ? [contacts.address, contacts.cityState].filter(Boolean).join(' · ')
                      : 'Endereço a ser definido no painel administrativo.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#C9A45C] shrink-0 mt-1" />
                <div>
                  <p className="text-xs font-medium text-[#F5F3EF]">Horários</p>
                  <p>
                    {contacts.businessHours ||
                      'Horários de atendimento configuráveis no painel administrativo.'}
                  </p>
                </div>
              </div>

              {contacts.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#C9A45C] shrink-0 mt-1" />
                  <div>
                    <p className="text-xs font-medium text-[#F5F3EF]">E-mail</p>
                    <a
                      href={`mailto:${contacts.email}`}
                      className="hover:text-[#F5F3EF] transition-colors"
                    >
                      {contacts.email}
                    </a>
                  </div>
                </div>
              )}

              {contacts.instagramHandle && (
                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs text-[#A19D95]">
                    Instagram:{' '}
                    <span className="text-[#F5F3EF] font-medium">
                      {contacts.instagramHandle}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {activeSocials.length > 0 && (
              <div className="pt-4 border-t border-white/10 space-y-2">
                <p className="text-xs font-medium text-[#F5F3EF]">Redes Sociais</p>
                <div className="flex flex-wrap gap-3">
                  {activeSocials.map((soc) => (
                    <a
                      key={soc.id}
                      href={soc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#C9A45C] hover:text-[#D9B771] underline underline-offset-4"
                    >
                      {soc.label || soc.platform}
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7">
          <BookingForm />
        </div>
      </div>
    </div>
  );
}
