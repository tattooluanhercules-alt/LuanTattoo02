import { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface StudioImageProps {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
  fallbackTitle?: string;
}

export function StudioImage({
  src,
  alt,
  className = '',
  eager = false,
  fallbackTitle,
}: StudioImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#14141A] border border-white/10 text-[#A19D95] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <ImageOff className="w-6 h-6 mb-2 text-[#C9A45C]/70" aria-hidden="true" />
        <span className="text-xs tracking-wide">{fallbackTitle || alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
