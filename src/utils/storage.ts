import {
  StudySession,
  UserProgress,
  ActiveTab,
  UserProfile,
  SubjectItem,
  NoteItem,
  StudyPlanTask,
  FocusSessionLog,
  SubjectChatMessage,
} from '../types';

const SESSIONS_KEY = 'studyflow_sessions_v2';
const PROGRESS_KEY = 'studyflow_progress_v2';
const PROFILE_KEY = 'studyflow_profile_v2';
const SUBJECTS_KEY = 'studyflow_subjects_v2';
const NOTES_KEY = 'studyflow_notes_v2';
const PLAN_TASKS_KEY = 'studyflow_plantasks_v2';
const FOCUS_LOGS_KEY = 'studyflow_focuslogs_v2';
const SUBJECT_CHATS_KEY = 'studyflow_subject_chats_v2';

export const DEFAULT_SUBJECTS: SubjectItem[] = [
  {
    id: 'subj-maths',
    name: 'Maths',
    topics: ['Calculus', 'Algebra', 'Trigonometry', 'Probability'],
    color: '#2D6A4F',
  },
  {
    id: 'subj-science',
    name: 'Science',
    topics: ['Atmosphere', 'Motion', 'Matter', 'Life Processes'],
    color: '#1B4332',
  },
  {
    id: 'subj-english',
    name: 'English',
    topics: ['Grammar & Syntax', 'Literary Analysis', 'Essay Structure', 'Poetry'],
    color: '#40916C',
  },
  {
    id: 'subj-social',
    name: 'Social Science',
    topics: ['World History', 'Civics & Democracy', 'Economic Systems', 'Physical Geography'],
    color: '#52B788',
  },
  {
    id: 'subj-cs',
    name: 'Computer Science',
    topics: ['Data Structures', 'Algorithms', 'Web Architecture', 'Database Systems'],
    color: '#74C69D',
  },
];

// Helper to determine the current active user ID for data isolation
export function getActiveUserId(): string {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return 'guest';
    const parsed: UserProfile = JSON.parse(raw);
    return parsed.id || 'guest';
  } catch (e) {
    return 'guest';
  }
}

// Generates a user-isolated storage key
function getScopedKey(baseKey: string, customUserId?: string): string {
  const uid = customUserId || getActiveUserId();
  return `${baseKey}_usr_${uid}`;
}

// Profile Persistence
export function getStoredProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse user profile', e);
    return null;
  }
}

