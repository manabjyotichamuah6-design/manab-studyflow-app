import React from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit3,
  Layers,
  HelpCircle,
  Tag,
} from 'lucide-react';
import { QuizQuestion } from '../../types';

interface ManageQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuizQuestion[];
  currentIdx: number;
  onSelectIndex: (index: number) => void;
  onEditQuestion: (question: QuizQuestion) => void;
  onDeleteQuestion: (id: string) => void;
  onOpenAddModal: () => void;
}

export const ManageQuestionsModal: React.FC<ManageQuestionsModalProps> = ({
  isOpen,
  onClose,
  questions,
  currentIdx,
  onSelectIndex,
  onEditQuestion,
  onDeleteQuestion,
  onOpenAddModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5E0D3] w-full max-w-3xl rounded-3xl shadow-2xl p-6 sm:p-8 text-[#1C1E1B] space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E4D9] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-[#DCD6C7] text-[#1B4332] flex items-center justify-center font-bold">
              <Layers className="w-5 h-5 text-[#1B4332]" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#1C1E1B]">
                Quiz Questions Manager ({questions.length})
              </h2>
              <p className="text-xs text-[#6B7267]">
                Review, edit, add, or delete questions in this quiz.
              </p>
            </div>
          </div>
          <button
            id="close-manage-questions-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-[#6B7267] hover:text-[#1C1E1B] hover:bg-[#F4EFE6] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#FAF8F5] border border-[#E2DDCF] rounded-2xl">
          <span className="text-xs font-mono-code font-semibold text-[#555A50]">
            Total: {questions.length} Questions
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="manage-add-q-btn"
              onClick={() => {
                onClose();
                onOpenAddModal();
              }}
              className="px-3 py-1.5 rounded-xl border border-[#DCD6C7] bg-white hover:bg-[#F4EFE6] text-[#333830] text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#555A50]" />
              + Add Question
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-1">
          {questions.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <HelpCircle className="w-10 h-10 text-[#888E83] mx-auto" />
              <p className="text-sm font-semibold text-[#555A50]">No questions in this quiz yet.</p>
              <p className="text-xs text-[#888E83]">
                Click "+ Add Question" to generate with AI or add manually!
              </p>
            </div>
          ) : (
            questions.map((q, idx) => {
              const isCurrent = currentIdx === idx;
              const difficultyBadge =
                q.difficulty === 'easy'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : q.difficulty === 'hard' || q.difficulty === 'advanced'
                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                  : 'bg-amber-100 text-amber-800 border-amber-200';

              return (
                <div
                  key={q.id || idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400/40 shadow-xs'
                      : 'bg-[#FAF8F5] border-[#E5E0D3] hover:border-[#D0C9BA]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#EFECE3] text-[#1C1E1B] font-mono-code text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>

                        <span
                          className={`text-[10px] font-mono-code font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${difficultyBadge}`}
                        >
                          {q.difficulty || 'Medium'}
                        </span>

                        {q.topic && (
                          <span className="text-[10px] text-[#6B7267] bg-[#EFECE3] px-2 py-0.5 rounded flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" />
                            {q.topic}
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm font-semibold text-[#1C1E1B] leading-snug">
                        {q.question}
                      </p>

                      <p className="text-xs text-[#555A50]">
                        <strong className="text-emerald-800">
                          Correct: Option {String.fromCharCode(65 + (q.correctIndex || 0))}
                        </strong>{' '}
                        — {q.options[q.correctIndex || 0]}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        id={`jump-to-q-${idx}`}
                        onClick={() => {
                          onSelectIndex(idx);
                          onClose();
                        }}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-[#DCD6C7] text-[#1C1E1B] hover:bg-[#F4EFE6] transition-colors cursor-pointer"
                        title="Jump to this question"
                      >
                        Practice
                      </button>

                      <button
                        type="button"
                        id={`edit-q-${idx}`}
                        onClick={() => {
                          onClose();
                          onEditQuestion(q);
                        }}
                        className="p-1.5 text-[#555A50] hover:text-[#1C1E1B] hover:bg-[#F4EFE6] rounded-lg transition-colors cursor-pointer"
                        title="Edit question"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        id={`delete-q-${idx}`}
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete Question ${idx + 1}?`)) {
                            onDeleteQuestion(q.id);
                          }
                        }}
                        className="p-1.5 text-[#888E83] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-4 border-t border-[#E8E4D9]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1B4332] text-white text-xs sm:text-sm font-bold hover:bg-[#2D6A4F] transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
