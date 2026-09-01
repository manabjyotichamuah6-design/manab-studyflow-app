import React, { useState, useEffect } from 'react';
import { Flashcard, DifficultyRating } from '../../types';
import {
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Shuffle,
  CheckCircle,
  HelpCircle,
  Award,
  Sparkles,
  Layers,
  Check,
  Plus,
  Sliders,
  Edit3,
} from 'lucide-react';
import { CustomizeCardsModal } from '../flashcards/CustomizeCardsModal';

interface FlashcardsTabProps {
  topic: string;
  flashcards: Flashcard[];
  rawContent?: string;
  onRatingUpdate?: (id: string, rating: DifficultyRating) => void;
  onSessionReviewed?: () => void;
  onUpdateCards?: (updatedCards: Flashcard[]) => void;
}

export const FlashcardsTab: React.FC<FlashcardsTabProps> = ({
  topic,
  flashcards: initialCards,
  rawContent = '',
  onRatingUpdate,
  onSessionReviewed,
  onUpdateCards,
}) => {
  const [cards, setCards] = useState<Flashcard[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filter, setFilter] = useState<'all' | 'need-practice' | 'mastered'>('all');
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'customize' | 'manual' | 'manage'>('customize');

  useEffect(() => {
    setCards(initialCards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [initialCards]);

  const filteredCards = cards.filter((c) => {
    if (filter === 'need-practice') return c.rating === 'practice';
    if (filter === 'mastered') return c.rating === 'mastered';
    return true;
  });

  const currentCard = filteredCards[currentIndex] || filteredCards[0];

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleNext = () => {
    if (currentIndex < filteredCards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRating = (rating: DifficultyRating) => {
    if (!currentCard) return;

    const updated = cards.map((c) => (c.id === currentCard.id ? { ...c, rating } : c));
    setCards(updated);

    if (onRatingUpdate) {
      onRatingUpdate(currentCard.id, rating);
    }
    if (onSessionReviewed) {
      onSessionReviewed();
    }
    if (onUpdateCards) {
      onUpdateCards(updated);
    }

    // Auto-advance if not on last card
    if (currentIndex < filteredCards.length - 1) {
      setTimeout(() => {
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
      }, 250);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Callback when new AI cards are generated
  const handleCardsGenerated = (newCards: Flashcard[], replaceExisting: boolean) => {
    const updated = replaceExisting ? newCards : [...cards, ...newCards];
    setCards(updated);
    if (onUpdateCards) {
      onUpdateCards(updated);
    }
    setCurrentIndex(replaceExisting ? 0 : cards.length);
    setIsFlipped(false);
  };

  // Callback when a manual card is saved
  const handleSaveManualCard = (card: Flashcard, addAnother: boolean = false) => {
    const updated = [...cards, card];
    setCards(updated);
    if (onUpdateCards) {
      onUpdateCards(updated);
    }
    if (!addAnother) {
      setCurrentIndex(cards.length);
      setIsFlipped(false);
    }
  };

  // Callback when deck is edited/reordered/deleted in modal
  const handleUpdateDeck = (updatedCards: Flashcard[]) => {
    setCards(updatedCards);
    if (onUpdateCards) {
      onUpdateCards(updatedCards);
    }
    if (currentIndex >= updatedCards.length) {
      setCurrentIndex(Math.max(0, updatedCards.length - 1));
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCustomizeModalOpen) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const masteredCount = cards.filter((c) => c.rating === 'mastered').length;
  const practiceCount = cards.filter((c) => c.rating === 'practice').length;
  const easyCount = cards.filter((c) => c.rating === 'easy').length;

  if (filteredCards.length === 0) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto text-[#1C1E1B]">
        <div className="bg-white rounded-3xl p-8 border border-[#E5E0D3] text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] border border-emerald-300 text-[#1B4332] flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-serif-display text-xl font-semibold text-[#1C1E1B]">
            {cards.length === 0 ? 'No Flashcards in this Deck' : 'No flashcards match this filter'}
          </h3>
          <p className="text-sm text-[#555A50] max-w-md mx-auto">
            {cards.length === 0
              ? 'Customize the number of cards on a specific topic or generate active recall flashcards.'
              : `You currently have no cards marked under "${filter}".`}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {cards.length > 0 && (
              <button
                onClick={() => {
                  setFilter('all');
                  setCurrentIndex(0);
                }}
                className="px-4 py-2.5 bg-white border border-[#DCD6C7] hover:bg-[#F4EFE6] text-[#1C1E1B] text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                View All Flashcards
              </button>
            )}

            <button
              id="customize-cards-empty-btn"
              onClick={() => {
                setModalInitialTab('customize');
                setIsCustomizeModalOpen(true);
              }}
              className="px-5 py-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-bold rounded-xl transition-all shadow-[0_4px_16px_rgba(27,67,50,0.25)] flex items-center gap-2 cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              Customize Cards
            </button>

            <button
              id="add-flashcards-empty-btn"
              onClick={() => {
                setModalInitialTab('customize');
                setIsCustomizeModalOpen(true);
              }}
              className="px-4 py-2.5 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-[#1B4332] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Flashcards
            </button>
          </div>
        </div>

        {/* Modal */}
        <CustomizeCardsModal
          isOpen={isCustomizeModalOpen}
          onClose={() => setIsCustomizeModalOpen(false)}
          topic={topic}
          rawContent={rawContent}
          existingCards={cards}
          onCardsGenerated={handleCardsGenerated}
          onSaveManualCard={handleSaveManualCard}
          onUpdateDeck={handleUpdateDeck}
          initialTab={modalInitialTab}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto text-[#1C1E1B]">
      {/* Top controls and filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E8E4D9]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-code font-semibold uppercase tracking-wider text-[#1B4332] bg-[#E8F5E9] border border-emerald-300 px-2 py-0.5 rounded">
              Active Recall
            </span>
            <span className="text-xs font-mono-code text-[#6B7267]">
              {cards.length} Total Cards
            </span>
          </div>
          <h2 className="font-serif-display text-2xl font-semibold text-[#1C1E1B] mt-1">
            Flashcard Revision Deck
          </h2>
        </div>

        {/* Action Buttons: Customize Cards & Add Flashcards */}
        <div className="flex items-center gap-2">
          <button
            id="customize-cards-btn"
            onClick={() => {
              setModalInitialTab('customize');
              setIsCustomizeModalOpen(true);
            }}
            className="px-3.5 py-2 bg-white border border-[#DCD6C7] hover:border-emerald-500 hover:bg-[#FAF8F5] text-[#1B4332] text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Customize number of flashcards, difficulty, or topic"
          >
            <Sliders className="w-4 h-4 text-[#1B4332]" />
            <span>Customize Cards</span>
          </button>

          <button
            id="add-flashcards-btn"
            onClick={() => {
              setModalInitialTab('customize');
              setIsCustomizeModalOpen(true);
            }}
            className="px-3.5 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-bold rounded-xl transition-all shadow-[0_4px_14px_rgba(27,67,50,0.25)] flex items-center gap-1.5 cursor-pointer"
            title="Add more flashcards to this deck"
          >
            <Plus className="w-4 h-4 text-[#FAF8F5]" />
            <span>Add Flashcards</span>
          </button>
        </div>
      </div>

      {/* Filter and Shuffle toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F5] p-2.5 rounded-2xl border border-[#E2DDCF]">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#DCD6C7] text-xs font-medium">
          <button
            id="filter-all-cards-btn"
            onClick={() => {
              setFilter('all');
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              filter === 'all' ? 'bg-[#1B4332] text-[#FAF8F5] font-bold' : 'text-[#555A50] hover:text-[#1C1E1B]'
            }`}
          >
            All ({cards.length})
          </button>
          <button
            id="filter-practice-cards-btn"
            onClick={() => {
              setFilter('need-practice');
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              filter === 'need-practice' ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold' : 'text-[#555A50] hover:text-[#1C1E1B]'
            }`}
          >
            Need Practice ({practiceCount})
          </button>
          <button
            id="filter-mastered-cards-btn"
            onClick={() => {
              setFilter('mastered');
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              filter === 'mastered' ? 'bg-[#E8F5E9] text-[#1B4332] border border-emerald-300 font-bold' : 'text-[#555A50] hover:text-[#1C1E1B]'
            }`}
          >
            Mastered ({masteredCount})
          </button>
        </div>

        {/* Deck Utilities: Shuffle / Restart / Manage */}
        <div className="flex items-center gap-2.5 text-xs text-[#555A50] font-mono-code">
          <button
            onClick={handleShuffle}
            className="hover:text-[#1B4332] flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-white cursor-pointer"
            title="Shuffle deck"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#2D6A4F]" />
            Shuffle
          </button>
          <button
            onClick={handleReset}
            className="hover:text-[#1B4332] flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-white cursor-pointer"
            title="Restart from beginning"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#2D6A4F]" />
            Restart
          </button>
          <button
            onClick={() => {
              setModalInitialTab('manage');
              setIsCustomizeModalOpen(true);
            }}
            className="hover:text-[#1B4332] flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-white text-[#1B4332] font-semibold cursor-pointer"
            title="Manage all deck cards"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#1B4332]" />
            Manage Deck
          </button>
        </div>
      </div>

      {/* Progress header */}
      <div className="flex items-center justify-between text-xs text-[#555A50] px-1 font-mono-code">
        <span className="font-semibold text-[#1B4332]">
          Card {currentIndex + 1} of {filteredCards.length}
        </span>
        <span className="text-[11px] text-[#6B7267]">
          {masteredCount} Mastered • {practiceCount} Practice • {easyCount} Easy
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#E8E4D9] h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-[#1B4332] h-full transition-all duration-300 rounded-full"
          style={{ width: `${((currentIndex + 1) / filteredCards.length) * 100}%` }}
        />
      </div>

      {/* Interactive 3D Card Stage with Real Perspective Flip */}
      <div
        className="w-full min-h-[320px] sm:min-h-[360px]"
        style={{ perspective: '1200px' }}
      >
        <div
          id="active-flashcard"
          onClick={handleFlip}
          role="button"
          tabIndex={0}
          aria-label={`Flashcard: ${isFlipped ? 'Answer side' : 'Question side'}. Click to flip.`}
          className="relative w-full h-full min-h-[320px] sm:min-h-[360px] cursor-pointer transition-transform duration-500 ease-out select-none"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* FRONT FACE (Question) */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl bg-white border border-[#E5E0D3] hover:border-emerald-500/60 shadow-[0_8px_30px_rgba(27,67,50,0.08)] p-6 sm:p-10 flex flex-col justify-between"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-[#E8E4D9] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono-code font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#FAF8F5] text-[#1B4332] border border-[#DCD6C7]">
                  FRONT — PROMPT
                </span>
                <span className="text-[10px] font-mono-code text-[#6B7267] hidden sm:inline">
                  3D Flip Ready
                </span>
              </div>

              {currentCard.rating && (
                <span
                  className={`text-[11px] font-mono-code font-semibold px-2 py-0.5 rounded capitalize border ${
                    currentCard.rating === 'mastered'
                      ? 'bg-[#E8F5E9] text-[#1B4332] border-emerald-300'
                      : currentCard.rating === 'practice'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-[#FAF8F5] text-[#333830] border-[#DCD6C7]'
                  }`}
                >
                  {currentCard.rating === 'practice' ? 'Needs Practice' : currentCard.rating}
                </span>
              )}
            </div>

            {/* Prompt Content */}
            <div className="my-auto py-6 text-left">
              <p className="text-xs font-mono-code uppercase tracking-wider text-[#6B7267] mb-2">
                Question / Prompt
              </p>
              <h3 className="font-serif-display text-xl sm:text-2xl font-semibold text-[#1C1E1B] leading-snug">
                {currentCard.front}
              </h3>
            </div>

            {/* Bottom Bar */}
            <div className="pt-3 border-t border-[#E8E4D9] flex items-center justify-between text-xs text-[#6B7267]">
              <span className="flex items-center gap-1.5 font-medium text-[#1B4332]">
                <Sparkles className="w-3.5 h-3.5" />
                Click or press Space to flip to Answer ⟲
              </span>
              <span className="hidden sm:inline font-mono-code text-[11px] text-[#888E83]">
                [Space / Click]
              </span>
            </div>
          </div>

          {/* BACK FACE (Answer) */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl bg-[#FAF8F5] border-2 border-[#1B4332]/20 hover:border-emerald-600 shadow-[0_8px_30px_rgba(27,67,50,0.12)] p-6 sm:p-10 flex flex-col justify-between"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-[#E2DDCF] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono-code font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#E8F5E9] text-[#1B4332] border border-emerald-300">
                  BACK — ANSWER
                </span>
                <span className="text-[10px] font-mono-code text-[#2D6A4F]">
                  ✓ Verified Concept
                </span>
              </div>

              {currentCard.rating && (
                <span
                  className={`text-[11px] font-mono-code font-semibold px-2 py-0.5 rounded capitalize border ${
                    currentCard.rating === 'mastered'
                      ? 'bg-[#E8F5E9] text-[#1B4332] border-emerald-300'
                      : currentCard.rating === 'practice'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-white text-[#333830] border-[#DCD6C7]'
                  }`}
                >
                  {currentCard.rating === 'practice' ? 'Needs Practice' : currentCard.rating}
                </span>
              )}
            </div>

            {/* Answer Content */}
            <div className="my-auto py-6 text-left space-y-2">
              <p className="text-xs font-mono-code uppercase tracking-wider text-[#1B4332] font-semibold">
                Professor Breakdown & Solution
              </p>
              <p className="text-base sm:text-lg text-[#1C1E1B] leading-relaxed font-normal">
                {currentCard.back}
              </p>
            </div>

            {/* Bottom Bar */}
            <div className="pt-3 border-t border-[#E2DDCF] flex items-center justify-between text-xs text-[#6B7267]">
              <span className="flex items-center gap-1.5 text-[#555A50]">
                <RotateCcw className="w-3.5 h-3.5 text-[#1B4332]" />
                Click again to flip back to question
              </span>
              <span className="font-mono-code text-[11px] text-[#1B4332] font-bold">
                Rate your recall below ↓
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rating & Mastery Buttons */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5E0D3] shadow-xs space-y-3">
        <div className="text-center">
          <span className="text-xs font-medium text-[#333830]">
            How well did you recall this concept?
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <button
            id="rating-easy-btn"
            onClick={() => handleRating('easy')}
            className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
              currentCard.rating === 'easy'
                ? 'bg-[#F4EFE6] border-[#B8B2A4] text-[#1C1E1B] font-bold'
                : 'bg-[#FAF8F5] border-[#E2DDCF] text-[#333830] hover:bg-[#F4EFE6]'
            }`}
          >
            <Check className="w-4 h-4 text-[#6B7267]" />
            Easy
          </button>

          <button
            id="rating-practice-btn"
            onClick={() => handleRating('practice')}
            className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
              currentCard.rating === 'practice'
                ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                : 'bg-[#FAF8F5] border-[#E2DDCF] text-amber-800 hover:bg-amber-50'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-700" />
            Need Practice
          </button>

          <button
            id="rating-mastered-btn"
            onClick={() => handleRating('mastered')}
            className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
              currentCard.rating === 'mastered'
                ? 'bg-[#E8F5E9] border-emerald-500 text-[#1B4332] font-bold'
                : 'bg-[#FAF8F5] border-[#E2DDCF] text-[#1B4332] hover:bg-[#E8F5E9]'
            }`}
          >
            <Award className="w-4 h-4 text-[#1B4332]" />
            Mastered
          </button>
        </div>
      </div>

      {/* Navigation Buttons: ← PREVIOUS / NEXT → */}
      <div className="flex items-center justify-between gap-4">
        <button
          id="flashcard-prev-btn"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`flex-1 py-3 px-4 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
            currentIndex === 0
              ? 'bg-[#FAF8F5] text-[#A29C8F] border-[#E2DDCF] cursor-not-allowed'
              : 'bg-white border-[#DCD6C7] text-[#1C1E1B] hover:bg-[#F4EFE6] active:scale-98'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          ← PREVIOUS
        </button>

        <button
          id="flashcard-next-btn"
          onClick={handleNext}
          disabled={currentIndex === filteredCards.length - 1}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
            currentIndex === filteredCards.length - 1
              ? 'bg-[#FAF8F5] text-[#A29C8F] border border-[#E2DDCF] cursor-not-allowed'
              : 'bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] shadow-[0_4px_16px_rgba(27,67,50,0.25)] active:scale-98'
          }`}
        >
          NEXT →
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Customize & Add Flashcards Modal */}
      <CustomizeCardsModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
        topic={topic}
        rawContent={rawContent}
        existingCards={cards}
        onCardsGenerated={handleCardsGenerated}
        onSaveManualCard={handleSaveManualCard}
        onUpdateDeck={handleUpdateDeck}
        initialTab={modalInitialTab}
      />
    </div>
  );
};

