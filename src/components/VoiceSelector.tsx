import { Check, Mic, User } from 'lucide-react';
import { VOICE_OPTIONS } from '@/lib/voices';

interface VoiceSelectorProps {
  voiceId: string;
  onChange: (id: string, name: string) => void;
}

export function VoiceSelector({ voiceId, onChange }: VoiceSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {VOICE_OPTIONS.map((voice) => {
        const selected = voice.id === voiceId;
        return (
          <button
            key={voice.id}
            onClick={() => onChange(voice.id, voice.name)}
            className={`relative flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-300 ${
              selected
                ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                : 'border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900/80'
            }`}
          >
            <div className={`p-2.5 rounded-lg shrink-0 transition-colors ${selected ? 'bg-amber-500/20' : 'bg-slate-800'}`}>
              {voice.gender === 'female' ? (
                <User className={`w-5 h-5 ${selected ? 'text-amber-400' : 'text-slate-400'}`} />
              ) : (
                <Mic className={`w-5 h-5 ${selected ? 'text-amber-400' : 'text-slate-400'}`} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${selected ? 'text-amber-400' : 'text-slate-200'}`}>
                {voice.name}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{voice.description}</p>
            </div>
            {selected && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-slate-900" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
