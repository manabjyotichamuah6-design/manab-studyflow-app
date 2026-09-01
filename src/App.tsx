/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AppView,
  ActiveTab,
  StudySession,
  UserProgress,
  DifficultyRating,
  UserProfile,
  SubjectItem,
  NoteItem,
  StudyPlanTask,
  FocusSessionLog,
  QuizQuestion,
  Flashcard,
} from './types';
import {
  getStoredSessions,
  saveSession,
  deleteStoredSession,
  getStoredProgress,
  recordProgressAction,
  getStoredProfile,
  saveStoredProfile,
  getStoredSubjects,
  saveStoredSubjects,
  getStoredNotes,
  saveStoredNote,
  deleteStoredNote,
  getStoredPlanTasks,
  saveStoredPlanTask,
  saveStoredPlanTasksBulk,
  reorderStoredPlanTasks,
  toggleStoredPlanTask,
  deleteStoredPlanTask,
  getStoredFocusLogs,
  saveStoredFocusLog,
  resetAllDataToBrandNew,
  resetProgressOnly,
} from './utils/storage';
import { SAMPLE_TOPICS } from './data/sampleMaterials';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { Workspace } from './components/Workspace';
import { SmartNotesView } from './components/SmartNotesView';
import { SubjectsView } from './components/SubjectsView';
import { SubjectWorkspace } from './components/SubjectWorkspace';
import { AIToolsHubView } from './components/AIToolsHubView';
import { StudyPlannerView } from './components/StudyPlannerView';
import { ProgressView } from './components/ProgressView';
import { MyLibraryView } from './components/MyLibraryView';
import { ProfileSettingsView } from './components/ProfileSettingsView';
import { ExplainSimplyModal } from './components/ExplainSimplyModal';
import { FocusSessionModal } from './components/FocusSessionModal';
import { UploadMaterialModal } from './components/UploadMaterialModal';
import { AuthModal } from './components/AuthModal';
import { AuthView } from './components/AuthView';
import { OnboardingFlow } from './components/OnboardingFlow';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { CaseStudyView } from './components/CaseStudyView';
import { DoubtSolverView } from './components/DoubtSolverView';
import { LogoutFeedbackView } from './components/LogoutFeedbackView';
import { Footer } from './components/Footer';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { checkRedirectAuth, signOutFromFirebase, saveProfileToFirestore, syncUserProfileFromFirestore } from './lib/authService';
import {
  fetchUserWorkspaceFromFirestore,
  syncNoteToFirestore,
  deleteNoteFromFirestore,
  syncSubjectsToFirestore,
  syncPlanTaskToFirestore,
  deletePlanTaskFromFirestore,
  syncFocusLogToFirestore,
  syncSessionToFirestore,
  deleteSessionFromFirestore,
  syncProgressToFirestore,
} from './lib/firestoreSync';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [viewHistory, setViewHistory] = useState<AppView[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('summary');

  // Persistence States
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [planTasks, setPlanTasks] = useState<StudyPlanTask[]>([]);
  const [focusLogs, setFocusLogs] = useState<FocusSessionLog[]>([]);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(null);

  const [progress, setProgress] = useState<UserProgress>({
    topicsStudied: 0,
    quizzesCompleted: 0,
    flashcardsReviewed: 0,
    studySessions: 0,
    masteredCards: 0,
    recentActivity: [],
  });

  // Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isExplainModalOpen, setIsExplainModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // App & Backend State
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCustomExplaining, setIsCustomExplaining] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Load all user collections for active user
  const loadUserData = (userId?: string) => {
    const activeUid = userId || userProfile?.id || 'guest';
    setSubjects(getStoredSubjects(activeUid));
    setNotes(getStoredNotes(activeUid));
    setPlanTasks(getStoredPlanTasks(activeUid));
    setFocusLogs(getStoredFocusLogs(activeUid));
    setSessions(getStoredSessions(activeUid));
    setProgress(getStoredProgress(activeUid));

    // If authenticated user, hydrate in background from Firestore
    if (activeUid && activeUid !== 'guest') {
      fetchUserWorkspaceFromFirestore(activeUid)
        .then((remoteData) => {
          if (remoteData.subjects.length > 0) setSubjects(remoteData.subjects);
          if (remoteData.notes.length > 0) setNotes(remoteData.notes);
          if (remoteData.planTasks.length > 0) setPlanTasks(remoteData.planTasks);
          if (remoteData.focusLogs.length > 0) setFocusLogs(remoteData.focusLogs);
          if (remoteData.sessions.length > 0) setSessions(remoteData.sessions);
        })
        .catch((e) => {
          console.warn('Firestore workspace fetch notice:', e);
        });
    }
  };

  // Initialization & Firebase Auth State Listener
  useEffect(() => {
    const prof = getStoredProfile();
    setUserProfile(prof);
    loadUserData(prof?.id);

    // Check for any redirect auth from mobile browser
    checkRedirectAuth().then((res) => {
      if (res && res.profile) {
        setUserProfile(res.profile);
        loadUserData(res.profile.id);
        if (res.isNewUser) {
          setCurrentView('onboarding');
        } else {
          setCurrentView('dashboard');
        }
      }
    });

    // Listen to live Firebase Auth state
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // If current state does not match this authenticated user, sync
        if (!userProfile || userProfile.id !== firebaseUser.uid) {
          try {
            const { profile } = await syncUserProfileFromFirestore(firebaseUser);
            setUserProfile(profile);
            loadUserData(profile.id);
          } catch (e) {
            console.warn('Live auth sync notice:', e);
          }
        }
      }
    });

    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(Boolean(data.hasGeminiKey));
      })
      .catch(() => {
        setHasApiKey(false);
      });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K (Global Search)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Centralized Navigation with Protected Route Guard and History Stack
  const handleNavigate = (view: AppView, addToHistory = true) => {
    if (addToHistory && view !== currentView) {
      setViewHistory((prev) => [...prev.slice(-30), currentView]);
    }

    const publicViews: AppView[] = ['landing', 'case-study', 'auth', 'onboarding', 'logout-confirm'];
    const isProtected = !publicViews.includes(view);

    if (isProtected && (!userProfile || !userProfile.isLoggedIn)) {
      setCurrentView('auth');
      showToast('Please sign in or start for free to access your personal study space.', 'info');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Top Blue Arrow Navigation Handlers: Go to Previous Page or Home
  const handleGoBack = () => {
    if (viewHistory.length > 0) {
      const nextHistory = [...viewHistory];
      const prevView = nextHistory.pop()!;
      setViewHistory(nextHistory);

      const publicViews: AppView[] = ['landing', 'case-study', 'auth', 'onboarding', 'logout-confirm'];
      const isProtected = !publicViews.includes(prevView);

      if (isProtected && (!userProfile || !userProfile.isLoggedIn)) {
        setCurrentView('auth');
      } else {
        setCurrentView(prevView);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // If no history, default to Home (Dashboard if logged in, Landing if guest)
      const homeView: AppView = userProfile?.isLoggedIn ? 'dashboard' : 'landing';
      setCurrentView(homeView);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGoHome = () => {
    const homeView: AppView = userProfile?.isLoggedIn ? 'dashboard' : 'landing';
    handleNavigate(homeView);
  };

  const handleInitiateSignOut = () => {
    setCurrentView('logout-confirm');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteSignOut = (feedback?: { reason: string; rating: number; thoughts: string; favoriteFeature: string }) => {
    if (feedback) {
      try {
        const storedFeedback = JSON.parse(localStorage.getItem('studyflow_logout_feedback') || '[]');
        storedFeedback.push({
          ...feedback,
          userId: userProfile?.id,
          userName: userProfile?.name,
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem('studyflow_logout_feedback', JSON.stringify(storedFeedback));
      } catch {
        // safe fallback
      }
    }

    const studentName = userProfile?.name || 'Student';
    signOutFromFirebase();
    setUserProfile(null);
    saveStoredProfile(null);
    loadUserData('guest');
    setCurrentView('landing');
    showToast(`Thank you for studying with StudyFlow, ${studentName}! Your feedback was received and progress saved.`, 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth / Onboarding completions
  const handleAuthSuccess = (profile: UserProfile, isNewUser?: boolean) => {
    setUserProfile(profile);
    saveStoredProfile(profile);
    loadUserData(profile.id);
    setIsAuthModalOpen(false);

    // If user hasn't finished full onboarding or is newly signing in/up, present personal information form
    if (!profile.onboarded || isNewUser) {
      setCurrentView('onboarding');
      showToast(`Welcome ${profile.name}! Please confirm your academic level and subjects.`);
    } else {
      // If already fully onboarded
      const currentSubjects = getStoredSubjects(profile.id);
      if (!currentSubjects || currentSubjects.length === 0) {
        const initSubjects: SubjectItem[] = (profile.subjects && profile.subjects.length > 0 ? profile.subjects : ['Science', 'Mathematics', 'English']).map((subjName, idx) => ({
          id: `subj-${Date.now()}-${idx}`,
          name: subjName,
          topics: ['Introduction & Core Concepts', 'Important Formulas & Definitions', 'Chapter Practice'],
          color: idx % 2 === 0 ? '#1B4332' : '#2D6A4F',
        }));
        setSubjects(initSubjects);
        saveStoredSubjects(initSubjects, profile.id);
      }
      setCurrentView('dashboard');
      showToast(`Welcome back, ${profile.name}!`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    // Auto-create initial subjects with structured starter topics based on user selection
    const newSubjects: SubjectItem[] = (profile.subjects || ['Core Subject']).map((subjName, idx) => ({
      id: `subj-${Date.now()}-${idx}`,
      name: subjName,
      topics: [
        'Introduction & High-Yield Fundamentals',
        'Core Mechanisms, Formulas & Definitions',
        'Diagnostic Questions & Case Studies',
      ],
      color: idx % 2 === 0 ? '#1B4332' : '#2D6A4F',
    }));

    const completeProfile: UserProfile = {
      ...profile,
      onboarded: true,
      isLoggedIn: true,
    };

    setUserProfile(completeProfile);
    saveProfileToFirestore(completeProfile);
    saveStoredSubjects(newSubjects, completeProfile.id);
    syncSubjectsToFirestore(completeProfile.id, newSubjects);
    loadUserData(completeProfile.id);

    setCurrentView('dashboard');
    showToast(`Your personalized ${profile.gradeLabel || 'study'} workspace is ready!`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Focus session logger
  const handleSaveFocusSession = (topicStudied: string, subject: string, durationMinutes: number) => {
    const activeUid = userProfile?.id || 'guest';
    const newLog: FocusSessionLog = {
      id: `focus-${Date.now()}`,
      timestamp: new Date().toISOString(),
      topicStudied: topicStudied.trim(),
      subject: subject || 'General',
      durationMinutes,
      completed: true,
    };
    saveStoredFocusLog(newLog, activeUid);
    setFocusLogs(getStoredFocusLogs(activeUid));
    if (activeUid !== 'guest') {
      syncFocusLogToFirestore(activeUid, newLog);
    }

    const updatedProg = recordProgressAction('studySessions', {
      title: `${durationMinutes}m Focus: ${topicStudied}`,
      category: 'focus',
    }, activeUid);
    setProgress(updatedProg);
    if (activeUid !== 'guest') {
      syncProgressToFirestore(activeUid, updatedProg);
    }
    setIsFocusModalOpen(false);
    showToast(`Focus session logged: ${durationMinutes} minutes! 🌱`);
  };

  // Notes operations
  const handleSaveNote = (noteToSave: NoteItem) => {
    const activeUid = userProfile?.id || 'guest';
    saveStoredNote(noteToSave, activeUid);
    const updatedNotes = getStoredNotes(activeUid);
    setNotes(updatedNotes);
    if (activeUid !== 'guest') {
      syncNoteToFirestore(activeUid, noteToSave);
    }
    const updatedProg = recordProgressAction('topicsStudied', {
      title: noteToSave.title,
      category: 'summary',
    }, activeUid);
    setProgress(updatedProg);
    if (activeUid !== 'guest') {
      syncProgressToFirestore(activeUid, updatedProg);
    }
    showToast(`Note "${noteToSave.title}" saved.`);
  };

  const handleDeleteNote = (id: string) => {
    const activeUid = userProfile?.id || 'guest';
    deleteStoredNote(id, activeUid);
    setNotes(getStoredNotes(activeUid));
    if (activeUid !== 'guest') {
      deleteNoteFromFirestore(activeUid, id);
    }
    showToast('Note deleted.', 'info');
  };

  // Planner operations
  const handleSaveTask = (task: StudyPlanTask) => {
    const activeUid = userProfile?.id || 'guest';
    saveStoredPlanTask(task, activeUid);
    setPlanTasks(getStoredPlanTasks(activeUid));
    if (activeUid !== 'guest') {
      syncPlanTaskToFirestore(activeUid, task);
    }
    showToast('Task added to schedule.');
  };

  const handleSaveTasksBulk = (tasksToAdd: StudyPlanTask[]) => {
    if (!tasksToAdd || tasksToAdd.length === 0) return;
    const activeUid = userProfile?.id || 'guest';
    saveStoredPlanTasksBulk(tasksToAdd, activeUid);
    setPlanTasks(getStoredPlanTasks(activeUid));
    if (activeUid !== 'guest') {
      tasksToAdd.forEach((t) => syncPlanTaskToFirestore(activeUid, t));
    }
    showToast(`Added ${tasksToAdd.length} task${tasksToAdd.length > 1 ? 's' : ''} to schedule! ✨`);
  };

  const handleReorderTasks = (updatedTasks: StudyPlanTask[]) => {
    const activeUid = userProfile?.id || 'guest';
    reorderStoredPlanTasks(updatedTasks, activeUid);
    setPlanTasks(updatedTasks);
  };

  const handleToggleTask = (id: string) => {
    const activeUid = userProfile?.id || 'guest';
    toggleStoredPlanTask(id, activeUid);
    const currentTasks = getStoredPlanTasks(activeUid);
    setPlanTasks(currentTasks);
    const toggled = currentTasks.find((t) => t.id === id);
    if (activeUid !== 'guest' && toggled) {
      syncPlanTaskToFirestore(activeUid, toggled);
    }
    const updatedProg = recordProgressAction('studySessions', {
      title: 'Completed scheduled task',
      category: 'studyPlan',
    }, activeUid);
    setProgress(updatedProg);
    if (activeUid !== 'guest') {
      syncProgressToFirestore(activeUid, updatedProg);
    }
  };

  const handleDeleteTask = (id: string) => {
    const activeUid = userProfile?.id || 'guest';
    deleteStoredPlanTask(id, activeUid);
    setPlanTasks(getStoredPlanTasks(activeUid));
    if (activeUid !== 'guest') {
      deletePlanTaskFromFirestore(activeUid, id);
    }
    showToast('Task removed from schedule.', 'info');
  };

  // AI Multi-day planner generator
  const handleGeneratePlanWithAI = async (subjectName: string, topicName: string, days: number, minutes: number) => {
    showToast(`Generating ${days}-day plan for ${topicName}...`);
    try {
      const res = await fetch('/api/study/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: `${subjectName}: ${topicName}`,
          content: `Create a structured ${days}-day study timetable for ${topicName} in ${subjectName}. Daily available time: ${minutes} minutes.`,
          studyDays: days,
          dailyMinutes: minutes,
        }),
      });
      const data = await res.json();
      if (data.data?.studyPlan) {
        const activeUid = userProfile?.id || 'guest';
        // Save each plan day as task
        const newGeneratedTasks: StudyPlanTask[] = data.data.studyPlan.map((p: any, idx: number) => {
          const futureDate = new Date(Date.now() + idx * 86400000).toISOString().split('T')[0];
          return {
            id: `task-${Date.now()}-${idx}`,
            subject: subjectName,
            topic: `${p.focus} (Day ${p.day})`,
            availableMinutes: minutes,
            targetDate: futureDate,
            priority: idx === 0 ? 'high' : 'medium',
            completed: false,
            notes: p.activity,
          };
        });
        saveStoredPlanTasksBulk(newGeneratedTasks, activeUid);
        setPlanTasks(getStoredPlanTasks(activeUid));
        if (activeUid !== 'guest') {
          newGeneratedTasks.forEach((t) => syncPlanTaskToFirestore(activeUid, t));
        }
        showToast(`${days}-day plan generated and added to timetable!`);
      }
    } catch (e) {
      showToast('Could not generate plan with AI', 'error');
    }
  };

  // Generate full study session from Workspace
  const handleGenerate = async (params: {
    topic: string;
    content: string;
    studyDays: number;
    dailyMinutes: number;
  }) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/study/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to generate study materials');
      }

      const resData = await response.json();
      const generated = resData.data;

      const newSession: StudySession = {
        id: `sess-${Date.now()}`,
        topic: generated.topic || params.topic || 'Study Session',
        rawContent: params.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        summary: generated.summary,
        keyPoints: generated.keyPoints || [],
        flashcards: generated.flashcards || [],
        quiz: generated.quiz || [],
        explanation: generated.explanation,
        studyPlan: generated.studyPlan || [],
      };

      const activeUid = userProfile?.id || 'guest';
      setCurrentSession(newSession);
      saveSession(newSession, activeUid);
      setSessions(getStoredSessions(activeUid));
      if (activeUid !== 'guest') {
        syncSessionToFirestore(activeUid, newSession);
      }
      const updatedProg = recordProgressAction('topicsStudied', {
        title: newSession.topic,
        category: 'summary',
      }, activeUid);
      setProgress(updatedProg);
      if (activeUid !== 'guest') {
        syncProgressToFirestore(activeUid, updatedProg);
      }

      showToast(`Study package synthesized for "${newSession.topic}"!`);

      // Scroll to results container
      setTimeout(() => {
        const el = document.getElementById('results-container');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } catch (err: any) {
      console.error('Generation error:', err);
      showToast(err.message || 'Error creating study plan', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Flashcards or Quizzes from Note
  const handleGenerateFlashcardsFromNote = async (note: NoteItem) => {
    showToast(`Generating flashcards for "${note.title}"...`);
    setCurrentView('workspace');
    setActiveTab('flashcards');
    await handleGenerate({
      topic: note.title,
      content: note.content,
      studyDays: 4,
      dailyMinutes: 45,
    });
  };

  const handleGenerateQuizFromNote = async (note: NoteItem) => {
    showToast(`Generating quiz for "${note.title}"...`);
    setCurrentView('workspace');
    setActiveTab('quiz');
    await handleGenerate({
      topic: note.title,
      content: note.content,
      studyDays: 4,
      dailyMinutes: 45,
    });
  };

  // Quick select sample material from Landing
  const handleSelectSample = async (sampleId: string) => {
    const sample = SAMPLE_TOPICS.find((s) => s.id === sampleId);
    if (!sample) return;

    setCurrentView('workspace');
    setActiveTab('summary');
    await handleGenerate({
      topic: sample.title,
      content: sample.notes,
      studyDays: 4,
      dailyMinutes: 45,
    });
  };

  // Quick Action launcher from Dashboard
  const handleNewSessionWithAction = (tab: ActiveTab) => {
    setActiveTab(tab);
    setCurrentView('workspace');
  };

  // Open existing saved session
  const handleOpenSession = (session: StudySession, initialTab: ActiveTab = 'summary') => {
    setCurrentSession(session);
    setActiveTab(initialTab);
    setCurrentView('workspace');
  };

  // Reset progress counters specifically
  const handleResetProgress = () => {
    const activeUid = userProfile?.id || 'guest';
    const clean = resetProgressOnly(activeUid);
    setProgress(clean);
    if (activeUid !== 'guest') {
      syncProgressToFirestore(activeUid, clean);
    }
    showToast('Your progression stats have been reset to 0%.', 'info');
  };

  // Delete saved session
  const handleDeleteSession = (id: string) => {
    const activeUid = userProfile?.id || 'guest';
    deleteStoredSession(id, activeUid);
    const updated = getStoredSessions(activeUid);
    setSessions(updated);
    if (activeUid !== 'guest') {
      deleteSessionFromFirestore(activeUid, id);
    }
    if (currentSession && currentSession.id === id) {
      setCurrentSession(null);
    }
    showToast('Topic removed from saved list', 'info');
  };

  // Update flashcard difficulty rating
  const handleUpdateFlashcardRating = (cardId: string, rating: DifficultyRating) => {
    if (!currentSession) return;
    const activeUid = userProfile?.id || 'guest';

    const updatedCards = currentSession.flashcards.map((c) =>
      c.id === cardId ? { ...c, rating } : c
    );

    const updatedSession = {
      ...currentSession,
      flashcards: updatedCards,
      updatedAt: new Date().toISOString(),
    };

    setCurrentSession(updatedSession);
    saveSession(updatedSession, activeUid);
    setSessions(getStoredSessions(activeUid));
    if (activeUid !== 'guest') {
      syncSessionToFirestore(activeUid, updatedSession);
    }

    if (rating === 'mastered') {
      const up = recordProgressAction('masteredCards', undefined, activeUid);
      setProgress(up);
      if (activeUid !== 'guest') {
        syncProgressToFirestore(activeUid, up);
      }
    }
    const upProg = recordProgressAction('flashcardsReviewed', {
      title: currentSession.topic,
      category: 'flashcards',
    }, activeUid);
    setProgress(upProg);
    if (activeUid !== 'guest') {
      syncProgressToFirestore(activeUid, upProg);
    }
  };

  // Quiz completion handler
  const handleQuizComplete = (score: number, total: number) => {
    if (!currentSession) return;
    const activeUid = userProfile?.id || 'guest';

    const updatedSession: StudySession = {
      ...currentSession,
      lastQuizScore: {
        score,
        total,
        date: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };

    setCurrentSession(updatedSession);
    saveSession(updatedSession, activeUid);
    setSessions(getStoredSessions(activeUid));
    if (activeUid !== 'guest') {
      syncSessionToFirestore(activeUid, updatedSession);
    }

    const upProg = recordProgressAction('quizzesCompleted', {
      title: currentSession.topic,
      category: 'quiz',
    }, activeUid);
    setProgress(upProg);
    if (activeUid !== 'guest') {
      syncProgressToFirestore(activeUid, upProg);
    }

    showToast(`Quiz completed! Score: ${score}/${total}`);
  };

  // Update quiz questions (Add, Edit, Delete, or Batch Generate)
  const handleUpdateQuizQuestions = (updatedQuiz: QuizQuestion[]) => {
    const activeUid = userProfile?.id || 'guest';
    if (!currentSession) {
      const freshSession: StudySession = {
        id: `sess-${Date.now()}`,
        topic: 'Custom Practice Quiz',
        rawContent: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        summary: 'Interactive practice quiz session.',
        keyPoints: [],
        flashcards: [],
        quiz: updatedQuiz,
        explanation: {
          simpleExplanation: 'Practice quiz configured by student.',
          everydayAnalogy: '',
          keyTerms: [],
          quickRecap: [],
        },
        studyPlan: [],
      };
      setCurrentSession(freshSession);
      saveSession(freshSession, activeUid);
      setSessions(getStoredSessions(activeUid));
      if (activeUid !== 'guest') {
        syncSessionToFirestore(activeUid, freshSession);
      }
      showToast(`Quiz updated (${updatedQuiz.length} questions)!`);
      return;
    }

    const updatedSession: StudySession = {
      ...currentSession,
      quiz: updatedQuiz,
      updatedAt: new Date().toISOString(),
    };

    setCurrentSession(updatedSession);
    saveSession(updatedSession, activeUid);
    setSessions(getStoredSessions(activeUid));
    if (activeUid !== 'guest') {
      syncSessionToFirestore(activeUid, updatedSession);
    }
    showToast(`Quiz saved with ${updatedQuiz.length} questions!`);
  };

  // Update flashcards (Customize, Add, Edit, Delete, or Batch Generate)
  const handleUpdateFlashcards = (updatedCards: Flashcard[]) => {
    const activeUid = userProfile?.id || 'guest';
    if (!currentSession) {
      const freshSession: StudySession = {
        id: `sess-${Date.now()}`,
        topic: 'Custom Active Recall Deck',
        rawContent: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        summary: 'Custom active recall flashcard deck.',
        keyPoints: [],
        flashcards: updatedCards,
        quiz: [],
        explanation: {
          simpleExplanation: 'Flashcard revision deck.',
          everydayAnalogy: '',
          keyTerms: [],
          quickRecap: [],
        },
        studyPlan: [],
      };
      setCurrentSession(freshSession);
      saveSession(freshSession, activeUid);
      setSessions(getStoredSessions(activeUid));
      if (activeUid !== 'guest') {
        syncSessionToFirestore(activeUid, freshSession);
      }
      showToast(`Flashcard deck created with ${updatedCards.length} cards!`);
      return;
    }

    const updatedSession: StudySession = {
      ...currentSession,
      flashcards: updatedCards,
      updatedAt: new Date().toISOString(),
    };

    setCurrentSession(updatedSession);
    saveSession(updatedSession, activeUid);
    setSessions(getStoredSessions(activeUid));
    if (activeUid !== 'guest') {
      syncSessionToFirestore(activeUid, updatedSession);
    }
    showToast(`Flashcard deck updated (${updatedCards.length} cards total)!`);
  };

  // Custom concept explanation within Workspace
  const handleExplainConcept = async (concept: string) => {
    if (!currentSession) return;
    setIsCustomExplaining(true);
    try {
      const res = await fetch('/api/study/explain-simply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept }),
      });
      const data = await res.json();
      if (data.data) {
        const updatedExplanation = {
          ...currentSession.explanation,
          simpleExplanation: data.data.simpleExplanation,
          everydayAnalogy: data.data.everydayAnalogy,
          keyTerms: [
            ...(data.data.keyTerms || []),
            ...currentSession.explanation.keyTerms,
          ].slice(0, 8),
          quickRecap: data.data.quickRecap || currentSession.explanation.quickRecap,
        };

        const updatedSession = {
          ...currentSession,
          explanation: updatedExplanation,
          updatedAt: new Date().toISOString(),
        };

        setCurrentSession(updatedSession);
        saveSession(updatedSession);
        showToast(`Explained "${concept}" simply.`);
      }
    } catch (e: any) {
      showToast('Could not explain concept', 'error');
    } finally {
      setIsCustomExplaining(false);
    }
  };

  const handleResetWorkspace = () => {
    setCurrentSession(null);
    setActiveTab('summary');
  };

  return (
    <div className="min-h-screen w-full max-w-full flex flex-col bg-[#FAF8F5] text-[#1C1E1B] font-sans selection:bg-emerald-200 selection:text-emerald-950 overflow-x-clip">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 fade-in duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-sm font-medium ${
              toastMessage.type === 'error'
                ? 'bg-rose-50 text-rose-950 border-rose-200 shadow-rose-900/10'
                : 'bg-white text-[#1C1E1B] border-emerald-300 shadow-[0_8px_30px_rgba(45,106,79,0.15)]'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-stone-400 hover:text-stone-700 ml-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Header / Navigation with Top Blue Arrow Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onGoBack={handleGoBack}
        onGoHome={handleGoHome}
        canGoBack={viewHistory.length > 0 || (currentView !== 'landing' && currentView !== 'dashboard')}
        onOpenExplainModal={() => setIsExplainModalOpen(true)}
        onOpenFocusModal={() => setIsFocusModalOpen(true)}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleInitiateSignOut}
        userProfile={userProfile}
        hasApiKey={hasApiKey}
      />

      {/* Main App Content View Switcher */}
      <main className="flex-1 max-w-7xl w-full mx-auto pb-8">
        {/* VIEW: LANDING */}
        {currentView === 'landing' && (
          <LandingPage
            onStartStudying={() => {
              if (userProfile?.isLoggedIn || userProfile?.onboarded) {
                handleNavigate('dashboard');
              } else {
                handleNavigate('auth');
              }
            }}
            onExploreFeatures={() => {
              const el = document.getElementById('features-section');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            onSelectSample={handleSelectSample}
            onNavigateCaseStudy={() => {
              handleNavigate('case-study');
            }}
          />
        )}

        {/* VIEW: AUTHENTICATION / SIGN UP & LOG IN PAGE */}
        {currentView === 'auth' && (
          <AuthView
            initialMode="signin"
            onSuccess={handleAuthSuccess}
            onExploreAsGuest={() => {
              setCurrentView('dashboard');
              showToast('Continuing as Guest Student. You can sign in anytime.', 'info');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToLanding={() => {
              setCurrentView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW: ONBOARDING */}
        {currentView === 'onboarding' && (
          <OnboardingFlow
            onComplete={handleOnboardingComplete}
            onSkip={() => {
              setCurrentView('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW: DASHBOARD */}
        {currentView === 'dashboard' && (
          <Dashboard
            userProfile={userProfile}
            sessions={sessions}
            notes={notes}
            subjects={subjects}
            planTasks={planTasks}
            progress={progress}
            focusLogs={focusLogs}
            onOpenSession={handleOpenSession}
            onSelectNote={(note) => {
              setCurrentView('notes');
            }}
            onSelectSubject={(subj) => {
              setSelectedSubject(subj);
              setCurrentView('subject-detail');
            }}
            onNewSessionWithAction={handleNewSessionWithAction}
            onDeleteSession={handleDeleteSession}
            onOpenExplainModal={() => setIsExplainModalOpen(true)}
            onOpenFocusModal={() => setIsFocusModalOpen(true)}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onSaveTask={handleSaveTask}
            onSaveTasksBulk={handleSaveTasksBulk}
            onReorderTasks={handleReorderTasks}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW: SMART NOTES WORKSPACE */}
        {currentView === 'notes' && (
          <SmartNotesView
            notes={notes}
            subjects={subjects}
            onSaveNote={handleSaveNote}
            onDeleteNote={handleDeleteNote}
            onGenerateFlashcardsFromNote={handleGenerateFlashcardsFromNote}
            onGenerateQuizFromNote={handleGenerateQuizFromNote}
            hasApiKey={hasApiKey}
          />
        )}

        {/* VIEW: DEDICATED DOUBT SOLVER */}
        {currentView === 'doubt-solver' && (
          <DoubtSolverView
            subjects={subjects}
            userProfile={userProfile}
            onSaveAsNote={(note) => {
              handleSaveNote(note);
              showToast('Doubt solution saved to Smart Notes!');
            }}
            onStartFlashcards={(topic, subject) => {
              setCurrentView('workspace');
              setActiveTab('flashcards');
              handleGenerate({
                topic: `${subject}: ${topic}`,
                content: `Active recall study questions and conceptual tests for ${topic} in ${subject}`,
                studyDays: 3,
                dailyMinutes: 30,
              });
            }}
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW: ALL SUBJECTS */}
        {currentView === 'subjects' && (
          <SubjectsView
            subjects={subjects}
            notes={notes}
            onSelectSubject={(subj) => {
              setSelectedSubject(subj);
              setCurrentView('subject-detail');
            }}
            onAddSubject={(newSubj) => {
              const activeUid = userProfile?.id || 'guest';
              const updated = [...subjects, newSubj];
              setSubjects(updated);
              saveStoredSubjects(updated, activeUid);
              if (activeUid !== 'guest') {
                syncSubjectsToFirestore(activeUid, updated);
              }
              showToast(`Created subject "${newSubj.name}"`);
            }}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {/* VIEW: SUBJECT WORKSPACE */}
        {currentView === 'subject-detail' && selectedSubject && (
          <SubjectWorkspace
            subject={selectedSubject}
            notes={notes}
            allSubjects={subjects}
            onBack={() => setCurrentView('subjects')}
            onSelectNote={(note) => {
              setCurrentView('notes');
            }}
            onCreateNoteInSubject={(subjName) => {
              setCurrentView('notes');
            }}
            onAddTopicToSubject={(subjName, topicName) => {
              const activeUid = userProfile?.id || 'guest';
              const updated = subjects.map((s) =>
                s.name === subjName ? { ...s, topics: [...s.topics, topicName] } : s
              );
              setSubjects(updated);
              saveStoredSubjects(updated, activeUid);
              if (activeUid !== 'guest') {
                syncSubjectsToFirestore(activeUid, updated);
              }
              setSelectedSubject(updated.find((s) => s.name === subjName) || null);
              showToast(`Added topic "${topicName}" to ${subjName}`);
            }}
            onStartQuizForTopic={(topicName, subjName) => {
              setCurrentView('workspace');
              setActiveTab('quiz');
              handleGenerate({
                topic: `${subjName}: ${topicName}`,
                content: `Key revision principles and practice questions for ${topicName} in ${subjName}`,
                studyDays: 4,
                dailyMinutes: 45,
              });
            }}
            onStartFlashcardsForTopic={(topicName, subjName) => {
              setCurrentView('workspace');
              setActiveTab('flashcards');
              handleGenerate({
                topic: `${subjName}: ${topicName}`,
                content: `Key definitions and active recall prompt-answers for ${topicName} in ${subjName}`,
                studyDays: 4,
                dailyMinutes: 45,
              });
            }}
            onSaveExtractedNote={handleSaveNote}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {/* VIEW: AI TOOLS HUB */}
        {currentView === 'ai-tools' && (
          <AIToolsHubView
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenExplainModal={() => setIsExplainModalOpen(true)}
            onOpenFocusModal={() => setIsFocusModalOpen(true)}
            hasApiKey={hasApiKey}
          />
        )}

        {/* VIEW: STUDY PLANNER & TIMETABLE */}
        {currentView === 'plan' && (
          <StudyPlannerView
            tasks={planTasks}
            subjects={subjects}
            onSaveTask={handleSaveTask}
            onSaveTasksBulk={handleSaveTasksBulk}
            onReorderTasks={handleReorderTasks}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onGeneratePlanWithAI={handleGeneratePlanWithAI}
          />
        )}

        {/* VIEW: PROGRESS & AUTHENTIC STATS */}
        {currentView === 'progress' && (
          <ProgressView
            progress={progress}
            focusLogs={focusLogs}
            notes={notes}
            planTasks={planTasks}
            sessions={sessions}
            onResetProgress={handleResetProgress}
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW: MY LIBRARY VAULT */}
        {currentView === 'library' && (
          <MyLibraryView
            notes={notes}
            sessions={sessions}
            subjects={subjects}
            onSelectNote={(note) => {
              setCurrentView('notes');
            }}
            onSelectSession={(sess) => {
              handleOpenSession(sess, 'summary');
            }}
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW: PROFILE & STUDY PREFERENCES */}
        {currentView === 'settings' && (
          <ProfileSettingsView
            profile={userProfile}
            subjects={subjects}
            onSaveProfile={(prof) => {
              setUserProfile(prof);
              saveStoredProfile(prof);
              showToast('Profile updated successfully.');
            }}
            onSignOut={handleInitiateSignOut}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onResetProgress={handleResetProgress}
            onResetToBrandNew={() => {
              const freshState = resetAllDataToBrandNew();
              setUserProfile(freshState.profile);
              setSubjects(freshState.subjects);
              setNotes(freshState.notes);
              setPlanTasks(freshState.planTasks);
              setFocusLogs(freshState.focusLogs);
              setSessions(freshState.sessions);
              setProgress(freshState.progress);
              setCurrentSession(null);
              setCurrentView('landing');
              showToast('✨ App restored to brand new state! All tools and features ready.', 'success');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigate={handleNavigate}
          />
        )}

        {/* VIEW: LOGOUT CONFIRMATION & FEEDBACK */}
        {currentView === 'logout-confirm' && (
          <LogoutFeedbackView
            userProfile={userProfile}
            progress={progress}
            onConfirmSignOut={handleCompleteSignOut}
            onCancel={() => {
              setCurrentView(userProfile ? 'dashboard' : 'landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW: WORKSPACE (FLASHCARDS, QUIZ, GENERATOR) */}
        {(currentView === 'workspace' || currentView === 'flashcards' || currentView === 'quiz') && (
          <Workspace
            currentSession={currentSession}
            activeTab={currentView === 'flashcards' ? 'flashcards' : currentView === 'quiz' ? 'quiz' : activeTab}
            onTabChange={setActiveTab}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            onSaveSession={(sess) => {
              saveSession(sess);
              setSessions(getStoredSessions());
              showToast('Session saved to library');
            }}
            onUpdateFlashcardRating={handleUpdateFlashcardRating}
            onUpdateFlashcards={handleUpdateFlashcards}
            onQuizComplete={handleQuizComplete}
            onUpdateQuizQuestions={handleUpdateQuizQuestions}
            onExplainConcept={handleExplainConcept}
            isCustomExplaining={isCustomExplaining}
            onResetWorkspace={handleResetWorkspace}
          />
        )}

        {/* VIEW: CASE STUDY */}
        {currentView === 'case-study' && <CaseStudyView onNavigate={handleNavigate} />}
      </main>

      {/* MODALS */}
      {/* 1. Global Search Modal (Cmd+K) */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        notes={notes}
        subjects={subjects}
        planTasks={planTasks}
        onSelectNote={(note) => {
          setCurrentView('notes');
        }}
        onSelectSubject={(subj) => {
          setSelectedSubject(subj);
          setCurrentView('subject-detail');
        }}
        onNavigate={(view) => setCurrentView(view)}
      />

      {/* 2. Focus Session Pomodoro Modal */}
      <FocusSessionModal
        isOpen={isFocusModalOpen}
        onClose={() => setIsFocusModalOpen(false)}
        onSessionComplete={(log) => handleSaveFocusSession(log.topicStudied, log.subject, log.durationMinutes)}
      />

      {/* 3. Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* 4. Explain Simply Modal */}
      <ExplainSimplyModal
        isOpen={isExplainModalOpen}
        onClose={() => setIsExplainModalOpen(false)}
      />

      {/* 5. Snap / Upload Study Material Modal */}
      <UploadMaterialModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        subjects={subjects}
        defaultSubject={selectedSubject?.name}
        onExtractedForNotes={(extracted, subj) => {
          const newNote: NoteItem = {
            id: `note-${Date.now()}`,
            title: extracted.topic || 'Extracted Study Notes',
            subject: subj,
            topic: extracted.topic || 'General',
            content: extracted.extractedText,
            tags: ['Uploaded Material', subj, ...(extracted.keyConcepts || [])],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            summaryData: extracted.summaryData || {
              quickSummary: extracted.summaryPreview || extracted.summary || '',
              keyPoints: extracted.keyPoints || extracted.keyConcepts || [],
              importantTerms: (extracted.keywords || extracted.keyConcepts || []).map((k) => ({ term: k, definition: `Key concept in ${extracted.topic}` })),
              rememberThis: 'Master governing principles and formulas.',
              formulas: extracted.formulas,
              keywords: extracted.keywords || extracted.keyConcepts,
            },
            formulas: extracted.formulas,
            keywords: extracted.keywords || extracted.keyConcepts,
            keyPoints: extracted.keyPoints || extracted.keyConcepts,
            importantPoints: extracted.importantPoints,
            explanationData: extracted.explanationData,
            examRevisionNotes: extracted.examRevisionNotes,
            flashcards: extracted.flashcards,
            quiz: extracted.quiz,
          };
          handleSaveNote(newNote);
          setIsUploadModalOpen(false);
          setCurrentView('notes');
          showToast(`Saved master notes on "${newNote.title}" to ${subj}!`);
        }}
        onExtractedForWorkspace={(extracted) => {
          setIsUploadModalOpen(false);
          setCurrentView('workspace');
          handleGenerate({
            topic: extracted.topic || 'Uploaded Topic',
            content: extracted.extractedText,
            studyDays: 4,
            dailyMinutes: 45,
          });
        }}
      />

      {/* Footer */}
      <Footer
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
