import { useRef, useEffect, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import type { BlurRegion, SrtCue, SubtitleStyle } from '@/types';
import { getActiveCue } from '@/lib/captions';
import { formatDuration } from '@/types';

interface VideoPreviewScreenProps {
  videoUrl: string;
  audioUrl: string | null;
  subtitles: SrtCue[];
  language: 'my' | 'en';
  movieTitle: string;
  subtitleStyle: SubtitleStyle;
  blurRegions: BlurRegion[];
  onBlurRegionsChange?: (regions: BlurRegion[]) => void;
  onDurationChange?: (duration: number) => void;
}

export function VideoPreviewScreen({ videoUrl, audioUrl, subtitles, language, movieTitle, subtitleStyle, blurRegions, onDurationChange, onBlurRegionsChange }: VideoPreviewScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const activeCue = getActiveCue(subtitles, currentTime);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => { const value = Number.isFinite(video.duration) ? video.duration : 0; setDuration(value); onDurationChange?.(value); };
    const onPlay = () => { setPlaying(true); if (audioRef.current && audioUrl) { audioRef.current.currentTime = video.currentTime; audioRef.current.play().catch(() => {}); } };
    const onPause = () => { setPlaying(false); audioRef.current?.pause(); };
    const onSeeked = () => { if (audioRef.current && audioUrl) audioRef.current.currentTime = video.currentTime; };
    video.addEventListener('timeupdate', onTimeUpdate); video.addEventListener('loadedmetadata', onLoadedMetadata); video.addEventListener('durationchange', onLoadedMetadata); video.addEventListener('play', onPlay); video.addEventListener('pause', onPause); video.addEventListener('seeked', onSeeked);
    return () => { video.removeEventListener('timeupdate', onTimeUpdate); video.removeEventListener('loadedmetadata', onLoadedMetadata); video.removeEventListener('durationchange', onLoadedMetadata); video.removeEventListener('play', onPlay); video.removeEventListener('pause', onPause); video.removeEventListener('seeked', onSeeked); };
  }, [audioUrl, onDurationChange]);

  const togglePlay = () => { const video = videoRef.current; if (!video) return; if (video.paused) video.play().catch(() => {}); else video.pause(); };
  const toggleMute = () => { const target = audioUrl ? audioRef.current : videoRef.current; if (!target) return; target.muted = !target.muted; setMuted(target.muted); };
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const startBlurDrag = (event: ReactPointerEvent<HTMLDivElement>, region: BlurRegion) => {
    if (!onBlurRegionsChange || !previewRef.current) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = previewRef.current.getBoundingClientRect();
    dragRef.current = { id: region.id, offsetX: (event.clientX - rect.left) / rect.width * 100 - region.x, offsetY: (event.clientY - rect.top) / rect.height * 100 - region.y };
  };
  const moveBlur = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || !previewRef.current || !onBlurRegionsChange) return;
    const rect = previewRef.current.getBoundingClientRect();
    const region = blurRegions.find((item) => item.id === drag.id);
    if (!region) return;
    const x = Math.min(100 - region.width, Math.max(0, (event.clientX - rect.left) / rect.width * 100 - drag.offsetX));
    const y = Math.min(100 - region.height, Math.max(0, (event.clientY - rect.top) / rect.height * 100 - drag.offsetY));
    onBlurRegionsChange(blurRegions.map((item) => item.id === drag.id ? { ...item, x, y } : item));
  };
  const stopBlurDrag = () => { dragRef.current = null; };

  return <div className="space-y-4">
    <div ref={previewRef} onPointerMove={moveBlur} onPointerUp={stopBlurDrag} onPointerCancel={stopBlurDrag} className="relative overflow-hidden rounded-2xl bg-black shadow-2xl group">
      <video ref={videoRef} src={videoUrl} className="aspect-video w-full object-contain" playsInline preload="metadata" />
      {audioUrl && <audio ref={audioRef} src={audioUrl} crossOrigin="anonymous" />}
      {blurRegions.filter((region) => region.enabled).map((region) => <div key={region.id} onPointerDown={(event) => startBlurDrag(event, region)} className="absolute cursor-move touch-none rounded-md border border-violet-300/70 bg-violet-400/10 backdrop-blur-xl" style={{ left: `${region.x}%`, top: `${region.y}%`, width: `${region.width}%`, height: `${region.height}%` }} title="Drag to move blur area" />)}
      {activeCue && <div className="absolute left-1/2 max-w-[88%] -translate-x-1/2 rounded-lg bg-black/70 px-4 py-2 backdrop-blur-sm" style={{ bottom: `${100 - subtitleStyle.position}%` }}><p className="text-center font-semibold leading-snug drop-shadow-lg" style={{ color: subtitleStyle.color, fontFamily: subtitleStyle.fontFamily, fontSize: `${Math.max(12, subtitleStyle.fontSize / 1.5)}px`, textShadow: `0 0 ${subtitleStyle.outlineWidth}px ${subtitleStyle.outlineColor}` }}>{activeCue.text}</p></div>}
      {movieTitle && <div className="absolute left-4 top-4 rounded-lg bg-black/60 px-3 py-1.5 backdrop-blur-sm"><p className="text-sm font-semibold text-amber-400">{movieTitle}</p></div>}
      {!playing && <button onClick={togglePlay} aria-label="Play video" className="absolute inset-0 flex items-center justify-center bg-black/30 transition-all hover:bg-black/20"><div className="rounded-full bg-amber-500/90 p-6 transition-transform group-hover:scale-110"><Play className="ml-1 h-10 w-10 text-slate-900" fill="currentColor" /></div></button>}
    </div>
    <div className="flex flex-wrap items-center gap-3 px-2 sm:gap-4">
      <button onClick={togglePlay} aria-label={playing ? 'Pause video' : 'Play video'} className="rounded-full bg-slate-800 p-3 text-amber-400 hover:bg-slate-700">{playing ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" fill="currentColor" />}</button>
      <div className="relative min-w-[120px] flex-1"><div className="h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: `${progress}%` }} /></div><input aria-label="Seek video" type="range" min={0} max={duration || 0} value={currentTime} step={0.1} onChange={(e) => { if (videoRef.current) { videoRef.current.currentTime = Number(e.target.value); setCurrentTime(Number(e.target.value)); } }} className="absolute inset-0 w-full cursor-pointer opacity-0" /></div>
      <span className="whitespace-nowrap text-xs font-mono tabular-nums text-slate-300">{formatDuration(currentTime)} / {formatDuration(duration)}</span>
      <button onClick={toggleMute} aria-label={muted ? 'Unmute video' : 'Mute video'} className="rounded-full bg-slate-800 p-2.5 text-slate-300 hover:bg-slate-700">{muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}</button>
    </div>
    <div className="flex flex-wrap gap-x-4 gap-y-1 px-2 text-xs text-slate-500"><span>{formatDuration(duration)} total</span><span>{subtitles.length} subtitles</span><span>{language === 'my' ? 'မြန်မာ subtitle' : 'English subtitles'}</span>{audioUrl && <span className="text-emerald-400">Custom audio enabled</span>}{blurRegions.some((region) => region.enabled) && <span className="text-violet-300">Blur enabled</span>}</div>
  </div>;
}
