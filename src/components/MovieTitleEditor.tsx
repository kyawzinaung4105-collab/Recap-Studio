import { type ChangeEvent } from 'react';
import { Clapperboard, Film } from 'lucide-react';

interface MovieTitleEditorProps {
  title: string;
  onChange: (title: string) => void;
}

export function MovieTitleEditor({ title, onChange }: MovieTitleEditorProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
        <Clapperboard className="w-4 h-4 text-amber-400" />
        Movie / Video Title
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
          <Film className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={title}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          placeholder="Enter movie or video title..."
          className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
        />
      </div>
    </div>
  );
}
