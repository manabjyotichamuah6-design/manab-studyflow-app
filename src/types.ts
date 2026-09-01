export type DifficultyRating = 'easy' | 'practice' | 'mastered';

export type GradeStandard =
  | 'class-6-8'
  | 'class-9-10'
  | 'class-11-12-pcm'
  | 'class-11-12-pcb'
  | 'class-11-12-commerce'
  | 'class-11-12-arts'
  | 'competitive-jee-neet'
  | 'college-higher-ed';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  rating?: DifficultyRating;
  subject?: string;
  topic?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  userSelectedIndex?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'advanced';
  topic?: string;
  customAdded?: boolean;
}

export interface TermDefinition {
  term: string;
  definition: string;
}

export interface FormulaItem {
  name: string;
  formula: string;
  explanation: string;
  units?: string;
  variables?: { symbol: string; meaning: string }[];
}

export interface ExamNotesData {
  cheatSheetSummary: string;
  mustRememberFormulas?: string[];
  keyPitfalls: string[];
  highYieldQuestions: string[];
}

export interface VisualDiagramData {
  type: string;
  title: string;
  description: string;
  svgType?: 'atom_molecule' | 'force_motion' | 'circuit_flow' | 'math_curve' | 'biology_cell' | 'process_flow' | 'concept_map';
  labels?: string[];
}

export interface ExplanationData {
  concept?: string;
  simpleExplanation: string;
  everydayAnalogy: string;
  whyItMatters?: string;
  keyTerms: TermDefinition[];
  quickRecap: string[];
  professorDeepDive?: string;
}

export interface NoteSummaryData {
  quickSummary: string;
  keyPoints: string[];
  importantTerms: TermDefinition[];
  rememberThis: string;
  formulas?: FormulaItem[];
  keywords?: string[];
  examCheatSheet?: string;
}

export interface StudyPlanStep {
  id: string;
  activity: string;
  durationMinutes: number;
  type: 'read' | 'practice' | 'revision' | 'quiz' | 'rest';
  completed?: boolean;
}

export interface StudyPlanDay {
  dayNumber: number;
  title: string;
  estimatedMinutes: number;
  focus: string;
  steps: StudyPlanStep[];
}

export interface StudyPlanTask {
  id: string;
  subject: string;
  topic: string;
  availableMinutes: number;
  targetDate: string; // YYYY-MM-DD
  deadlineTime?: string; // e.g. "17:30" or "05:30 PM"
  priority: 'low' | 'medium' | 'high';
  category?: 'revision' | 'homework' | 'exam' | 'quiz' | 'project' | 'general';
  completed: boolean;
  notes?: string;
  createdAt?: string;
  order?: number;
}

export interface NoteItem {
  id: string;
  title: string;
  subject: string;
  topic: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  summaryData?: NoteSummaryData;
  explanationData?: ExplanationData;
  formulas?: FormulaItem[];
  keywords?: string[];
  keyPoints?: string[];
  importantPoints?: string[];
  examRevisionNotes?: ExamNotesData;
  visualDiagram?: VisualDiagramData;
  flashcards?: Flashcard[];
  quiz?: QuizQuestion[];
}

export interface SubjectItem {
  id: string;
  name: string;
  topics: string[];
  icon?: string;
  color?: string;
}

export interface FocusSessionLog {
  id: string;
  topicStudied: string;
  durationMinutes: number;
  timestamp: string;
  subject?: string;
  completed?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  institution?: string;
  academicCategory?: 'mbbs' | 'degree' | 'competitive' | 'class11_12' | 'class6_10' | 'other';
  gradeLevel?: GradeStandard | string;
  gradeLabel?: string;
  specialization?: string;
  targetExam?: string;
  targetExamYear?: string;
  subjects: string[];
  mainGoals?: string[];
  targetExamDate?: string;
  dobYear?: string;
  onboarded?: boolean;
  createdAt: string;
  isLoggedIn?: boolean;
  studyPreferences?: {
    theme: 'light' | 'dark';
    dailyGoalMinutes: number;
    showHintsFirst: boolean;
  };
}

export interface StudySession {
  id: string;
  topic: string;
  rawContent: string;
  createdAt: string;
  updatedAt: string;
  summary: string;
  keyPoints: string[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  explanation: ExplanationData;
  studyPlan: StudyPlanDay[];
  formulas?: FormulaItem[];
  keywords?: string[];
  isProblemSolvingSubject?: boolean;
  examRevisionNotes?: ExamNotesData;
  visualDiagram?: VisualDiagramData;
  lastQuizScore?: {
    score: number;
    total: number;
    date: string;
  };
}

export interface UserProgress {
  topicsStudied: number;
  quizzesCompleted: number;
  flashcardsReviewed: number;
  studySessions: number;
  masteredCards: number;
  focusMinutesTotal?: number;
  recentActivity: {
    id: string;
    title: string;
    type: string;
    timestamp: string;
  }[];
}

export interface FileAttachmentData {
  name: string;
  type: string;
  size?: number;
  base64Data?: string;
  previewUrl?: string;
  isImage?: boolean;
  isVideo?: boolean;
  durationSeconds?: number;
  videoThumbnails?: string[];
}

export interface SubjectChatMessage {
  id: string;
  subjectName: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachment?: FileAttachmentData;
  attachments?: FileAttachmentData[];
  mode?: 'direct' | 'step_by_step' | 'concept_breakdown' | 'hint' | 'answer' | 'explain_solution';
  finalAnswer?: string;
  stepByStep?: string[];
  suggestions?: string[];
}

export interface DoubtItem {
  id: string;
  question: string;
  subject: string;
  gradeLevel?: string;
  teachingStyle?: 'direct' | 'step_by_step' | 'concept_breakdown' | 'hint';
  finalAnswer?: string;
  answer: string;
  formulas?: FormulaItem[];
  stepByStep?: string[];
  keyConcept: string;
  analogy?: string;
  examTip?: string;
  verification?: string;
  suggestedQuestions?: string[];
  createdAt: string;
  attachment?: FileAttachmentData;
  attachments?: FileAttachmentData[];
}

export interface ExtractedMaterial {
  topic: string;
  subjectSuggestion: string;
  extractedText: string;
  summaryPreview: string;
  keyConcepts: string[];
  sourceMediaCount?: number;
  isVideoLesson?: boolean;
  summary?: string;
  keywords?: string[];
  keyPoints?: string[];
  importantPoints?: string[];
  formulas?: FormulaItem[];
  summaryData?: NoteSummaryData;
  explanationData?: ExplanationData;
  examRevisionNotes?: ExamNotesData;
  flashcards?: Flashcard[];
  quiz?: QuizQuestion[];
}

export type ActiveTab = 'summary' | 'keyPoints' | 'flashcards' | 'quiz' | 'explanation' | 'studyPlan' | 'examNotes' | 'formulas';

export type AppView =
  | 'landing'
  | 'auth'
  | 'onboarding'
  | 'dashboard'
  | 'subjects'
  | 'subject-detail'
  | 'notes'
  | 'doubt-solver'
  | 'ai-tools'
  | 'flashcards'
  | 'quiz'
  | 'plan'
  | 'progress'
  | 'library'
  | 'settings'
  | 'case-study'
  | 'workspace'
  | 'logout-confirm';


