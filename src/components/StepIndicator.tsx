import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  steps: { label: string; icon: typeof Check }[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center w-full max-w-3xl mx-auto mb-10">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isActive = i === currentStep;
        const isComplete = i < currentStep;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex items-center justify-center w-11 h-11 rounded-full border-2 transition-all duration-500 ${
                  isActive
                    ? 'border-amber-500 bg-amber-500/20 text-amber-400 scale-110 shadow-lg shadow-amber-500/20'
                    : isComplete
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-slate-700 bg-slate-900 text-slate-500'
                }`}
              >
                {isComplete ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span
                className={`text-xs font-medium tracking-wide transition-colors duration-300 ${
                  isActive ? 'text-amber-400' : isComplete ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-3 -mt-6 rounded-full overflow-hidden bg-slate-800">
                <div
                  className={`h-full transition-all duration-700 ${
                    isComplete ? 'w-full bg-emerald-500' : 'w-0 bg-slate-700'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
