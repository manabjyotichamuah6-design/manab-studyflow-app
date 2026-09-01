import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Layers,
  AlertCircle,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { QuizQuestion } from '../../types';

interface GenerateQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionsGenerated: (questions: QuizQuestion[], replaceExisting: boolean) => void;
  topic: string;
  rawContent?: string;
}

export const GenerateQuizModal: React.FC<GenerateQuizModalProps> = ({
  isOpen,
  onClose,
  onQuestionsGenerated,
  topic,
  rawContent = '',
}) => {
  const [questionCountInput, setQuestionCountInput] = useState<string>('5');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'advanced'>('medium');
  const [questionType, setQuestionType] = useState<'mcq' | 'true_false' | 'mixed'>('mcq');
  const [focusPrompt, setFocusPrompt] = useState<string>('');
  const [replaceExisting, setReplaceExisting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCountChange = (val: string) => {
    setQuestionCountInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 50) {
      setErrorMessage(null);
    }
  };

  const handleGenerate = async () => {
    const parsed = parseInt(questionCountInput, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 50) {
      setErrorMessage('Please enter a valid number of questions between 1 and 50.');
      return;
    }

    const finalCount = Math.min(Math.max(parsed, 1), 50);

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/study/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic || 'Study Material',
          content: rawContent || `Comprehensive practice questions on ${topic}`,
          questionCount: finalCount,
          difficulty,
          questionType,
          focusPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate practice quiz questions.');
      }

      const resData = await response.json();
      const generated = resData.data;

      if (Array.isArray(generated) && generated.length > 0) {
        onQuestionsGenerated(generated, replaceExisting);
        onClose();
      } else {
        throw new Error('No quiz questions were returned by the generator.');
      }
    } catch (err: any) {
      console.error('Generate quiz error:', err);
      setErrorMessage(err.message || 'Error creating questions with AI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentCount = parseInt(questionCountInput, 10) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5E0D3] w-full max-w-xl rounded-3xl shadow-2xl p-6 sm:p-8 text-[#1C1E1B] space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E4D9] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#1C1E1B]">
                Generate AI Quiz Questions
              </h2>
              <p className="text-xs text-[#6B7267]">
                Specify your preferred number of test questions and difficulty.
              </p>
            </div>
          </div>
          <button
            id="close-generate-quiz-modal-btn"
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-xl text-[#6B7267] hover:text-[#1C1E1B] hover:bg-[#F4EFE6] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-5">
          {/* Direct Input for Number of Questions (1 - 50) */}
          <div className="space-y-2">
            <label className="block text-xs font-mono-code uppercase font-semibold text-[#555A50]">
              Number of Questions to Take Test (1 - 50) <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-3 bg-[#FAF8F5] p-3.5 border border-[#DCD6C7] rounded-2xl">
              <input
                id="custom-question-count-input"
                type="number"
                min="1"
                max="50"
                value={questionCountInput}
                onChange={(e) => handleCountChange(e.target.value)}
                placeholder="Enter number (e.g. 5, 12, 25, 50)"
                className="w-32 sm:w-40 p-2.5 bg-white border border-[#D0C9BA] rounded-xl text-lg font-bold text-center text-[#1C1E1B] focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
              <div className="flex-1 text-xs text-[#555A50] leading-snug">
                <span className="font-semibold text-[#1C1E1B] block">
                  Write your preferred question count
                </span>
                <span>Higher limit is up to 50 questions per test.</span>
              </div>
            </div>
          </div>

          {/* Difficulty Level Selection */}
          <div>
            <label className="block text-xs font-mono-code uppercase font-semibold text-[#555A50] mb-2">
              Select Difficulty Level
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {(
                [
                  {
                    id: 'easy',
                    title: 'Easy',
                    desc: 'Foundational recall & key definitions',
                    color: 'border-emerald-300 bg-emerald-50 text-emerald-900',
                  },
                  {
                    id: 'medium',
                    title: 'Medium',
                    desc: 'Conceptual application & scenarios',
                    color: 'border-amber-300 bg-amber-50 text-amber-900',
                  },
                  {
                    id: 'hard',
                    title: 'Hard / Advanced',
                    desc: 'Multi-step reasoning & exam traps',
                    color: 'border-rose-300 bg-rose-50 text-rose-900',
                  },
                ] as const
              ).map((lvl) => {
                const isSelected = difficulty === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    id={`gen-difficulty-${lvl.id}`}
                    onClick={() => setDifficulty(lvl.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? `${lvl.color} ring-2 ring-blue-600 shadow-xs`
                        : 'bg-[#FAF8F5] border-[#DCD6C7] text-[#555A50] hover:bg-[#F4EFE6]'
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm text-[#1C1E1B] flex items-center justify-between">
                      <span>{lvl.title}</span>
                    </div>
                    <p className="text-[11px] text-[#6B7267] mt-1 leading-tight">{lvl.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Format */}
          <div>
            <label className="block text-xs font-mono-code uppercase font-semibold text-[#555A50] mb-1.5">
              Question Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'mcq', label: '4 Options (MCQ)' },
                  { id: 'true_false', label: 'True / False' },
                  { id: 'mixed', label: 'Mixed Format' },
                ] as const
              ).map((fmt) => {
                const isSelected = questionType === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    id={`gen-format-${fmt.id}`}
                    onClick={() => setQuestionType(fmt.id)}
                    className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400 text-blue-900 ring-1 ring-blue-400 font-bold'
                        : 'bg-[#FAF8F5] border-[#DCD6C7] text-[#555A50] hover:bg-[#F4EFE6]'
                    }`}
                  >
                    {fmt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Specific Focus Prompt (Optional) */}
          <div>
            <label className="block text-xs font-mono-code uppercase font-semibold text-[#555A50] mb-1.5">
              Specific Topic Focus / Sub-topics (Optional)
            </label>
            <input
              id="gen-focus-prompt-input"
              type="text"
              value={focusPrompt}
              onChange={(e) => setFocusPrompt(e.target.value)}
              placeholder="e.g. Emphasize calculations, numerical problems, or tricky formulas..."
              className="w-full p-3 bg-[#FAF8F5] border border-[#DCD6C7] rounded-xl text-xs sm:text-sm text-[#1C1E1B] placeholder-[#888E83] focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>

          {/* Append vs Replace Choice */}
          <div className="p-3 bg-[#FAF8F5] border border-[#E2DDCF] rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#333830]">
              <Layers className="w-4 h-4 text-blue-600 shrink-0" />
              <span>How to add questions to current test:</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="mode-append-btn"
                onClick={() => setReplaceExisting(false)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !replaceExisting
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-[#555A50] border border-[#DCD6C7]'
                }`}
              >
                + Append (+{currentCount > 0 ? currentCount : 5})
              </button>
              <button
                type="button"
                id="mode-replace-btn"
                onClick={() => setReplaceExisting(true)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  replaceExisting
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-[#555A50] border border-[#DCD6C7]'
                }`}
              >
                Replace All
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#E8E4D9]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#DCD6C7] bg-white text-[#555A50] hover:bg-[#F4EFE6] text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            id="generate-quiz-confirm-btn"
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating {currentCount || 5} Questions...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                Generate {currentCount || 5} Questions ({difficulty.toUpperCase()})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
