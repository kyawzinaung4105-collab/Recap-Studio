import type { SrtCue } from '@/types';

/**
 * Parse an SRT subtitle file content into structured cues.
 * Supports standard SRT format with optional styling tags.
 */
export function parseSrt(content: string): SrtCue[] {
  const cues: SrtCue[] = [];
  const blocks = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.split('\n').filter((l) => l.trim() !== '');
    if (lines.length < 2) continue;

    // First line may be a number index or may be missing
    let lineIdx = 0;
    let index = cues.length + 1;
    if (/^\d+$/.test(lines[0].trim())) {
      index = parseInt(lines[0].trim(), 10);
      lineIdx = 1;
    }

    const timeLine = lines[lineIdx];
    if (!timeLine) continue;

    const timeMatch = timeLine.match(
      /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/
    );
    if (!timeMatch) continue;

    const startTime =
      parseInt(timeMatch[1]) * 3600 +
      parseInt(timeMatch[2]) * 60 +
      parseInt(timeMatch[3]) +
      parseInt(timeMatch[4]) / 1000;
    const endTime =
      parseInt(timeMatch[5]) * 3600 +
      parseInt(timeMatch[6]) * 60 +
      parseInt(timeMatch[7]) +
      parseInt(timeMatch[8]) / 1000;

    const textLines = lines.slice(lineIdx + 1);
    const text = textLines.join('\n').replace(/<[^>]+>/g, '').trim();

    if (text) {
      cues.push({ index, startTime, endTime, text });
    }
  }

  return cues;
}

/**
 * Format seconds into SRT timestamp format: HH:MM:SS,mmm
 */
export function formatSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

/**
 * Generate SRT content from cues
 */
export function generateSrt(cues: SrtCue[]): string {
  return cues
    .map((cue, i) => {
      return `${i + 1}\n${formatSrtTime(cue.startTime)} --> ${formatSrtTime(cue.endTime)}\n${cue.text}`;
    })
    .join('\n\n');
}

/**
 * Find the active cue at a given time
 */
export function getActiveCue(cues: SrtCue[], time: number): SrtCue | null {
  for (const cue of cues) {
    if (time >= cue.startTime && time <= cue.endTime) {
      return cue;
    }
  }
  return null;
}

/**
 * Detect platform from a URL
 */
export function detectPlatform(url: string): 'youtube' | 'tiktok' | 'rednote' | 'other' {
  const lower = url.toLowerCase();
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('tiktok.com')) return 'tiktok';
  if (lower.includes('xiaohongshu.com') || lower.includes('rednote')) return 'rednote';
  return 'other';
}

/**
 * Extract a YouTube video ID from a URL
 */
export function getYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
