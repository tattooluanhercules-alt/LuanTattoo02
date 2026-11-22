import React, { useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { apiClient } from '../services/apiClient';

export function BookingForm() {
  const [name, setName] = useState('');
  const [contactChannel, setContactChannel] = useState('');
  const [placement, setPlacement] = useState('');
  const [sizeEstimate, setSizeEstimate] = useState('');
  const [idea, setIdea] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      await apiClient.submitContact({
        name,
        contactChannel,
        placement,
        sizeEstimate,
        idea,
      });
      setSuccessMsg(
        'Solicitação registrada com sucesso. Nossa equipe analisará sua ideia e retornará pelo contato informado.'
      );
      setName('');
      setContactChannel('');
      setPlacement('');
      setSizeEstimate('');
      setIdea('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Não foi possível enviar sua solicitação.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#111115] border border-white/10 rounded-lg p-6 sm:p-8 space-y-5"
    >
      <div className="space-y-1">
        <h3 className="font-display text-2xl font-medium text-[#F5F3EF]">
          Solicitar Avaliação de Projeto
        </h3>
        <p className="text-sm text-[#A19D95]">
          Descreva sua ideia com clareza para agilizar o orçamento e agendamento.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="p-3.5 rounded-md border border-red-500/30 bg-red-500/10 text-xs text-red-200"
        >
          {error}
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          className="p-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-200 flex items-start gap-2.5"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="contact-name" className="block text-xs font-medium text-[#F5F3EF]">
            Seu nome *
          </label>
          <input
            id="contact-name"
            type="text"
            required
            minLength={2}
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome completo"
            className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF] placeholder:text-[#A19D95]/60 focus:outline-none focus:border-[#C9A45C]"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contact-channel" className="block text-xs font-medium text-[#F5F3EF]">
            WhatsApp ou E-mail *
          </label>
          <input
            id="contact-channel"
            type="text"
            required
            minLength={4}
            maxLength={160}
            value={contactChannel}
            onChange={(e) => setContactChannel(e.target.value)}
            placeholder="Como prefere receber o retorno"
            className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF] placeholder:text-[#A19D95]/60 focus:outline-none focus:border-[#C9A45C]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="contact-placement" className="block text-xs font-medium text-[#F5F3EF]">
            Região do corpo
          </label>
          <input
            id="contact-placement"
            type="text"
            maxLength={120}
            value={placement}
            onChange={(e) => setPlacement(e.target.value)}
            placeholder="Ex.: antebraço, ombro, costas"
            className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF] placeholder:text-[#A19D95]/60 focus:outline-none focus:border-[#C9A45C]"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contact-size" className="block text-xs font-medium text-[#F5F3EF]">
            Tamanho aproximado (cm)
          </label>
          <input
            id="contact-size"
            type="text"
            maxLength={80}
            value={sizeEstimate}
            onChange={(e) => setSizeEstimate(e.target.value)}
            placeholder="Ex.: 12 cm"
            className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF] placeholder:text-[#A19D95]/60 focus:outline-none focus:border-[#C9A45C]"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-idea" className="block text-xs font-medium text-[#F5F3EF]">
          Descrição da ideia e referências *
        </label>
        <textarea
          id="contact-idea"
          required
          minLength={10}
          maxLength={1500}
          rows={4}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Conte sobre o tema, estilo desejado e se será sua primeira tatuagem ou reforma."
          className="w-full px-3.5 py-2.5 rounded-md bg-[#070709] border border-white/15 text-sm text-[#F5F3EF] placeholder:text-[#A19D95]/60 focus:outline-none focus:border-[#C9A45C]"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-[#C9A45C] text-[#070709] text-sm font-semibold hover:bg-[#D9B771] disabled:opacity-50 transition-colors"
      >
        <Send className="w-4 h-4" />
        {submitting ? 'Enviando solicitação...' : 'Enviar para avaliação'}
      </button>
    </form>
  );
}
