import React from 'react';
import {
  StudySession,
  UserProgress,
  ActiveTab,
  SubjectItem,
  NoteItem,
  StudyPlanTask,
  UserProfile,
  AppView,
  FocusSessionLog,
} from '../types';
import {
  FileText,
  Layers,
  HelpCircle,
  Lightbulb,
  Calendar,
  PlusCircle,
  Trash2,
  ArrowRight,
  BookOpen,
  Sparkles,
  Clock,
  Award,
  CheckCircle2,
  TrendingUp,
  FolderPlus,
  Play,
  CheckSquare,
  Camera,
  Upload,
  MessageSquare,
  Target,
  CircleDashed,
  Compass,
} from 'lucide-react';
import { HomeStudyTracker } from './HomeStudyTracker';
import { calculateGenuineProgress } from '../utils/progressCalculator';

interface DashboardProps {
  userProfile: UserProfile | null;
  sessions: StudySession[];
  notes: NoteItem[];
  subjects: SubjectItem[];
  planTasks: StudyPlanTask[];
  progress: UserProgress;
  focusLogs?: FocusSessionLog[];
  onOpenSession: (session: StudySession, initialTab?: ActiveTab) => void;
  onSelectNote: (note: NoteItem) => void;
  onSelectSubject: (subject: SubjectItem) => void;
  onNewSessionWithAction: (tab: ActiveTab) => void;
  onDeleteSession: (id: string) => void;
  onOpenExplainModal: () => void;
  onOpenFocusModal: () => void;
  onOpenUploadModal?: () => void;
  onNavigate: (view: AppView) => void;
  onSaveTask?: (task: StudyPlanTask) => void;
  onSaveTasksBulk?: (tasks: StudyPlanTask[]) => void;
  onReorderTasks?: (tasks: StudyPlanTask[]) => void;
  onToggleTask?: (id: string) => void;
  onDeleteTask?: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userProfile,
  sessions,
  notes,
  subjects,
  planTasks,
  progress,
  focusLogs = [],
  onOpenSession,
  onSelectNote,
  onSelectSubject,
  onNewSessionWithAction,
  onDeleteSession,
  onOpenExplainModal,
  onOpenFocusModal,
  onOpenUploadModal,
  onNavigate,
  onSaveTask,
  onSaveTasksBulk,
  onReorderTasks,
  onToggleTask,
  onDeleteTask,
}) => {
  const studentName = userProfile?.name || 'Student';

  // Calculate honest, verified progression stats
  const genuineStats = calculateGenuineProgress(progress, notes, planTasks, focusLogs, sessions);

  // Get next urgent task for "TODAY'S STUDY"
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysTasks = planTasks.filter((t) => t.targetDate === todayStr && !t.completed);
  const featuredTask = todaysTasks[0] || planTasks.find((t) => !t.completed) || null;

  const quickActions = [
    {
      id: 'qa-upload',
      label: 'SNAP / UPLOAD',
      description: 'Camera photo, PDF book, or files',
      icon: Camera,
      action: onOpenUploadModal ? onOpenUploadModal : () => onNavigate('workspace'),
    },
    {
      id: 'qa-doubt',
      label: 'DOUBT SOLVER',
      description: 'Ask queries, step-by-step solutions & notes',
      icon: HelpCircle,
      action: () => onNavigate('doubt-solver'),
    },
    {
      id: 'qa-notes',
      label: 'MY NOTES',
      description: 'Smart notes with instant AI summaries',
      icon: FileText,
      action: () => onNavigate('notes'),
    },
    {
      id: 'qa-explain',
      label: 'ASK AI / EXPLAIN',
      description: 'Feynman analogies & step-by-step hints',
      icon: Lightbulb,
      action: onOpenExplainModal,
    },
    {
      id: 'qa-quiz',
      label: 'MAKE QUIZ',
      description: 'Multiple choice tests with reasoning',
      icon: HelpCircle,
      action: () => onNavigate('quiz'),
    },
    {
      id: 'qa-flashcards',
      label: '3D FLASHCARDS',
      description: 'Active recall & 3D card flips',
      icon: Layers,
      action: () => onNavigate('flashcards'),
    },
    {
      id: 'qa-focus',
      label: 'FOCUS TIMER',
      description: '25-min Pomodoro distraction shield',
      icon: Clock,
      action: onOpenFocusModal,
    },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-[#1C1E1B] animate-fade-in">
      {/* 1. GREETING & HERO HEADER */}
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8E4D9] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#2D6A4F] bg-[#E3EDE5] px-3 py-1 rounded-full inline-block">
                StudyFlow Companion
              </span>
              {userProfile?.gradeLabel && (
                <span className="text-xs font-mono-code font-bold text-amber-900 bg-[#FFF8E7] border border-amber-300 px-3 py-1 rounded-full inline-block">
                  🎓 {userProfile.gradeLabel}
                </span>
              )}
            </div>
            <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#1C1E1B]">
              Good to see you, {studentName}.
            </h1>
            <p className="text-[#555A50] text-sm sm:text-base mt-1">
              What would you like to study today? Snap notes, upload textbook PDFs, or solve doubts with your subject AI tutor.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onOpenUploadModal && (
              <button
                onClick={onOpenUploadModal}
                className="px-4 py-2.5 rounded-xl border border-[#2D6A4F] bg-[#E3EDE5] hover:bg-[#D5E5D8] text-[#1B4332] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Camera className="w-4 h-4 text-[#2D6A4F]" />
                <span>Snap / Upload Notes</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('notes')}
              className="px-5 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Note</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STUDY TRACKER & DEADLINE PLANNER BOX */}
      {onSaveTask && onToggleTask && onDeleteTask && (
        <HomeStudyTracker
          tasks={planTasks}
          subjects={subjects}
          onSaveTask={onSaveTask}
          onSaveTasksBulk={onSaveTasksBulk}
          onReorderTasks={onReorderTasks}
          onToggleTask={onToggleTask}
          onDeleteTask={onDeleteTask}
          onNavigate={onNavigate}
        />
      )}

      {/* 3. TODAY'S STUDY FEATURED BLOCK (Shows when user has active tasks) */}
      {featuredTask && (
        <div className="bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white rounded-3xl p-6 sm:p-8 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono-code uppercase font-bold tracking-widest text-[#95D5B2] bg-white/10 px-3 py-1 rounded-full inline-block mb-2">
                Today's Target Session
              </span>
              <div className="text-xs text-white/80 font-medium">{featuredTask.subject}</div>
              <h2 className="font-serif-display text-2xl sm:text-3xl font-bold mt-1 text-white">
                {featuredTask.topic}
              </h2>
              {featuredTask.notes && (
                <p className="text-xs text-white/75 mt-1 max-w-xl">{featuredTask.notes}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono-code bg-white/15 px-3 py-1.5 rounded-xl text-white">
                ⏱ {featuredTask.availableMinutes} min
              </span>
              <button
                onClick={() => onNavigate('notes')}
                className="px-5 py-2.5 rounded-xl bg-white text-[#1B4332] hover:bg-[#F4EFE6] text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>Continue Studying</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. QUICK ACTIONS ROW */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#1C1E1B]">
            Quick Actions
          </h2>
          <span className="text-xs text-[#6B7267]">Launch your study tools</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.action}
                className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E4D9] hover:border-[#2D6A4F] hover:shadow-xs transition-all text-left flex flex-col justify-between h-full group cursor-pointer active:scale-98"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-[#E3EDE5] text-[#1B4332] group-hover:bg-[#1B4332] group-hover:text-white transition-colors flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-xs text-[#1C1E1B] group-hover:text-[#1B4332] uppercase tracking-wider font-mono-code">
                    {action.label}
                  </h3>
                  <p className="text-[11px] text-[#6B7267] mt-1 leading-snug">
                    {action.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#E8E4D9]/60 flex items-center gap-1 text-[10px] font-bold text-[#2D6A4F]">
                  <span>Launch</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. MY SUBJECTS PREVIEW */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#1C1E1B]">
              My Subjects
            </h2>
            <p className="text-xs text-[#6B7267]">Organized curriculum workspaces</p>
          </div>

          <button
            onClick={() => onNavigate('subjects')}
            className="text-xs font-bold text-[#2D6A4F] hover:text-[#1B4332] flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({subjects.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjects.slice(0, 4).map((subj) => {
            const subjNotes = notes.filter((n) => n.subject.toLowerCase() === subj.name.toLowerCase());
            return (
              <div
                key={subj.id}
                onClick={() => onSelectSubject(subj)}
                className="bg-[#FAF8F5] rounded-2xl border border-[#E8E4D9] p-5 hover:border-[#2D6A4F] hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-8 h-8 rounded-xl bg-[#1B4332] text-white flex items-center justify-center font-serif-display font-bold text-sm">
                      {subj.name.charAt(0)}
                    </span>
                    <span className="text-[10px] font-mono-code bg-[#F4EFE6] text-[#2D6A4F] px-2 py-0.5 rounded-full font-bold">
                      {subj.topics.length} topics
                    </span>
                  </div>

                  <h3 className="font-serif-display font-bold text-base text-[#1C1E1B] group-hover:text-[#1B4332] transition-colors mb-1">
                    {subj.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#6B7267] mt-0.5">
                    <MessageSquare className="w-3 h-3 text-[#2D6A4F]" />
                    <span>AI Tutor & {subjNotes.length} notes</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8E4D9] flex items-center justify-between text-xs text-[#2D6A4F] font-bold">
                  <span>Chat & Study</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. AUTHENTIC STUDY ACTIVITY & PROGRESS SUMMARY */}
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8E4D9] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#2D6A4F] bg-[#E3EDE5] px-2.5 py-0.5 rounded-full">
                Real-Time Verified Metrics
              </span>
              <span className="text-xs text-[#8A9085]">
                {genuineStats.hasAnyActivity ? 'Active Learning' : 'Fresh Student Workspace'}
              </span>
            </div>
            <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#1C1E1B] mt-1">
              My Study Progression
            </h2>
          </div>

          <button
            onClick={() => onNavigate('progress')}
            className="text-xs font-bold text-[#2D6A4F] hover:text-[#1B4332] flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Full Progress & Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Overall Progression Bar & Real Percentage */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E4D9]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <span className="text-xs font-bold text-[#1C1E1B] flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#2D6A4F]" />
                <span>Overall Verified Syllabus & Practice Completion</span>
              </span>
              <p className="text-[11px] text-[#6B7267] mt-0.5">
                Calculated strictly from your completed notes, quiz submissions, flashcard reviews, and timetable tasks.
              </p>
            </div>
            <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
              <div className="font-serif-display text-3xl font-bold text-[#1B4332]">
                {genuineStats.overallProgressPercent}%
              </div>
              <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-[#6B7267]">
                {genuineStats.overallProgressPercent === 0
                  ? '0% Completed'
                  : genuineStats.overallProgressPercent < 25
                  ? 'Getting Started'
                  : genuineStats.overallProgressPercent < 60
                  ? 'Steady Momentum'
                  : 'High Mastery'}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#EFEBE0] h-3 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-[#2D6A4F] to-[#1B4332] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.max(genuineStats.overallProgressPercent, 0)}%` }}
            />
          </div>

          {/* Quick Explanation if Fresh (0%) */}
          {!genuineStats.hasAnyActivity ? (
            <div className="mt-4 pt-3 border-t border-[#E8E4D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#555A50]">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                <span>
                  <strong>No artificial stats:</strong> Your progression starts at 0% and climbs as you make notes, take quizzes, and finish tasks.
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => onNavigate('notes')}
                  className="px-3 py-1 rounded-lg bg-[#E3EDE5] hover:bg-[#D5E5D8] text-[#1B4332] font-bold text-[11px] cursor-pointer"
                >
                  + Add Note (+5%)
                </button>
                <button
                  onClick={() => onNavigate('quiz')}
                  className="px-3 py-1 rounded-lg bg-[#1B4332] text-white hover:bg-[#2D6A4F] font-bold text-[11px] cursor-pointer"
                >
                  Take Quiz (+10%)
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 pt-2.5 border-t border-[#E8E4D9]/80 flex flex-wrap items-center gap-3 text-[11px] text-[#6B7267]">
              <span><strong>Breakdown:</strong></span>
              <span className="bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E8E4D9]">
                Notes: {genuineStats.scoreBreakdown.notesScore}/25 pts
              </span>
              <span className="bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E8E4D9]">
                Quizzes: {genuineStats.scoreBreakdown.quizScore}/25 pts
              </span>
              <span className="bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E8E4D9]">
                Flashcards: {genuineStats.scoreBreakdown.flashcardScore}/20 pts
              </span>
              <span className="bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E8E4D9]">
                Tasks: {genuineStats.scoreBreakdown.tasksScore}/20 pts
              </span>
              <span className="bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E8E4D9]">
                Focus: {genuineStats.scoreBreakdown.focusScore}/10 pts
              </span>
            </div>
          )}
        </div>

        {/* 4 Category Metric Blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E8E4D9]">
            <span className="text-xs text-[#6B7267] font-semibold">Notes & Summaries</span>
            <div className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1B4332] mt-1">
              {genuineStats.totalNotes}
            </div>
            <p className="text-[10px] text-[#8A9085] mt-0.5">
              {genuineStats.totalNotes === 0 ? '0 notes saved' : `${genuineStats.totalNotes} syllabus notes`}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E8E4D9]">
            <span className="text-xs text-[#6B7267] font-semibold">Quizzes Completed</span>
            <div className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1B4332] mt-1">
              {genuineStats.totalQuizzesTaken}
            </div>
            <p className="text-[10px] text-[#8A9085] mt-0.5">
              {genuineStats.totalQuizzesTaken > 0
                ? `${genuineStats.averageQuizAccuracy}% average accuracy`
                : '0 tests completed'}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E8E4D9]">
            <span className="text-xs text-[#6B7267] font-semibold">Flashcards Mastered</span>
            <div className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1B4332] mt-1">
              {genuineStats.totalFlashcardsMastered}
            </div>
            <p className="text-[10px] text-[#8A9085] mt-0.5">
              {genuineStats.totalFlashcardsPracticed > 0
                ? `${genuineStats.totalFlashcardsPracticed} cards reviewed`
                : '0 cards reviewed'}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E8E4D9]">
            <span className="text-xs text-[#6B7267] font-semibold">Focus Minutes</span>
            <div className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1B4332] mt-1">
              {genuineStats.totalFocusMinutes}
            </div>
            <p className="text-[10px] text-[#8A9085] mt-0.5">
              {genuineStats.totalFocusSessions > 0
                ? `${genuineStats.totalFocusSessions} focus sessions`
                : '0 minutes logged'}
            </p>
          </div>
        </div>
      </div>

      {/* 6. RECENT STUDY NOTES & SESSIONS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#1C1E1B]">
            Recent Study Notes
          </h2>
          <button
            onClick={() => onNavigate('notes')}
            className="text-xs font-bold text-[#2D6A4F] hover:text-[#1B4332] flex items-center gap-1 cursor-pointer"
          >
            <span>All Notes ({notes.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {notes.length === 0 ? (
          <div className="bg-[#FAF8F5] rounded-2xl border border-dashed border-[#D5CFBF] p-8 text-center text-xs text-[#8A9085]">
            No notes created yet. Click "New Study Note" to create your first revision note.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {notes.slice(0, 3).map((note) => (
              <div
                key={note.id}
                onClick={() => onSelectNote(note)}
                className="bg-[#FAF8F5] rounded-2xl border border-[#E8E4D9] p-5 hover:border-[#2D6A4F] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono-code font-bold bg-[#E3EDE5] text-[#1B4332] px-2 py-0.5 rounded">
                      {note.subject}
                    </span>
                    <span className="text-[10px] text-[#8A9085]">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-serif-display font-bold text-base text-[#1C1E1B] group-hover:text-[#1B4332] transition-colors mb-1">
                    {note.title}
                  </h3>
                  <p className="text-xs text-[#6B7267] line-clamp-2">{note.content}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#E8E4D9] flex items-center justify-between text-xs text-[#2D6A4F] font-bold">
                  <span>Open & Summarize</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
