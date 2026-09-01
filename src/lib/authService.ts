import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  User as FirebaseUser,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { UserProfile, SubjectItem, NoteItem, StudyPlanTask, FocusSessionLog, StudySession, UserProgress } from '../types';
import {
  saveStoredProfile,
  saveStoredSubjects,
  saveStoredNote,
  saveStoredPlanTasksBulk,
  saveStoredFocusLog,
  saveSession,
  getStoredProfile,
} from '../utils/storage';

export interface FirebaseSyncResult {
  profile: UserProfile;
  isNewUser: boolean;
}

// Convert a Firebase User object to StudyFlow UserProfile
export function mapFirebaseUserToProfile(user: FirebaseUser, existingData?: Partial<UserProfile>): UserProfile {
  const displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'Student');
  const formattedName = displayName
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    id: user.uid,
    name: existingData?.name || formattedName,
    email: user.email || `${user.uid}@studyflow.ai`,
    profilePicture: user.photoURL || existingData?.profilePicture || undefined,
    institution: existingData?.institution,
    academicCategory: existingData?.academicCategory,
    gradeLevel: existingData?.gradeLevel,
    gradeLabel: existingData?.gradeLabel,
    specialization: existingData?.specialization,
    targetExam: existingData?.targetExam,
    targetExamYear: existingData?.targetExamYear,
    targetExamDate: existingData?.targetExamDate,
    dobYear: existingData?.dobYear,
    subjects: existingData?.subjects || ['Mathematics', 'Science'],
    mainGoals: existingData?.mainGoals || ['Understanding core concepts', 'Exam preparation'],
    createdAt: existingData?.createdAt || new Date().toISOString(),
    isLoggedIn: true,
    onboarded: existingData?.onboarded ?? false,
    studyPreferences: existingData?.studyPreferences || {
      theme: 'light',
      dailyGoalMinutes: 45,
      showHintsFirst: true,
    },
  };
}

export interface AuthErrorInfo {
  code: string;
  rawMessage: string;
  userMessage: string;
  recommendation: string;
  isIframeIssue: boolean;
}

export class FirebaseAuthError extends Error {
  code: string;
  rawMessage: string;
  recommendation: string;
  isIframeIssue: boolean;

  constructor(info: { code: string; rawMessage: string; userMessage: string; recommendation: string; isIframeIssue?: boolean }) {
    super(info.userMessage);
    this.name = 'FirebaseAuthError';
    this.code = info.code;
    this.rawMessage = info.rawMessage;
    this.recommendation = info.recommendation;
    this.isIframeIssue = info.isIframeIssue || false;
  }
}

export function interpretFirebaseAuthError(error: any): FirebaseAuthError {
  if (error instanceof FirebaseAuthError) {
    return error;
  }

  const code = error?.code || 'auth/unknown';
  const rawMessage = error?.message || (typeof error === 'string' ? error : 'Unknown error');

  let userMessage = 'Authentication failed. Please try again.';
  let recommendation = 'Please retry or choose an alternate sign-in method.';
  let isIframeIssue = false;

  switch (code) {
    case 'auth/popup-closed-by-user':
      userMessage = 'The Google sign-in popup was closed before completing authentication.';
      recommendation = 'In iframe/sandbox preview environments, popups may be terminated by browser cross-origin window policies. Use the Redirect option below or open the app in a new browser tab.';
      isIframeIssue = true;
      break;

    case 'auth/popup-blocked':
      userMessage = 'The Google sign-in popup was blocked by your browser or sandbox policy.';
      recommendation = 'Please allow popups for this site, or use the "Continue with Google (Redirect)" option below.';
      isIframeIssue = true;
      break;

    case 'auth/cancelled-popup-request':
      userMessage = 'The sign-in popup was cancelled because another popup was opened.';
      recommendation = 'Please avoid clicking multiple times in rapid succession.';
      break;

    case 'auth/unauthorized-domain':
      userMessage = 'This preview domain is not authorized in Firebase Authentication.';
      recommendation = `Add "${typeof window !== 'undefined' ? window.location.hostname : 'domain'}" to Firebase Console -> Authentication -> Settings -> Authorized Domains.`;
      break;

    case 'auth/operation-not-supported-in-this-environment':
      userMessage = 'Popup authentication is not supported in this iframe or browser context.';
      recommendation = 'Switch to redirect authentication or open the app in a full window.';
      isIframeIssue = true;
      break;

    case 'auth/network-request-failed':
      userMessage = 'Network connection failed while communicating with Firebase Authentication.';
      recommendation = 'Check your network connection and ensure Firebase auth endpoints are reachable.';
      break;

    case 'auth/internal-error':
      userMessage = 'An internal Firebase Authentication error occurred.';
      recommendation = 'Ensure Google Provider is enabled in Firebase Console -> Authentication -> Sign-in method.';
      break;

    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid-please-pass-a-valid-api-key':
      userMessage = 'The Firebase API Key is invalid or restricted.';
      recommendation = 'Check the apiKey in your Firebase project configuration.';
      break;

    default:
      userMessage = rawMessage.replace(/^Firebase:\s*/, '');
      recommendation = 'Review Firebase Console configuration.';
      break;
  }

  return new FirebaseAuthError({
    code,
    rawMessage,
    userMessage,
    recommendation,
    isIframeIssue,
  });
}

