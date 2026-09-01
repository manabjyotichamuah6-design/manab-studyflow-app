import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Layers,
  AlertCircle,
  Loader2,
  Plus,
  Save,
  Check,
  Edit3,
} from 'lucide-react';
import { QuizQuestion } from '../../types';

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionsGenerated: (questions: QuizQuestion[], replaceExisting: boolean) => void;
  onSaveManualQuestion: (question: QuizQuestion, addAnother?: boolean) => void;
  topic: string;
  rawContent?: string;
  initialData?: QuizQuestion | null;
  initialTab?: 'ai' | 'manual';
}

export const AddQuestionModal: React.FC<AddQuestionModalProps> = ({
  isOpen,
  onClose,
  onQuestionsGenerated,
  onSaveManualQuestion,
  topic,
  rawContent = '',
  initialData = null,
  initialTab = 'ai',
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>(initialData ? 'manual' : initialTab);

  // AI Generation State
  const [questionCountInput, setQuestionCountInput] = useState<string>('5');
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard' | 'advanced'>('medium');
  const [questionType, setQuestionType] = useState<'mcq' | 'true_false' | 'mixed'>('mcq');
  const [focusPrompt, setFocusPrompt] = useState<string>('');
  const [replaceExisting, setReplaceExisting] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Manual Writing State
  const [manualQuestionText, setManualQuestionText] = useState('');
  const [manualOptions, setManualOptions] = useState<string[]>(['', '', '', '']);
  const [manualCorrectIndex, setManualCorrectIndex] = useState<number>(0);
  const [manualExplanation, setManualExplanation] = useState('');
  const [manualDifficulty, setManualDifficulty] = useState<'easy' | 'medium' | 'hard' | 'advanced'>('medium');
  const [manualTopicTag, setManualTopicTag] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setActiveTab('manual');
      setManualQuestionText(initialData.question || '');
      const opts = initialData.options && initialData.options.length >= 4
        ? initialData.options.slice(0, 4)
        : [...(initialData.options || []), '', '', '', ''].slice(0, 4);
      setManualOptions(opts);
      setManualCorrectIndex(typeof initialData.correctIndex === 'number' ? initialData.correctIndex : 0);
      setManualExplanation(initialData.explanation || '');
      setManualDifficulty(initialData.difficulty || 'medium');
      setManualTopicTag(initialData.topic || topic || '');
    } else {
      setActiveTab(initialTab);
      setManualQuestionText('');
      setManualOptions(['', '', '', '']);
      setManualCorrectIndex(0);
      setManualExplanation('');
      setManualDifficulty('medium');
      setManualTopicTag(topic || '');
    }
    setErrorMessage(null);
  }, [initialData, topic, isOpen, initialTab]);

  if (!isOpen) return null;

  // Handle AI Question Count Change
  const handleCountChange = (val: string) => {
    setQuestionCountInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 50) {
      setErrorMessage(null);
    }
  };

  // Handle AI Generation Submit
  const handleAiGenerate = async () => {
    const parsed = parseInt(questionCountInput, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 50) {
      setErrorMessage('Please enter a valid number of questions between 1 and 50.');
      return;
    }

    const finalCount = Math.min(Math.max(parsed, 1), 50);

    setIsAiLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/study/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic || 'Study Material',
          content: rawContent || `Comprehensive practice questions on ${topic}`,
          questionCount: finalCount,
          difficulty: aiDifficulty,
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
      setIsAiLoading(false);
    }
  };

  // Handle Manual Option Change
  const handleOptionChange = (index: number, val: string) => {
    const updated = [...manualOptions];
    updated[index] = val;
    setManualOptions(updated);
  };

  // Handle Manual Question Submit
  const handleManualSubmit = (addAnother: boolean = false) => {
    if (!manualQuestionText.trim()) {
      setErrorMessage('Please enter the question statement.');
      return;
    }

    const trimmedOptions = manualOptions.map((o) => o.trim());
    if (trimmedOptions.some((o) => o === '')) {
      setErrorMessage('All 4 options (A, B, C, D) must be filled in with text.');
      return;
    }

    if (manualCorrectIndex < 0 || manualCorrectIndex >= trimmedOptions.length) {
      setErrorMessage('Please select which option is the correct answer.');
      return;
    }

    const finalQuestion: QuizQuestion = {
      id: initialData?.id || `custom-q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      question: manualQuestionText.trim(),
      options: trimmedOptions,
      correctIndex: manualCorrectIndex,
      explanation:
        manualExplanation.trim() ||
        `The correct answer is Option ${String.fromCharCode(65 + manualCorrectIndex)}: "${trimmedOptions[manualCorrectIndex]}".`,
      difficulty: manualDifficulty,
      topic: manualTopicTag.trim() || topic || 'Custom Practice',
      customAdded: true,
    };

    onSaveManualQuestion(finalQuestion, addAnother);

    if (addAnother) {
      setManualQuestionText('');
      setManualOptions(['', '', '', '']);
      setManualCorrectIndex(0);
      setManualExplanation('');
      setErrorMessage(null);
    } else {
      onClose();
    }
  };

  const currentCount = parseInt(questionCountInput, 10) || 0;
  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5E0D3] w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 text-[#1C1E1B] space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E4D9] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-[#DCD6C7] text-[#1B4332] flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#1C1E1B]">
                {initialData ? 'Edit Question' : 'Add Questions'}
              </h2>
              <p className="text-xs text-[#6B7267]">
                {initialData
                  ? 'Update question statement, options, and explanation.'
                  : 'Add questions with AI generation or write your own custom test questions.'}
              </p>
            </div>
          </div>
          <button
            id="close-add-question-modal-btn"
            onClick={onClose}
            disabled={isAiLoading}
            className="p-2 rounded-xl text-[#6B7267] hover:text-[#1C1E1B] hover:bg-[#F4EFE6] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (AI vs Manual) - Only if not editing */}
        {!initialData && (
          <div className="flex items-center p-1 bg-[#FAF8F5] border border-[#DCD6C7] rounded-2xl">
            <button
              type="button"
              id="tab-ai-generate-btn"
              onClick={() => {
                setActiveTab('ai');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-white text-[#1C1E1B] shadow-xs border border-[#D0C9BA]'
                  : 'text-[#6B7267] hover:text-[#1C1E1B]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              Generate with AI (1 - 50 Qs)
            </button>
            <button
              type="button"
              id="tab-manual-write-btn"
              onClick={() => {
                setActiveTab('manual');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-white text-[#1C1E1B] shadow-xs border border-[#D0C9BA]'
                  : 'text-[#6B7267] hover:text-[#1C1E1B]'
              }`}
            >
              <Edit3 className="w-4 h-4 text-[#555A50]" />
              Write Manually
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* AI GENERATOR TAB */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            {/* Number of Questions (1 - 50) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono-code uppercase font-semibold text-[#555A50]">
                Number of Questions to Generate (1 - 50) <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-3 bg-[#FAF8F5] p-3.5 border border-[#DCD6C7] rounded-2xl">
                <input
                  id="custom-question-count-input"
                  type="number"
                  min="1"
                  max="50"
                  value={questionCountInput}
                  onChange={(e) => handleCountChange(e.target.value)}
                  placeholder="e.g. 5, 15, 30, 50"
                  className="w-32 sm:w-40 p-2.5 bg-white border border-[#D0C9BA] rounded-xl text-lg font-bold text-center text-[#1C1E1B] focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
                <div className="flex-1 text-xs text-[#555A50] leading-snug">
                  <span className="font-semibold text-[#1C1E1B] block">
                    Write any preferred question quantity
                  </span>
                  <span>Supports up to 50 questions per test batch.</span>
                </div>
              </div>
            </div>

            {/* Difficulty Selector */}
            <div>
              <label className="block text-xs font-mono-code uppercase font-semibold text-[#555A50] mb-1.5">
                Difficulty Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {(
                  [
                    { id: 'easy', title: 'Easy', desc: 'Recall & definitions', color: 'border-emerald-300 bg-emerald-50 text-emerald-900' },
                    { id: 'medium', title: 'Medium', desc: 'Application & scenarios', color: 'border-amber-300 bg-amber-50 text-amber-900' },
                    { id: 'hard', title: 'Hard / Advanced', desc: 'Complex reasoning & traps', color: 'border-rose-300 bg-rose-50 text-rose-900' },
                  ] as const
                ).map((lvl) => {
                  const isSelected = aiDifficulty === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      id={`ai-diff-${lvl.id}`}
                      onClick={() => setAiDifficulty(lvl.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? `${lvl.color} ring-2 ring-blue-600 shadow-xs`
                          : 'bg-[#FAF8F5] border-[#DCD6C7] text-[#555A50] hover:bg-[#F4EFE6]'
                      }`}
                    >
                      <div className="font-bold text-xs sm:text-sm text-[#1C1E1B]">{lvl.title}</div>
                      <p className="text-[11px] text-[#6B7267] mt-0.5 leading-tight">{lvl.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Format */}
            <div>
              <label className="block text-xs font-mono-code uppercase font-semibold text-[#555A50] mb-1.5">
                Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'mcq', label: '4 Options (MCQ)' },
                    { id: 'true_false', label: 'True / False' },
                    { id: 'mixed', label: 'Mixed' },
                  ] as const
                ).map((fmt) => {
                  const isSelected = questionType === fmt.id;
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      id={`ai-fmt-${fmt.id}`}
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

            {/* Optional Topic Focus */}
            <div>
              <label className="block text-xs font-mono-code uppercase font-semibold text-[#555A50] mb-1">
                Specific Topic Focus / Sub-topics (Optional)
              </label>
              <input
                id="ai-focus-prompt-input"
                type="text"
                value={focusPrompt}
                onChange={(e) => setFocusPrompt(e.target.value)}
                placeholder="e.g. Focus on formulas, tricky calculation problems, or definitions..."
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6C7] rounded-xl text-xs sm:text-sm text-[#1C1E1B] placeholder-[#888E83] focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>

            {/* Append vs Replace Choice */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E2DDCF] rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#333830]">
                <Layers className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Add mode:</span>
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
        )}

        {/* MANUAL WRITING TAB */}
        {activeTab === 'manual' && (
          <div className="space-y-4">
            {/* Question Text */}
            <div>
              <label className="block text-xs font-mono-code uppercase font-semibold text-[#555A50] mb-1">
                Question Statement <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="custom-question-text"
                rows={3}
                value={manualQuestionText}
                onChange={(e) => {
                  setManualQuestionText(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="e.g. Which fundamental theorem relates the line integral around a simple closed curve to a double integral?"
                className="w-full p-3 bg-[#FAF8F5] border border-[#DCD6C7] rounded-xl text-sm text-[#1C1E1B] placeholder-[#888E83] focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all leading-relaxed"
              />
            </div>

            {/* Difficulty & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono-code uppercase font-semibold text-[#555A50] mb-1">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'easy', label: 'Easy', color: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
                      { id: 'medium', label: 'Medium', color: 'border-amber-300 bg-amber-50 text-amber-900' },
                      { id: 'hard', label: 'Hard', color: 'border-rose-300 bg-rose-50 text-rose-900' },
                    ] as const
                  ).map((lvl) => {
                    const isSelected = manualDifficulty === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        id={`manual-diff-${lvl.id}`}
                        onClick={() => setManualDifficulty(lvl.id)}
                        className={`py-1.5 px-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? `${lvl.color} ring-2 ring-blue-500 font-bold shadow-xs`
                            : 'bg-[#FAF8F5] border-[#DCD6C7] text-[#555A50] hover:bg-[#F4EFE6]'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-code uppercase font-semibold text-[#555A50] mb-1">
                  Topic / Category (Optional)
                </label>
                <input
                  id="custom-question-topic"
                  type="text"
                  value={manualTopicTag}
                  onChange={(e) => setManualTopicTag(e.target.value)}
                  placeholder="e.g. Vector Calculus, Physics"
                  className="w-full p-2 bg-[#FAF8F5] border border-[#DCD6C7] rounded-xl text-sm text-[#1C1E1B] placeholder-[#888E83] focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Standard 4 Options (A, B, C, D) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono-code uppercase font-semibold text-[#555A50]">
                  Options (Click letter to select correct answer) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-[#6B7267]">
                  Selected: <strong className="text-emerald-800">Option {optionLetters[manualCorrectIndex]}</strong>
                </span>
              </div>

              <div className="space-y-2">
                {manualOptions.map((opt, idx) => {
                  const isCorrect = manualCorrectIndex === idx;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all ${
                        isCorrect
                          ? 'bg-emerald-50/80 border-emerald-400 ring-1 ring-emerald-400'
                          : 'bg-[#FAF8F5] border-[#E2DDCF] hover:border-[#D0C9BA]'
                      }`}
                    >
                      <button
                        type="button"
                        id={`set-correct-opt-${idx}`}
                        onClick={() => {
                          setManualCorrectIndex(idx);
                          setErrorMessage(null);
                        }}
                        className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-mono-code text-xs font-bold transition-all cursor-pointer ${
                          isCorrect
                            ? 'bg-[#1B4332] text-white shadow-xs'
                            : 'bg-[#EFECE3] text-[#555A50] hover:bg-emerald-200'
                        }`}
                        title={isCorrect ? 'Correct Answer' : 'Click to set as correct answer'}
                      >
                        {optionLetters[idx]}
                      </button>

                      <input
                        id={`option-input-${idx}`}
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${optionLetters[idx]} text...`}
                        className="flex-1 bg-transparent border-none text-sm text-[#1C1E1B] placeholder-[#888E83] focus:outline-hidden px-1"
                      />

                      {isCorrect && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                          <Check className="w-3 h-3" /> Correct
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explanation / Solution Note */}
            <div>
              <label className="block text-xs font-mono-code uppercase font-semibold text-[#555A50] mb-1">
                Explanation / Solution Note (Shown after answering)
              </label>
              <textarea
                id="custom-question-explanation"
                rows={2}
                value={manualExplanation}
                onChange={(e) => setManualExplanation(e.target.value)}
                placeholder="Short 1-2 line explanation on why the correct option is right and others are wrong..."
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6C7] rounded-xl text-sm text-[#1C1E1B] placeholder-[#888E83] focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#E8E4D9]">
          <button
            type="button"
            onClick={onClose}
            disabled={isAiLoading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#DCD6C7] bg-white text-[#555A50] hover:bg-[#F4EFE6] text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            Cancel
          </button>

          {activeTab === 'ai' ? (
            <button
              type="button"
              id="generate-quiz-confirm-btn"
              onClick={handleAiGenerate}
              disabled={isAiLoading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {isAiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating {currentCount || 5} Questions...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  Generate {currentCount || 5} Questions ({aiDifficulty.toUpperCase()})
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {!initialData && (
                <button
                  type="button"
                  id="save-and-add-another-btn"
                  onClick={() => handleManualSubmit(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Save & Add Another
                </button>
              )}

              <button
                type="button"
                id="save-manual-question-btn"
                onClick={() => handleManualSubmit(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {initialData ? 'Update Question' : 'Save Question'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
