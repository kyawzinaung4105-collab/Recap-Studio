import { Plus, Trash2, SlidersHorizontal, Type } from 'lucide-react';
import type { BlurRegion, SubtitleStyle } from '@/types';
import { createBlurRegion } from '@/types';

interface Props {
  subtitleStyle: SubtitleStyle;
  blurRegions: BlurRegion[];
  onSubtitleStyleChange: (style: SubtitleStyle) => void;
  onBlurRegionsChange: (regions: BlurRegion[]) => void;
}

export function VideoEffectsEditor({ subtitleStyle, blurRegions, onSubtitleStyleChange, onBlurRegionsChange }: Props) {
  const updateRegion = (id: string, patch: Partial<BlurRegion>) =>
    onBlurRegionsChange(blurRegions.map((region) => region.id === id ? { ...region, ...patch } : region));

  return (
    <div className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-200"><Type className="h-4 w-4 text-sky-400" /> Subtitle appearance</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-xs text-slate-400">Font
          <select value={subtitleStyle.fontFamily} onChange={(e) => onSubtitleStyleChange({ ...subtitleStyle, fontFamily: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100">
            {['Arial', 'Tahoma', 'Verdana', 'Georgia', 'Trebuchet MS', 'Courier New'].map((font) => <option key={font}>{font}</option>)}
          </select>
        </label>
        <label className="text-xs text-slate-400">Size: {subtitleStyle.fontSize}px
          <input type="range" min="16" max="64" value={subtitleStyle.fontSize} onChange={(e) => onSubtitleStyleChange({ ...subtitleStyle, fontSize: Number(e.target.value) })} className="mt-2 w-full accent-amber-500" />
        </label>
        <label className="flex items-center gap-3 text-xs text-slate-400">Text color
          <input type="color" value={subtitleStyle.color} onChange={(e) => onSubtitleStyleChange({ ...subtitleStyle, color: e.target.value })} className="h-8 w-12 cursor-pointer rounded border-0 bg-transparent" />
        </label>
        <label className="text-xs text-slate-400">Vertical position: {subtitleStyle.position}%
          <input type="range" min="60" max="96" value={subtitleStyle.position} onChange={(e) => onSubtitleStyleChange({ ...subtitleStyle, position: Number(e.target.value) })} className="mt-2 w-full accent-amber-500" />
        </label>
      </div>

      <div className="border-t border-slate-800 pt-4">
        <div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-semibold text-slate-200"><SlidersHorizontal className="h-4 w-4 text-violet-400" /> Blur areas</div><button onClick={() => onBlurRegionsChange([...blurRegions, createBlurRegion()])} className="flex items-center gap-1 rounded-lg bg-violet-500/15 px-3 py-1.5 text-xs font-medium text-violet-300 hover:bg-violet-500/25"><Plus className="h-3.5 w-3.5" /> Add area</button></div>
        <p className="mb-3 text-xs text-slate-500">Blur is applied to the preview and exported video. Position and size use percentages of the frame.</p>
        {blurRegions.length === 0 && <p className="rounded-lg border border-dashed border-slate-700 p-3 text-center text-xs text-slate-500">No blur areas added</p>}
        <div className="space-y-3">{blurRegions.map((region, index) => <div key={region.id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
          <div className="mb-2 flex items-center justify-between"><span className="text-xs font-medium text-slate-300">Area {index + 1}</span><button onClick={() => onBlurRegionsChange(blurRegions.filter((item) => item.id !== region.id))} className="text-slate-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{(['x', 'y', 'width', 'height'] as const).map((key) => <label key={key} className="text-[11px] capitalize text-slate-500">{key} %<input type="number" min="0" max="100" value={region[key]} onChange={(e) => updateRegion(region.id, { [key]: Math.min(100, Math.max(0, Number(e.target.value))) })} className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs text-slate-100" /></label>)}</div>
          <label className="mt-3 flex items-center gap-2 text-xs text-slate-400"><input type="checkbox" checked={region.enabled} onChange={(e) => updateRegion(region.id, { enabled: e.target.checked })} className="accent-violet-500" /> Enabled</label>
        </div>)}</div>
      </div>
    </div>
  );
}
