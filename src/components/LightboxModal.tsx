import { useEffect } from 'react';
import { X } from 'lucide-react';
import { StudioImage } from './StudioImage';

interface LightboxModalProps {
  open: boolean;
  imageUrl: string;
  title: string;
  category?: string;
  description?: string;
  isPlaceholder?: boolean;
  onClose: () => void;
}

export function LightboxModal({
  open,
  imageUrl,
  title,
  category,
  description,
  isPlaceholder,
  onClose,
}: LightboxModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#111115] border border-white/10 rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar visualização"
          className="absolute top-4 right-4 z-10 inline-flex items-center justify-center w-10 h-10 rounded-md bg-black/75 text-[#F5F3EF] border border-white/15 hover:bg-[#C9A45C] hover:text-[#070709] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-[#070709] flex items-center justify-center max-h-[72vh] overflow-hidden">
          <StudioImage
            src={imageUrl}
            alt={title}
            eager
            className="w-full max-h-[72vh] object-contain"
          />
        </div>

        <div className="p-6 border-t border-white/10 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#A19D95]">
            {category && <span className="text-[#C9A45C]">{category}</span>}
            {isPlaceholder && (
              <>
                <span aria-hidden="true">·</span>
                <span>Referência editorial</span>
              </>
            )}
          </div>
          <h3 className="font-display text-2xl font-medium text-[#F5F3EF]">{title}</h3>
          {description && (
            <p className="text-sm text-[#A19D95] leading-relaxed">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
