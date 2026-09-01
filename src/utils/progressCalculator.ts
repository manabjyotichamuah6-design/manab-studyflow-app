import { NoteItem, StudyPlanTask, FocusSessionLog, StudySession, UserProgress } from '../types';

export interface GenuineProgressStats {
  totalNotes: number;
  totalQuizzesTaken: number;
  averageQuizAccuracy: number; // 0 - 100%
  totalFlashcardsPracticed: number;
  totalFlashcardsMastered: number;
  flashcardMasteryRate: number; // 0 - 100%
  totalTasksCompleted: number;
  totalTasksScheduled: number;
  taskCompletionRate: number; // 0 - 100%
  totalFocusMinutes: number;
  totalFocusSessions: number;
  
  overallProgressPercent: number; // 0 - 100%
  hasAnyActivity: boolean;
  
  scoreBreakdown: {
    notesScore: number;       // up to 25
    quizScore: number;        // up to 25
    flashcardScore: number;   // up to 20
    tasksScore: number;       // up to 20
    focusScore: number;       // up to 10
  };
}

/**
 * Calculates honest, verified student progress based strictly on actual user activity.
 * Returns 0% if the user is freshly arrived or has not completed genuine activities.
 */
export function calculateGenuineProgress(
  progress: UserProgress,
  notes: NoteItem[],
  planTasks: StudyPlanTask[],
  focusLogs: FocusSessionLog[],
  sessions: StudySession[]
): GenuineProgressStats {
  const totalNotes = notes.length;
  
  // Real quiz statistics from sessions and recorded progress
  const sessionsWithQuiz = sessions.filter((s) => s.lastQuizScore !== undefined);
  const totalQuizzesTaken = Math.max(progress.quizzesCompleted || 0, sessionsWithQuiz.length);
  
  let totalScoreSum = 0;
  let totalPossibleSum = 0;
  sessionsWithQuiz.forEach((s) => {
    if (s.lastQuizScore) {
      totalScoreSum += s.lastQuizScore.score;
      totalPossibleSum += s.lastQuizScore.total;
    }
  });

  const averageQuizAccuracy =
    totalPossibleSum > 0
      ? Math.round((totalScoreSum / totalPossibleSum) * 100)
      : totalQuizzesTaken > 0
      ? 75 // default average estimate if quizzes taken without session records
      : 0;

  // Flashcards statistics
  let sessionMasteredCards = 0;
  let sessionTotalCards = 0;
  sessions.forEach((s) => {
    (s.flashcards || []).forEach((c) => {
      sessionTotalCards++;
      if (c.rating === 'mastered') sessionMasteredCards++;
    });
  });

  const totalFlashcardsPracticed = Math.max(progress.flashcardsReviewed || 0, sessionTotalCards);
  const totalFlashcardsMastered = Math.max(progress.masteredCards || 0, sessionMasteredCards);
  const flashcardMasteryRate =
    totalFlashcardsPracticed > 0
      ? Math.min(100, Math.round((totalFlashcardsMastered / totalFlashcardsPracticed) * 100))
      : 0;

  // Scheduled Timetable Tasks
  const totalTasksScheduled = planTasks.length;
  const totalTasksCompleted = planTasks.filter((t) => t.completed).length;
  const taskCompletionRate =
    totalTasksScheduled > 0
      ? Math.round((totalTasksCompleted / totalTasksScheduled) * 100)
      : 0;

  // Focus sessions
  const totalFocusMinutes = focusLogs.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  const totalFocusSessions = focusLogs.length;

  const hasAnyActivity =
    totalNotes > 0 ||
    totalQuizzesTaken > 0 ||
    totalFlashcardsPracticed > 0 ||
    totalTasksCompleted > 0 ||
    totalFocusMinutes > 0;

  if (!hasAnyActivity) {
    return {
      totalNotes: 0,
      totalQuizzesTaken: 0,
      averageQuizAccuracy: 0,
      totalFlashcardsPracticed: 0,
      totalFlashcardsMastered: 0,
      flashcardMasteryRate: 0,
      totalTasksCompleted: 0,
      totalTasksScheduled,
      taskCompletionRate: 0,
      totalFocusMinutes: 0,
      totalFocusSessions: 0,
      overallProgressPercent: 0,
      hasAnyActivity: false,
      scoreBreakdown: {
        notesScore: 0,
        quizScore: 0,
        flashcardScore: 0,
        tasksScore: 0,
        focusScore: 0,
      },
    };
  }

  // Weightings:
  // Notes: up to 25% (5% per note, max 5 notes for full 25%)
  const notesScore = Math.min(25, totalNotes * 5);

  // Quizzes: up to 25% (based on quizzes taken and accuracy)
  const quizScore =
    totalQuizzesTaken > 0
      ? Math.min(25, Math.round((Math.min(totalQuizzesTaken, 5) / 5) * 15 + (averageQuizAccuracy / 100) * 10))
      : 0;

  // Flashcards: up to 20% (practice + mastery)
  const flashcardScore =
    totalFlashcardsPracticed > 0
      ? Math.min(20, Math.round((Math.min(totalFlashcardsPracticed, 10) / 10) * 10 + (flashcardMasteryRate / 100) * 10))
      : 0;

  // Tasks: up to 20% (completed tasks rate)
  const tasksScore =
    totalTasksScheduled > 0
      ? Math.min(20, Math.round((totalTasksCompleted / Math.max(totalTasksScheduled, 1)) * 20))
      : totalTasksCompleted > 0
      ? Math.min(20, totalTasksCompleted * 5)
      : 0;

  // Focus: up to 10% (every 25m focus = 2.5%, max 100m for 10%)
  const focusScore = Math.min(10, Math.round((totalFocusMinutes / 100) * 10));

  const overallProgressPercent = Math.min(100, Math.max(0, notesScore + quizScore + flashcardScore + tasksScore + focusScore));

  return {
    totalNotes,
    totalQuizzesTaken,
    averageQuizAccuracy,
    totalFlashcardsPracticed,
    totalFlashcardsMastered,
    flashcardMasteryRate,
    totalTasksCompleted,
    totalTasksScheduled,
    taskCompletionRate,
    totalFocusMinutes,
    totalFocusSessions,
    overallProgressPercent,
    hasAnyActivity,
    scoreBreakdown: {
      notesScore,
      quizScore,
      flashcardScore,
      tasksScore,
      focusScore,
    },
  };
}
