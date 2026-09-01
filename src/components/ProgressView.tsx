import React, { useState } from 'react';
import {
  TrendingUp,
  BookOpen,
  HelpCircle,
  Layers,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Target,
  Award,
  CheckSquare,
  AlertCircle,
  Flame,
} from 'lucide-react';
import {
  UserProgress,
  FocusSessionLog,
  AppView,
  NoteItem,
  StudyPlanTask,
  StudySession,
} from '../types';
import { calculateGenuineProgress } from '../utils/progressCalculator';

interface ProgressViewProps {
  progress: UserProgress;
  focusLogs: FocusSessionLog[];
  notes?: NoteItem[];
  planTasks?: StudyPlanTask[];
  sessions?: StudySession[];
  onNavigate: (view: AppView) => void;
  onResetProgress?: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  progress,
  focusLogs,
  notes = [],
  planTasks = [],
  sessions = [],
  onNavigate,
  onResetProgress,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const genuineStats = calculateGenuineProgress(progress, notes, planTasks, focusLogs, sessions);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-[#1C1E1B]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#2D6A4F] bg-[#E3EDE5] px-3 py-1 rounded-full">
              Verified Learning Metrics
            </span>
            <span className="text-xs text-[#8A9085]">
              {genuineStats.hasAnyActivity ? 'Active Progress' : 'Fresh Student Account'}
            </span>
          </div>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1E1B]">
            My Study Progression & Analytics
          </h1>
          <p className="text-sm text-[#555A51] mt-1">
            Zero fake numbers. Every metric is computed strictly from your real notes, quiz submissions, flashcard reviews, and timetable tasks.
          </p>
        </div>