// Real Google Sign-In handler (supports popup and fallback)
export async function authenticateWithGoogle(): Promise<FirebaseSyncResult> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return await syncUserProfileFromFirestore(user);
  } catch (error: any) {
    console.warn('Google Sign-In Popup Error:', error);
    throw interpretFirebaseAuthError(error);
  }
}

// Mobile/Fallback Redirect Trigger
export async function triggerGoogleRedirect(): Promise<void> {
  await signInWithRedirect(auth, googleProvider);
}

// Check for redirect result on app initialization
export async function checkRedirectAuth(): Promise<FirebaseSyncResult | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      return await syncUserProfileFromFirestore(result.user);
    }
    return null;
  } catch (error: any) {
    console.error('Redirect auth error:', error);
    return null;
  }
}

// Synchronize profile with Firestore under /users/{uid}
export async function syncUserProfileFromFirestore(user: FirebaseUser): Promise<FirebaseSyncResult> {
  const userRef = doc(db, 'users', user.uid);
  let isNewUser = false;
  let profile: UserProfile;

  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as Partial<UserProfile>;
      profile = mapFirebaseUserToProfile(user, data);
      isNewUser = !data.onboarded;
    } else {
      isNewUser = true;
      profile = mapFirebaseUserToProfile(user);
      // Save initial profile document to Firestore
      await setDoc(userRef, {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        profilePicture: profile.profilePicture || null,
        subjects: profile.subjects,
        mainGoals: profile.mainGoals,
        createdAt: profile.createdAt,
        onboarded: false,
        isLoggedIn: true,
        studyPreferences: profile.studyPreferences,
      });
    }
  } catch (firestoreError) {
    console.warn('Firestore sync fallback to client profile:', firestoreError);
    const local = getStoredProfile();
    profile = mapFirebaseUserToProfile(user, local?.id === user.uid ? local : undefined);
    isNewUser = !profile.onboarded;
  }

  // Persist locally for instant offline/caching speed
  saveStoredProfile(profile);
  return { profile, isNewUser };
}

// Save onboarded profile to Firestore and local
export async function saveProfileToFirestore(profile: UserProfile): Promise<void> {
  saveStoredProfile(profile);
  try {
    if (auth.currentUser && auth.currentUser.uid === profile.id) {
      const userRef = doc(db, 'users', profile.id);
      await setDoc(userRef, {
        ...profile,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }
  } catch (e) {
    console.warn('Failed saving profile to Firestore:', e);
  }
}

// Log out user cleanly from Firebase and clear local storage
export async function signOutFromFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Sign out error:', e);
  }
  saveStoredProfile(null);
}
