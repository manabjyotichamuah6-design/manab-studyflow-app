import React, { useState } from 'react';
import { SubjectItem, UserProfile, DoubtItem, NoteItem, FileAttachmentData } from '../types';
import {
  HelpCircle,
  Sparkles,
  Send,
  Loader2,
  Paperclip,
  Image as ImageIcon,
  CheckCircle2,
  Bookmark,
  Sigma,
  AlertTriangle,
  Lightbulb,
  FileText,
  Trash2,
  Copy,
  Check,
  GraduationCap,
  Camera,
} from 'lucide-react';
import { useCameraAccess } from '../hooks/useCameraAccess';
import { CameraCaptureModal } from './CameraCaptureModal';

interface DoubtSolverViewProps {
  userProfile?: UserProfile | null;
  subjects: SubjectItem[];
  savedDoubts?: DoubtItem[];
  onSaveAsNote?: (note: NoteItem) => void;
  onSaveDoubtNote?: (note: Partial<NoteItem>) => void;
  onStartFlashcards?: (topic: string, subject: string) => void;
  onSelectSubject?: (subjectId: string) => void;
  onNavigate?: (view: any) => void;
}

export const DoubtSolverView: React.FC<DoubtSolverViewProps> = ({
  userProfile,
  subjects,
  savedDoubts = [],
  onSaveAsNote,
  onSaveDoubtNote,
  onStartFlashcards,
  onSelectSubject,
  onNavigate,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>(
    subjects[0]?.name || 'Physics'
  );
  const [doubtText, setDoubtText] = useState('');
  const [tutorMode, setTutorMode] = useState<
    'direct' | 'step_by_step' | 'concept_breakdown' | 'hint'
  >('direct');
  const [attachment, setAttachment] = useState<FileAttachmentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDoubtResult, setCurrentDoubtResult] = useState<DoubtItem | null>(null);
  const [savedNotesAlert, setSavedNotesAlert] = useState(false);
  const [copiedSolution, setCopiedSolution] = useState(false);

  const cameraAccess = useCameraAccess();

  const handleCameraSnap = () => {
    cameraAccess.requestCamera((base64Image, filename) => {
      setAttachment({
        name: filename,
        type: 'image/jpeg',
        base64Data: base64Image,
        isImage: true,
      });
    });
  };

  // Suggested prompt quick triggers tailored for solver actions
  const promptTriggers = [
    { label: 'Solve numerical step-by-step', icon: '🔢', text: 'Please solve this numerical problem with full working, formulas, and SI units:' },
    { label: 'Give direct answer & final result', icon: '⚡', text: 'Give me the direct, exact final answer and calculation for:' },
    { label: 'Concept breakdown & derivation', icon: '💡', text: 'Prove and derive this formula step-by-step with concept breakdown:' },
    { label: 'Balance chemical reaction & mechanism', icon: '⚗️', text: 'Balance this reaction, show oxidation states, and explain the mechanism for:' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        type: file.type,
        size: file.size,
        base64Data: reader.result as string,
        isImage: file.type.startsWith('image/'),
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSolveDoubt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!doubtText.trim() && !attachment) return;

    setIsLoading(true);
    setCurrentDoubtResult(null);

    try {
      const response = await fetch('/api/study/solve-doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: doubtText.trim(),
          subject: selectedSubject,
          gradeLevel: userProfile?.gradeLevel || 'class-11-12-pcm',
          mode: tutorMode,
          attachment: attachment,
        }),
      });

      const json = await response.json();
      if (json.data) {
        setCurrentDoubtResult(json.data);
      }
    } catch (err) {
      console.error('Error solving doubt:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsStudyNote = () => {
    if (!currentDoubtResult) return;

    const noteContent = `### 🎯 Final Answer / Direct Solution:\n${currentDoubtResult.finalAnswer || currentDoubtResult.answer}\n\n### 📖 Full Solution & Explanation:\n${currentDoubtResult.answer}\n\n${currentDoubtResult.stepByStep?.length ? `### 🔢 Step-by-Step Derivation:\n${currentDoubtResult.stepByStep.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n` : ''}${currentDoubtResult.verification ? `### 🔍 Verification:\n${currentDoubtResult.verification}\n\n` : ''}${currentDoubtResult.analogy ? `### 💡 Real-World Analogy:\n"${currentDoubtResult.analogy}"\n\n` : ''}${currentDoubtResult.examTip ? `### ⚡ High-Yield Exam Tip:\n${currentDoubtResult.examTip}\n` : ''}`;

    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: `Solution: ${currentDoubtResult.question.slice(0, 45)}...`,
      subject: currentDoubtResult.subject || selectedSubject,
      topic: currentDoubtResult.keyConcept || selectedSubject,
      content: noteContent,
      tags: ['Doubt Solved', selectedSubject, 'Step-by-Step'],
      formulas: currentDoubtResult.formulas,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (onSaveAsNote) {
      onSaveAsNote(newNote);
    } else if (onSaveDoubtNote) {
      onSaveDoubtNote(newNote);
    }

    setSavedNotesAlert(true);
    setTimeout(() => setSavedNotesAlert(false), 3000);
  };

  const handleCopySolution = () => {
    if (!currentDoubtResult) return;
    const text = `QUESTION: ${currentDoubtResult.question}\n\n🎯 FINAL ANSWER:\n${currentDoubtResult.finalAnswer || currentDoubtResult.answer}\n\n📖 COMPLETE SOLUTION:\n${currentDoubtResult.answer}\n\n🔢 STEP-BY-STEP WORKING:\n${(currentDoubtResult.stepByStep || []).join('\n')}\n\n${currentDoubtResult.verification ? `VERIFICATION:\n${currentDoubtResult.verification}\n\n` : ''}EXAM TIP:\n${currentDoubtResult.examTip || ''}`;
    navigator.clipboard.writeText(text);
    setCopiedSolution(true);
    setTimeout(() => setCopiedSolution(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-[#1C1E1B]">
      {/* Top Banner / Academic Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E8E4D9]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4332] bg-[#E8F5E9] border border-emerald-300 px-2.5 py-0.5 rounded flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              AI Academic Problem Solver
            </span>
            <span className="text-xs text-[#555A50]">
              Class / Standard: <strong className="text-[#1B4332] font-mono-code">{userProfile?.gradeLabel || userProfile?.gradeLevel || 'Senior Secondary'}</strong>
            </span>
          </div>
          <h1 className="font-serif-display text-3xl font-semibold text-[#1C1E1B] mt-1.5">
            Instant Doubt & Problem Solver
          </h1>
          <p className="text-sm text-[#555A50] mt-1">
            Get direct solutions, step-by-step mathematical proofs, and concept breakdowns — not vague advice. Enter any problem, numerical, theorem, or question photo below.
          </p>
        </div>
      </div>

      {/* Main Doubt Input Station */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E0D3] shadow-xs space-y-6">
        {/* Subject & Teaching Style Selection Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#333830] mb-2">
              Select Subject:
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#DCD6C7] bg-[#FAF8F5] text-[#1C1E1B] font-medium text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-600"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.name}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#333830] mb-2">
              Teaching & Solver Style:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setTutorMode('direct')}
                className={`py-2 px-2.5 rounded-xl border font-semibold transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-0.5 ${
                  tutorMode === 'direct'
                    ? 'bg-[#1B4332] text-[#FAF8F5] border-[#1B4332] shadow-xs'
                    : 'bg-[#FAF8F5] text-[#333830] border-[#DCD6C7] hover:bg-[#F4EFE6]'
                }`}
              >
                <span className="font-bold flex items-center gap-1">⚡ Direct Answer</span>
                <span className={`text-[10px] ${tutorMode === 'direct' ? 'text-emerald-100' : 'text-[#6B7267]'}`}>Exact solution first</span>
              </button>

              <button
                type="button"
                onClick={() => setTutorMode('step_by_step')}
                className={`py-2 px-2.5 rounded-xl border font-semibold transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-0.5 ${
                  tutorMode === 'step_by_step'
                    ? 'bg-[#1B4332] text-[#FAF8F5] border-[#1B4332] shadow-xs'
                    : 'bg-[#FAF8F5] text-[#333830] border-[#DCD6C7] hover:bg-[#F4EFE6]'
                }`}
              >
                <span className="font-bold flex items-center gap-1">🔢 Step-by-Step</span>
                <span className={`text-[10px] ${tutorMode === 'step_by_step' ? 'text-emerald-100' : 'text-[#6B7267]'}`}>Full derivation</span>
              </button>

              <button
                type="button"
                onClick={() => setTutorMode('concept_breakdown')}
                className={`py-2 px-2.5 rounded-xl border font-semibold transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-0.5 ${
                  tutorMode === 'concept_breakdown'
                    ? 'bg-[#1B4332] text-[#FAF8F5] border-[#1B4332] shadow-xs'
                    : 'bg-[#FAF8F5] text-[#333830] border-[#DCD6C7] hover:bg-[#F4EFE6]'
                }`}
              >
                <span className="font-bold flex items-center gap-1">💡 Concept Breakdown</span>
                <span className={`text-[10px] ${tutorMode === 'concept_breakdown' ? 'text-emerald-100' : 'text-[#6B7267]'}`}>Deep mechanism</span>
              </button>

              <button
                type="button"
                onClick={() => setTutorMode('hint')}
                className={`py-2 px-2.5 rounded-xl border font-semibold transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-0.5 ${
                  tutorMode === 'hint'
                    ? 'bg-amber-100 text-amber-900 border-amber-400 font-bold shadow-xs'
                    : 'bg-[#FAF8F5] text-[#333830] border-[#DCD6C7] hover:bg-[#F4EFE6]'
                }`}
              >
                <span className="font-bold flex items-center gap-1">🎯 Guiding Hint</span>
                <span className={`text-[10px] ${tutorMode === 'hint' ? 'text-amber-800' : 'text-[#6B7267]'}`}>Self-paced clue</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Question Starters */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono-code uppercase font-semibold text-[#6B7267]">
            Quick Problem Starters:
          </span>
          <div className="flex flex-wrap gap-2">
            {promptTriggers.map((trig, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setDoubtText(trig.text + ' ')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#DCD6C7] text-xs text-[#333830] hover:bg-[#F4EFE6] hover:text-[#1C1E1B] transition-colors cursor-pointer"
              >
                <span>{trig.icon}</span>
                <span>{trig.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Textarea for Doubt Question */}
        <form onSubmit={handleSolveDoubt} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="doubt-query-input" className="block text-xs font-semibold uppercase tracking-wider text-[#1C1E1B]">
              Enter Your Doubt, Problem, Equation, or Theorem:
            </label>
            <textarea
              id="doubt-query-input"
              rows={4}
              value={doubtText}
              onChange={(e) => setDoubtText(e.target.value)}
              placeholder={`e.g., A 2kg ball is thrown upwards at 15 m/s. Calculate maximum height and time of flight with g = 9.8 m/s².\nOr paste an organic reaction, math integral, or accounting journal entry...`}
              className="w-full p-4 rounded-xl border border-[#DCD6C7] bg-[#FAF8F5] text-[#1C1E1B] placeholder:text-[#888E83] text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-600 leading-relaxed font-normal"
            />
          </div>

          {/* Attachment Preview (if uploaded) */}
          {attachment && (
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DCD6C7] flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                {attachment.isImage ? (
                  <ImageIcon className="w-4 h-4 text-[#1B4332] shrink-0" />
                ) : (
                  <FileText className="w-4 h-4 text-[#1B4332] shrink-0" />
                )}
                <span className="font-mono-code truncate font-medium text-[#1C1E1B]">
                  {attachment.name}
                </span>
                {attachment.size && (
                  <span className="text-[#888E83]">({Math.round(attachment.size / 1024)} KB)</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="text-[#888E83] hover:text-rose-600 transition-colors p-1 cursor-pointer"
                title="Remove attachment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Action Row: Attach Photo / File & Solve Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="btn-doubt-camera-snap"
                type="button"
                onClick={handleCameraSnap}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#1B4332]/40 bg-[#E8F5E9] hover:bg-[#D8F3DC] text-[#1B4332] text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <Camera className="w-4 h-4" />
                <span>Snap Question with Camera</span>
              </button>

              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#DCD6C7] bg-white hover:bg-[#FAF8F5] text-[#333830] text-xs font-semibold transition-colors cursor-pointer shadow-xs">
                <Paperclip className="w-4 h-4 text-[#1B4332]" />
                <span>Attach Files</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={(!doubtText.trim() && !attachment) || isLoading}
              className="px-6 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] disabled:bg-[#E2DDCF] disabled:text-[#888E83] text-[#FAF8F5] text-xs font-bold transition-all shadow-[0_4px_14px_rgba(27,67,50,0.2)] flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#FAF8F5]" />
                  <span>Solving Problem Step-by-Step...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#FAF8F5]" />
                  <span>Solve Doubt Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Solved Doubt Professor & Solver Breakdown Card */}
      {currentDoubtResult && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E0D3] shadow-md space-y-6 animate-in fade-in duration-300">
          {/* Top Result Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E4D9] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono-code font-bold uppercase tracking-wider text-[#1B4332] bg-[#E8F5E9] border border-emerald-300 px-2.5 py-0.5 rounded">
                  🎯 Verified Academic Solution
                </span>
                <span className="text-[11px] font-mono-code text-[#6B7267] bg-[#FAF8F5] border border-[#E2DDCF] px-2 py-0.5 rounded">
                  Style: {tutorMode === 'direct' ? 'Direct Answer' : tutorMode === 'step_by_step' ? 'Step-by-Step Derivation' : tutorMode === 'concept_breakdown' ? 'Concept Breakdown' : 'Guiding Hint'}
                </span>
              </div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#1C1E1B] mt-1.5">
                {currentDoubtResult.keyConcept || 'Direct Solution & Core Principle'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySolution}
                className="p-2 rounded-lg border border-[#DCD6C7] bg-white hover:bg-[#FAF8F5] text-[#333830] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {copiedSolution ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#1B4332]" />
                    <span>Copied Solution</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#6B7267]" />
                    <span>Copy Solution</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSaveAsStudyNote}
                className="px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save to Revision Notes</span>
              </button>
            </div>
          </div>

          {/* Success Banner if Saved */}
          {savedNotesAlert && (
            <div className="p-3 rounded-xl bg-[#E8F5E9] border border-emerald-300 text-[#1B4332] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Doubt solution saved to your Revision Notes!</span>
            </div>
          )}

          {/* Prominent FINAL ANSWER Card */}
          {currentDoubtResult.finalAnswer && (
            <div className="p-5 rounded-2xl bg-[#E8F5E9]/80 border-2 border-emerald-500/80 shadow-xs space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4332]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Final Answer & Direct Solution:</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-[#0D2818] font-sans leading-relaxed">
                {currentDoubtResult.finalAnswer}
              </div>
            </div>
          )}

          {/* 1. Core Professor Explanation & Full Solution */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#1B4332] flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Comprehensive Academic Solution:
            </div>
            <p className="text-base text-[#2C302A] leading-relaxed font-normal whitespace-pre-line">
              {currentDoubtResult.answer}
            </p>
          </div>

          {/* 2. Step-by-Step Logic Breakdown */}
          {currentDoubtResult.stepByStep && currentDoubtResult.stepByStep.length > 0 && (
            <div className="bg-[#FAF8F5] rounded-xl p-5 border border-[#E2DDCF] space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#1B4332]">
                Step-by-Step Derivation & Methodical Calculation:
              </div>
              <div className="space-y-2.5">
                {currentDoubtResult.stepByStep.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#1C1E1B] bg-white p-3 rounded-lg border border-[#E8E4D9]">
                    <span className="w-6 h-6 rounded-full bg-[#1B4332] text-[#FAF8F5] font-mono-code font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed font-normal">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Formulas & Equations involved */}
          {currentDoubtResult.formulas && currentDoubtResult.formulas.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#333830] flex items-center gap-2">
                <Sigma className="w-4 h-4 text-[#1B4332]" />
                Applicable Governing Formulas & Laws:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentDoubtResult.formulas.map((form, fIdx) => (
                  <div key={fIdx} className="bg-white p-4 rounded-xl border border-[#E5E0D3] space-y-1.5 shadow-xs">
                    <span className="font-mono-code font-bold text-xs text-[#1B4332] block">
                      {form.name}
                    </span>
                    <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E2DDCF] font-mono-code text-sm font-bold text-center text-[#1B4332] overflow-x-auto">
                      {form.formula}
                    </div>
                    <p className="text-xs text-[#555A50] leading-relaxed">{form.explanation}</p>
                    {form.units && (
                      <span className="text-[10px] font-mono-code text-[#6B7267] block">
                        SI Units: {form.units}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Verification / Sanity Check */}
          {currentDoubtResult.verification && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3 text-xs sm:text-sm text-blue-950">
              <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold mb-0.5 text-blue-900">Mathematical & Dimensional Verification:</strong>
                <span>{currentDoubtResult.verification}</span>
              </div>
            </div>
          )}

          {/* 5. Real-World Analogy */}
          {currentDoubtResult.analogy && (
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDCF] space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#1B4332]">
                Intuitive Real-World Analogy:
              </div>
              <p className="text-xs sm:text-sm font-serif-display italic text-[#1C1E1B] leading-relaxed">
                "{currentDoubtResult.analogy}"
              </p>
            </div>
          )}

          {/* 6. Exam Tip & Common Trap */}
          {currentDoubtResult.examTip && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-300 flex items-start gap-3 text-xs sm:text-sm text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold mb-0.5">Professor Exam Tip:</strong>
                <span>{currentDoubtResult.examTip}</span>
              </div>
            </div>
          )}

          {/* 7. Drill Follow-Up Questions */}
          {currentDoubtResult.suggestedQuestions && currentDoubtResult.suggestedQuestions.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#E8E4D9]">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#6B7267]">
                Test Yourself with Follow-up Drills:
              </div>
              <div className="flex flex-wrap gap-2">
                {currentDoubtResult.suggestedQuestions.map((q, qIdx) => (
                  <button
                    key={qIdx}
                    onClick={() => {
                      setDoubtText(q);
                      window.scrollTo({ top: 150, behavior: 'smooth' });
                    }}
                    className="p-2 px-3 rounded-lg bg-[#FAF8F5] border border-[#DCD6C7] text-xs text-[#1C1E1B] hover:bg-[#E8F5E9] hover:border-emerald-500 transition-colors text-left cursor-pointer"
                  >
                    👉 {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Camera Capture Viewfinder Modal */}
      <CameraCaptureModal
        isOpen={cameraAccess.isCaptureModalOpen}
        onClose={cameraAccess.closeCaptureModal}
        initialMode={cameraAccess.activeMode}
        onCapture={cameraAccess.handleCapturePhoto}
        onCaptureMultiple={cameraAccess.handleCaptureMultiple}
        onCaptureVideo={cameraAccess.handleCaptureVideo}
      />
    </div>
  );
};
