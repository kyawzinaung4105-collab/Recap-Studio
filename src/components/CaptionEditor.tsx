import { useState } from 'react';
import { Pencil, Save, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type { SrtCue } from '@/types';
import { formatSrtTime } from '@/lib/captions';

interface CaptionEditorProps {
  cues: SrtCue[];
  onChange: (cues: SrtCue[]) => void;
}

export function CaptionEditor({ cues, onChange }: CaptionEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const startEdit = (cue: SrtCue, index: number) => {
    setEditingIndex(index);
    setEditText(cue.text);
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    const updated = [...cues];
    updated[editingIndex] = { ...updated[editingIndex], text: editText };
    onChange(updated);
    setEditingIndex(null);
    setEditText('');
  };

  const deleteCue = (index: number) => {
    onChange(cues.filter((_, i) => i !== index));
  };

  const moveCue = (index: number, dir: 'up' | 'down') => {
    if (dir === 'up' && index === 0) return;
    if (dir === 'down' && index === cues.length - 1) return;
    const newIndex = dir === 'up' ? index - 1 : index + 1;
    const updated = [...cues];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  const addCue = () => {
    const lastEnd = cues.length > 0 ? cues[cues.length - 1].endTime : 0;
    const newCue: SrtCue = {
      index: cues.length + 1,
      startTime: lastEnd,
      endTime: lastEnd + 3,
      text: 'New subtitle...',
    };
    onChange([...cues, newCue]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-400">{cues.length} subtitle cues</p>
        <button
          onClick={addCue}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Cue
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto rounded-xl bg-slate-900/50 border border-slate-800 divide-y divide-slate-800">
        {cues.map((cue, i) => (
          <div key={i} className="flex items-start gap-3 p-3 hover:bg-slate-800/50 transition-colors group">
            <div className="flex flex-col gap-0.5 shrink-0">
              <button
                onClick={() => moveCue(i, 'up')}
                disabled={i === 0}
                className="p-0.5 text-slate-600 hover:text-slate-300 disabled:opacity-30 transition-colors"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => moveCue(i, 'down')}
                disabled={i === cues.length - 1}
                className="p-0.5 text-slate-600 hover:text-slate-300 disabled:opacity-30 transition-colors"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="shrink-0 text-xs font-mono text-slate-500 tabular-nums w-28 pt-1">
              {formatSrtTime(cue.startTime)}
            </div>

            <div className="flex-1 min-w-0">
              {editingIndex === i ? (
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={2}
                  autoFocus
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-amber-500 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                />
              ) : (
                <p className="text-sm text-slate-200 leading-snug">{cue.text}</p>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {editingIndex === i ? (
                <button
                  onClick={saveEdit}
                  className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                >
                  <Save className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => startEdit(cue, i)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => deleteCue(i)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
