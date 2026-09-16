export type InputMode = 'upload' | 'link';

export type Platform = 'youtube' | 'tiktok' | 'rednote' | 'other';

export interface SrtCue {
  index: number;
  startTime: number; // seconds
  endTime: number;   // seconds
  text: string;
}

export interface VideoProject {
  mode: InputMode;
  videoUrl: string | null;
  videoFileName: string;
  platform: Platform;
  linkUrl: string;
  audioUrl: string | null;
  audioFileName: string;
  subtitles: SrtCue[];
  subtitleFileName: string;
  movieTitle: string;
  language: 'my' | 'en';
  voiceId: string;
  voiceName: string;
}

export const emptyProject: VideoProject = {
  mode: 'upload',
  videoUrl: null,
  videoFileName: '',
  platform: 'other',
  linkUrl: '',
  audioUrl: null,
  audioFileName: '',
  subtitles: [],
  subtitleFileName: '',
  movieTitle: '',
  language: 'my',
  voiceId: '',
  voiceName: '',
};

export type Step = 0 | 1 | 2 | 3;

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female';
  description: string;
}
