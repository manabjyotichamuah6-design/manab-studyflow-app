import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Layers,
  AlertCircle,
  Loader2,
  Plus,
  Save,
  Sliders,
  Edit3,
  Trash2,
  CheckCircle2,
  BookOpen,
  ListFilter,
} from 'lucide-react';
import { Flashcard, DifficultyRating } from '../../types';

interface CustomizeCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  rawContent?: string;
  existingCards: Flashcard[];
  onCardsGenerated: (newCards: Flashcard[], replaceExisting: boolean) => void;
  onSaveManualCard: (card: Flashcard, addAnother?: boolean) => void;
  onUpdateDeck?: (updatedCards: Flashcard[]) => void;
  initialTab?: 'customize' | 'manual' | 'manage';
}

export const CustomizeCardsModal: React.FC<CustomizeCardsModalProps> = ({
  isOpen,
  onClose,
  topic,
  rawContent = '',
  existingCards,
  onCardsGenerated,
  onSaveManualCard,
  onUpdateDeck,
  initialTab = 'customize',
}) => {
  const [activeTab, setActiveTab] = useState<'customize' | 'manual' | 'manage'>(initialTab);

  // Customize & AI Generation State
  const [cardCountInput, setCardCountInput] = useState<string>('8');
  const [specificTopicInput, setSpecificTopicInput] = useState<string>(topic || '');
  const [focusPromptInput, setFocusPromptInput] = useState<string>('');
  const [cardDifficulty, setCardDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [replaceExisting, setReplaceExisting] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Manual Card Creation State
  const [manualFront, setManualFront] = useState<string>('');
  const [manualBack, setManualBack] = useState<string>('');
  const [manualRating, setManualRating] = useState<DifficultyRating>('practice');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  // Deck Management State
  const [managedCards, setManagedCards] = useState<Flashcard[]>(existingCards);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSpecificTopicInput(topic || '');
      setManagedCards(existingCards);
      setErrorMessage(null);
      setEditingCardId(null);
      setManualFront('');
      setManualBack('');
    }
  }, [isOpen, topic, existingCards, initialTab]);

  if (!isOpen) return null;

  const handleCountChange = (val: string) => {
    setCardCountInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 50) {
      setErrorMessage(null);
    }
  };

  // AI Flashcard Generation Handler
  const handleGenerateCards = async () => {
    const parsed = parseInt(cardCountInput, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 50) {
      setErrorMessage('Please enter a valid number of flashcards between 1 and 50.');
      return;
    }

    const targetTopic = specificTopicInput.trim() || topic || 'Study Material';
    const finalCount = Math.min(Math.max(parsed, 1), 50);

    setIsAiLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/study/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: targetTopic,
          content: rawContent || `High-yield flashcard prompts and answers on ${targetTopic}`,
          count: finalCount,
          difficulty: cardDifficulty,
          focusPrompt: focusPromptInput.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate flashcards.');
      }

      const resData = await response.json();
      const generated = resData.data;

      if (Array.isArray(generated) && generated.length > 0) {
        const formatted: Flashcard[] = generated.map((c: any, idx: number) => ({
          id: c.id || `custom-fc-${Date.now()}-${idx + 1}`,
          front: c.front,
          back: c.back,
          topic: targetTopic,
          rating: 'practice',
        }));

        onCardsGenerated(formatted, replaceExisting);
        onClose();
      } else {
        throw new Error('No flashcards were returned by the generator.');
      }
    } catch (err: any) {
      console.error('Customize flashcards error:', err);
      setErrorMessage(err.message || 'Error generating cards with AI. Please try again.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Manual Card Submit Handler
  const handleSaveManual = (addAnother: boolean = false) => {
    if (!manualFront.trim()) {
      setErrorMessage('Please enter the question or prompt for the Front of the card.');
      return;
    }

    if (!manualBack.trim()) {
      setErrorMessage('Please enter the answer or explanation for the Back of the card.');
      return;
    }

    if (editingCardId) {
      // Update existing card in deck
      const updated = managedCards.map((c) =>
        c.id === editingCardId
          ? {
              ...c,
              front: manualFront.trim(),
              back: manualBack.trim(),
              rating: manualRating,
              topic: specificTopicInput.trim() || c.topic || topic,
            }
          : c
      );
      setManagedCards(updated);
      if (onUpdateDeck) {
        onUpdateDeck(updated);
      }
      setEditingCardId(null);
      setManualFront('');
      setManualBack('');
      setActiveTab('manage');
      return;
    }

    const newCard: Flashcard = {
      id: `manual-fc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      front: manualFront.trim(),
      back: manualBack.trim(),
      rating: manualRating,
      topic: specificTopicInput.trim() || topic || 'Custom Deck',
    };

    onSaveManualCard(newCard, addAnother);

    if (addAnother) {
      setManualFront('');
      setManualBack('');
      setErrorMessage(null);
    } else {
      onClose();
    }
  };

  const handleEditCardFromList = (card: Flashcard) => {
    setEditingCardId(card.id);
    setManualFront(card.front);
    setManualBack(card.back);
    setManualRating(card.rating || 'practice');
    setActiveTab('manual');
  };

  const handleDeleteCardFromList = (cardId: string) => {
    const updated = managedCards.filter((c) => c.id !== cardId);
    setManagedCards(updated);
    if (onUpdateDeck) {
      onUpdateDeck(updated);
    }
  };

  const currentCountNumber = parseInt(cardCountInput, 10) || 8;
  const countPresets = [5, 8, 12, 20, 30];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5E0D3] w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 text-[#1C1E1B] space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E4D9] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F5E9] border border-emerald-300 text-[#1B4332] flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#1C1E1B]">
                Customize Flashcards
              </h2>
              <p className="text-xs text-[#6B7267]">
                Choose number of cards, target topic, difficulty, or write custom recall cards.
              </p>
            </div>
          </div>
          <button
            id="close-customize-cards-modal-btn"
            onClick={onClose}
            disabled={isAiLoading}
            className="p-2 rounded-xl text-[#6B7267] hover:text-[#1C1E1B] hover:bg-[#F4EFE6] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Customize AI / Write Manually / Manage Deck */}
        <div className="flex items-center p-1 bg-[#FAF8F5] border border-[#DCD6C7] rounded-2xl gap-1">
          <button
            type="button"
            id="tab-customize-cards-btn"
            onClick={() => {
              setActiveTab('customize');
              setEditingCardId(null);
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'customize'
                ? 'bg-white text-[#1B4332] shadow-xs border border-emerald-300 font-bold'
                : 'text-[#6B7267] hover:text-[#1C1E1B]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#1B4332]" />
            <span>Customize & Generate</span>
          </button>

          <button
            type="button"
            id="tab-write-manual-card-btn"
            onClick={() => {
              setActiveTab('manual');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-white text-[#1B4332] shadow-xs border border-emerald-300 font-bold'
                : 'text-[#6B7267] hover:text-[#1C1E1B]'
            }`}
          >
            <Edit3 className="w-4 h-4 text-[#555A50]" />
            <span>{editingCardId ? 'Edit Card' : 'Write Manually'}</span>
          </button>

          <button
            type="button"
            id="tab-manage-deck-btn"
            onClick={() => {
              setActiveTab('manage');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'manage'
                ? 'bg-white text-[#1B4332] shadow-xs border border-emerald-300 font-bold'
                : 'text-[#6B7267] hover:text-[#1C1E1B]'
            }`}
          >
            <ListFilter className="w-4 h-4 text-[#555A50]" />
            <span>Deck ({managedCards.length})</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. CUSTOMIZE & GENERATE TAB */}
        {activeTab === 'customize' && (
          <div className="space-y-4">
            {/* Number of Flashcards to Make */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="custom-flashcard-count-input"
                  className="block text-xs font-mono-code uppercase font-semibold text-[#555A50]"
                >
                  Number of Flashcards to Add (1 - 50) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-[#2D6A4F] font-semibold">
                  Batch size: {currentCountNumber} Cards
                </span>
              </div>

              <div className="bg-[#FAF8F5] p-3.5 border border-[#DCD6C7] rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    id="custom-flashcard-count-input"
                    type="number"
                    min="1"
                    max="50"
                    value={cardCountInput}
                    onChange={(e) => handleCountChange(e.target.value)}
                    placeholder="e.g. 8, 15, 25, 50"
                    className="w-28 sm:w-36 p-2.5 bg-white border border-emerald-300 rounded-xl text-xl font-bold text-center text-[#1B4332] focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40"
                  />
                  <div className="flex-1 text-xs text-[#555A50] leading-snug">
                    <span className="font-semibold text-[#1C1E1B] block">
                      Choose exact card quantity
                    </span>
                    <span>Set anywhere between 1 to 50 active recall cards.</span>
                  </div>
                </div>

                {/* Quick Count Presets */}
                <div className="flex items-center gap-2 pt-1 border-t border-[#E2DDCF]">
                  <span className="text-[11px] font-mono-code text-[#6B7267]">Quick Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {countPresets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        id={`count-preset-${preset}-btn`}
                        onClick={() => handleCountChange(String(preset))}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono-code font-bold transition-all cursor-pointer ${
                          cardCountInput === String(preset)
                            ? 'bg-[#1B4332] text-white shadow-xs'
                            : 'bg-white border border-[#DCD6C7] text-[#333830] hover:bg-[#E8F5E9]'
                        }`}
                      >
                        {preset} Cards
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Specific Topic Input */}
            <div>
              <label
                htmlFor="custom-flashcard-topic-input"
                className="block text-xs font-mono-code uppercase font-semibold text-[#555A50] mb-1"
              >
                Specific Topic / Subject Area <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="custom-flashcard-topic-input"
                  type="text"
                  value={specificTopicInput}
                  onChange={(e) => setSpecificTopicInput(e.target.value)}
                  placeholder="e.g. Thermodynamics Laws, Newton's 3rd Law, Photosynthesis Light Reactions"
                  className="w-full p-3 pl-9 bg-[#FAF8F5] border border-[#DCD6C7] rounded-xl text-sm font-medium text-[#1C1E1B] placeholder-[#888E83] focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
                />
                <BookOpen className="w-4 h-4 text-[#2D6A4F] absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Specific Focus / Sub-topics (Optional) */}
            <div>
              <label
                htmlFor="custom-flashcard-focus-input"
                className="block text-xs font-mono-code uppercase font-semibold text-[#555A50] mb-1"
              >
                Specific Focus / Subtopic Nuances (Optional)
              </label>
              <input
                id="custom-flashcard-focus-input"
                type="text"
                value={focusPromptInput}
                onChange={(e) => setFocusPromptInput(e.target.value)}
                placeholder="e.g. Focus on definitions, core formula cues, tricky exam traps..."
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD6C7] rounded-xl text-xs sm:text-sm text-[#1C1E1B] placeholder-[#888E83] focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="block text-xs font-mono-code uppercase font-semibold text-[#555A50] mb-1.5">
                Difficulty / Depth Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {(
                  [
                    {
                      id: 'easy',
                      title: 'Foundational',
                      desc: 'Definitions & key facts',
                      color: 'border-emerald-300 bg-emerald-50 text-emerald-900',
                    },
                    {
                      id: 'medium',
                      title: 'Standard',
                      desc: 'Mechanisms & core links',
                      color: 'border-amber-300 bg-amber-50 text-amber-900',
                    },
                    {
                      id: 'hard',
                      title: 'Advanced / Traps',
                      desc: 'Complex cues & derivations',
                      color: 'border-rose-300 bg-rose-50 text-rose-900',
                    },
                  ] as const
                ).map((lvl) => {
                  const isSelected = cardDifficulty === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      id={`card-diff-${lvl.id}`}
                      onClick={() => setCardDifficulty(lvl.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? `${lvl.color} ring-2 ring-emerald-600 shadow-xs font-bold`
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

            {/* Append vs Replace Choice */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E2DDCF] rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#333830]">
                <Layers className="w-4 h-4 text-[#1B4332] shrink-0" />
                <span>Deck Action:</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="card-mode-append-btn"
                  onClick={() => setReplaceExisting(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !replaceExisting
                      ? 'bg-[#1B4332] text-white shadow-xs'
                      : 'bg-white text-[#555A50] border border-[#DCD6C7]'
                  }`}
                >
                  + Add to Current Deck (+{currentCountNumber})
                </button>
                <button
                  type="button"
                  id="card-mode-replace-btn"
                  onClick={() => setReplaceExisting(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    replaceExisting
                      ? 'bg-[#1B4332] text-white shadow-xs'
                      : 'bg-white text-[#555A50] border border-[#DCD6C7]'
                  }`}
                >
                  Replace Deck
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. MANUAL FLASHCARD CREATION TAB */}
        {activeTab === 'manual' && (
          <div className="space-y-4">
            {/* Front Prompt */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="manual-flashcard-front"
                  className="block text-xs font-mono-code uppercase font-semibold text-[#555A50]"
                >
                  FRONT (Question / Cue / Concept) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] font-mono-code text-[#2D6A4F] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Prompt Side
                </span>
              </div>
              <textarea
                id="manual-flashcard-front"
                rows={3}
                value={manualFront}
                onChange={(e) => {
                  setManualFront(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="e.g., What is Le Chatelier's Principle and how does temperature affect exothermic reactions?"
                className="w-full p-3 bg-[#FAF8F5] border border-[#DCD6C7] rounded-xl text-sm text-[#1C1E1B] placeholder-[#888E83] focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all leading-relaxed"
              />
            </div>

            {/* Back Answer */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="manual-flashcard-back"
                  className="block text-xs font-mono-code uppercase font-semibold text-[#555A50]"
                >
                  BACK (Answer / Explanation / Professor Breakdown) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] font-mono-code text-[#1B4332] bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  Answer Side
                </span>
              </div>
              <textarea
                id="manual-flashcard-back"
                rows={4}
                value={manualBack}
                onChange={(e) => {
                  setManualBack(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="e.g., If a dynamic equilibrium is disturbed by changing conditions, the position of equilibrium shifts to counteract the change. For exothermic reactions, increasing temperature shifts equilibrium to the left (reactants)."
                className="w-full p-3 bg-[#FAF8F5] border border-[#DCD6C7] rounded-xl text-sm text-[#1C1E1B] placeholder-[#888E83] focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all leading-relaxed"
              />
            </div>

            {/* Initial Recall Rating */}
            <div>
              <label className="block text-xs font-mono-code uppercase font-semibold text-[#555A50] mb-1">
                Initial Recall Rating
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'easy', label: 'Easy' },
                    { id: 'practice', label: 'Need Practice' },
                    { id: 'mastered', label: 'Mastered' },
                  ] as const
                ).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setManualRating(r.id)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                      manualRating === r.id
                        ? 'bg-[#E8F5E9] border-emerald-500 text-[#1B4332] font-bold ring-1 ring-emerald-500'
                        : 'bg-[#FAF8F5] border-[#DCD6C7] text-[#555A50] hover:bg-[#F4EFE6]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. MANAGE CURRENT DECK TAB */}
        {activeTab === 'manage' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#555A50]">
                Current Deck Cards ({managedCards.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  setEditingCardId(null);
                  setManualFront('');
                  setManualBack('');
                  setActiveTab('manual');
                }}
                className="text-xs font-bold text-[#1B4332] hover:text-[#2D6A4F] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Card
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {managedCards.length === 0 ? (
                <div className="p-8 text-center bg-[#FAF8F5] rounded-2xl border border-[#E2DDCF] text-[#6B7267] text-xs">
                  No flashcards in this deck. Use the "Customize & Generate" tab to generate cards!
                </div>
              ) : (
                managedCards.map((card, idx) => (
                  <div
                    key={card.id || idx}
                    className="p-3 bg-[#FAF8F5] border border-[#DCD6C7] rounded-xl flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-code font-bold text-[#1B4332]">#{idx + 1}</span>
                        <span className="font-semibold text-[#1C1E1B] line-clamp-1">{card.front}</span>
                      </div>
                      <p className="text-[#555A50] text-[11px] line-clamp-2">{card.back}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleEditCardFromList(card)}
                        className="p-1.5 text-[#555A50] hover:text-[#1B4332] hover:bg-white rounded-lg border border-transparent hover:border-[#DCD6C7] transition-colors cursor-pointer"
                        title="Edit Card"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCardFromList(card.id)}
                        className="p-1.5 text-[#888E83] hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                        title="Delete Card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
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

          {activeTab === 'customize' ? (
            <button
              type="button"
              id="confirm-customize-cards-btn"
              onClick={handleGenerateCards}
              disabled={isAiLoading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] disabled:opacity-50 text-white text-xs sm:text-sm font-bold transition-all shadow-[0_4px_16px_rgba(27,67,50,0.25)] flex items-center justify-center gap-2 cursor-pointer"
            >
              {isAiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating {currentCountNumber} Flashcards...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  Add Flashcards ({currentCountNumber} Cards)
                </>
              )}
            </button>
          ) : activeTab === 'manual' ? (
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {!editingCardId && (
                <button
                  type="button"
                  id="save-card-and-add-another-btn"
                  onClick={() => handleSaveManual(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-[#1B4332] hover:bg-emerald-100 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Save & Add Another
                </button>
              )}

              <button
                type="button"
                id="save-manual-card-btn"
                onClick={() => handleSaveManual(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs sm:text-sm font-bold transition-all shadow-[0_4px_16px_rgba(27,67,50,0.25)] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {editingCardId ? 'Update Flashcard' : 'Add Flashcard'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              id="done-managing-deck-btn"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer"
            >
              Done Managing ({managedCards.length} Cards)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
