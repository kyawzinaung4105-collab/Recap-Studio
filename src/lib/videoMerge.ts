import type { SrtCue } from '@/types';
import { getActiveCue } from '@/lib/captions';

/**
 * Options for creating a merged video with audio and burned-in subtitles.
 */
export interface MergeOptions {
  audioUrl: string;
  subtitles: SrtCue[];
  subtitleStyle?: SubtitleStyle;
  videoStartTime?: number;
}

export interface SubtitleStyle {
  font: string;
  fontSize: number;
  primaryColor: string;
  outlineColor: string;
  outlineWidth: number;
  position: number;
}

export const defaultSubtitleStyle: SubtitleStyle = {
  font: 'Arial',
  fontSize: 24,
  primaryColor: '&H00FFFFFF',
  outlineColor: '&H00000000',
  outlineWidth: 2,
  position: 90,
};

/**
 * Convert SRT cues to ASS subtitle format.
 */
export function cuesToAss(cues: SrtCue[], style: SubtitleStyle = defaultSubtitleStyle): string {
  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const cs = Math.floor((seconds % 1) * 100);
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  };

  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 384
PlayResY: 288
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${style.font},${style.fontSize},${style.primaryColor},&H000000FF,${style.outlineColor},&H80000000,0,0,0,0,100,100,0,0,1,${style.outlineWidth},1,2,10,10,${Math.round((288 * (100 - style.position)) / 100)},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;

  const events = cues.map((cue) => {
    const start = formatTime(cue.startTime);
    const end = formatTime(cue.endTime);
    const text = cue.text.replace(/\n/g, '\\N');
    return `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}`;
  });

  return `${header}\n${events.join('\n')}`;
}

/**
 * Trigger a browser download of a blob
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Download an SRT file
 */
export function downloadSrt(cues: SrtCue[], fileName: string): void {
  const content = cues
    .map((cue, i) => {
      const fmt = (s: number) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = Math.floor(s % 60);
        const ms = Math.floor((s % 1) * 1000);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
      };
      return `${i + 1}\n${fmt(cue.startTime)} --> ${fmt(cue.endTime)}\n${cue.text}`;
    })
    .join('\n\n');

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, fileName);
}

export interface ExportOptions {
  videoUrl: string;
  audioUrl: string | null;
  subtitles: SrtCue[];
  movieTitle: string;
  language: 'my' | 'en';
  onProgress?: (progress: number) => void;
}

/**
 * Export a merged video in the browser using Canvas + MediaRecorder.
 * Burns subtitles into the video and replaces audio with the custom MP3 if provided.
 * Produces a downloadable .webm file.
 */
export async function exportMergedVideo(opts: ExportOptions): Promise<Blob> {
  const { videoUrl, audioUrl, subtitles, movieTitle, language, onProgress } = opts;

  // Set up the video element
  const video = document.createElement('video');
  video.src = videoUrl;
  video.crossOrigin = 'anonymous';
  video.muted = !!audioUrl; // mute original if we have custom audio
  video.playsInline = true;

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error('Failed to load video'));
  });

  const width = video.videoWidth || 1280;
  const height = video.videoHeight || 720;

  // Set up canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  // Set up audio context for mixing
  let audioStream: MediaStream | null = null;
  let audioCtx: AudioContext | null = null;

  if (audioUrl) {
    try {
      audioCtx = new AudioContext();
      const audioEl = new Audio(audioUrl);
      audioEl.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        audioEl.onloadeddata = () => resolve();
        audioEl.onerror = () => reject(new Error('Failed to load audio'));
      });
      const source = audioCtx.createMediaElementSource(audioEl);
      const dest = audioCtx.createMediaStreamDestination();
      source.connect(dest);
      source.connect(audioCtx.destination);
      audioStream = dest.stream;
      audioEl.currentTime = 0;
      // Start audio when video plays
      video.addEventListener('play', () => {
        audioEl.currentTime = video.currentTime;
        audioEl.play().catch(() => {});
      });
      video.addEventListener('pause', () => audioEl.pause());
      video.addEventListener('seeked', () => {
        audioEl.currentTime = video.currentTime;
      });
    } catch {
      // Fall back to no custom audio
    }
  }

  // Capture canvas stream
  const canvasStream = canvas.captureStream(30);

  // Combine canvas + audio streams
  const combinedStream = new MediaStream();
  canvasStream.getVideoTracks().forEach((t) => combinedStream.addTrack(t));
  if (audioStream) {
    audioStream.getAudioTracks().forEach((t) => combinedStream.addTrack(t));
  } else if (!audioUrl) {
    // Use video's own audio track if available
    try {
      const videoStream = (video as any).captureStream?.() as MediaStream | undefined;
      videoStream?.getAudioTracks().forEach((t) => combinedStream.addTrack(t));
    } catch {
      // No audio track available
    }
  }

  // Set up MediaRecorder
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
    ? 'video/webm;codecs=vp9,opus'
    : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
    ? 'video/webm;codecs=vp8,opus'
    : 'video/webm';

  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: 5_000_000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const done = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: 'video/webm' }));
    };
  });

  // Start playing and recording
  video.currentTime = 0;
  await video.play();
  recorder.start(100);

  // Render loop: draw video frame + subtitle overlay
  const startTime = performance.now();
  const renderFrame = () => {
    if (video.ended || video.paused) {
      // Check if we're done
      if (video.ended) {
        recorder.stop();
        if (audioCtx) audioCtx.close();
        return;
      }
    }

    // Draw video frame
    ctx.drawImage(video, 0, 0, width, height);

    // Get current time
    const currentVideoTime = video.currentTime;

    // Draw subtitle overlay
    const activeCue = getActiveCue(subtitles, currentVideoTime);
    if (activeCue) {
      const fontSize = Math.max(20, Math.floor(height / 28));
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';

      const lines = activeCue.text.split('\n');
      const lineHeight = fontSize * 1.4;
      const baseY = height - 40 - (lines.length - 1) * lineHeight;

      // Title badge
      if (movieTitle) {
        ctx.font = `bold ${Math.max(16, Math.floor(height / 40))}px Arial, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(15, 15, ctx.measureText(movieTitle).width + 24, 36);
        ctx.fillStyle = '#FFD700';
        ctx.fillText(movieTitle, 27, 22);
      }

      // Subtitle background + text
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';

      lines.forEach((line, i) => {
        const y = baseY + i * lineHeight;
        const x = width / 2;

        // Text shadow/outline
        ctx.lineWidth = Math.max(2, fontSize / 10);
        ctx.strokeStyle = 'rgba(0,0,0,0.9)';
        ctx.lineJoin = 'round';
        ctx.strokeText(line, x, y);

        // Main text
        ctx.fillStyle = '#FFD700';
        ctx.fillText(line, x, y);
      });
    } else if (movieTitle) {
      // Draw just the title badge
      ctx.font = `bold ${Math.max(16, Math.floor(height / 40))}px Arial, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(15, 15, ctx.measureText(movieTitle).width + 24, 36);
      ctx.fillStyle = '#FFD700';
      ctx.fillText(movieTitle, 27, 22);
    }

    // Update progress
    if (onProgress && video.duration > 0) {
      onProgress(video.currentTime / video.duration);
    }

    requestAnimationFrame(renderFrame);
  };

  renderFrame();

  // Safety timeout: stop after duration + 5 seconds
  const maxDuration = (video.duration + 5) * 1000;
  setTimeout(() => {
    if (recorder.state !== 'inactive') {
      recorder.stop();
      if (audioCtx) audioCtx.close();
    }
  }, maxDuration);

  return done;
}
