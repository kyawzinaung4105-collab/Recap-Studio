import { useState } from 'react';
import { Film, Upload, Link2, Music, Subtitles, ArrowRight, ArrowLeft, RotateCcw, Sparkles, Type, Languages, Mic2, Eye, Download } from 'lucide-react';
import { RecapProvider, useRecap } from '@/context/RecapContext';
import { StepIndicator } from '@/components/StepIndicator';
import { VideoUpload } from '@/components/VideoUpload';
import { VideoLinkInput } from '@/components/VideoLinkInput';
import { CustomAudioUpload } from '@/components/CustomAudioUpload';
import { SubtitleUpload } from '@/components/SubtitleUpload';
import { LanguageSelector } from '@/components/LanguageSelector';
import { VoiceSelector } from '@/components/VoiceSelector';
import { MovieTitleEditor } from '@/components/MovieTitleEditor';
import { CaptionEditor } from '@/components/CaptionEditor';
import { VideoPreviewScreen } from '@/components/VideoPreviewScreen';
import { VideoExporter } from '@/components/VideoExporter';
import { VideoEffectsEditor } from '@/components/VideoEffectsEditor';
import { formatDuration, type Platform } from '@/types';

const STEPS = [
  { label: 'Input', icon: Film },
  { label: 'Assets', icon: Music },
  { label: 'Preview', icon: Eye },
  { label: 'Export', icon: Download },
];

