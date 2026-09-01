import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  getDocFromServer,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import {
  UserProfile,
  SubjectItem,
  NoteItem,
  StudyPlanTask,
  FocusSessionLog,
  StudySession,
  UserProgress,
} from '../types';
import {
  saveStoredSubjects,
  saveStoredNotes,
  saveStoredPlanTasksBulk,
  saveStoredFocusLogs,
  saveStoredSessionsList,
  saveStoredProgress,
  DEFAULT_SUBJECTS,
} from '../utils/storage';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Error: ', JSON.stringify(errInfo));
}

// Test server connectivity on startup
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    if (auth.currentUser) {
      await getDocFromServer(doc(db, 'users', auth.currentUser.uid));
    }
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is currently in offline mode.');
    }
    return false;
  }
}

// 1. Fetch entire user workspace from Firestore
export async function fetchUserWorkspaceFromFirestore(userId: string): Promise<{
  subjects: SubjectItem[];
  notes: NoteItem[];
  planTasks: StudyPlanTask[];
  focusLogs: FocusSessionLog[];
  sessions: StudySession[];
  progress: UserProgress | null;
}> {
  const result = {
    subjects: [] as SubjectItem[],
    notes: [] as NoteItem[],
    planTasks: [] as StudyPlanTask[],
    focusLogs: [] as FocusSessionLog[],
    sessions: [] as StudySession[],
    progress: null as UserProgress | null,
  };

  if (!userId || userId === 'guest') {
    return result;
  }

  // Fetch Notes
  try {
    const notesSnap = await getDocs(collection(db, 'users', userId, 'notes'));
    const notesList: NoteItem[] = [];
    notesSnap.forEach((docItem) => {
      notesList.push({ ...(docItem.data() as NoteItem), id: docItem.id });
    });
    result.notes = notesList;
    if (notesList.length > 0) {
      saveStoredNotes(notesList, userId);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `users/${userId}/notes`);
  }

  // Fetch Subjects
  try {
    const subjectsSnap = await getDocs(collection(db, 'users', userId, 'subjects'));
    const subjectsList: SubjectItem[] = [];
    subjectsSnap.forEach((docItem) => {
      subjectsList.push({ ...(docItem.data() as SubjectItem), id: docItem.id });
    });
    if (subjectsList.length > 0) {
      result.subjects = subjectsList;
      saveStoredSubjects(subjectsList, userId);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `users/${userId}/subjects`);
  }

  // Fetch Study Plan Tasks
  try {
    const tasksSnap = await getDocs(collection(db, 'users', userId, 'planTasks'));
    const tasksList: StudyPlanTask[] = [];
    tasksSnap.forEach((docItem) => {
      tasksList.push({ ...(docItem.data() as StudyPlanTask), id: docItem.id });
    });
    result.planTasks = tasksList;
    if (tasksList.length > 0) {
      saveStoredPlanTasksBulk(tasksList, userId);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `users/${userId}/planTasks`);
  }

  // Fetch Focus Logs
  try {
    const logsSnap = await getDocs(collection(db, 'users', userId, 'focusLogs'));
    const logsList: FocusSessionLog[] = [];
    logsSnap.forEach((docItem) => {
      logsList.push({ ...(docItem.data() as FocusSessionLog), id: docItem.id });
    });
    result.focusLogs = logsList;
    if (logsList.length > 0) {
      saveStoredFocusLogs(logsList, userId);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `users/${userId}/focusLogs`);
  }

  // Fetch Study Sessions
  try {
    const sessionsSnap = await getDocs(collection(db, 'users', userId, 'sessions'));
    const sessionsList: StudySession[] = [];
    sessionsSnap.forEach((docItem) => {
      sessionsList.push({ ...(docItem.data() as StudySession), id: docItem.id });
    });
    result.sessions = sessionsList;
    if (sessionsList.length > 0) {
      saveStoredSessionsList(sessionsList, userId);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `users/${userId}/sessions`);
  }

  return result;
}

// 2. Note Firestore Sync
export async function syncNoteToFirestore(userId: string, note: NoteItem): Promise<void> {
  if (!userId || userId === 'guest') return;
  const path = `users/${userId}/notes/${note.id}`;
  try {
    const noteRef = doc(db, 'users', userId, 'notes', note.id);
    await setDoc(noteRef, {
      ...note,
      userId,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteNoteFromFirestore(userId: string, noteId: string): Promise<void> {
  if (!userId || userId === 'guest') return;
  const path = `users/${userId}/notes/${noteId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'notes', noteId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// 3. Subjects Firestore Sync
export async function syncSubjectsToFirestore(userId: string, subjects: SubjectItem[]): Promise<void> {
  if (!userId || userId === 'guest') return;
  for (const subject of subjects) {
    const path = `users/${userId}/subjects/${subject.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'subjects', subject.id), {
        ...subject,
        userId,
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }
}

// 4. Study Plan Task Firestore Sync
export async function syncPlanTaskToFirestore(userId: string, task: StudyPlanTask): Promise<void> {
  if (!userId || userId === 'guest') return;
  const path = `users/${userId}/planTasks/${task.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'planTasks', task.id), {
      ...task,
      userId,
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deletePlanTaskFromFirestore(userId: string, taskId: string): Promise<void> {
  if (!userId || userId === 'guest') return;
  const path = `users/${userId}/planTasks/${taskId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'planTasks', taskId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// 5. Focus Log Firestore Sync
export async function syncFocusLogToFirestore(userId: string, log: FocusSessionLog): Promise<void> {
  if (!userId || userId === 'guest') return;
  const path = `users/${userId}/focusLogs/${log.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'focusLogs', log.id), {
      ...log,
      userId,
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// 6. Study Session Firestore Sync
export async function syncSessionToFirestore(userId: string, session: StudySession): Promise<void> {
  if (!userId || userId === 'guest') return;
  const path = `users/${userId}/sessions/${session.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'sessions', session.id), {
      ...session,
      userId,
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteSessionFromFirestore(userId: string, sessionId: string): Promise<void> {
  if (!userId || userId === 'guest') return;
  const path = `users/${userId}/sessions/${sessionId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'sessions', sessionId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// 7. User Progress Firestore Sync
export async function syncProgressToFirestore(userId: string, progress: UserProgress): Promise<void> {
  if (!userId || userId === 'guest') return;
  const path = `users/${userId}/progress/summary`;
  try {
    await setDoc(doc(db, 'users', userId, 'progress', 'summary'), {
      ...progress,
      userId,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}
