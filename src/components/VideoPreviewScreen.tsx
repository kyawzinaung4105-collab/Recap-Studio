import { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import type { SrtCue } from '@/types';
import { getActiveCue } from '@/lib/captions';

interface VideoPreviewScreenProps {
  videoUrl: string;
  audioUrl: string | null;
  subtitles: SrtCue[];
  language: 'my' | 'en';
  movieTitle: string;
}

export function VideoPreviewScreen({ videoUrl, audioUrl, subtitles, language, movieTitle }: VideoPreviewScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  const activeCue = getActiveCue(subtitles, currentTime);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (audioRef.current && !audioUrl) {
        // no external audio — video's own audio plays
      }
    };
    const onLoadedMetadata = () => setDuration(video.duration);
    const onPlay = () => {
      setPlaying(true);
      if (audioRef.current && audioUrl) {
        audioRef.current.currentTime = video.currentTime;
        audioRef.current.play().catch(() => {});
      }
    };
    const onPause = () => {
      setPlaying(false);
      if (audioRef.current) audioRef.current.pause();
    };
    const onSeeked = () => {
      if (audioRef.current && audioUrl) {
        audioRef.current.currentTime = video.currentTime;
      }
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('seeked', onSeeked);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('seeked', onSeeked);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (audioUrl) {
      // When using custom audio, mute controls the audio element
      const audio = audioRef.current;
      if (audio) {
        audio.muted = !audio.muted;
        setMuted(audio.muted);
      }
    } else {
      video.muted = !video.muted;
      setMuted(video.muted);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="relative rounded-2xl overflow-hidden bg-black shadow-2xl group">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full aspect-video object-contain"
          playsInline
        />
        {audioUrl && <audio ref={audioRef} src={audioUrl} crossOrigin="anonymous" />}

        {/* Subtitle overlay */}
        {activeCue && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 max-w-[85%] px-4 py-2 rounded-lg bg-black/70 backdrop-blur-sm">
            <p className={`text-center font-semibold leading-snug drop-shadow-lg ${
              language === 'my' ? 'text-lg' : 'text-base'
            }`} style={{ color: '#FFD700', textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
              {activeCue.text}
            </p>
          </div>
        )}

        {/* Title badge */}
        {movieTitle && (
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm">
            <p className="text-sm font-semibold text-amber-400">{movieTitle}</p>
          </div>
        )}

        {/* Play overlay */}
        {!playing && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-all"
          >
            <div className="p-6 rounded-full bg-amber-500/90 group-hover:scale-110 transition-transform">
              <Play className="w-10 h-10 text-slate-900 ml-1" fill="currentColor" />
            </div>
          </button>
        )}
      </div>

      {/* Controls bar */}
      <div className="flex items-center gap-4 px-2">
        <button
          onClick={togglePlay}
          className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
        >
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" fill="currentColor" />}
        </button>

        <div className="flex-1 relative">
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            step={0.1}
            onChange={(e) => {
              const video = videoRef.current;
              if (video) {
                video.currentTime = parseFloat(e.target.value);
                setCurrentTime(video.currentTime);
              }
            }}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
        </div>

        <span className="text-xs font-mono text-slate-400 tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <button
          onClick={toggleMute}
          className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500 px-2">
        <span>{subtitles.length} subtitles</span>
        <span>•</span>
        <span>{language === 'my' ? 'မြန်မာ subtitle' : 'English subtitles'}</span>
        {audioUrl && (
          <>
            <span>•</span>
            <span className="text-emerald-400">Custom audio enabled</span>
          </>
        )}
      </div>
    </div>
  );
}
