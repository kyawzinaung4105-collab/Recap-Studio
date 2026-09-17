import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { UploadCloud, Film, Loader2, AlertCircle } from 'lucide-react';
import { normalizeVideoForPreview } from '@/lib/videoMerge';

interface VideoUploadProps {
  onVideoLoaded: (url: string, fileName: string, sourceFile?: File) => void;
  currentFileName?: string;
}

export function VideoUpload({ onVideoLoaded, currentFileName }: VideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    const looksLikeVideo = file.type.startsWith('video/') || /\.(mp4|m4v|mov|webm|avi|mkv)$/i.test(file.name);
    if (!looksLikeVideo) { setError('Video ဖိုင်ကိုပဲ ရွေးပါ။'); return; }
    setLoading(true);
    setError('');
    try {
      const normalized = await normalizeVideoForPreview(file);
      onVideoLoaded(URL.createObjectURL(normalized), file.name, file);
    } catch (conversionError) {
      console.error('Video normalization failed', conversionError);
      setError('ဒီ video ကို Preview အတွက် ပြောင်းလဲမရပါ။ MP4 (H.264/AAC) ဖိုင်ကို ပြန်တင်ကြည့်ပါ။');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e: DragEvent) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files?.[0]; if (file) void handleFile(file); };
  const onChange = (e: ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) void handleFile(file); };

  if (currentFileName) return <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/80 p-4"><Film className="h-8 w-8 shrink-0 text-amber-400" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-200">{currentFileName}</p><p className="text-xs text-emerald-400">Video loaded successfully</p></div><button onClick={() => inputRef.current?.click()} className="text-xs font-medium text-amber-400 hover:text-amber-300">Change</button><input ref={inputRef} type="file" accept="video/*,.mkv,.avi" className="hidden" onChange={onChange} /></div>;

  return <div><div onClick={() => !loading && inputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={onDrop} className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all ${dragOver ? 'scale-[1.02] border-amber-500 bg-amber-500/10' : 'border-slate-700 bg-slate-900/50 hover:border-amber-500/60'}`}><input ref={inputRef} type="file" accept="video/*,.mkv,.avi" className="hidden" onChange={onChange} /><div className="flex flex-col items-center gap-4"><div className="rounded-full bg-slate-800 p-5">{loading ? <Loader2 className="h-10 w-10 animate-spin text-amber-400" /> : <UploadCloud className="h-10 w-10 text-amber-400" />}</div><div><p className="text-lg font-semibold text-slate-200">{loading ? 'Preparing video for preview...' : 'Drop your video here'}</p><p className="mt-1 text-sm text-slate-500">{loading ? 'Converting to H.264/AAC MP4' : 'MP4, MOV, AVI, WebM'}</p></div></div></div>{error && <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}</div>;
}
