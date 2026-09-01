import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  Clock,
  Zap,
  BookOpen,
  Sigma,
  FileText,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { NoteItem } from '../types';

interface DeepNoteAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicTitle: string;
  sourceLabel?: string;
  generatedNote: NoteItem | null;
  isLoadingBackend: boolean;
  onComplete: (note: NoteItem) => void;
}

const ANALYSIS_STAGES = [
  {
    id: 1,
    timeRange: '0s - 15s',
    title: 'Multimodal OCR & Document Analysis',
    icon: FileText,
    color: 'emerald',
    description: 'Scanning pages, transcribing handwriting, reading math symbols & scientific notations...',
    subtasks: [
      'Optical text and diagram detection',
      'Handwritten character and formula parsing',
      'Structural hierarchy & margin note mapping',
    ],
  },
  {
    id: 2,
    timeRange: '15s - 30s',
    title: 'Academic Syllabus & Theorem Dissection',
    icon: BookOpen,
    color: 'blue',
    description: 'Deconstructing core principles, governing scientific laws, and formal derivations...',
    subtasks: [
      'Mapping standard curriculum syllabus',
      'Verifying core theorems and mechanisms',
      'Dissecting step-by-step problem logic',
    ],
  },
  {
    id: 3,
    timeRange: '30s - 45s',
    title: 'High-Yield Mining (Formulas, Keywords & Pitfalls)',
    icon: Sigma,
    color: 'purple',
    description: 'Extracting key vocabulary, mathematical equations with SI units & exam alerts...',
    subtasks: [
      'Extracting mathematical & physics formulas with SI units',
      'Compiling bold high-yield academic vocabulary',
      'Identifying common exam traps and boundary conditions',
    ],
  },
  {
    id: 4,
    timeRange: '45s - 60s',
    title: 'Master Notes Synthesis & Organization',
    icon: Layers,
    color: 'amber',
    description: 'Synthesizing executive summary, full markdown textbook notes, 3D flashcards & quiz...',
    subtasks: [
      'Generating comprehensive executive summary',
      'Formatting textbook-grade master notes body',
      'Generating active-recall flashcards & practice quiz',
    ],
  },
];

const TELEMETRY_LOGS = [
  'Initializing multimodal vision OCR engine...',
  'Processing uploaded notebook/book material...',
  'Extracted 18 core academic terminology tokens...',
  'Identified governing scientific principles and relationships...',
  'Compiling mathematical derivations and LaTeX equations...',
  'Checking SI units and variable breakdown definitions...',
  'Detecting high-yield exam traps & boundary constraints...',
  'Synthesizing multi-paragraph executive summary...',
  'Structuring comprehensive Markdown notes with bold keywords...',
  'Generating 3D active-recall flashcards and diagnostic quiz...',
  'Master notes synthesized and categorized for revision!',
];

