import { useState } from 'react';
import { Download, FileText, Subtitles, Music, Film, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import type { VideoProject } from '@/types';
import { downloadSrt, downloadBlob, exportMergedVideo } from '@/lib/videoMerge';

interface VideoExporterProps {
  project: VideoProject;
  onExport?: () => void;
}

export function VideoExporter({ project, onExport }: VideoExporterProps) {
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleExport = async () => {
    if (!project.videoUrl) {
      setError('No video source available to export');
      return;
    }

    setExporting(true);
    setError('');
    setProgress(0);

    try {
      const blob = await exportMergedVideo({
        videoUrl: project.videoUrl,
        audioUrl: project.audioUrl,
        subtitles: project.subtitles,
        movieTitle: project.movieTitle,
        language: project.language,
        onProgress: (p) => setProgress(Math.round(p * 100)),
      });

      const fileName = (project.movieTitle || 'recap') + '.webm';
      downloadBlob(blob, fileName);

      setDone(true);
      onExport?.();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Export failed';
      setError(msg);
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadSrt = () => {
    const name = (project.movieTitle || 'recap') + '.srt';
    downloadSrt(project.subtitles, name);
  };

  const checklist = [
    { icon: Film, label: 'Video source', value: project.videoFileName || project.linkUrl || 'Not set', done: !!(project.videoUrl || project.linkUrl) },
    { icon: Music, label: 'Audio (MP3)', value: project.audioFileName || 'Original audio', done: true },
    { icon: Subtitles, label: 'Subtitles (SRT)', value: `${project.subtitles.length} cues`, done: project.subtitles.length > 0 },
    { icon: FileText, label: 'Title', value: project.movieTitle || 'Untitled', done: !!project.movieTitle },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-slate-900/50 border border-slate-800 divide-y divide-slate-800">
        {checklist.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-center gap-3 p-4">
              <div className="p-2 rounded-lg bg-slate-800 shrink-0">
                <Icon className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="text-sm font-medium text-slate-200 truncate">{item.value}</p>
              </div>
              <CheckCircle2 className={`w-5 h-5 shrink-0 ${item.done ? 'text-emerald-400' : 'text-slate-700'}`} />
            </div>
          );
        })}
      </div>

      {exporting && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-amber-400">Rendering video with audio + subtitles...</span>
            <span className="text-slate-400 font-mono">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/30 p-4">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-300">Export failed</p>
            <p className="text-xs text-red-400/70 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleExport}
          disabled={exporting || done || !project.videoUrl}
          className={`flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all duration-300 ${
            done
              ? 'bg-emerald-500 text-white cursor-default'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/20'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {exporting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Exporting... {progress}%
            </>
          ) : done ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Video Downloaded!
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Export & Download Video
            </>
          )}
        </button>

        <button
          onClick={handleDownloadSrt}
          disabled={project.subtitles.length === 0}
          className="flex items-center justify-center gap-2 py-4 rounded-xl bg-slate-800 text-slate-200 font-semibold hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FileText className="w-5 h-5 text-sky-400" />
          Download SRT File
        </button>
      </div>

      {done && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4">
          <p className="text-sm text-emerald-300">
            Your video has been downloaded as a .webm file with the Myanmar audio track and subtitles embedded. The SRT file is also available for separate download.
          </p>
        </div>
      )}

      {!project.videoUrl && project.linkUrl && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4">
          <p className="text-sm text-amber-300">
            Link-based videos need to be uploaded as a file to export. YouTube/TikTok/RedNote videos cannot be directly downloaded in the browser due to platform restrictions. Please download the video file first, then re-upload it to export with audio and subtitles.
          </p>
        </div>
      )}
    </div>
  );
}
