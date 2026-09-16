import { useRef, useState, type ChangeEvent } from 'react';
import { FileText, UploadCloud, Loader2, X } from 'lucide-react';
import { parseSrt } from '@/lib/captions';
import type { SrtCue } from '@/types';

interface SubtitleUploadProps {
  onSubtitlesLoaded: (cues: SrtCue[], fileName: string) => void;
  currentFileName?: string;
  cueCount?: number;
  onClear?: () => void;
}

export function SubtitleUpload({ onSubtitlesLoaded, currentFileName, cueCount, onClear }: SubtitleUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (file: File) => {
    setLoading(true);
    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const cues = parseSrt(content);
      if (cues.length === 0) {
        setError('No valid subtitle cues found in this file');
        setLoading(false);
        return;
      }
      onSubtitlesLoaded(cues, file.name);
      setLoading(false);
    };
    reader.onerror = () => {
      setError('Failed to read file');
      setLoading(false);
    };
    reader.readAsText(file);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  if (currentFileName && cueCount !== undefined) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-700">
        <FileText className="w-8 h-8 text-sky-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">{currentFileName}</p>
          <p className="text-xs text-sky-400">{cueCount} subtitle cues loaded</p>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/50 hover:border-sky-500/60 hover:bg-slate-900/80 transition-all duration-300 p-6 text-center group"
      >
        <input ref={inputRef} type="file" accept=".srt,.vtt,.txt" className="hidden" onChange={onChange} />
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 rounded-full bg-slate-800 group-hover:bg-sky-500/10 transition-all duration-300">
            {loading ? (
              <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8 text-sky-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">Upload SRT subtitle file</p>
            <p className="text-xs text-slate-500 mt-1">Drop or click — .srt format</p>
          </div>
        </div>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
