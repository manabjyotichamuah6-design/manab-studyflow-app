import React, { useState } from 'react';
import { 
  LogOut, 
  ArrowLeft, 
  Star, 
  CheckCircle2, 
  Sparkles, 
  MessageSquare, 
  ShieldCheck, 
  BookOpen, 
  Heart,
  Smile,
  Check
} from 'lucide-react';
import { UserProfile, UserProgress } from '../types';

interface LogoutFeedbackViewProps {
  userProfile: UserProfile | null;
  progress?: UserProgress;
  onConfirmSignOut: (feedback?: { reason: string; rating: number; thoughts: string; favoriteFeature: string }) => void;
  onCancel: () => void;
}

const EXIT_REASONS = [
  { id: 'completed_goals', label: 'Completed my study goals for today', emoji: '🎯' },
  { id: 'taking_break', label: 'Taking a short break (will return later)', emoji: '☕' },
  { id: 'switching_device', label: 'Switching to another device or browser', emoji: '💻' },
  { id: 'rest_eyes', label: 'Resting my eyes & wrapping up', emoji: '🌙' },
  { id: 'faced_issue', label: 'Faced a difficulty or confusing feature', emoji: '🛠️' },
  { id: 'other', label: 'Other personal reason', emoji: '✍️' },
];

const FAVORITE_FEATURES = [
  'Smart AI Notes',
  'Active Recall Flashcards',
  'Practice Quizzes',
  'Focus Session Timer',
  'Feynman Explanations',
  'Study Timetable Planner',
  'AI Doubt Solver',
  'Clean UI & Atmosphere',
];

