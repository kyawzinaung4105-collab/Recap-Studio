export type InputMode = 'upload' | 'link';

export type Platform = 'youtube' | 'tiktok' | 'rednote' | 'other';

export interface SrtCue {
  index: number;
  startTime: number;
  endTime: number;
  text: string;
}

export interface SubtitleStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  outlineColor: string;
  outlineWidth: number;
  position: number;
}

export interface BlurRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  enabled: boolean;
}

export interface VideoProject {
  mode: InputMode;
  videoUrl: string | null;
  videoFileName: string;
  videoDuration: number;
  platform: Platform;
  linkUrl: string;
  audioUrl: string | null;
  audioFileName: string;
  subtitles: SrtCue[];
  subtitleFileName: string;
  subtitleStyle: SubtitleStyle;
  blurEnabled: boolean;
  blurStrength: number;
  blurRegions: BlurRegion[];
  movieTitle: string;
  language: 'my' | 'en';
  voiceId: string;
  voiceName: string;
}

export const defaultSubtitleStyle: SubtitleStyle = {
  fontFamily: 'Arial',
  fontSize: 28,
  color: '#FFD700',
  outlineColor: '#000000',
  outlineWidth: 3,
  position: 88,
};

export const emptyProject: VideoProject = {
  mode: 'upload',
  videoUrl: null,
  videoFileName: '',
  videoDuration: 0,
  platform: 'other',
  linkUrl: '',
  audioUrl: null,
  audioFileName: '',
  subtitles: [],
  subtitleFileName: '',
  subtitleStyle: defaultSubtitleStyle,
  blurEnabled: false,
  blurStrength: 50,
  blurRegions: [],
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

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    : `${minutes}:${String(secs).padStart(2, '0')}`;
}

export function createBlurRegion(): BlurRegion {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, x: 35, y: 35, width: 30, height: 20, enabled: true };
}

export function createDefaultProject(): VideoProject {
  return { ...emptyProject, subtitleStyle: { ...defaultSubtitleStyle }, blurRegions: [] };
}

export const defaultProject = createDefaultProject();
