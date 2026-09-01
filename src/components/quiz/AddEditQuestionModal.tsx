import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Save,
  Check,
  AlertCircle,
} from 'lucide-react';
import { QuizQuestion } from '../../types';

interface AddEditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: QuizQuestion, addAnother?: boolean) => void;
  initialData?: QuizQuestion | null;
  defaultTopic?: string;
}

export const AddEditQuestionModal: React.FC<AddEditQuestionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultTopic = '',
}) => {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'advanced'>('medium');
  const [topicTag, setTopicTag] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setQuestionText(initialData.question || '');
      const initialOpts = initialData.options && initialData.options.length >= 4
        ? initialData.options.slice(0, 4)
        : [...(initialData.options || []), '', '', '', ''].slice(0, 4);
      setOptions(initialOpts);
      setCorrectIndex(typeof initialData.correctIndex === 'number' ? initialData.correctIndex : 0);
      setExplanation(initialData.explanation || '');
      setDifficulty(initialData.difficulty || 'medium');
      setTopicTag(initialData.topic || defaultTopic || '');
      setErrorMessage(null);
    } else {
      setQuestionText('');
      setOptions(['', '', '', '']);
      setCorrectIndex(0);
      setExplanation('');
      setDifficulty('medium');
      setTopicTag(defaultTopic || '');
      setErrorMessage(null);
    }
  }, [initialData, defaultTopic, isOpen]);

  if (!isOpen) return null;

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleSubmit = (addAnother: boolean = false) => {
    if (!questionText.trim()) {
      setErrorMessage('Please enter the question statement.');
      return;
    }

    const trimmedOptions = options.map((o) => o.trim());
    if (trimmedOptions.some((o) => o === '')) {
      setErrorMessage('All 4 options (A, B, C, D) must be filled in with text.');
      return;
    }

    if (correctIndex < 0 || correctIndex >= trimmedOptions.length) {
      setErrorMessage('Please select which option is the correct answer.');
      return;
    }

    const finalQuestion: QuizQuestion = {
      id: initialData?.id || `custom-q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      question: questionText.trim(),
      options: trimmedOptions,
      correctIndex,
      explanation: explanation.trim() || `The correct answer is Option ${String.fromCharCode(65 + correctIndex)}: "${trimmedOptions[correctIndex]}".`,
      difficulty,
      topic: topicTag.trim() || defaultTopic || 'Custom Practice',
      customAdded: true,
    };

    onSave(finalQuestion, addAnother);

    if (addAnother) {
      setQuestionText('');
      setOptions(['', '', '', '']);
      setCorrectIndex(0);
      setExplanation('');
      setErrorMessage(null);
    } else {
      onClose();
    }
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5E0D3] w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 text-[#1C1E1B] space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E4D9] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-[#DCD6C7] text-[#1B4332] flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#1C1E1B]">
                {initialData ? 'Edit Quiz Question' : 'Add Custom Question'}
              </h2>
              <p className="text-xs text-[#6B7267]">
                {initialData
                  ? 'Update question text, correct answer, and explanation.'
                  : 'Write your own custom question to practice and test recall.'}
              </p>
            </div>
          </div>
          <button
            id="close-add-question-modal-btn"
            onClick={onClose}
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
          {/* Question Text */}
          <div>
            <label className="block text-xs font-mono-code uppercase font-semibold text-[#555A50] mb-1.5">
              Question Statement <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="custom-question-text"
              rows={3}
              value={questionText}
              onChange={(e) => {
                setQuestionText(e.target.value);
                setErrorMessage(null);
              }}
              placeholder="e.g. Which law states that total energy in an isolated system remains constant over time?"
              className="w-full p-3.5 bg-[#FAF8F5] border border-[#DCD6C7] rounded-xl text-sm text-[#1C1E1B] placeholder-[#888E83] focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all leading-relaxed"
            />
          </div>

          {/* Difficulty Level & Topic Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono-code uppercase font-semibold text-[#555A50] mb-1.5">
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
                  const isSelected = difficulty === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      id={`question-difficulty-${lvl.id}`}
                      onClick={() => setDifficulty(lvl.id)}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
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
              <label className="block text-xs font-mono-code uppercase font-semibold text-[#555A50] mb-1.5">
                Sub-Topic / Category (Optional)
              </label>
              <input
                id="custom-question-topic"
                type="text"
                value={topicTag}
                onChange={(e) => setTopicTag(e.target.value)}
                placeholder="e.g. Thermodynamics, Reaction Kinetics"
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6C7] rounded-xl text-sm text-[#1C1E1B] placeholder-[#888E83] focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Options Section: Standard 4 options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono-code uppercase font-semibold text-[#555A50]">
                Options (Click letter to select correct answer) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-[#6B7267]">
                Selected: <strong className="text-emerald-800">Option {optionLetters[correctIndex]}</strong>
              </span>
            </div>

            <div className="space-y-2.5">
              {options.map((opt, idx) => {
                const isCorrect = correctIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all ${
                      isCorrect
                        ? 'bg-emerald-50/80 border-emerald-400 ring-1 ring-emerald-400'
                        : 'bg-[#FAF8F5] border-[#E2DDCF] hover:border-[#D0C9BA]'
                    }`}
                  >
                    {/* Correct answer letter selector */}
                    <button
                      type="button"
                      id={`set-correct-option-${idx}`}
                      onClick={() => {
                        setCorrectIndex(idx);
                        setErrorMessage(null);
                      }}
                      className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-mono-code text-xs font-bold transition-all cursor-pointer ${
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
                      placeholder={`Option ${optionLetters[idx]} statement...`}
                      className="flex-1 bg-transparent border-none text-sm text-[#1C1E1B] placeholder-[#888E83] focus:outline-hidden px-1"
                    />

                    {isCorrect && (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                        <Check className="w-3 h-3" /> Correct Answer
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-xs font-mono-code uppercase font-semibold text-[#555A50] mb-1.5">
              Explanation / Solution Note (Shown after answering)
            </label>
            <textarea
              id="custom-question-explanation"
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain why the selected option is correct and why other options are false..."
              className="w-full p-3 bg-[#FAF8F5] border border-[#DCD6C7] rounded-xl text-sm text-[#1C1E1B] placeholder-[#888E83] focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all leading-relaxed"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#E8E4D9]">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#DCD6C7] bg-white text-[#555A50] hover:bg-[#F4EFE6] text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {!initialData && (
              <button
                type="button"
                id="save-and-add-another-btn"
                onClick={() => handleSubmit(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Save & Add Another
              </button>
            )}

            <button
              type="button"
              id="save-question-btn"
              onClick={() => handleSubmit(false)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {initialData ? 'Update Question' : 'Save Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