export const DeepNoteAnalysisModal: React.FC<DeepNoteAnalysisModalProps> = ({
  isOpen,
  onClose,
  topicTitle,
  sourceLabel = 'Uploaded Study Material',
  generatedNote,
  isLoadingBackend,
  onComplete,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [logIndex, setLogIndex] = useState<number>(0);
  const totalTargetSeconds = 60;

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setElapsedSeconds(0);
      setLogIndex(0);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setElapsedSeconds(0);
    setLogIndex(0);

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        // Update telemetry log periodically
        const logStep = Math.min(
          TELEMETRY_LOGS.length - 1,
          Math.floor((next / totalTargetSeconds) * TELEMETRY_LOGS.length)
        );
        setLogIndex(logStep);

        if (next >= totalTargetSeconds) {
          if (timerRef.current) clearInterval(timerRef.current);
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  // When 60s timer reaches 60, and we have the note from the backend
  useEffect(() => {
    if (elapsedSeconds >= totalTargetSeconds && generatedNote) {
      const finishTimeout = setTimeout(() => {
        onComplete(generatedNote);
      }, 600);
      return () => clearTimeout(finishTimeout);
    }
  }, [elapsedSeconds, generatedNote, onComplete]);

  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.round((elapsedSeconds / totalTargetSeconds) * 100));
  const remainingSeconds = Math.max(0, totalTargetSeconds - elapsedSeconds);

  // Determine current active stage (1 to 4)
  const currentStageIndex = Math.min(3, Math.floor(elapsedSeconds / 15));
  const currentStage = ANALYSIS_STAGES[currentStageIndex];

  const handleFastTrack = () => {
    if (generatedNote) {
      onComplete(generatedNote);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in text-[#1C1E1B]">
      <div className="bg-[#FAF8F5] w-full max-w-2xl rounded-3xl border border-[#E8E4D9] shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
        {/* Header with Live 60s Badge */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E4D9]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center shadow-lg relative">
              <Sparkles className="w-6 h-6 text-emerald-300 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-code font-bold uppercase tracking-wider bg-[#E3EDE5] text-[#1B4332]">
                  60s Deep Academic Analysis
                </span>
                <span className="text-xs font-mono-code text-[#6B7267]">
                  {sourceLabel}
                </span>
              </div>
              <h2 className="font-serif-display font-bold text-xl sm:text-2xl text-[#1C1E1B] mt-0.5">
                Synthesizing Master Study Notes
              </h2>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-mono-code font-extrabold text-[#1B4332]">
              {remainingSeconds > 0 ? `${remainingSeconds}s` : 'Ready!'}
            </div>
            <div className="text-[10px] uppercase font-bold text-[#6B7267] tracking-wider">
              {remainingSeconds > 0 ? 'Analyzing...' : 'Complete!'}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#4B5047]">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#1B4332]" />
              <span>Topic: <strong>{topicTitle || 'Comprehensive Study Notes'}</strong></span>
            </span>
            <span className="font-mono-code text-[#1B4332] font-bold">{progressPercent}%</span>
          </div>

          <div className="h-3 w-full bg-[#EAE4D5] rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-linear-to-r from-[#1B4332] via-[#2D6A4F] to-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 4 Multi-Stage Visual Roadmap */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          {ANALYSIS_STAGES.map((stage, idx) => {
            const isPassed = currentStageIndex > idx;
            const isCurrent = currentStageIndex === idx;
            const Icon = stage.icon;

            return (
              <div
                key={stage.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-white border-[#1B4332] shadow-md ring-2 ring-[#1B4332]/20'
                    : isPassed
                    ? 'bg-[#E3EDE5]/60 border-[#2D6A4F]/30 text-[#1B4332]'
                    : 'bg-[#F4EFE6]/70 border-[#E8E4D9] text-[#8A9085] opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isCurrent
                          ? 'bg-[#1B4332] text-white shadow-xs animate-pulse'
                          : isPassed
                          ? 'bg-[#2D6A4F] text-white'
                          : 'bg-[#DCD6C7] text-[#6B7267]'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="text-[10px] font-mono-code font-bold uppercase text-[#6B7267]">
                        Stage {stage.id} ({stage.timeRange})
                      </div>
                      <div className="font-bold text-xs text-[#1C1E1B] leading-tight">
                        {stage.title}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-[#555A51] leading-relaxed mb-2">
                  {stage.description}
                </p>

                {isCurrent && (
                  <div className="space-y-1 pt-1.5 border-t border-[#E8E4D9]">
                    {stage.subtasks.map((task, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10px] text-[#1B4332] font-medium">
                        <Loader2 className="w-2.5 h-2.5 animate-spin text-emerald-600 shrink-0" />
                        <span>{task}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Live Terminal Telemetry Log Box */}
        <div className="mt-5 p-3.5 rounded-xl bg-[#1C1E1B] text-[#FAF8F5] font-mono-code text-xs space-y-1.5 shadow-inner">
          <div className="flex items-center justify-between text-[10px] text-emerald-400 uppercase tracking-wider pb-1 border-b border-white/10 font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>AI Pedagogical Synthesis Engine</span>
            </span>
            <span>T+{elapsedSeconds}s / 60s</span>
          </div>

          <div className="flex items-center gap-2 text-emerald-300 text-[11px] pt-1">
            <span className="text-white/40">&gt;</span>
            <span className="animate-pulse">{TELEMETRY_LOGS[logIndex]}</span>
          </div>
        </div>

        {/* Fast-Track Option / Direct Action */}
        <div className="mt-6 pt-4 border-t border-[#E8E4D9] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#6B7267] flex items-center gap-1.5 text-center sm:text-left">
            <ShieldCheck className="w-4 h-4 text-[#2D6A4F] shrink-0" />
            <span>
              {generatedNote
                ? '✨ Master notes synthesized! Deep pedagogical verification in progress.'
                : 'Extracting formulas, keywords, keypoints, and exam tips...'}
            </span>
          </div>

          {generatedNote ? (
            <button
              onClick={handleFastTrack}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 animate-bounce"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>View Master Notes Now (Skip Wait)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1B4332]">
              <Loader2 className="w-4 h-4 animate-spin text-[#1B4332]" />
              <span>Analyzing academic content...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