function AppContent() {
  const { project, step, setStep, updateProject, resetProject } = useRecap();
  const [inputMode, setInputMode] = useState<'upload' | 'link'>('upload');

  const canGoNext = () => {
    if (step === 0) return !!(project.videoUrl || project.linkUrl);
    if (step === 1) return project.subtitles.length > 0;
    if (step === 2) return true;
    return true;
  };

  const handleLinkSubmit = (url: string, platform: Platform) => {
    updateProject({ linkUrl: url, platform, mode: 'link' });
  };

  const handleVideoLoaded = (url: string, fileName: string) => {
    updateProject({ videoUrl: url, videoFileName: fileName, videoDuration: 0, mode: 'upload' });
  };

  const handleAudioLoaded = (url: string, fileName: string) => {
    updateProject({ audioUrl: url, audioFileName: fileName });
  };

  const handleSubtitlesLoaded = (cues: typeof project.subtitles, fileName: string) => {
    updateProject({ subtitles: cues, subtitleFileName: fileName });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-800/60 backdrop-blur-sm bg-slate-950/60 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
                <Film className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Recap Studio</h1>
                <p className="text-xs text-slate-500">AI Movie Recap — Myanmar Audio & Subtitles</p>
              </div>
            </div>
            <button
              onClick={resetProject}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <StepIndicator currentStep={step} steps={STEPS} />

          {/* Step 0: Input */}
          {step === 0 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Choose your video source</h2>
                <p className="text-slate-400">Upload a video file or paste a link from YouTube, TikTok, or RedNote</p>
              </div>

              {/* Mode toggle */}
              <div className="flex p-1 rounded-xl bg-slate-900/60 border border-slate-800">
                <button
                  onClick={() => setInputMode('upload')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                    inputMode === 'upload'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 shadow-lg'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Upload Video
                </button>
                <button
                  onClick={() => setInputMode('link')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                    inputMode === 'link'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 shadow-lg'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Link2 className="w-4 h-4" />
                  Paste Link
                </button>
              </div>

              {inputMode === 'upload' ? (
                <VideoUpload onVideoLoaded={handleVideoLoaded} currentFileName={project.videoFileName} />
              ) : (
                <VideoLinkInput onLinkSubmit={handleLinkSubmit} currentLink={project.linkUrl} />
              )}

              {(project.videoUrl || project.linkUrl) && (
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-300">Video ready!</p>
                    <p className="text-xs text-amber-400/70 mt-0.5">Proceed to add your MP3 audio and SRT subtitle file. The audio will replace the original, and subtitles will be burned into the video.</p>
                  </div>
                </div>
              )}
              {project.videoDuration > 0 && (
                <p className="text-center text-xs text-slate-500">Detected duration: {formatDuration(project.videoDuration)}</p>
              )}
            </div>
          )}

          {/* Step 1: Assets */}
          {step === 1 && (
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Add audio & subtitles</h2>
                <p className="text-slate-400">Upload your Myanmar MP3 dubbing and SRT subtitle file</p>
              </div>

              {/* Audio upload */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Music className="w-4 h-4 text-emerald-400" />
                  Audio Track (MP3)
                </div>
                <CustomAudioUpload
                  onAudioLoaded={handleAudioLoaded}
                  currentFileName={project.audioFileName}
                  onClear={() => updateProject({ audioUrl: null, audioFileName: '' })}
                />
              </div>

              {/* Subtitle upload */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Subtitles className="w-4 h-4 text-sky-400" />
                  Subtitle File (SRT)
                </div>
                <SubtitleUpload
                  onSubtitlesLoaded={handleSubtitlesLoaded}
                  currentFileName={project.subtitleFileName}
                  cueCount={project.subtitles.length}
                  onClear={() => updateProject({ subtitles: [], subtitleFileName: '' })}
                />
              </div>

              {/* Title */}
              <MovieTitleEditor title={project.movieTitle} onChange={(t) => updateProject({ movieTitle: t })} />

              {/* Language */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Languages className="w-4 h-4 text-amber-400" />
                  Subtitle Language
                </div>
                <LanguageSelector value={project.language} onChange={(lang) => updateProject({ language: lang })} />
              </div>

              {/* Voice selector */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Mic2 className="w-4 h-4 text-amber-400" />
                  AI Voice (for future TTS generation)
                </div>
                <VoiceSelector
                  voiceId={project.voiceId}
                  onChange={(id, name) => updateProject({ voiceId: id, voiceName: name })}
                />
              </div>

              {/* Caption editor */}
              {project.subtitles.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Type className="w-4 h-4 text-sky-400" />
                    Edit Subtitles
                  </div>
                  <CaptionEditor cues={project.subtitles} onChange={(cues) => updateProject({ subtitles: cues })} />
                </div>
              )}

            </div>
          )}

          {/* Step 2: Preview */}
          {step === 2 && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Preview your recap</h2>
                <p className="text-slate-400">See your video with custom audio and burned-in subtitles</p>
              </div>

              {(project.videoUrl || project.linkUrl) ? (
                <>
                  <VideoPreviewScreen
                    videoUrl={project.videoUrl || ''}
                    audioUrl={project.audioUrl}
                    subtitles={project.subtitles}
                    language={project.language}
                    movieTitle={project.movieTitle}
                    subtitleStyle={project.subtitleStyle}
                    blurRegions={project.blurRegions}
                    blurEnabled={project.blurEnabled}
                    blurStrength={project.blurStrength}
                    onDurationChange={(videoDuration) => updateProject({ videoDuration })}
                    onBlurRegionsChange={(blurRegions) => updateProject({ blurRegions })}
                  />
                  <VideoEffectsEditor
                    subtitleStyle={project.subtitleStyle}
                    blurEnabled={project.blurEnabled}
                    blurStrength={project.blurStrength}
                    blurRegions={project.blurRegions}
                    onSubtitleStyleChange={(subtitleStyle) => updateProject({ subtitleStyle })}
                    onBlurEnabledChange={(blurEnabled) => updateProject({ blurEnabled })}
                    onBlurStrengthChange={(blurStrength) => updateProject({ blurStrength })}
                    onBlurRegionsChange={(blurRegions) => updateProject({ blurRegions })}
                  />
                </>
              ) : (
                <div className="text-center text-slate-500 py-12">No video to preview</div>
              )}
            </div>
          )}

          {/* Step 3: Export */}
          {step === 3 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Export your final video</h2>
                <p className="text-slate-400">Download the merged video with audio and subtitles</p>
              </div>
              <VideoExporter project={project} onExport={() => {}} />
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between max-w-2xl mx-auto mt-10 pt-6 border-t border-slate-800/60">
            <button
              onClick={() => step > 0 && setStep((step - 1) as 0 | 1 | 2 | 3)}
              disabled={step === 0}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            {step < 3 ? (
              <button
                onClick={() => canGoNext() && setStep((step + 1) as 0 | 1 | 2 | 3)}
                disabled={!canGoNext()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={resetProject}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Start New
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <RecapProvider>
      <AppContent />
    </RecapProvider>
  );
}