        {onResetProgress && (
          <div className="flex items-center gap-2">
            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="px-3.5 py-2 rounded-xl border border-[#D5CFBF] hover:border-red-400 bg-white hover:bg-red-50 text-xs font-bold text-[#6B7267] hover:text-red-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Progress to 0%</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-red-50 border border-red-300 p-1.5 rounded-xl text-xs">
                <span className="text-red-800 font-semibold px-2">Clear all activity metrics?</span>
                <button
                  type="button"
                  onClick={() => {
                    onResetProgress();
                    setShowResetConfirm(false);
                  }}
                  className="px-2.5 py-1 bg-red-700 text-white rounded-lg font-bold hover:bg-red-800 cursor-pointer"
                >
                  Yes, Reset to 0%
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2 py-1 text-gray-600 hover:text-black font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Overall Progress Dashboard Card */}
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8E4D9] p-6 sm:p-8 mb-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E4D9]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1B4332]">
              <Target className="w-4 h-4 text-[#2D6A4F]" />
              <span>OVERALL SYLLABUS & PRACTICE COMPLETION</span>
            </div>
            <p className="text-xs text-[#6B7267] mt-1 max-w-xl">
              Composite mastery calculated across 5 core study pillars: Notes (25%), Quizzes (25%), Flashcards (20%), Timetable Tasks (20%), and Focus Sessions (10%).
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-[#E8E4D9]">
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono-code font-bold text-[#8A9085] block">
                Overall Progress
              </span>
              <span className="font-serif-display text-4xl font-bold text-[#1B4332] block leading-none">
                {genuineStats.overallProgressPercent}%
              </span>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-[#E3EDE5] flex items-center justify-center font-mono-code text-xs font-bold text-[#1B4332]">
              {genuineStats.overallProgressPercent}%
            </div>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div>
          <div className="w-full bg-[#EFEBE0] h-4 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-[#2D6A4F] to-[#1B4332] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.max(genuineStats.overallProgressPercent, 0)}%` }}
            />
          </div>
        </div>

        {/* 5-Pillar Score Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="bg-white p-3.5 rounded-xl border border-[#E8E4D9]">
            <div className="flex items-center justify-between text-[11px] text-[#6B7267] font-semibold mb-1">
              <span>1. Study Notes</span>
              <BookOpen className="w-3.5 h-3.5 text-[#2D6A4F]" />
            </div>
            <div className="font-serif-display text-xl font-bold text-[#1B4332]">
              {genuineStats.scoreBreakdown.notesScore} <span className="text-xs font-normal text-[#8A9085]">/ 25 pts</span>
            </div>
            <div className="text-[10px] text-[#8A9085] mt-0.5">{genuineStats.totalNotes} notes created</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E8E4D9]">
            <div className="flex items-center justify-between text-[11px] text-[#6B7267] font-semibold mb-1">
              <span>2. Quizzes</span>
              <HelpCircle className="w-3.5 h-3.5 text-[#2D6A4F]" />
            </div>
            <div className="font-serif-display text-xl font-bold text-[#1B4332]">
              {genuineStats.scoreBreakdown.quizScore} <span className="text-xs font-normal text-[#8A9085]">/ 25 pts</span>
            </div>
            <div className="text-[10px] text-[#8A9085] mt-0.5">
              {genuineStats.totalQuizzesTaken > 0
                ? `${genuineStats.averageQuizAccuracy}% accuracy`
                : '0 quizzes taken'}
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E8E4D9]">
            <div className="flex items-center justify-between text-[11px] text-[#6B7267] font-semibold mb-1">
              <span>3. Flashcards</span>
              <Layers className="w-3.5 h-3.5 text-[#2D6A4F]" />
            </div>
            <div className="font-serif-display text-xl font-bold text-[#1B4332]">
              {genuineStats.scoreBreakdown.flashcardScore} <span className="text-xs font-normal text-[#8A9085]">/ 20 pts</span>
            </div>
            <div className="text-[10px] text-[#8A9085] mt-0.5">
              {genuineStats.totalFlashcardsMastered} mastered ({genuineStats.totalFlashcardsPracticed} reviewed)
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E8E4D9]">
            <div className="flex items-center justify-between text-[11px] text-[#6B7267] font-semibold mb-1">
              <span>4. Timetable Tasks</span>
              <CheckSquare className="w-3.5 h-3.5 text-[#2D6A4F]" />
            </div>
            <div className="font-serif-display text-xl font-bold text-[#1B4332]">
              {genuineStats.scoreBreakdown.tasksScore} <span className="text-xs font-normal text-[#8A9085]">/ 20 pts</span>
            </div>
            <div className="text-[10px] text-[#8A9085] mt-0.5">
              {genuineStats.totalTasksCompleted} / {genuineStats.totalTasksScheduled} completed
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E8E4D9] col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-[11px] text-[#6B7267] font-semibold mb-1">
              <span>5. Focus Sessions</span>
              <Clock className="w-3.5 h-3.5 text-[#2D6A4F]" />
            </div>
            <div className="font-serif-display text-xl font-bold text-[#1B4332]">
              {genuineStats.scoreBreakdown.focusScore} <span className="text-xs font-normal text-[#8A9085]">/ 10 pts</span>
            </div>
            <div className="text-[10px] text-[#8A9085] mt-0.5">{genuineStats.totalFocusMinutes} minutes</div>
          </div>
        </div>
      </div>

      {!genuineStats.hasAnyActivity ? (
        /* Fresh Student Empty State */
        <div className="bg-[#FAF8F5] rounded-3xl border border-dashed border-[#D5CFBF] p-8 sm:p-12 text-center max-w-2xl mx-auto my-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#E3EDE5] text-[#1B4332] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8 stroke-[2]" />
          </div>
          <h2 className="font-serif-display text-2xl font-bold text-[#1C1E1B]">
            Authentic 0% Progression State
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7267] leading-relaxed max-w-lg mx-auto">
            Because you are freshly set up and have not yet created notes, taken quizzes, or finished study tasks, all progression indicators correctly reflect 0%. As you complete real activities, your genuine score will update automatically.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('notes')}
              className="px-5 py-2.5 rounded-2xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              + Create First Study Note (+5%)
            </button>
            <button
              onClick={() => onNavigate('quiz')}
              className="px-5 py-2.5 rounded-2xl border border-[#2D6A4F] text-[#1B4332] hover:bg-[#E3EDE5] text-xs font-bold transition-all cursor-pointer"
            >
              Take Practice Quiz (+10%)
            </button>
            <button
              onClick={() => onNavigate('plan')}
              className="px-5 py-2.5 rounded-2xl border border-[#D5CFBF] bg-white hover:bg-[#FAF8F5] text-[#4B5047] text-xs font-bold transition-all cursor-pointer"
            >
              Add Timetable Tasks
            </button>
          </div>
        </div>
      ) : (
        /* Detailed Activity History and Insights */
        <div className="space-y-8">
          {/* Supportive Habits Encouragement */}
          <div className="bg-[#E3EDE5] rounded-2xl border border-[#2D6A4F]/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono-code uppercase tracking-wider text-[#1B4332] font-bold mb-1">
                Study Insight
              </div>
              <h3 className="font-serif-display font-bold text-lg text-[#1B4332]">
                Consistent, active retrieval beats passive re-reading.
              </h3>
              <p className="text-xs text-[#2D6A4F] mt-1">
                You've completed genuine study milestones. Keep reviewing your active flashcard decks and finishing your timetable schedule before exam day.
              </p>
            </div>

            <button
              onClick={() => onNavigate('flashcards')}
              className="px-4 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-[#2D6A4F] transition-all whitespace-nowrap cursor-pointer shrink-0"
            >
              Review Flashcards →
            </button>
          </div>

          {/* Recent Activity Log & Focus Log */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity History */}
            <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E4D9] p-6 shadow-xs">
              <h3 className="font-serif-display font-bold text-lg text-[#1C1E1B] mb-4 flex items-center justify-between">
                <span>Recent Learning Milestones</span>
                <span className="text-xs text-[#8A9085] font-normal">{progress.recentActivity.length} logged</span>
              </h3>

              {progress.recentActivity.length === 0 ? (
                <div className="text-xs text-[#8A9085] py-6 text-center">
                  No recent activities recorded yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {progress.recentActivity.slice(0, 8).map((act) => (
                    <div
                      key={act.id}
                      className="p-3 bg-white rounded-xl border border-[#E8E4D9] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                        <div>
                          <span className="font-bold text-[#1C1E1B] block">{act.title}</span>
                          <span className="text-[10px] text-[#8A9085] capitalize">{act.type}</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-[#8A9085]">
                        {new Date(act.timestamp).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Focus Session Logs */}
            <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E4D9] p-6 shadow-xs">
              <h3 className="font-serif-display font-bold text-lg text-[#1C1E1B] mb-4 flex items-center justify-between">
                <span>Completed Focus Sessions</span>
                <span className="text-xs text-[#8A9085] font-normal">{focusLogs.length} sessions</span>
              </h3>

              {focusLogs.length === 0 ? (
                <div className="text-xs text-[#8A9085] py-6 text-center">
                  No focus sessions logged yet. Try starting a 25-minute timer!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {focusLogs.slice(0, 8).map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-white rounded-xl border border-[#E8E4D9] flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#1C1E1B]">{log.topicStudied}</div>
                        <div className="text-[11px] text-[#6B7267]">
                          {log.subject ? `${log.subject} • ` : ''}
                          {log.durationMinutes} minutes uninterrupted focus
                        </div>
                      </div>
                      <span className="text-[11px] text-[#8A9085]">
                        {new Date(log.timestamp).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
