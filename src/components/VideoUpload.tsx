import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { UploadCloud, Film, Loader2 } from 'lucide-react';

interface VideoUploadProps {
  onVideoLoaded: (url: string, fileName: string) => void;
  currentFileName?: string;
}

export function VideoUpload({ onVideoLoaded, currentFileName }: VideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('video/')) return;
    setLoading(true);
    const url = URL.createObjectURL(file);
    onVideoLoaded(url, file.name);
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
        <Film className="w-8 h-8 text-amber-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">{currentFileName}</p>
          <p className="text-xs text-emerald-400">Video loaded successfully</p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
        >
          Change
        </button>
        <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={onChange} />
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 p-10 text-center group ${
        dragOver
          ? 'border-amber-500 bg-amber-500/10 scale-[1.02]'
          : 'border-slate-700 bg-slate-900/50 hover:border-amber-500/60 hover:bg-slate-900/80'
      }`}
    >
      <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={onChange} />
      <div className="flex flex-col items-center gap-4">
        <div className={`p-5 rounded-full bg-slate-800 transition-all duration-300 ${dragOver ? 'scale-110 bg-amber-500/20' : 'group-hover:bg-amber-500/10'}`}>
          {loading ? (
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
          ) : (
            <UploadCloud className="w-10 h-10 text-amber-400" />
          )}
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-200">Drop your video here</p>
          <p className="text-sm text-slate-500 mt-1">or click to browse — MP4, MOV, AVI, WebM</p>
        </div>
      </div>
    </div>
  );
}
