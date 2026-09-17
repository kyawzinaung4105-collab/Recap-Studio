import type { IncomingMessage, ServerResponse } from 'node:http';
import { spawn } from 'node:child_process';
import { createReadStream, promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { IncomingForm } from 'formidable';
import ffmpegPath from 'ffmpeg-static';

export const config = { api: { bodyParser: false } };

type Upload = { filepath: string; originalFilename?: string };

function first(value: Upload | Upload[] | undefined): Upload | undefined { return Array.isArray(value) ? value[0] : value; }
function safeName(name: string): string { return name.replace(/[^a-zA-Z0-9._-]/g, '_'); }

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) return reject(new Error('FFmpeg binary is unavailable on this deployment.'));
    const binary = typeof ffmpegPath === 'string' ? ffmpegPath : ffmpegPath.default;
    const child = spawn(binary, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr?.on('data', (chunk) => { stderr += chunk.toString(); if (stderr.length > 8000) stderr = stderr.slice(-8000); });
    child.on('error', reject);
    child.on('close', (code) => code === 0 ? resolve() : reject(new Error(stderr || `FFmpeg exited with code ${code}`)));
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') { res.statusCode = 405; res.setHeader('Allow', 'POST'); res.end('Method Not Allowed'); return; }
  const dir = join(tmpdir(), `recap-${randomUUID()}`);
  await fs.mkdir(dir, { recursive: true });
  try {
    const form = new IncomingForm({ uploadDir: dir, keepExtensions: true, maxFileSize: 500 * 1024 * 1024 });
    const [, files] = await form.parse(req);
    const video = first(files.video as Upload | Upload[] | undefined);
    const audio = first(files.audio as Upload | Upload[] | undefined);
    const options = first(files.options as Upload | Upload[] | undefined);
    if (!video || !options) throw new Error('Video and export options are required.');
    
    const settings = JSON.parse(await fs.readFile(options.filepath, 'utf8')) as {
      subtitles?: { startTime: number; endTime: number; text: string }[];
      subtitleStyle?: { fontFamily: string; fontSize: number; color: string; outlineWidth: number; position: number };
      blurRegions?: { x: number; y: number; width: number; height: number; enabled: boolean }[];
      blurEnabled?: boolean;
      blurStrength?: number;
    };

    const output = join(dir, 'recap-final.mp4');
    const input = video.filepath;
    const args = ['-y', '-i', input];
    if (audio) args.push('-i', audio.filepath);

    const filters: string[] = [];
    
    // Fixed Blur Region Filter Logic (Proper overlay/crop isolation)
    const regions = settings.blurEnabled ? (settings.blurRegions || []).filter((r) => r.enabled) : [];
    if (regions.length) {
      const r = regions[0];
      const strength = Math.max(2, Math.round((settings.blurStrength || 50) / 4));
      // Safely apply blur to the specific region without breaking the rest of the frame
      filters.push(`[0:v]split=2[main][to_blur];[to_blur]crop=iw*${r.width / 100}:ih*${r.height / 100}:iw*${r.x / 100}:ih*${r.y / 100},boxblur=${strength}:1[blurred];[main][blurred]overlay=W*${r.x / 100}:H*${r.y / 100}[v_blurred]`);
    }

    const style = settings.subtitleStyle;
    const videoInputRef = regions.length ? '[v_blurred]' : '[0:v]';
    
    if (style && settings.subtitles?.length) {
      const font = style.fontFamily.replace(/[^a-zA-Z0-9 ]/g, '');
      const textFilters = settings.subtitles.map((cue, index) => {
        // Robust escaping for special characters and unicode/Burmese text
        const escaped = cue.text
          .replace(/\\/g, '\\\\')
          .replace(/'/g, '\\u0027')
          .replace(/:/g, '\\:')
          .replace(/,/g, '\\,');
        
        const label = index === settings.subtitles!.length - 1 ? '[v_out]' : `[v_sub${index}]`;
        const prevRef = index === 0 ? videoInputRef : `[v_sub${index - 1}]`;

        return `${prevRef}drawtext=text='${escaped}':fontcolor=${style.color}:fontsize=${Math.max(14, style.fontSize)}:borderw=${style.outlineWidth}:bordercolor=black:x=(w-text_w)/2:y=h*${style.position / 100}:enable='between(t,${cue.startTime},${cue.endTime})'${label}`;
      });

      filters.push(...textFilters);
      args.push('-filter_complex', filters.join(';'));
      args.push('-map', '[v_out]');
    } else if (regions.length) {
      filters.push(`${videoInputRef}copy[v_out]`);
      args.push('-filter_complex', filters.join(';'));
      args.push('-map', '[v_out]');
    } else {
      args.push('-map', '0:v:0');
    }

    if (audio) args.push('-map', '1:a:0', '-shortest');
    else args.push('-map', '0:a:0?');

    // Universal compatibility settings requested by user
    args.push(
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-pix_fmt', 'yuv420p',
      '-r', '30',
      '-vsync', 'cfr',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-movflags', '+faststart',
      output
    );

    await runFfmpeg(args);
    const stat = await fs.stat(output);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', stat.size.toString());
    res.setHeader('Content-Disposition', `attachment; filename="recap-${safeName(video.originalFilename || 'video').replace(/\.[^.]+$/, '')}.mp4"`);
    createReadStream(output).pipe(res);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Server export failed' }));
  } finally {
    setTimeout(() => { void fs.rm(dir, { recursive: true, force: true }); }, 1000);
  }
}
