import { useState, type ChangeEvent } from 'react';
import { Link2, Youtube, Music2, BookOpen, Loader2, Globe } from 'lucide-react';
import { detectPlatform } from '@/lib/captions';
import type { Platform } from '@/types';

interface VideoLinkInputProps {
  onLinkSubmit: (url: string, platform: Platform) => void;
  currentLink?: string;
}

const PLATFORM_ICONS: Record<string, typeof Youtube> = {
  youtube: Youtube,
  tiktok: Music2,
  rednote: BookOpen,
  other: Globe,
};

const PLATFORM_LABELS: Record<string, string> = {
  youtube: 'YouTube',
  tiktok: 'TikTok',
  rednote: 'RedNote (Xiaohongshu)',
  other: 'Other Platform',
};

export function VideoLinkInput({ onLinkSubmit, currentLink }: VideoLinkInputProps) {
  const [url, setUrl] = useState(currentLink || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!url.trim()) {
      setError('Please paste a video link');
      return;
    }
    try {
      new URL(url);
    } catch {
      setError("That doesn't look like a valid URL");
      return;
    }
    setError('');
    setLoading(true);
    const platform = detectPlatform(url);
    setTimeout(() => {
      onLinkSubmit(url, platform);
      setLoading(false);
    }, 600);
  };

  const detectedPlatform = url.trim() ? detectPlatform(url) : null;
  const DetectedIcon = detectedPlatform ? PLATFORM_ICONS[detectedPlatform] : null;

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
          <Link2 className="w-5 h-5" />
        </div>
        <input
          type="url"
          value={url}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Paste YouTube, TikTok, or RedNote link..."
          className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {detectedPlatform && DetectedIcon && !error && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <DetectedIcon className="w-4 h-4 text-amber-400" />
          <span>Detected: {PLATFORM_LABELS[detectedPlatform]}</span>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !url.trim()}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-semibold hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-amber-500/20"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Fetching video info...</span>
          </>
        ) : (
          <>
            <Globe className="w-5 h-5" />
            <span>Fetch Video</span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-6 pt-2">
        {(Object.keys(PLATFORM_LABELS) as Array<keyof typeof PLATFORM_LABELS>).map((key) => {
          const Icon = PLATFORM_ICONS[key];
          return (
            <div key={key} className="flex flex-col items-center gap-1 opacity-50">
              <Icon className="w-6 h-6 text-slate-400" />
              <span className="text-[10px] text-slate-500">{PLATFORM_LABELS[key]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
