import { createContext, useContext, useState, type ReactNode } from 'react';
import type { VideoProject, Step } from '@/types';
import { emptyProject } from '@/types';

interface RecapContextValue {
  project: VideoProject;
  step: Step;
  setStep: (s: Step) => void;
  updateProject: (patch: Partial<VideoProject>) => void;
  resetProject: () => void;
}

const RecapContext = createContext<RecapContextValue | null>(null);

export function RecapProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<VideoProject>(emptyProject);
  const [step, setStep] = useState<Step>(0);

  const updateProject = (patch: Partial<VideoProject>) => {
    setProject((prev) => ({ ...prev, ...patch }));
  };

  const resetProject = () => {
    setProject(emptyProject);
    setStep(0);
  };

  return (
    <RecapContext.Provider value={{ project, step, setStep, updateProject, resetProject }}>
      {children}
    </RecapContext.Provider>
  );
}

export function useRecap() {
  const ctx = useContext(RecapContext);
  if (!ctx) throw new Error('useRecap must be used within RecapProvider');
  return ctx;
}
