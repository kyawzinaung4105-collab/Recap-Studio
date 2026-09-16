import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { Music, UploadCloud, Loader2, X } from 'lucide-react';

interface CustomAudioUploadProps {
  onAudioLoaded: (url: string, fileName: string) => void;
  currentFileName?: string;
  onClear?: () => void;
}

export function CustomAudioUpload({ onAudioLoaded, currentFileName, onClear }: CustomAudioUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('audio/')) return;
    setLoading(true);
    const url = URL.createObjectURL(file);
    onAudioLoaded(url, file.name);
    setLoading(false);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  if (currentFileName) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-700">
        <Music className="w-8 h-8 text-emerald-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">{currentFileName}</p>
          <p className="text-xs text-emerald-400">Audio loaded — will replace original video audio</p>
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
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 p-6 text-center group ${
        dragOver
          ? 'border-emerald-500 bg-emerald-500/10'
          : 'border-slate-700 bg-slate-900/50 hover:border-emerald-500/60 hover:bg-slate-900/80'
      }`}
    >
      <input ref={inputRef} type="file" accept="audio/*" className="hidden" onChange={onChange} />
      <div className="flex flex-col items-center gap-3">
        <div className={`p-4 rounded-full bg-slate-800 transition-all duration-300 ${dragOver ? 'scale-110 bg-emerald-500/20' : 'group-hover:bg-emerald-500/10'}`}>
          {loading ? (
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          ) : (
            <UploadCloud className="w-8 h-8 text-emerald-400" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-200">Upload MP3 audio (Myanmar dubbing)</p>
          <p className="text-xs text-slate-500 mt-1">Drop or click — MP3, WAV, AAC, M4A</p>
        </div>
      </div>
    </div>
  );
}