export const LogoutFeedbackView: React.FC<LogoutFeedbackViewProps> = ({
  userProfile,
  progress,
  onConfirmSignOut,
  onCancel,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [otherReasonText, setOtherReasonText] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [favoriteFeature, setFavoriteFeature] = useState<string>('Smart AI Notes');
  const [thoughts, setThoughts] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 1: return 'Could be much better';
      case 2: return 'Fair, needs improvement';
      case 3: return 'Good, helpful study tools';
      case 4: return 'Great experience!';
      case 5: return 'Outstanding! Loved it ⭐';
      default: return '';
    }
  };

  const handleCompleteSignOut = () => {
    if (!selectedReason) {
      setErrorMsg('Please select a reason for logging out to proceed.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const finalReason = selectedReason === 'other' && otherReasonText.trim() 
      ? `Other: ${otherReasonText.trim()}` 
      : EXIT_REASONS.find(r => r.id === selectedReason)?.label || selectedReason;

    // Small simulated brief transition
    setTimeout(() => {
      onConfirmSignOut({
        reason: finalReason,
        rating,
        thoughts: thoughts.trim(),
        favoriteFeature,
      });
    }, 400);
  };

  return (
    <div className="min-h-[85vh] py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto animate-fade-in">
      {/* Top back navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          id="btn-cancel-logout-top"
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#2D6A4F] hover:text-[#1B4332] bg-[#E3EDE5] hover:bg-[#D4E5D8] px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Keep Studying (Cancel)</span>
        </button>

        <span className="text-[11px] font-mono-code text-[#6B7267] flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E8E4D9] px-2.5 py-1 rounded-lg">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
          Progress Auto-Saved
        </span>
      </div>

      {/* Main Confirmation Card */}
      <div className="bg-[#FAF8F5] border-2 border-[#1B4332]/20 rounded-3xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)] relative overflow-hidden">
        {/* Decorative subtle background accents */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-[#D8F3DC]/40 rounded-full blur-2xl pointer-events-none" />

        {/* Header Question */}
        <div className="relative z-10 text-center max-w-xl mx-auto mb-8">
          <div className="w-14 h-14 bg-rose-100 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-700 shadow-xs">
            <LogOut className="w-7 h-7" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1E1B] tracking-tight">
            Are you sure you want to log out?
          </h1>
          <p className="text-sm text-[#555A50] mt-2">
            Goodbye for now, <strong className="text-[#1B4332]">{userProfile?.name || 'Student'}</strong>! 
            Before you leave, please share quick feedback so we can continue making StudyFlow even better for you.
          </p>

          {/* Activity summary pill */}
          {progress && (
            <div className="mt-4 inline-flex items-center gap-4 bg-[#F2EDE2] border border-[#E8E4D9] px-4 py-2 rounded-2xl text-xs text-[#2D6A4F] font-medium">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <strong>{progress.topicsStudied}</strong> topics studied
              </span>
              <span className="text-[#D5CFBF]">•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <strong>{progress.quizzesCompleted}</strong> quizzes taken
              </span>
              <span className="text-[#D5CFBF]">•</span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <strong>{progress.masteredCards}</strong> cards mastered
              </span>
            </div>
          )}
        </div>

        {/* Feedback Form Content */}
        <div className="space-y-7 relative z-10">
          {/* QUESTION 1: Reason for leaving */}
          <div className="bg-white/80 border border-[#E8E4D9] rounded-2xl p-5 shadow-xs">
            <label className="block text-sm font-bold text-[#1C1E1B] mb-1">
              1. Why do you want to log out right now? <span className="text-rose-600">*</span>
            </label>
            <p className="text-xs text-[#6B7267] mb-3.5">
              Select the option that best describes your reason for leaving today:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {EXIT_REASONS.map((r) => {
                const isSelected = selectedReason === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    id={`reason-opt-${r.id}`}
                    onClick={() => {
                      setSelectedReason(r.id);
                      setErrorMsg('');
                    }}
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-[#E3EDE5] border-[#1B4332] text-[#1B4332] ring-1 ring-[#1B4332] shadow-xs'
                        : 'bg-[#FAF8F5] border-[#E8E4D9] text-[#2C302B] hover:bg-[#F2EDE2]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{r.emoji}</span>
                      <span>{r.label}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#1B4332] shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>

            {/* If other is selected, show details box */}
            {selectedReason === 'other' && (
              <div className="mt-3 animate-fade-in">
                <input
                  type="text"
                  id="input-other-reason"
                  value={otherReasonText}
                  onChange={(e) => setOtherReasonText(e.target.value)}
                  placeholder="Please specify your reason here..."
                  className="w-full px-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#D5CFBF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#2D6A4F] text-[#1C1E1B]"
                />
              </div>
            )}
          </div>

          {/* QUESTION 2: Rating */}
          <div className="bg-white/80 border border-[#E8E4D9] rounded-2xl p-5 shadow-xs">
            <label className="block text-sm font-bold text-[#1C1E1B] mb-1">
              2. How did you like using the platform today?
            </label>
            <p className="text-xs text-[#6B7267] mb-3">
              Rate your overall study experience:
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating !== null ? hoverRating : rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      id={`rating-star-${star}`}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="p-1 text-2xl transition-transform hover:scale-125 cursor-pointer focus:outline-hidden"
                      aria-label={`Rate ${star} star`}
                    >
                      <Star
                        className={`w-7 h-7 ${
                          isFilled
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-[#D5CFBF] hover:text-amber-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F2EDE2] border border-[#E8E4D9] rounded-xl text-xs font-bold text-[#1B4332]">
                <Smile className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>{getRatingLabel(hoverRating !== null ? hoverRating : rating)}</span>
              </div>
            </div>
          </div>

          {/* QUESTION 3: Favorite Feature */}
          <div className="bg-white/80 border border-[#E8E4D9] rounded-2xl p-5 shadow-xs">
            <label className="block text-sm font-bold text-[#1C1E1B] mb-1">
              3. Which feature was most helpful during your study?
            </label>
            <p className="text-xs text-[#6B7267] mb-3">
              Select the tool you enjoyed using the most:
            </p>

            <div className="flex flex-wrap gap-2">
              {FAVORITE_FEATURES.map((feat) => {
                const isSelected = favoriteFeature === feat;
                return (
                  <button
                    key={feat}
                    type="button"
                    id={`feat-opt-${feat.replace(/\s+/g, '-').toLowerCase()}`}
                    onClick={() => setFavoriteFeature(feat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1B4332] text-white border border-[#1B4332] shadow-xs'
                        : 'bg-[#FAF8F5] text-[#4B5047] border border-[#E8E4D9] hover:bg-[#EAE4D5]'
                    }`}
                  >
                    {feat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* QUESTION 4: Additional suggestions/thoughts */}
          <div className="bg-white/80 border border-[#E8E4D9] rounded-2xl p-5 shadow-xs">
            <label className="block text-sm font-bold text-[#1C1E1B] mb-1">
              4. Any suggestions, thoughts, or requests before logging out? <span className="text-[#6B7267] font-normal">(optional)</span>
            </label>
            <p className="text-xs text-[#6B7267] mb-2.5">
              Tell us what we can improve or add next for your studies:
            </p>

            <div className="relative">
              <textarea
                id="textarea-logout-feedback"
                value={thoughts}
                onChange={(e) => setThoughts(e.target.value)}
                placeholder="Write your suggestions, comments, or what you worked on today..."
                rows={3}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border border-[#D5CFBF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#2D6A4F] text-[#1C1E1B] resize-none"
              />
              <MessageSquare className="w-4 h-4 text-[#8C9286] absolute right-3 bottom-3 pointer-events-none" />
            </div>
          </div>

          {/* Validation Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-shake">
              <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-[#E8E4D9]">
            <button
              type="button"
              id="btn-cancel-logout-bottom"
              onClick={onCancel}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-[#4B5047] bg-[#EAE4D5] hover:bg-[#DFD9C9] transition-colors cursor-pointer text-center"
            >
              Cancel & Continue Studying
            </button>

            <button
              type="button"
              id="btn-confirm-logout-submit"
              onClick={handleCompleteSignOut}
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                isSubmitting
                  ? 'bg-[#1B4332]/60 cursor-not-allowed'
                  : 'bg-rose-700 hover:bg-rose-800 hover:shadow-lg'
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Feedback & Logging Out...' : 'Submit Feedback & Log Out'}</span>
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-[11px] text-[#6B7267] flex items-center justify-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>Thank you for studying with StudyFlow. Your data is safely stored on this device.</span>
        </div>
      </div>
    </div>
  );
};
