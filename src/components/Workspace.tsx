import React, { useState, useRef } from 'react';
import { StudySession, ActiveTab, Flashcard, DifficultyRating, QuizQuestion } from '../types';
import { SummaryTab } from './tabs/SummaryTab';
import { KeyPointsTab } from './tabs/KeyPointsTab';
import { FlashcardsTab } from './tabs/FlashcardsTab';
import { QuizTab } from './tabs/QuizTab';
import { ExplanationTab } from './tabs/ExplanationTab';
import { StudyPlanTab } from './tabs/StudyPlanTab';
import { FormulaTab } from './tabs/FormulaTab';
import { ExamNotesTab } from './tabs/ExamNotesTab';
import { InteractiveVisualConcept } from './InteractiveVisualConcept';
import {
  Sparkles,
  ArrowRight,
  Upload,
  Camera,
  BookOpen,
  FileText,
  Layers,
  HelpCircle,
  Lightbulb,
  Calendar,
  Bookmark,
  Printer,
  Copy,
  Check,
  RotateCcw,
  Loader2,
  AlertCircle,
  Clock,
  Sliders,
  CheckCircle2,
  Sigma,
  Zap,
} from 'lucide-react';

interface WorkspaceProps {
  currentSession: StudySession | null;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onGenerate: (params: {
    topic: string;
    content: string;
    studyDays: number;
    dailyMinutes: number;
  }) => Promise<void>;
  isLoading: boolean;
  onSaveSession: (session: StudySession) => void;
  onUpdateFlashcardRating: (id: string, rating: DifficultyRating) => void;
  onUpdateFlashcards?: (cards: Flashcard[]) => void;
  onQuizComplete: (score: number, total: number) => void;
  onUpdateQuizQuestions?: (questions: QuizQuestion[]) => void;
  onExplainConcept: (concept: string) => Promise<void>;
  isCustomExplaining: boolean;
  onResetWorkspace: () => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  currentSession,
  activeTab,
  onTabChange,
  onGenerate,
  isLoading,
  onSaveSession,
  onUpdateFlashcardRating,
  onUpdateFlashcards,
  onQuizComplete,
  onUpdateQuizQuestions,
  onExplainConcept,
  isCustomExplaining,
  onResetWorkspace,
}) => {
  const [topicInput, setTopicInput] = useState(currentSession ? currentSession.topic : '');
  const [contentInput, setContentInput] = useState(currentSession ? currentSession.rawContent : '');
  const [studyDays, setStudyDays] = useState(4);
  const [dailyMinutes, setDailyMinutes] = useState(45);
  const [showConfig, setShowConfig] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [savedStatus, setSavedStatus] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  const handleProcessFile = async (file: File) => {
    setIsExtracting(true);
    setUploadStatusMsg(`Reading ${file.name}...`);

    const isImg = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    try {
      if (isImg || isPdf) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64Data = e.target?.result as string;
          setUploadStatusMsg('Extracting textbook & handwritten notes with AI...');

          try {
            const res = await fetch('/api/study/extract-content', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                base64Data,
                mimeType: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
                filename: file.name,
              }),
            });
            const data = await res.json();
            if (data.data) {
              setTopicInput(data.data.topic || file.name.replace(/\.[^/.]+$/, ''));
              setContentInput(data.data.extractedText || '');
              setUploadStatusMsg('✨ Study material extracted! Ready to generate study pack.');
              setTimeout(() => setUploadStatusMsg(null), 4000);
            }
          } catch (err) {
            console.error(err);
            setUploadStatusMsg('Extraction fallback used. You can edit the text below.');
          } finally {
            setIsExtracting(false);
          }
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setContentInput(text);
          if (!topicInput) {
            const cleanName = file.name.replace(/\.[^/.]+$/, '');
            setTopicInput(cleanName);
          }
          setIsExtracting(false);
          setUploadStatusMsg('✨ File loaded!');
          setTimeout(() => setUploadStatusMsg(null), 3000);
        };
        reader.readAsText(file);
      }
    } catch (e) {
      console.error(e);
      setIsExtracting(false);
      setUploadStatusMsg('Could not process file.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!contentInput.trim() && !topicInput.trim()) || isLoading) return;
    await onGenerate({
      topic: topicInput.trim(),
      content: contentInput.trim(),
      studyDays,
      dailyMinutes,
    });
  };

  const handleSave = () => {
    if (!currentSession) return;
    onSaveSession(currentSession);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleExportAll = () => {
    if (!currentSession) return;
    let full = `# STUDYFLOW AI REVISION PACKET: ${currentSession.topic}\n\n`;
    full += `## 1. SUMMARY\n${currentSession.summary}\n\n`;
    full += `## 2. KEY POINTS\n` + currentSession.keyPoints.map((kp, i) => `${i + 1}. ${kp}`).join('\n') + `\n\n`;
    full += `## 3. FLASHCARDS (${currentSession.flashcards.length})\n` +
      currentSession.flashcards.map((f, i) => `Q${i + 1}: ${f.front}\nA: ${f.back}`).join('\n\n') +
      `\n\n`;
    full += `## 4. PRACTICE QUIZ\n` +
      currentSession.quiz.map((q, i) => `Q${i + 1}: ${q.question}\nOptions:\n${q.options.map((o, oi) => `  [${String.fromCharCode(65 + oi)}] ${o}`).join('\n')}\nAnswer: Option ${String.fromCharCode(65 + q.correctIndex)}\nExplanation: ${q.explanation}`).join('\n\n') +
      `\n\n`;
    full += `## 5. SIMPLE EXPLANATION (FEYNMAN)\n${currentSession.explanation.simpleExplanation}\n\nAnalogy: "${currentSession.explanation.everydayAnalogy}"\n\n`;

    navigator.clipboard.writeText(full);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const tabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'summary', label: 'SUMMARY', icon: FileText },
    { id: 'formulas', label: 'FORMULAS & KEYS', icon: Sigma },
    { id: 'examNotes', label: 'EXAM BOOSTER', icon: Zap },
    { id: 'keyPoints', label: 'KEY POINTS', icon: Check },
    { id: 'flashcards', label: '3D FLASHCARDS', icon: Layers },
    { id: 'quiz', label: 'QUIZ', icon: HelpCircle },
    { id: 'explanation', label: 'EXPLANATION', icon: Lightbulb },
    { id: 'studyPlan', label: 'STUDY PLAN', icon: Calendar },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6 text-[#1C1E1B]">
      {/* 1. INPUT WORKSPACE AREA */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E0D3] shadow-[0_4px_24px_rgba(45,106,79,0.06)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E4D9] pb-4">
          <div>
            <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#2D6A4F]">
              AI Workspace
            </span>
            <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1C1E1B] mt-0.5">
              WHAT ARE YOU STUDYING?
            </h1>
          </div>

          {currentSession && (
            <button
              onClick={onResetWorkspace}
              className="self-start sm:self-auto text-xs font-semibold text-[#333830] hover:text-[#1C1E1B] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DCD6C7] bg-[#FAF8F5] hover:bg-[#F4EFE6] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#1B4332]" />
              Start New Topic
            </button>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Topic Title Input */}
          <div>
            <label
              htmlFor="study-topic-name"
              className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#333830] mb-1.5"
            >
              Subject or Topic Title (Optional)
            </label>
            <input
              id="study-topic-name"
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g., Photosynthesis & Light Reactions, Gradient Descent, Inflation & Central Banks..."
              className="w-full px-4 py-3 rounded-xl border border-[#DCD6C7] bg-[#FCFBF8] text-[#1C1E1B] placeholder:text-[#888E83] text-sm sm:text-base font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-600 transition-all"
            />
          </div>

          {/* Hidden inputs for native triggers */}
          <input
            type="file"
            ref={cameraInputRef}
            accept="image/*"
            capture="environment"
            onChange={(e) => e.target.files?.[0] && handleProcessFile(e.target.files[0])}
            className="hidden"
          />
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*,application/pdf,.txt,.md,.doc,.docx"
            onChange={(e) => e.target.files?.[0] && handleProcessFile(e.target.files[0])}
            className="hidden"
          />
          <input
            type="file"
            ref={pdfInputRef}
            accept="application/pdf"
            onChange={(e) => e.target.files?.[0] && handleProcessFile(e.target.files[0])}
            className="hidden"
          />

          {/* 3 Prominent Mobile Triggers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isExtracting}
              className="p-3.5 rounded-xl border border-[#DCD6C7] bg-[#FCFBF8] hover:border-[#1B4332] hover:bg-[#E3EDE5] transition-all text-left flex items-center gap-3 group cursor-pointer disabled:opacity-50"
            >
              <div className="w-9 h-9 rounded-lg bg-[#E3EDE5] text-[#1B4332] group-hover:bg-[#1B4332] group-hover:text-white transition-colors flex items-center justify-center flex-shrink-0">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-[#1C1E1B] group-hover:text-[#1B4332]">
                  Snap Notes Photo
                </div>
                <div className="text-[10px] text-[#6B7267]">Use phone camera</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isExtracting}
              className="p-3.5 rounded-xl border border-[#DCD6C7] bg-[#FCFBF8] hover:border-[#1B4332] hover:bg-[#E3EDE5] transition-all text-left flex items-center gap-3 group cursor-pointer disabled:opacity-50"
            >
              <div className="w-9 h-9 rounded-lg bg-[#E3EDE5] text-[#1B4332] group-hover:bg-[#1B4332] group-hover:text-white transition-colors flex items-center justify-center flex-shrink-0">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-[#1C1E1B] group-hover:text-[#1B4332]">
                  Upload Files / Gallery
                </div>
                <div className="text-[10px] text-[#6B7267]">Photos, downloads, docs</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => pdfInputRef.current?.click()}
              disabled={isExtracting}
              className="p-3.5 rounded-xl border border-[#DCD6C7] bg-[#FCFBF8] hover:border-[#1B4332] hover:bg-[#E3EDE5] transition-all text-left flex items-center gap-3 group cursor-pointer disabled:opacity-50"
            >
              <div className="w-9 h-9 rounded-lg bg-[#E3EDE5] text-[#1B4332] group-hover:bg-[#1B4332] group-hover:text-white transition-colors flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-[#1C1E1B] group-hover:text-[#1B4332]">
                  Book PDF Chapter
                </div>
                <div className="text-[10px] text-[#6B7267]">Textbooks & syllabus</div>
              </div>
            </button>
          </div>

          {/* Upload Status / Extraction Banner */}
          {uploadStatusMsg && (
            <div className="p-3 rounded-xl bg-[#E3EDE5] border border-[#2D6A4F]/30 text-[#1B4332] text-xs flex items-center gap-2">
              {isExtracting ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#1B4332]" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-[#1B4332]" />
              )}
              <span className="font-semibold">{uploadStatusMsg}</span>
            </div>
          )}

          {/* Large Notes Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="study-notes-content"
                className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#333830]"
              >
                Study Material, Raw Notes, or Article Text
              </label>
            </div>

            <textarea
              id="study-notes-content"
              rows={6}
              value={contentInput}
              onChange={(e) => setContentInput(e.target.value)}
              placeholder="Paste raw notes, textbook paragraphs, lecture transcripts, or revision bullet points here..."
              className="w-full p-4 rounded-2xl border border-[#DCD6C7] bg-[#FCFBF8] text-[#1C1E1B] placeholder:text-[#888E83] text-sm sm:text-base leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-600 transition-all"
            />
          </div>

          {/* Study Plan Settings Toggle */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="text-xs text-[#1B4332] hover:text-[#2D6A4F] font-mono-code font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-[#2D6A4F]" />
              {showConfig ? 'Hide Plan Settings' : 'Adjust Study Schedule Parameters'}
            </button>

            {showConfig && (
              <div className="mt-3 p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDCF] grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-150">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1E1B] mb-1">
                    Study Duration: {studyDays} Days
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="7"
                    value={studyDays}
                    onChange={(e) => setStudyDays(Number(e.target.value))}
                    className="w-full accent-[#1B4332]"
                  />
                  <div className="flex justify-between text-[10px] text-[#6B7267] font-mono-code">
                    <span>2 Days</span>
                    <span>7 Days</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1E1B] mb-1">
                    Available Time: {dailyMinutes} Minutes / Day
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="120"
                    step="15"
                    value={dailyMinutes}
                    onChange={(e) => setDailyMinutes(Number(e.target.value))}
                    className="w-full accent-[#1B4332]"
                  />
                  <div className="flex justify-between text-[10px] text-[#6B7267] font-mono-code">
                    <span>15 min</span>
                    <span>120 min</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Action Button */}
          <div className="pt-3 flex items-center justify-between">
            <span className="text-xs text-[#6B7267] font-mono-code">
              {contentInput.length > 0 ? `${contentInput.length} characters` : 'Ready to generate'}
            </span>

            <button
              id="workspace-generate-btn"
              type="submit"
              disabled={(!contentInput.trim() && !topicInput.trim()) || isLoading}
              className="px-8 py-3.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] disabled:bg-[#E2DDCF] disabled:text-[#888E83] text-[#FAF8F5] font-bold text-sm sm:text-base transition-all shadow-[0_4px_20px_rgba(27,67,50,0.25)] hover:shadow-[0_6px_28px_rgba(27,67,50,0.35)] active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#FAF8F5]" />
                  <span>Synthesizing Study Resources...</span>
                </>
              ) : (
                <>
                  <span>GENERATE PLAN</span>
                  <ArrowRight className="w-5 h-5 text-[#FAF8F5]" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. RESULTS SECTION */}
      {currentSession && (
        <div id="results-container" className="space-y-6 animate-in fade-in duration-300">
          {/* Results Action & Export Header */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5E0D3] shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-600 shadow-[0_0_6px_#10b981]" />
              <div>
                <h3 className="font-serif-display text-lg font-bold text-[#1C1E1B]">
                  {currentSession.topic}
                </h3>
                <span className="text-xs text-[#6B7267] font-mono-code">
                  Generated {new Date(currentSession.updatedAt || currentSession.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="save-session-btn"
                onClick={handleSave}
                className="px-3 py-1.5 rounded-lg border border-[#DCD6C7] hover:border-emerald-500 hover:bg-[#F4EFE6] text-xs font-semibold text-[#333830] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Bookmark className={`w-3.5 h-3.5 ${savedStatus ? 'text-[#1B4332] fill-[#1B4332]' : 'text-[#6B7267]'}`} />
                <span>{savedStatus ? 'Saved!' : 'Save Session'}</span>
              </button>

              <button
                id="copy-packet-btn"
                onClick={handleExportAll}
                className="px-3 py-1.5 rounded-lg border border-[#DCD6C7] hover:border-emerald-500 hover:bg-[#F4EFE6] text-xs font-semibold text-[#333830] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedAll ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#1B4332]" />
                    <span>Packet Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#6B7267]" />
                    <span>Copy Full Packet</span>
                  </>
                )}
              </button>

              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg border border-[#DCD6C7] hover:border-emerald-500 hover:bg-[#F4EFE6] text-xs font-semibold text-[#333830] transition-colors hidden sm:flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#6B7267]" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Clean Navigation Tabs */}
          <div className="flex items-center gap-1.5 border-b border-[#E8E4D9] pb-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}-btn`}
                  onClick={() => onTabChange(tab.id)}
                  className={`px-4 py-3 rounded-xl font-mono-code font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#1B4332] text-[#FAF8F5] shadow-[0_4px_14px_rgba(27,67,50,0.25)]'
                      : 'text-[#555A50] hover:text-[#1C1E1B] hover:bg-[#EFECE3]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#FAF8F5]' : 'text-[#6B7267]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab View Rendering */}
          <div className="pt-2 space-y-6">
            {/* Visual Animated Concept (shown in summary or explanation or if present) */}
            {currentSession.visualDiagram && (activeTab === 'summary' || activeTab === 'explanation') && (
              <InteractiveVisualConcept
                topic={currentSession.topic}
                diagramData={currentSession.visualDiagram}
              />
            )}

            {activeTab === 'summary' && (
              <SummaryTab topic={currentSession.topic} summary={currentSession.summary} />
            )}

            {activeTab === 'formulas' && (
              <FormulaTab
                topic={currentSession.topic}
                formulas={currentSession.formulas || []}
                keywords={currentSession.keywords || []}
                isProblemSolving={currentSession.isProblemSolvingSubject}
              />
            )}

            {activeTab === 'examNotes' && (
              <ExamNotesTab
                topic={currentSession.topic}
                examNotes={currentSession.examRevisionNotes}
              />
            )}

            {activeTab === 'keyPoints' && (
              <KeyPointsTab topic={currentSession.topic} keyPoints={currentSession.keyPoints} />
            )}

            {activeTab === 'flashcards' && (
              <FlashcardsTab
                topic={currentSession.topic}
                flashcards={currentSession.flashcards}
                rawContent={currentSession.rawContent || ''}
                onRatingUpdate={onUpdateFlashcardRating}
                onUpdateCards={onUpdateFlashcards}
              />
            )}

            {activeTab === 'quiz' && (
              <QuizTab
                topic={currentSession.topic}
                questions={currentSession.quiz || []}
                rawContent={currentSession.rawContent || ''}
                onQuizCompleted={onQuizComplete}
                onUpdateQuestions={onUpdateQuizQuestions}
              />
            )}

            {activeTab === 'explanation' && (
              <ExplanationTab
                topic={currentSession.topic}
                explanation={currentSession.explanation}
                onExplainCustomConcept={onExplainConcept}
                isLoadingCustom={isCustomExplaining}
              />
            )}

            {activeTab === 'studyPlan' && (
              <StudyPlanTab topic={currentSession.topic} studyPlan={currentSession.studyPlan} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
