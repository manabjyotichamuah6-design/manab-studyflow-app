import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../../types';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  ArrowRight,
  ArrowLeft,
  Info,
  HelpCircle,
  Plus,
  Layers,
} from 'lucide-react';
import { AddQuestionModal } from '../quiz/AddQuestionModal';
import { ManageQuestionsModal } from '../quiz/ManageQuestionsModal';

interface QuizTabProps {
  topic: string;
  questions: QuizQuestion[];
  rawContent?: string;
  onQuizCompleted?: (score: number, total: number) => void;
  onUpdateQuestions?: (updatedQuestions: QuizQuestion[]) => void;
}

export const QuizTab: React.FC<QuizTabProps> = ({
  topic,
  questions: initialQuestions = [],
  rawContent = '',
  onQuizCompleted,
  onUpdateQuestions,
}) => {
  const [questionsList, setQuestionsList] = useState<QuizQuestion[]>(initialQuestions);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);

  // Sync questions if initialQuestions props change
  useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      setQuestionsList(initialQuestions);
    }
  }, [initialQuestions]);

  const total = questionsList.length;
  const currentQ = questionsList[currentIdx];

  // Helper to commit question updates both locally and upstream
  const commitQuestionsUpdate = (updated: QuizQuestion[]) => {
    setQuestionsList(updated);
    if (onUpdateQuestions) {
      onUpdateQuestions(updated);
    }
  };

  const handleSelectOption = (qId: string, optionIndex: number) => {
    // If already answered this question and not in retake, don't allow changing
    if (userAnswers[qId] !== undefined && !reviewMode) return;

    const newAnswers = { ...userAnswers, [qId]: optionIndex };
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIdx < total - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Finished all questions
      setIsCompleted(true);
      if (onQuizCompleted) {
        const correctCount = questionsList.reduce((acc, q) => {
          return userAnswers[q.id] === q.correctIndex ? acc + 1 : acc;
        }, 0);
        onQuizCompleted(correctCount, total);
      }
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleTryAgain = () => {
    setUserAnswers({});
    setCurrentIdx(0);
    setIsCompleted(false);
    setReviewMode(false);
  };

  const handleReviewAnswers = () => {
    setIsCompleted(false);
    setReviewMode(true);
    setCurrentIdx(0);
  };

  // Add / Edit Question handler
  const handleSaveQuestion = (savedQ: QuizQuestion, addAnother: boolean = false) => {
    let updated: QuizQuestion[];
    const exists = questionsList.some((q) => q.id === savedQ.id);

    if (exists) {
      updated = questionsList.map((q) => (q.id === savedQ.id ? savedQ : q));
    } else {
      updated = [...questionsList, savedQ];
    }

    commitQuestionsUpdate(updated);

    if (!addAnother) {
      setEditingQuestion(null);
      setIsAddModalOpen(false);
    }
  };

  // Delete Question handler
  const handleDeleteQuestion = (qId: string) => {
    const updated = questionsList.filter((q) => q.id !== qId);
    commitQuestionsUpdate(updated);

    // Adjust userAnswers
    const nextAnswers = { ...userAnswers };
    delete nextAnswers[qId];
    setUserAnswers(nextAnswers);

    // Adjust current index if needed
    if (currentIdx >= updated.length && updated.length > 0) {
      setCurrentIdx(updated.length - 1);
    }
  };

  // AI Generation handler (handles append vs replace)
  const handleQuestionsGenerated = (newQuestions: QuizQuestion[], replaceExisting: boolean) => {
    let updated: QuizQuestion[];
    if (replaceExisting) {
      updated = newQuestions;
      setUserAnswers({});
      setCurrentIdx(0);
      setIsCompleted(false);
      setReviewMode(false);
    } else {
      updated = [...questionsList, ...newQuestions];
    }
    commitQuestionsUpdate(updated);
    setIsAddModalOpen(false);
  };

  // Score calculation
  const correctCount = questionsList.reduce((acc, q) => {
    return userAnswers[q.id] === q.correctIndex ? acc + 1 : acc;
  }, 0);

  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = total > 0 ? (answeredCount / total) * 100 : 0;
  const optionLetters = ['A', 'B', 'C', 'D'];

  // Empty state when there are 0 questions
  if (total === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E5E0D3] shadow-xs max-w-2xl mx-auto text-center space-y-6 text-[#1C1E1B]">
        <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] border border-[#DCD6C7] text-[#1B4332] flex items-center justify-center mx-auto shadow-xs">
          <HelpCircle className="w-8 h-8 text-[#1B4332]" />
        </div>

        <div>
          <span className="text-xs font-mono-code uppercase tracking-wider font-semibold text-[#1B4332] bg-[#E8F5E9] border border-emerald-300 px-2.5 py-1 rounded">
            Quiz Workspace
          </span>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1C1E1B] mt-2">
            Build Your Practice Quiz
          </h2>
          <p className="text-sm text-[#6B7267] max-w-md mx-auto mt-2">
            No questions in this quiz yet. Add questions with AI generation (1-50 questions) or write custom questions.
          </p>
        </div>

        <div className="flex items-center justify-center pt-2">
          <button
            id="empty-add-question-btn"
            onClick={() => {
              setEditingQuestion(null);
              setIsAddModalOpen(true);
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#FAF8F5]" />
            + Add Questions
          </button>
        </div>

        {/* Unified Add/Generate Modal */}
        <AddQuestionModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingQuestion(null);
          }}
          onQuestionsGenerated={handleQuestionsGenerated}
          onSaveManualQuestion={handleSaveQuestion}
          topic={topic}
          rawContent={rawContent}
          initialData={editingQuestion}
        />
      </div>
    );
  }

  // Completed Summary Screen
  if (isCompleted) {
    const percentage = Math.round((correctCount / (total || 1)) * 100);

    return (
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E5E0D3] shadow-xs max-w-2xl mx-auto text-center space-y-6 text-[#1C1E1B]">
        <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] border border-[#DCD6C7] text-[#1B4332] flex items-center justify-center mx-auto shadow-xs">
          <Award className="w-8 h-8 text-[#1B4332]" />
        </div>

        <div>
          <span className="text-xs font-mono-code uppercase tracking-wider font-semibold text-[#1B4332] bg-[#E8F5E9] border border-emerald-300 px-2.5 py-1 rounded">
            Self-Assessment Finished
          </span>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#1C1E1B] mt-2">
            QUIZ COMPLETE
          </h2>
        </div>

        {/* Big Score Display */}
        <div className="bg-[#FAF8F5] rounded-2xl p-6 border border-[#E2DDCF] max-w-sm mx-auto">
          <p className="text-xs font-mono-code uppercase tracking-wider text-[#6B7267] mb-1">
            Your Recall Score
          </p>
          <div className="font-serif-display text-5xl font-bold text-[#1C1E1B]">
            {correctCount} <span className="text-2xl text-[#888E83] font-normal">/ {total}</span>
          </div>
          <p className="text-sm font-semibold text-[#1B4332] mt-1">{percentage}% Accuracy</p>
        </div>

        {/* Academic Disclaimers */}
        <div className="bg-[#FAF8F5] rounded-xl p-4 border border-[#E2DDCF] text-left flex items-start gap-3">
          <Info className="w-4 h-4 text-[#1B4332] shrink-0 mt-0.5" />
          <p className="text-xs text-[#555A50] leading-relaxed">
            <strong className="text-[#1C1E1B]">Disclaimer:</strong> This score reflects practice recall of the specific uploaded study material. It does not measure general academic ability, intelligence, or official examination readiness.
          </p>
        </div>

        {/* Actions: REVIEW ANSWERS / RETAKE QUIZ / ADD QUESTIONS */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            id="quiz-review-answers-btn"
            onClick={handleReviewAnswers}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#DCD6C7] bg-white hover:bg-[#F4EFE6] text-[#333830] hover:text-[#1C1E1B] text-sm font-semibold transition-all shadow-xs cursor-pointer"
          >
            Review Answers
          </button>
          <button
            id="quiz-try-again-btn"
            onClick={handleTryAgain}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-[#FAF8F5]" />
            Retake Quiz
          </button>
          <button
            id="quiz-add-more-q-btn"
            onClick={() => {
              setEditingQuestion(null);
              setIsAddModalOpen(true);
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#DCD6C7] bg-white hover:bg-[#F4EFE6] text-[#333830] text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#555A50]" />
            + Add Question
          </button>
        </div>

        {/* Unified Add/Generate Modal */}
        <AddQuestionModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingQuestion(null);
          }}
          onQuestionsGenerated={handleQuestionsGenerated}
          onSaveManualQuestion={handleSaveQuestion}
          topic={topic}
          rawContent={rawContent}
          initialData={editingQuestion}
        />
      </div>
    );
  }

  if (!currentQ) {
    return null;
  }

  const selectedOptionIndex = userAnswers[currentQ.id];
  const hasAnswered = selectedOptionIndex !== undefined;
  const isCorrect = selectedOptionIndex === currentQ.correctIndex;

  const difficultyBadge =
    currentQ.difficulty === 'easy'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
      : currentQ.difficulty === 'hard' || currentQ.difficulty === 'advanced'
      ? 'bg-rose-100 text-rose-800 border-rose-300'
      : 'bg-amber-100 text-amber-800 border-amber-300';

  return (
    <div className="space-y-6 max-w-3xl mx-auto text-[#1C1E1B]">
      {/* Top Action Bar & Quiz Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E8E4D9]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono-code font-semibold uppercase tracking-wider text-[#1B4332] bg-[#E8F5E9] border border-emerald-300 px-2 py-0.5 rounded">
              Practice Check
            </span>
            <span className={`text-xs font-mono-code font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${difficultyBadge}`}>
              Level: {currentQ.difficulty ? currentQ.difficulty.toUpperCase() : 'MEDIUM'}
            </span>
            {reviewMode && (
              <span className="text-xs font-mono-code bg-[#EFECE3] text-[#333830] px-2 py-0.5 rounded font-semibold">
                Review Mode
              </span>
            )}
          </div>
          <h2 className="font-serif-display text-2xl font-semibold text-[#1C1E1B] mt-1">
            Multiple-Choice Practice Test
          </h2>
        </div>

        {/* Top Control Buttons: ONE single "+ Add Question" button and Question List */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="quiz-add-question-header-btn"
            onClick={() => {
              setEditingQuestion(null);
              setIsAddModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl border border-[#DCD6C7] bg-white hover:bg-[#F4EFE6] text-[#333830] text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Add questions with AI generator or write manually"
          >
            <Plus className="w-3.5 h-3.5 text-[#555A50]" />
            + Add Question
          </button>

          {/* Manage Questions List */}
          <button
            type="button"
            id="quiz-manage-questions-btn"
            onClick={() => setIsManageModalOpen(true)}
            className="px-2.5 py-2 rounded-xl border border-[#DCD6C7] bg-white hover:bg-[#F4EFE6] text-[#555A50] hover:text-[#1C1E1B] text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
            title="Manage and view all questions"
          >
            <Layers className="w-3.5 h-3.5" />
            List ({total})
          </button>

          {/* Current score badge */}
          <div className="text-xs font-mono-code font-semibold text-[#1B4332] bg-white border border-[#DCD6C7] px-3 py-1.5 rounded-xl shadow-xs">
            Score: {correctCount} / {total}
          </div>
        </div>
      </div>

      {/* Question Number Strip Navigator */}
      <div className="bg-[#FAF8F5] p-2.5 rounded-2xl border border-[#E5E0D3] space-y-2">
        <div className="flex items-center justify-between text-xs text-[#555A50] font-mono-code px-1">
          <span>
            Question {currentIdx + 1} of {total}
          </span>
          <span>{Math.round(progressPercent)}% answered</span>
        </div>

        {/* Visual Dots / Pill Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {questionsList.map((q, idx) => {
            const isCurr = currentIdx === idx;
            const isAns = userAnswers[q.id] !== undefined;
            const isCorrectAnswer = userAnswers[q.id] === q.correctIndex;

            let badgeStyle = 'bg-white border-[#DCD6C7] text-[#6B7267] hover:bg-[#F4EFE6]';
            if (isAns) {
              badgeStyle = isCorrectAnswer
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-rose-500 text-white border-rose-500';
            }

            return (
              <button
                key={q.id || idx}
                id={`question-nav-pill-${idx}`}
                onClick={() => setCurrentIdx(idx)}
                className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-mono-code font-bold border transition-all flex items-center justify-center shrink-0 cursor-pointer ${badgeStyle} ${
                  isCurr ? 'ring-2 ring-blue-600 ring-offset-1 shadow-xs scale-105' : ''
                }`}
                title={`Jump to Question ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E0D3] shadow-xs space-y-6">
        {/* Question Statement */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-code font-semibold text-[#888E83] uppercase tracking-wider">
              Question {currentIdx + 1}
            </span>
            {currentQ.topic && (
              <span className="text-[11px] font-mono-code bg-[#FAF8F5] text-[#555A50] border border-[#E2DDCF] px-2 py-0.5 rounded">
                {currentQ.topic}
              </span>
            )}
          </div>
          <h3 className="font-serif-display text-lg sm:text-xl font-medium text-[#1C1E1B] leading-relaxed">
            {currentQ.question}
          </h3>
        </div>

        {/* Options List (A, B, C, D) */}
        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOptionIndex === idx;
            const isThisOptionCorrect = currentQ.correctIndex === idx;

            let optionStyle = 'border-[#E2DDCF] bg-[#FAF8F5] text-[#1C1E1B] hover:border-[#B5AFA0] hover:bg-[#F4EFE6]';

            if (hasAnswered) {
              if (isThisOptionCorrect) {
                // Correct answer always gets highlighted green
                optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-500 font-semibold';
              } else if (isSelected && !isCorrect) {
                // Wrong chosen answer gets highlighted red
                optionStyle = 'border-rose-400 bg-rose-50 text-rose-950 ring-1 ring-rose-400 font-medium';
              } else {
                optionStyle = 'border-[#E8E4D9] bg-white text-[#888E83] opacity-60';
              }
            }

            return (
              <button
                key={idx}
                id={`quiz-option-${currentIdx}-${idx}`}
                onClick={() => handleSelectOption(currentQ.id, idx)}
                disabled={hasAnswered && !reviewMode}
                className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all text-xs sm:text-sm cursor-pointer ${optionStyle}`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-mono-code text-xs font-bold transition-all ${
                    hasAnswered && isThisOptionCorrect
                      ? 'bg-emerald-600 text-white'
                      : hasAnswered && isSelected && !isCorrect
                      ? 'bg-rose-600 text-white'
                      : 'bg-white border border-[#DCD6C7] text-[#555A50]'
                  }`}
                >
                  {optionLetters[idx] || idx + 1}
                </div>

                <div className="flex-1 pt-0.5 leading-relaxed">{opt}</div>

                {hasAnswered && isThisOptionCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                )}
                {hasAnswered && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Immediate Feedback & Detailed Explanation */}
        {hasAnswered && (
          <div
            className={`p-4 sm:p-5 rounded-2xl border animate-in fade-in duration-200 space-y-3 ${
              isCorrect
                ? 'bg-emerald-50/80 border-emerald-300 text-[#1B4332]'
                : 'bg-[#FFF9F9] border-rose-200 text-[#1C1E1B]'
            }`}
          >
            {/* Feedback Header */}
            <div className="flex items-center justify-between gap-2 border-b pb-2.5 border-black/5">
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <>
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-800">
                      Correct Answer! (+1 Point)
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center">
                      <XCircle className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-rose-800">
                      Incorrect Choice
                    </span>
                  </>
                )}
              </div>

              <span className="text-xs font-mono-code font-semibold px-2 py-0.5 rounded bg-black/5">
                Correct: Option {optionLetters[currentQ.correctIndex]}
              </span>
            </div>

            {/* Answer Comparison when incorrect */}
            {!isCorrect && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-rose-100/70 border border-rose-200 text-rose-950">
                  <span className="font-bold text-[11px] font-mono-code uppercase block text-rose-800 mb-0.5">
                    Your Choice (Incorrect):
                  </span>
                  <p className="font-medium leading-snug">
                    <strong>Option {optionLetters[selectedOptionIndex]}:</strong> {currentQ.options[selectedOptionIndex]}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-200 text-emerald-950">
                  <span className="font-bold text-[11px] font-mono-code uppercase block text-emerald-800 mb-0.5">
                    Correct Answer:
                  </span>
                  <p className="font-medium leading-snug">
                    <strong>Option {optionLetters[currentQ.correctIndex]}:</strong> {currentQ.options[currentQ.correctIndex]}
                  </p>
                </div>
              </div>
            )}

            {/* Concise 1-2 line explanation */}
            <div className="space-y-1 text-xs sm:text-sm leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-[#333830]">
                <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{isCorrect ? 'Why this is correct:' : 'Explanation & Diagnostic Note:'}</span>
              </div>
              <p className="text-[#444A3E] pl-5">
                {currentQ.explanation || (isCorrect
                  ? `Option ${optionLetters[currentQ.correctIndex]} correctly applies the fundamental principle for ${currentQ.topic || 'this topic'}.`
                  : `Option ${optionLetters[currentQ.correctIndex]} is the correct answer. Option ${optionLetters[selectedOptionIndex]} is incorrect because it does not satisfy the governing conditions.`)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          id="quiz-prev-q-btn"
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer ${
            currentIdx === 0
              ? 'bg-[#FAF8F5] text-[#A29C8F] border-[#E2DDCF] cursor-not-allowed'
              : 'bg-white border-[#DCD6C7] text-[#1C1E1B] hover:bg-[#F4EFE6]'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex items-center gap-2">
          {/* Single Add Question button */}
          <button
            type="button"
            id="quiz-add-question-bottom-btn"
            onClick={() => {
              setEditingQuestion(null);
              setIsAddModalOpen(true);
            }}
            className="py-3 px-4 rounded-xl border border-[#DCD6C7] bg-white hover:bg-[#F4EFE6] text-[#333830] text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#555A50]" />
            Add Question
          </button>

          <button
            id="quiz-next-q-btn"
            onClick={handleNext}
            className="py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
          >
            {currentIdx === total - 1 ? 'View Final Results' : 'Next Question'}
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Unified Add/Generate Modal */}
      <AddQuestionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingQuestion(null);
        }}
        onQuestionsGenerated={handleQuestionsGenerated}
        onSaveManualQuestion={handleSaveQuestion}
        topic={topic}
        rawContent={rawContent}
        initialData={editingQuestion}
      />

      <ManageQuestionsModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        questions={questionsList}
        currentIdx={currentIdx}
        onSelectIndex={(idx) => setCurrentIdx(idx)}
        onEditQuestion={(q) => {
          setEditingQuestion(q);
          setIsAddModalOpen(true);
        }}
        onDeleteQuestion={handleDeleteQuestion}
        onOpenAddModal={() => {
          setEditingQuestion(null);
          setIsAddModalOpen(true);
        }}
      />
    </div>
  );
};
