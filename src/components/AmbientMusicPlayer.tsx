import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import type { MusicConfig } from '../types/studio';

export function AmbientMusicPlayer({ music }: { music: MusicConfig }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = Math.max(0, Math.min(1, music.initialVolume ?? 0.35));
    audio.loop = Boolean(music.loop);
  }, [music.initialVolume, music.loop]);

  if (!music.enabled || !music.audioUrl) {
    return null;
  }

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    setError(false);

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setError(true);
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !muted;
    setMuted(!muted);
  };

  return (
    <div className="inline-flex items-center gap-3 border border-white/10 bg-[#111115]/95 px-3.5 py-2 rounded-md text-xs text-[#F5F3EF]">
      <audio
        ref={audioRef}
        src={music.audioUrl}
        preload="none"
        onEnded={() => setPlaying(false)}
        onError={() => {
          setError(true);
          setPlaying(false);
        }}
      />
      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? 'Pausar música ambiente' : 'Reproduzir música ambiente'}
        className="inline-flex items-center justify-center w-7 h-7 rounded bg-[#C9A45C] text-[#070709] hover:bg-[#D9B771] transition-colors shrink-0"
      >
        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
      </button>
      <div className="min-w-0 max-w-[160px]">
        <p className="truncate font-medium text-[#F5F3EF]">{music.title}</p>
        <p className="truncate text-[11px] text-[#A19D95]">
          {error ? 'Áudio indisponível' : music.artist}
        </p>
      </div>
      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? 'Ativar som' : 'Silenciar som'}
        className="p-1.5 text-[#A19D95] hover:text-[#F5F3EF] transition-colors"
      >
        {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
