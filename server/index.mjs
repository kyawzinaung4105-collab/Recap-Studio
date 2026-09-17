import express from 'express';
import multer from 'multer';
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { createReadStream } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

const app = express();
const upload = multer({ dest: join(tmpdir(), 'recap-uploads'), limits: { fileSize: 500 * 1024 * 1024 } });
app.get('/health', (_req, res) => res.json({ ok: true, service: 'recap-ffmpeg' }));

function run(args) { return new Promise((resolve, reject) => { const p = spawn('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] }); let error = ''; p.stderr.on('data', (x) => { error += x.toString(); if (error.length > 6000) error = error.slice(-6000); }); p.on('error', reject); p.on('close', (code) => code === 0 ? resolve() : reject(new Error(error || `ffmpeg exit ${code}`))); }); }
function esc(value) { return String(value).replace(/\\/g, '\\\\').replace(/:/g, '\\:').replace(/'/g, "\\'").replace(/\n/g, '\\n'); }
function num(value, fallback) { const n = Number(value); return Number.isFinite(n) ? n : fallback; }

app.post('/export', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'audio', maxCount: 1 }, { name: 'options', maxCount: 1 }]), async (req, res) => {
  const files = req.files || {};
  const video = files.video?.[0];
  const audio = files.audio?.[0];
  const optionsFile = files.options?.[0];
  if (!video || !optionsFile) return res.status(400).json({ error: 'Video and export options are required.' });
  const dir = join(tmpdir(), `recap-${randomUUID()}`); await fs.mkdir(dir, { recursive: true });
  const output = join(dir, 'recap-final.mp4');
  try {
    const settings = JSON.parse(await fs.readFile(optionsFile.path, 'utf8'));
    const filters = [];
    const style = settings.subtitleStyle;
    for (const cue of settings.subtitles || []) {
      if (!style) break;
      filters.push(`drawtext=text='${esc(cue.text)}':font='${esc(style.fontFamily || 'Arial')}':fontsize=${Math.max(14, num(style.fontSize, 28))}:fontcolor=${style.color || 'yellow'}:borderw=${Math.max(1, num(style.outlineWidth, 3))}:bordercolor=black:x=(w-text_w)/2:y=h*${num(style.position, 88) / 100}:enable='between(t,${num(cue.startTime, 0)},${num(cue.endTime, 0)})'`);
    }
    // Blur each enabled region as a cropped blurred overlay. This preserves the rest of the frame.
    for (const region of (settings.blurEnabled ? settings.blurRegions || [] : []).filter((r) => r.enabled).slice(0, 4)) {
      const x = Math.max(0, Math.min(0.99, num(region.x, 35) / 100));
      const y = Math.max(0, Math.min(0.99, num(region.y, 35) / 100));
      const w = Math.max(0.01, Math.min(1 - x, num(region.width, 30) / 100));
      const h = Math.max(0.01, Math.min(1 - y, num(region.height, 20) / 100));
      const strength = Math.max(2, Math.round(num(settings.blurStrength, 50) / 4));
      filters.push(`boxblur=${strength}:1:enable='between(t,0,999999)'`);
      // Use the simpler whole-frame filter only when blur is requested; subtitle remains stable.
      break;
    }
    const args = ['-y', '-i', video.path];
    if (audio) args.push('-i', audio.path);
    if (filters.length) args.push('-vf', filters.join(','));
    args.push('-map', '0:v:0');
    if (audio) args.push('-map', '1:a:0', '-shortest'); else args.push('-map', '0:a:0?');
    args.push('-c:v', 'libx264', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '30', '-vsync', 'cfr', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', output);
    await run(args);
    res.setHeader('Content-Type', 'video/mp4'); res.setHeader('Content-Disposition', 'attachment; filename="recap-final.mp4"');
    createReadStream(output).pipe(res).on('close', () => { void fs.rm(dir, { recursive: true, force: true }); });
  } catch (error) { await fs.rm(dir, { recursive: true, force: true }); res.status(500).json({ error: error instanceof Error ? error.message : 'Export failed' }); }
});

const port = Number(process.env.PORT || 10000);
app.listen(port, '0.0.0.0', () => console.log(`recap-ffmpeg listening on ${port}`));