export function saveStoredProfile(profile: UserProfile | null): void {
  try {
    if (!profile) {
      localStorage.removeItem(PROFILE_KEY);
    } else {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    }
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function clearStoredProfile(): void {
  try {
    localStorage.removeItem(PROFILE_KEY);
  } catch (e) {
    console.error('Failed to clear profile', e);
  }
}

// Subjects Persistence (Isolated per user)
export function getStoredSubjects(userId?: string): SubjectItem[] {
  try {
    const key = getScopedKey(SUBJECTS_KEY, userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      // Check legacy key for fallback
      const legacyRaw = localStorage.getItem(SUBJECTS_KEY);
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw);
        localStorage.setItem(key, JSON.stringify(parsed));
        return parsed;
      }
      localStorage.setItem(key, JSON.stringify(DEFAULT_SUBJECTS));
      return DEFAULT_SUBJECTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_SUBJECTS;
  }
}

export function saveStoredSubjects(subjects: SubjectItem[], userId?: string): void {
  try {
    const key = getScopedKey(SUBJECTS_KEY, userId);
    localStorage.setItem(key, JSON.stringify(subjects));
  } catch (e) {
    console.error('Failed to save subjects', e);
  }
}

export function saveSubject(subject: SubjectItem, userId?: string): SubjectItem[] {
  try {
    const subjects = getStoredSubjects(userId);
    const existingIndex = subjects.findIndex(
      (s) => s.id === subject.id || s.name.toLowerCase() === subject.name.toLowerCase()
    );
    if (existingIndex >= 0) {
      subjects[existingIndex] = subject;
    } else {
      subjects.push(subject);
    }
    saveStoredSubjects(subjects, userId);
    return subjects;
  } catch (e) {
    return getStoredSubjects(userId);
  }
}

export function addTopicToSubject(subjectName: string, topicName: string, userId?: string): SubjectItem[] {
  const subjects = getStoredSubjects(userId);
  const target = subjects.find((s) => s.name.toLowerCase() === subjectName.toLowerCase());
  if (target) {
    if (!target.topics.includes(topicName.trim())) {
      target.topics.push(topicName.trim());
      saveStoredSubjects(subjects, userId);
    }
  }
  return subjects;
}

// Notes Persistence (Strict User Isolation)
export function getStoredNotes(userId?: string): NoteItem[] {
  try {
    const key = getScopedKey(NOTES_KEY, userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveStoredNote(note: NoteItem, userId?: string): NoteItem[] {
  try {
    const key = getScopedKey(NOTES_KEY, userId);
    const notes = getStoredNotes(userId);
    const existingIndex = notes.findIndex((n) => n.id === note.id);
    if (existingIndex >= 0) {
      notes[existingIndex] = { ...note, updatedAt: new Date().toISOString() };
    } else {
      notes.unshift({
        ...note,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    localStorage.setItem(key, JSON.stringify(notes));
    recordProgressAction('topicsStudied', { title: note.title, category: 'notes' }, userId);
    return notes;
  } catch (e) {
    return getStoredNotes(userId);
  }
}

export function saveNote(note: NoteItem, userId?: string): NoteItem[] {
  return saveStoredNote(note, userId);
}

export function saveStoredNotes(notes: NoteItem[], userId?: string): void {
  try {
    const key = getScopedKey(NOTES_KEY, userId);
    localStorage.setItem(key, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes list', e);
  }
}

export function deleteStoredNote(id: string, userId?: string): NoteItem[] {
  try {
    const key = getScopedKey(NOTES_KEY, userId);
    const notes = getStoredNotes(userId).filter((n) => n.id !== id);
    localStorage.setItem(key, JSON.stringify(notes));
    return notes;
  } catch (e) {
    return getStoredNotes(userId);
  }
}

export function deleteNote(id: string, userId?: string): NoteItem[] {
  return deleteStoredNote(id, userId);
}

// Subject AI Chat Persistence (Strict User Isolation)
export function getStoredSubjectChats(subjectName: string, userId?: string): SubjectChatMessage[] {
  try {
    const key = getScopedKey(SUBJECT_CHATS_KEY, userId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const allChats: Record<string, SubjectChatMessage[]> = JSON.parse(raw);
    return allChats[subjectName.toLowerCase()] || [];
  } catch (e) {
    return [];
  }
}

export function saveStoredSubjectMessage(
  subjectName: string,
  message: SubjectChatMessage,
  userId?: string
): SubjectChatMessage[] {
  try {
    const key = getScopedKey(SUBJECT_CHATS_KEY, userId);
    const raw = localStorage.getItem(key);
    const allChats: Record<string, SubjectChatMessage[]> = raw ? JSON.parse(raw) : {};
    const chatKey = subjectName.toLowerCase();
    const current = allChats[chatKey] || [];
    const updated = [...current, message].slice(-50); // retain last 50 messages per subject
    allChats[chatKey] = updated;
    localStorage.setItem(key, JSON.stringify(allChats));
    return updated;
  } catch (e) {
    return [];
  }
}

export function clearStoredSubjectChat(subjectName: string, userId?: string): void {
  try {
    const key = getScopedKey(SUBJECT_CHATS_KEY, userId);
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const allChats: Record<string, SubjectChatMessage[]> = JSON.parse(raw);
    delete allChats[subjectName.toLowerCase()];
    localStorage.setItem(key, JSON.stringify(allChats));
  } catch (e) {
    console.error('Failed to clear subject chat', e);
  }
}

// Study Plan Tasks Persistence (Strict User Isolation)
export function getStoredPlanTasks(userId?: string): StudyPlanTask[] {
  try {
    const key = getScopedKey(PLAN_TASKS_KEY, userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed: StudyPlanTask[] = JSON.parse(raw);
    const cleaned = parsed.filter((t) => t.id !== 'task-1' && t.id !== 'task-2');
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(key, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (e) {
    return [];
  }
}

export function saveStoredPlanTask(task: StudyPlanTask, userId?: string): StudyPlanTask[] {
  try {
    const key = getScopedKey(PLAN_TASKS_KEY, userId);
    const tasks = getStoredPlanTasks(userId);
    const existingIndex = tasks.findIndex((t) => t.id === task.id);
    if (existingIndex >= 0) {
      tasks[existingIndex] = task;
    } else {
      tasks.push(task);
    }
    localStorage.setItem(key, JSON.stringify(tasks));
    return tasks;
  } catch (e) {
    return getStoredPlanTasks(userId);
  }
}

export function saveStoredPlanTasksBulk(newTasks: StudyPlanTask[], userId?: string): StudyPlanTask[] {
  try {
    const key = getScopedKey(PLAN_TASKS_KEY, userId);
    const tasks = getStoredPlanTasks(userId);
    newTasks.forEach((nt) => {
      const idx = tasks.findIndex((t) => t.id === nt.id);
      if (idx >= 0) {
        tasks[idx] = nt;
      } else {
        tasks.push(nt);
      }
    });
    localStorage.setItem(key, JSON.stringify(tasks));
    return tasks;
  } catch (e) {
    return getStoredPlanTasks(userId);
  }
}

export function reorderStoredPlanTasks(updatedTasksList: StudyPlanTask[], userId?: string): StudyPlanTask[] {
  try {
    const key = getScopedKey(PLAN_TASKS_KEY, userId);
    localStorage.setItem(key, JSON.stringify(updatedTasksList));
    return updatedTasksList;
  } catch (e) {
    return getStoredPlanTasks(userId);
  }
}

export function savePlanTask(task: StudyPlanTask, userId?: string): StudyPlanTask[] {
  return saveStoredPlanTask(task, userId);
}

export function toggleStoredPlanTask(id: string, userId?: string): StudyPlanTask[] {
  const key = getScopedKey(PLAN_TASKS_KEY, userId);
  const tasks = getStoredPlanTasks(userId);
  const target = tasks.find((t) => t.id === id);
  if (target) {
    target.completed = !target.completed;
    localStorage.setItem(key, JSON.stringify(tasks));
    if (target.completed) {
      recordProgressAction(
        'studySessions',
        { title: `${target.subject}: ${target.topic}`, category: 'plan' },
        userId
      );
    }
  }
  return tasks;
}

export function togglePlanTask(id: string, userId?: string): StudyPlanTask[] {
  return toggleStoredPlanTask(id, userId);
}

export function deleteStoredPlanTask(id: string, userId?: string): StudyPlanTask[] {
  try {
    const key = getScopedKey(PLAN_TASKS_KEY, userId);
    const tasks = getStoredPlanTasks(userId).filter((t) => t.id !== id);
    localStorage.setItem(key, JSON.stringify(tasks));
    return tasks;
  } catch (e) {
    return getStoredPlanTasks(userId);
  }
}

export function deletePlanTask(id: string, userId?: string): StudyPlanTask[] {
  return deleteStoredPlanTask(id, userId);
}

// Focus Sessions Persistence (Strict User Isolation)
export function getStoredFocusLogs(userId?: string): FocusSessionLog[] {
  try {
    const key = getScopedKey(FOCUS_LOGS_KEY, userId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveStoredFocusLog(log: FocusSessionLog, userId?: string): FocusSessionLog[] {
  try {
    const key = getScopedKey(FOCUS_LOGS_KEY, userId);
    const logs = getStoredFocusLogs(userId);
    logs.unshift(log);
    localStorage.setItem(key, JSON.stringify(logs.slice(0, 50)));
    recordProgressAction('studySessions', { title: `Focus: ${log.topicStudied}`, category: 'focus' }, userId);
    return logs;
  } catch (e) {
    return getStoredFocusLogs(userId);
  }
}

export function saveStoredFocusLogs(logs: FocusSessionLog[], userId?: string): void {
  try {
    const key = getScopedKey(FOCUS_LOGS_KEY, userId);
    localStorage.setItem(key, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save focus logs list', e);
  }
}

export function saveFocusSessionLog(log: FocusSessionLog, userId?: string): FocusSessionLog[] {
  return saveStoredFocusLog(log, userId);
}

// Full Study Sessions (Generations - Strict User Isolation)
export function getStoredSessions(userId?: string): StudySession[] {
  try {
    const key = getScopedKey(SESSIONS_KEY, userId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored sessions', e);
    return [];
  }
}

export function saveStoredSessionsList(sessions: StudySession[], userId?: string): void {
  try {
    const key = getScopedKey(SESSIONS_KEY, userId);
    localStorage.setItem(key, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions list', e);
  }
}

export function saveSession(session: StudySession, userId?: string): void {
  try {
    const key = getScopedKey(SESSIONS_KEY, userId);
    const sessions = getStoredSessions(userId);
    const existingIndex = sessions.findIndex((s) => s.id === session.id);
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.unshift(session);
    }
    localStorage.setItem(key, JSON.stringify(sessions.slice(0, 30)));
    recordProgressAction('studySessions', undefined, userId);
  } catch (e) {
    console.error('Failed to save session', e);
  }
}

export function deleteStoredSession(id: string, userId?: string): void {
  try {
    const key = getScopedKey(SESSIONS_KEY, userId);
    const sessions = getStoredSessions(userId).filter((s) => s.id !== id);
    localStorage.setItem(key, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to delete session', e);
  }
}

// Progress Tracking (Honest, authentic student metrics strictly isolated per user)
export function getStoredProgress(userId?: string): UserProgress {
  const cleanProgress: UserProgress = {
    topicsStudied: 0,
    quizzesCompleted: 0,
    flashcardsReviewed: 0,
    studySessions: 0,
    masteredCards: 0,
    focusMinutesTotal: 0,
    recentActivity: [],
  };

  try {
    const key = getScopedKey(PROGRESS_KEY, userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      return cleanProgress;
    }
    const parsed: UserProgress = JSON.parse(raw);
    return parsed;
  } catch (e) {
    return cleanProgress;
  }
}

export function saveStoredProgress(progress: UserProgress, userId?: string): void {
  try {
    const key = getScopedKey(PROGRESS_KEY, userId);
    localStorage.setItem(key, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress', e);
  }
}

export function resetProgressOnly(userId?: string): UserProgress {
  const cleanProgress: UserProgress = {
    topicsStudied: 0,
    quizzesCompleted: 0,
    flashcardsReviewed: 0,
    studySessions: 0,
    masteredCards: 0,
    focusMinutesTotal: 0,
    recentActivity: [],
  };
  try {
    const key = getScopedKey(PROGRESS_KEY, userId);
    localStorage.setItem(key, JSON.stringify(cleanProgress));
  } catch (e) {
    console.error('Failed to reset progress', e);
  }
  return cleanProgress;
}

export function recordProgressAction(
  type:
    | 'topicsStudied'
    | 'quizzesCompleted'
    | 'flashcardsReviewed'
    | 'studySessions'
    | 'masteredCards'
    | 'focusMinutesTotal',
  detail?: { title: string; category: string },
  userId?: string
): UserProgress {
  const current = getStoredProgress(userId);
  const updated: UserProgress = {
    ...current,
    [type]: (current[type] || 0) + 1,
  };

  if (detail) {
    updated.recentActivity = [
      {
        id: `act-${Date.now()}`,
        title: detail.title,
        type: detail.category,
        timestamp: new Date().toISOString(),
      },
      ...(current.recentActivity || []).slice(0, 19),
    ];
  }

  try {
    const key = getScopedKey(PROGRESS_KEY, userId);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save progress', e);
  }
  return updated;
}

// Load entire user data package for a specific user ID
export function loadAllUserData(userId: string): {
  subjects: SubjectItem[];
  notes: NoteItem[];
  planTasks: StudyPlanTask[];
  focusLogs: FocusSessionLog[];
  sessions: StudySession[];
  progress: UserProgress;
} {
  return {
    subjects: getStoredSubjects(userId),
    notes: getStoredNotes(userId),
    planTasks: getStoredPlanTasks(userId),
    focusLogs: getStoredFocusLogs(userId),
    sessions: getStoredSessions(userId),
    progress: getStoredProgress(userId),
  };
}

const ACCOUNTS_REGISTRY_KEY = 'studyflow_accounts_registry_v2';

export interface StoredAccountRecord {
  id: string;
  email: string;
  passwordHash?: string;
  name: string;
  provider: 'email' | 'google' | 'phone';
  createdAt: string;
  profile: UserProfile;
}

// Account Registry Operations
export function getRegisteredAccounts(): StoredAccountRecord[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_REGISTRY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function findAccountByEmail(email: string): StoredAccountRecord | null {
  const accounts = getRegisteredAccounts();
  const cleanEmail = email.trim().toLowerCase();
  return accounts.find((a) => a.email.toLowerCase() === cleanEmail) || null;
}

export function findAccountByIdentifier(identifier: string): StoredAccountRecord | null {
  const accounts = getRegisteredAccounts();
  const clean = identifier.trim().toLowerCase();
  if (!clean) return null;

  // 1. Direct email match
  let found = accounts.find((a) => a.email.toLowerCase() === clean);
  if (found) return found;

  // 2. Direct name match (e.g. "XYZ", "Alex Rivera")
  found = accounts.find((a) => a.name.toLowerCase() === clean || a.profile?.name?.toLowerCase() === clean);
  if (found) return found;

  // 3. Email prefix / Username match (e.g. "xyz" in "xyz@domain.com")
  found = accounts.find((a) => a.email.toLowerCase().split('@')[0] === clean);
  if (found) return found;

  // 4. Case-insensitive substring match
  found = accounts.find((a) => a.name.toLowerCase().includes(clean) || (clean.length > 3 && a.email.toLowerCase().includes(clean)));
  return found || null;
}

export function saveAccountRecord(record: StoredAccountRecord): void {
  try {
    const accounts = getRegisteredAccounts();
    const idx = accounts.findIndex((a) => a.id === record.id || a.email.toLowerCase() === record.email.toLowerCase());
    if (idx >= 0) {
      accounts[idx] = record;
    } else {
      accounts.push(record);
    }
    localStorage.setItem(ACCOUNTS_REGISTRY_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save account record', e);
  }
}

// Reset Entire Workspace to Brand New Initial State
export function resetAllDataToBrandNew(userId?: string): {
  profile: null;
  subjects: SubjectItem[];
  notes: NoteItem[];
  planTasks: StudyPlanTask[];
  focusLogs: FocusSessionLog[];
  sessions: StudySession[];
  progress: UserProgress;
} {
  try {
    const uid = userId || getActiveUserId();
    localStorage.removeItem(getScopedKey(SESSIONS_KEY, uid));
    localStorage.removeItem(getScopedKey(PROGRESS_KEY, uid));
    localStorage.removeItem(getScopedKey(NOTES_KEY, uid));
    localStorage.removeItem(getScopedKey(PLAN_TASKS_KEY, uid));
    localStorage.removeItem(getScopedKey(FOCUS_LOGS_KEY, uid));
    localStorage.removeItem(getScopedKey(SUBJECT_CHATS_KEY, uid));
    localStorage.removeItem(getScopedKey(SUBJECTS_KEY, uid));
    localStorage.removeItem(PROFILE_KEY);
  } catch (e) {
    console.error('Failed to clear storage keys', e);
  }

  const initialProgress: UserProgress = {
    topicsStudied: 0,
    quizzesCompleted: 0,
    flashcardsReviewed: 0,
    studySessions: 0,
    masteredCards: 0,
    focusMinutesTotal: 0,
    recentActivity: [],
  };

  return {
    profile: null,
    subjects: DEFAULT_SUBJECTS,
    notes: [],
    planTasks: [],
    focusLogs: [],
    sessions: [],
    progress: initialProgress,
  };
}
