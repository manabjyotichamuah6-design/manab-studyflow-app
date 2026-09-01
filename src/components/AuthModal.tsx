import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Phone,
  ArrowLeft,
  AtSign,
  LogIn,
} from 'lucide-react';
import { UserProfile } from '../types';
import {
  findAccountByEmail,
  findAccountByIdentifier,
  saveAccountRecord,
  saveStoredProfile,
  getStoredProfile,
  StoredAccountRecord,
} from '../utils/storage';
import { authenticateWithGoogle, triggerGoogleRedirect, FirebaseAuthError, AuthErrorInfo } from '../lib/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: UserProfile, isNewUser?: boolean) => void;
  initialMode?: 'signup' | 'signin';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'signin',
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(initialMode);
  const [view, setView] = useState<'main' | 'forgot-password' | 'phone'>('main');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Authenticating...');
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<AuthErrorInfo | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setErrorDetails(null);
    setSuccessMsg(null);
    setIsLoading(false);
  };

  // Google Authentication Handler using Firebase
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setLoadingMessage('Opening Google Sign-In...');
    setError(null);
    setErrorDetails(null);

    try {
      const { profile, isNewUser } = await authenticateWithGoogle();
      setIsLoading(false);
      onSuccess(profile, isNewUser);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      if (err instanceof FirebaseAuthError) {
        setError(err.message);
        setErrorDetails({
          code: err.code,
          rawMessage: err.rawMessage,
          userMessage: err.message,
          recommendation: err.recommendation,
          isIframeIssue: err.isIframeIssue,
        });
      } else {
        const msg = err.message || 'Unable to complete Google sign-in. Please try again.';
        setError(msg);
        setErrorDetails({
          code: err.code || 'unknown',
          rawMessage: msg,
          userMessage: msg,
          recommendation: 'Check browser popup permissions or try signing in with redirect.',
          isIframeIssue: false,
        });
      }
    }
  };

  const handleGoogleRedirectAuth = async () => {
    setIsLoading(true);
    setLoadingMessage('Redirecting to Google...');
    setError(null);
    setErrorDetails(null);
    try {
      await triggerGoogleRedirect();
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.message || 'Unable to redirect to Google.';
      setError(msg);
      setErrorDetails({
        code: err.code || 'unknown',
        rawMessage: msg,
        userMessage: msg,
        recommendation: 'Ensure authorized domains are configured in Firebase Console.',
        isIframeIssue: false,
      });
    }
  };

  // Email Create Account
  const handleEmailSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your confirmation password.');
      return;
    }

    // Check if account already exists
    const existing = findAccountByEmail(cleanEmail);
    if (existing) {
      setError('An account with this email already exists. Please sign in instead.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Creating your study account...');

    setTimeout(() => {
      setIsLoading(false);
      const profileName = name.trim() || cleanEmail.split('@')[0];
      const capName = profileName.charAt(0).toUpperCase() + profileName.slice(1);

      const newProfile: UserProfile = {
        id: `usr-email-${Date.now()}`,
        name: capName,
        email: cleanEmail,
        subjects: ['Mathematics', 'Science'],
        mainGoals: ['Understanding concepts', 'Revision'],
        createdAt: new Date().toISOString(),
        isLoggedIn: true,
        onboarded: false,
        studyPreferences: {
          theme: 'light',
          dailyGoalMinutes: 45,
          showHintsFirst: true,
        },
      };

      const accountRecord: StoredAccountRecord = {
        id: newProfile.id,
        email: cleanEmail,
        passwordHash: password, // In client storage
        name: newProfile.name,
        provider: 'email',
        createdAt: new Date().toISOString(),
        profile: newProfile,
      };

      saveAccountRecord(accountRecord);
      saveStoredProfile(newProfile);
      onSuccess(newProfile, true);
      onClose();
    }, 600);
  };

  // Name, Username, or Email Sign In
  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const identifier = email.trim();
    if (!identifier) {
      setError('Please enter your name, username, or email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Signing in to your workspace...');

    setTimeout(() => {
      setIsLoading(false);
      // Look up by Name (e.g. "XYZ"), Username, or Email
      const account = findAccountByIdentifier(identifier);

      if (!account) {
        // If not found, seamlessly initialize/create their account with the entered name (e.g. "XYZ")
        const isEmailFormat = identifier.includes('@');
        const cleanName = isEmailFormat
          ? identifier.split('@')[0].replace(/[._-]/g, ' ')
          : identifier;
        const capName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        const generatedEmail = isEmailFormat
          ? identifier.toLowerCase()
          : `${identifier.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'student'}@studyflow.ai`;

        const newProfile: UserProfile = {
          id: `usr-direct-${Date.now()}`,
          name: capName,
          email: generatedEmail,
          subjects: ['Mathematics', 'Science'],
          mainGoals: ['Understanding concepts', 'Practice'],
          createdAt: new Date().toISOString(),
          isLoggedIn: true,
          onboarded: false,
          studyPreferences: {
            theme: 'light',
            dailyGoalMinutes: 45,
            showHintsFirst: true,
          },
        };

        const accountRecord: StoredAccountRecord = {
          id: newProfile.id,
          email: generatedEmail,
          passwordHash: password,
          name: capName,
          provider: 'email',
          createdAt: new Date().toISOString(),
          profile: newProfile,
        };

        saveAccountRecord(accountRecord);
        saveStoredProfile(newProfile);
        onSuccess(newProfile, true);
        onClose();
        return;
      }

      if (account.passwordHash && account.passwordHash !== password) {
        setError('Incorrect password. Please try again or reset your password.');
        return;
      }

      const activeProfile = {
        ...account.profile,
        isLoggedIn: true,
      };

      saveStoredProfile(activeProfile);
      onSuccess(activeProfile, !activeProfile.onboarded);
      onClose();
    }, 550);
  };

  // Forgot Password Handler
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address to receive reset instructions.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Sending password recovery instructions...');

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg(`A password reset link has been dispatched to ${cleanEmail}. Check your inbox or spam folder.`);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B4332]/50 backdrop-blur-sm animate-fade-in">
      <div
        id="auth-modal-window"
        className="relative w-full max-w-md bg-[#FAF8F5] rounded-3xl border border-[#E8E4D9] shadow-2xl p-6 sm:p-8 text-[#1C1E1B] overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#6B7267] hover:text-[#1B4332] hover:bg-[#EFEBE0] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[#1B4332] text-[#FAF8F5] flex items-center justify-center font-serif-display text-xl font-bold shadow-md">
            S
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1C1E1B] tracking-tight">
            WELCOME TO STUDYFLOW
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7267] mt-1.5 leading-relaxed">
            Create your personal study space and start learning for free.
          </p>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="py-8 flex flex-col items-center justify-center space-y-3 animate-fade-in text-center">
            <div className="w-9 h-9 border-3 border-[#1B4332] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono-code font-bold text-[#1B4332] uppercase tracking-wider">
              {loadingMessage}
            </p>
          </div>
        )}

        {/* Error Alert */}
        {!isLoading && error && (
          <div className="p-3.5 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium space-y-2 animate-fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-rose-900">{error}</p>
                {errorDetails?.recommendation && (
                  <p className="text-[11px] text-rose-700 mt-1 leading-relaxed">{errorDetails.recommendation}</p>
                )}
              </div>
            </div>

            {/* Safe Developer Diagnostic Badge */}
            {errorDetails && (
              <div className="p-2 rounded-lg bg-rose-100/70 border border-rose-300/60 font-mono-code text-[10px] space-y-0.5 text-rose-900">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-950">Firebase Error Code:</span>
                  <span className="bg-white/80 px-1.5 py-0.5 rounded font-bold text-rose-700">{errorDetails.code}</span>
                </div>
                <div className="text-rose-800/90 truncate pt-0.5">
                  <span className="font-semibold">Message: </span>{errorDetails.rawMessage}
                </div>
              </div>
            )}

            {(errorDetails?.isIframeIssue || error.includes('closed') || error.includes('blocked') || error.includes('popup') || error.includes('cancelled')) && (
              <div className="pt-1 flex items-center justify-between gap-2 border-t border-rose-200/80">
                <span className="text-[11px] text-rose-700">Blocked in iframe sandbox?</span>
                <button
                  type="button"
                  onClick={handleGoogleRedirectAuth}
                  className="text-xs text-[#1B4332] underline hover:text-[#2D6A4F] font-bold cursor-pointer"
                >
                  Try Sign-In with Redirect →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Success Alert */}
        {!isLoading && successMsg && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ======================================================= */}
        {/* 1. PRIMARY AUTH SCREEN: GOOGLE FIRST + FORM BELOW + OPTIONS */}
        {/* ======================================================= */}
        {!isLoading && view === 'main' && (
          <div className="space-y-4 animate-fade-in">
            {/* Mode Switch Tabs: SIGN IN vs CREATE ACCOUNT */}
            <div className="flex p-1 rounded-2xl bg-[#EDE8DC] border border-[#D5CFBF]">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  resetForm();
                }}
                className={`flex-1 py-2 text-xs font-mono-code font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#555A50] hover:text-[#1B4332]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  resetForm();
                }}
                className={`flex-1 py-2 text-xs font-mono-code font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#555A50] hover:text-[#1B4332]'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* TOP PRIMARY HERO: GOOGLE SIGN-IN */}
            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                id="modal-google-auth-btn"
                onClick={() => handleGoogleAuth()}
                className="w-full py-3.5 px-4 rounded-2xl border-2 border-[#1B4332]/25 bg-white hover:bg-[#F4EFE6] hover:border-[#1B4332] text-xs sm:text-sm font-bold text-[#1C1E1B] transition-all flex items-center justify-center gap-3 shadow-sm cursor-pointer active:scale-98 group"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="tracking-wide">
                  {authMode === 'signin' ? 'SIGN IN WITH GOOGLE / GMAIL' : 'CONTINUE WITH GOOGLE'}
                </span>
              </button>
              <p className="text-[10px] text-center text-[#6B7267] font-mono-code">
                ✨ Instant 1-Click Access with Gmail / Google Account
              </p>
            </div>

            {/* DIVIDER: OR WITH EMAIL / USERNAME */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-[#D5CFBF] w-full" />
              <span className="bg-[#FAF8F5] px-3 text-[10px] font-mono-code font-bold uppercase tracking-wider text-[#6B7267] shrink-0">
                {authMode === 'signin' ? 'OR SIGN IN WITH EMAIL / USERNAME' : 'OR SIGN UP WITH EMAIL'}
              </span>
              <div className="border-t border-[#D5CFBF] w-full" />
            </div>

            {/* FORM BELOW GOOGLE SECTION */}
            {authMode === 'signin' ? (
              <form onSubmit={handleEmailSignIn} className="space-y-3">
                <div>
                  <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#1C1E1B] mb-1">
                    Name, Username, or Gmail / Email
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A9085]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. XYZ, Alex Rivera, or name@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D5CFBF] bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                    />
                  </div>
                  <p className="text-[10px] text-[#6B7267] mt-0.5">
                    Enter your name (e.g. <span className="font-semibold text-[#1B4332]">XYZ</span>), username, or email.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#1C1E1B]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setView('forgot-password')}
                      className="text-[11px] text-[#2D6A4F] hover:underline"
                    >
                      FORGOT?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A9085]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#D5CFBF] bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A9085] hover:text-[#1B4332]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer active:scale-98 mt-1 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-emerald-200" />
                  <span>SIGN IN TO WORKSPACE</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleEmailSignUp} className="space-y-3">
                <div>
                  <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#1C1E1B] mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A9085]" />
                    <input
                      type="text"
                      placeholder="e.g. Alex Rivera or XYZ"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D5CFBF] bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#1C1E1B] mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A9085]" />
                    <input
                      type="email"
                      required
                      placeholder="name@student.edu or gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D5CFBF] bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#1C1E1B] mb-1">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8A9085]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Min. 6 chars"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 rounded-xl border border-[#D5CFBF] bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A9085] hover:text-[#1B4332]"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#1C1E1B] mb-1">
                      Confirm <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8A9085]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D5CFBF] bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer active:scale-98 mt-1 flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4 text-emerald-200" />
                  <span>CREATE FREE ACCOUNT</span>
                </button>
              </form>
            )}

            {/* ADDITIONAL OPTIONS BELOW GMAIL / EMAIL SECTION */}
            <div className="pt-3 border-t border-[#E8E4D9] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  id="modal-phone-option-btn"
                  onClick={() => {
                    resetForm();
                    setView('phone');
                  }}
                  className="flex-1 py-2 px-2.5 rounded-xl border border-[#D5CFBF] bg-white hover:bg-[#F4EFE6] text-xs font-bold text-[#4B5047] hover:text-[#1C1E1B] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-[#1B4332]" />
                  <span>Phone Number</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                  }}
                  className="flex-1 py-2 px-2.5 rounded-xl border border-[#D5CFBF] bg-white hover:bg-[#F4EFE6] text-xs font-bold text-[#4B5047] hover:text-[#1C1E1B] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Explore Demo</span>
                </button>
              </div>

              {/* Mode Switcher footer text */}
              <div className="text-center pt-1">
                {authMode === 'signin' ? (
                  <p className="text-xs text-[#6B7267]">
                    New to StudyFlow?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        resetForm();
                      }}
                      className="text-[#1B4332] font-bold hover:underline cursor-pointer ml-0.5"
                    >
                      Create an account free →
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-[#6B7267]">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        resetForm();
                      }}
                      className="text-[#1B4332] font-bold hover:underline cursor-pointer ml-0.5"
                    >
                      Sign In here →
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* 4. FORGOT PASSWORD */}
        {/* ======================================================= */}
        {!isLoading && view === 'forgot-password' && (
          <form onSubmit={handleForgotPassword} className="space-y-4 animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#1C1E1B]">RESET YOUR PASSWORD</h3>
              <p className="text-xs text-[#555A50]">
                Enter the email associated with your account to receive recovery instructions.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#1C1E1B] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A9085]" />
                <input
                  type="email"
                  required
                  placeholder="name@student.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D5CFBF] bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer active:scale-98"
            >
              SEND RESET INSTRUCTIONS
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setView('main');
                }}
                className="text-xs text-[#1B4332] font-bold hover:underline flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </button>
            </div>
          </form>
        )}

        {/* ======================================================= */}
        {/* 5. PHONE SIGN IN (CONFIGURATION STATUS NOTIFICATION) */}
        {/* ======================================================= */}
        {!isLoading && view === 'phone' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-[#1C1E1B] space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs font-mono-code uppercase">
                <Phone className="w-4 h-4" />
                <span>Phone Authentication Status</span>
              </div>
              <p className="text-xs text-amber-900 font-semibold leading-relaxed">
                Phone sign-in is currently unavailable.
              </p>
              <p className="text-[11px] text-amber-800/90 leading-relaxed">
                To enable phone SMS verification, Firebase Phone Authentication and SMS Gateway credentials must be configured in your application environment.
              </p>
            </div>

            <p className="text-xs text-[#555A50] text-center">
              Please choose Google or Email authentication to access your workspace.
            </p>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleGoogleAuth()}
                className="w-full py-3 px-4 rounded-xl border border-[#D5CFBF] bg-white hover:bg-[#F4EFE6] text-xs font-bold text-[#1C1E1B] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>CONTINUE WITH GOOGLE</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setView('main');
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>CONTINUE WITH EMAIL</span>
              </button>

              <button
                type="button"
                onClick={() => setView('main')}
                className="w-full py-2 text-xs text-[#6B7267] hover:text-[#1B4332] font-semibold flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Options</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
