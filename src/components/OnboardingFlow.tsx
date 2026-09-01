import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Target,
  GraduationCap,
  User,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Plus,
} from 'lucide-react';
import { UserProfile } from '../types';

interface OnboardingFlowProps {
  initialProfile?: UserProfile | null;
  onComplete: (profile: UserProfile) => void;
  onSkip?: () => void;
}

const DEFAULT_SUBJECT_OPTIONS = [
  'Mathematics',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Geography',
  'Computer Science',
  'Other',
];

const CLASS_GRADE_OPTIONS = [
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
  'College / University',
  'Self-learning',
  'Other',
];

const GOAL_OPTIONS = [
  'Understanding concepts',
  'Revision',
  'Practice',
  'Exam preparation',
  'Memorization',
  'Organization',
  'General learning',
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  initialProfile,
  onComplete,
  onSkip,
}) => {
  const [step, setStep] = useState<number>(1);

  // STEP 1: Subjects (What do you want to learn?)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    initialProfile?.subjects && initialProfile.subjects.length > 0
      ? initialProfile.subjects
      : ['Mathematics', 'Science']
  );
  const [customSubject, setCustomSubject] = useState<string>('');
  const [showCustomSubjectInput, setShowCustomSubjectInput] = useState<boolean>(false);

  // STEP 2: Grade / Current Study (What are you currently studying?)
  const [selectedClass, setSelectedClass] = useState<string>(
    initialProfile?.gradeLabel || 'Class 11'
  );
  const [customClass, setCustomClass] = useState<string>('');

  // STEP 3: Learning Goals (What do you want to improve?)
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    initialProfile?.mainGoals && initialProfile.mainGoals.length > 0
      ? initialProfile.mainGoals
      : ['Understanding concepts', 'Practice', 'Revision']
  );

  // STEP 4: Profile Details (What should we call you?)
  const [displayName, setDisplayName] = useState<string>(
    initialProfile?.name || 'Student'
  );
  const [username, setUsername] = useState<string>(
    initialProfile?.email ? initialProfile.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '') : ''
  );
  const [dob, setDob] = useState<string>(initialProfile?.dobYear || '');

  // Toggle Subject
  const handleToggleSubject = (subject: string) => {
    if (subject === 'Other') {
      setShowCustomSubjectInput(!showCustomSubjectInput);
      return;
    }
    if (selectedSubjects.includes(subject)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((s) => s !== subject));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const handleAddCustomSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSubject.trim() && !selectedSubjects.includes(customSubject.trim())) {
      setSelectedSubjects([...selectedSubjects, customSubject.trim()]);
      setCustomSubject('');
    }
  };

  // Toggle Goal
  const handleToggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      if (selectedGoals.length > 1) {
        setSelectedGoals(selectedGoals.filter((g) => g !== goal));
      }
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  // Finish Onboarding
  const handleFinish = () => {
    const finalClass = selectedClass === 'Other' && customClass.trim() ? customClass.trim() : selectedClass;
    const finalName = displayName.trim() || 'Student';

    const completedProfile: UserProfile = {
      id: initialProfile?.id || `user-${Date.now()}`,
      name: finalName,
      email: initialProfile?.email || `${username || 'student'}@studyflow.ai`,
      gradeLabel: finalClass,
      gradeLevel: finalClass.toLowerCase().replace(/\s+/g, '-'),
      subjects: selectedSubjects.length > 0 ? selectedSubjects : ['Mathematics', 'Science'],
      mainGoals: selectedGoals.length > 0 ? selectedGoals : ['Understanding concepts', 'Practice'],
      dobYear: dob ? dob.substring(0, 4) : undefined,
      createdAt: initialProfile?.createdAt || new Date().toISOString(),
      isLoggedIn: true,
      onboarded: true,
      studyPreferences: {
        theme: 'light',
        dailyGoalMinutes: 45,
        showHintsFirst: true,
      },
    };

    onComplete(completedProfile);
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-between py-8 px-4 sm:px-6 max-w-3xl mx-auto w-full text-[#1C1E1B] animate-fade-in">
      {/* Top Header & Step Progress Bar */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center font-serif-display font-bold text-lg shadow-sm">
              S
            </div>
            <div>
              <span className="font-serif-display font-bold text-xl text-[#1C1E1B] block leading-tight">
                WELCOME TO STUDYFLOW
              </span>
              <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4332]">
                Personal Learning Space Setup
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-code font-bold bg-[#E8F5E9] text-[#1B4332] border border-emerald-300 px-3 py-1 rounded-full">
              STEP {step} OF 5
            </span>
          </div>
        </div>

        {/* Progress Bar Indicator */}
        <div className="w-full bg-[#E8E4D9] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#1B4332] h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP CONTAINER */}
      <div className="bg-white rounded-3xl border border-[#E8E4D9] p-6 sm:p-10 shadow-sm flex-1 flex flex-col justify-between">
        {/* ======================================================= */}
        {/* STEP 1: WHAT DO YOU WANT TO LEARN? */}
        {/* ======================================================= */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4332] bg-[#E8F5E9] px-2.5 py-1 rounded-md border border-emerald-200 inline-block">
                STEP 1
              </span>
              <h2 className="font-serif-display text-2xl sm:text-4xl font-bold text-[#1C1E1B] tracking-tight">
                WHAT DO YOU WANT TO LEARN?
              </h2>
              <p className="text-sm text-[#555A50]">
                Select the subjects you'd like in your workspace. You can select multiple.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DEFAULT_SUBJECT_OPTIONS.map((subj) => {
                const isSelected = selectedSubjects.includes(subj);
                const isOther = subj === 'Other';
                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => handleToggleSubject(subj)}
                    className={`p-3.5 sm:p-4 rounded-2xl border text-left font-semibold text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer active:scale-98 ${
                      isSelected
                        ? 'bg-[#E8F5E9] border-[#1B4332] text-[#1B4332] shadow-xs ring-1 ring-[#1B4332]'
                        : isOther && showCustomSubjectInput
                        ? 'bg-amber-50 border-amber-300 text-[#1C1E1B]'
                        : 'bg-[#FAF8F5] border-[#E8E4D9] text-[#1C1E1B] hover:border-[#2D6A4F] hover:bg-white'
                    }`}
                  >
                    <span>{subj}</span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#1B4332] text-white flex items-center justify-center shrink-0 ml-1.5">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Subject Input if "Other" is chosen */}
            {showCustomSubjectInput && (
              <form onSubmit={handleAddCustomSubject} className="flex gap-2 pt-2 animate-fade-in">
                <input
                  type="text"
                  placeholder="Enter custom subject (e.g. Psychology, Microeconomics)..."
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D5CFBF] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                />
                <button
                  type="submit"
                  disabled={!customSubject.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-[#2D6A4F] disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </form>
            )}

            <div className="pt-4 flex items-center justify-between border-t border-[#E8E4D9]">
              <span className="text-xs font-mono-code text-[#6B7267]">
                {selectedSubjects.length} subject{selectedSubjects.length === 1 ? '' : 's'} selected
              </span>
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={selectedSubjects.length === 0}
                className="px-6 py-3 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-sm font-bold flex items-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <span>CONTINUE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* STEP 2: WHAT ARE YOU CURRENTLY STUDYING? */}
        {/* ======================================================= */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4332] bg-[#E8F5E9] px-2.5 py-1 rounded-md border border-emerald-200 inline-block">
                STEP 2
              </span>
              <h2 className="font-serif-display text-2xl sm:text-4xl font-bold text-[#1C1E1B] tracking-tight">
                WHAT ARE YOU CURRENTLY STUDYING?
              </h2>
              <p className="text-sm text-[#555A50]">
                Choose your current standard or academic stage to tailor explanation depth.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CLASS_GRADE_OPTIONS.map((cls) => {
                const isSelected = selectedClass === cls;
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSelectedClass(cls)}
                    className={`p-3.5 sm:p-4 rounded-2xl border text-left font-semibold text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer active:scale-98 ${
                      isSelected
                        ? 'bg-[#E8F5E9] border-[#1B4332] text-[#1B4332] shadow-xs ring-1 ring-[#1B4332]'
                        : 'bg-[#FAF8F5] border-[#E8E4D9] text-[#1C1E1B] hover:border-[#2D6A4F] hover:bg-white'
                    }`}
                  >
                    <span>{cls}</span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#1B4332] text-white flex items-center justify-center shrink-0 ml-1.5">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedClass === 'Other' && (
              <div className="pt-2">
                <input
                  type="text"
                  placeholder="Specify your course/curriculum (e.g. MBBS 2nd Prof, UPSC, GATE)..."
                  value={customClass}
                  onChange={(e) => setCustomClass(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D5CFBF] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>
            )}

            <div className="pt-4 flex items-center justify-between border-t border-[#E8E4D9]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl border border-[#D5CFBF] bg-white hover:bg-[#F4EFE6] text-xs font-bold text-[#1C1E1B] flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-sm font-bold flex items-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <span>CONTINUE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* STEP 3: WHAT DO YOU WANT TO IMPROVE? */}
        {/* ======================================================= */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4332] bg-[#E8F5E9] px-2.5 py-1 rounded-md border border-emerald-200 inline-block">
                STEP 3
              </span>
              <h2 className="font-serif-display text-2xl sm:text-4xl font-bold text-[#1C1E1B] tracking-tight">
                WHAT DO YOU WANT TO IMPROVE?
              </h2>
              <p className="text-sm text-[#555A50]">
                Select the learning areas you want StudyFlow to focus on for you.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GOAL_OPTIONS.map((goal) => {
                const isSelected = selectedGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => handleToggleGoal(goal)}
                    className={`p-4 rounded-2xl border text-left font-semibold text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer active:scale-98 ${
                      isSelected
                        ? 'bg-[#E8F5E9] border-[#1B4332] text-[#1B4332] shadow-xs ring-1 ring-[#1B4332]'
                        : 'bg-[#FAF8F5] border-[#E8E4D9] text-[#1C1E1B] hover:border-[#2D6A4F] hover:bg-white'
                    }`}
                  >
                    <span>{goal}</span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#1B4332] text-white flex items-center justify-center shrink-0 ml-2">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-[#E8E4D9]">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl border border-[#D5CFBF] bg-white hover:bg-[#F4EFE6] text-xs font-bold text-[#1C1E1B] flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(4)}
                disabled={selectedGoals.length === 0}
                className="px-6 py-3 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-sm font-bold flex items-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <span>CONTINUE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* STEP 4: WHAT SHOULD WE CALL YOU? */}
        {/* ======================================================= */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4332] bg-[#E8F5E9] px-2.5 py-1 rounded-md border border-emerald-200 inline-block">
                STEP 4
              </span>
              <h2 className="font-serif-display text-2xl sm:text-4xl font-bold text-[#1C1E1B] tracking-tight">
                WHAT SHOULD WE CALL YOU?
              </h2>
              <p className="text-sm text-[#555A50]">
                Set up your student profile and workspace identity.
              </p>
            </div>

            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#1C1E1B] mb-1.5">
                  DISPLAY NAME <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#D5CFBF] bg-[#FAF8F5] focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#1C1E1B] mb-1.5">
                  OPTIONAL USERNAME
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono-code text-[#8A9085]">
                    @
                  </span>
                  <input
                    type="text"
                    placeholder="alexrivera"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-[#D5CFBF] bg-[#FAF8F5] focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                  />
                </div>
              </div>

              {/* Secure Date of Birth Notice */}
              <div>
                <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#1C1E1B] mb-1.5">
                  DATE OF BIRTH <span className="text-[11px] font-normal text-[#6B7267]">(Optional)</span>
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#D5CFBF] bg-[#FAF8F5] focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                />
                <p className="flex items-center gap-1.5 text-[11px] text-[#6B7267] mt-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1B4332]" />
                  <span>Your birth date is stored securely and never displayed publicly.</span>
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-[#E8E4D9]">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2.5 rounded-xl border border-[#D5CFBF] bg-white hover:bg-[#F4EFE6] text-xs font-bold text-[#1C1E1B] flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(5)}
                disabled={!displayName.trim()}
                className="px-6 py-3 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-sm font-bold flex items-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <span>CONTINUE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* STEP 5 / SUMMARY: YOUR STUDY SPACE IS READY */}
        {/* ======================================================= */}
        {step === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2 text-center max-w-md mx-auto">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-[#E8F5E9] border border-emerald-300 text-[#1B4332] flex items-center justify-center shadow-xs mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#1C1E1B] tracking-tight">
                YOUR STUDY SPACE IS READY.
              </h2>
              <p className="text-sm text-[#555A50]">
                Here is a summary of your personal learning profile.
              </p>
            </div>

            {/* Profile Summary Card */}
            <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E4D9] p-5 sm:p-6 space-y-4 max-w-lg mx-auto">
              <div className="flex items-center justify-between border-b border-[#E8E4D9] pb-3">
                <span className="text-xs font-mono-code font-bold uppercase text-[#6B7267]">Name</span>
                <span className="text-sm font-bold text-[#1C1E1B]">{displayName.trim()}</span>
              </div>

              <div className="flex items-start justify-between border-b border-[#E8E4D9] pb-3">
                <span className="text-xs font-mono-code font-bold uppercase text-[#6B7267] mt-0.5">Class / Standard</span>
                <span className="text-sm font-semibold text-[#1B4332] bg-[#E8F5E9] px-2.5 py-0.5 rounded border border-emerald-200">
                  {selectedClass === 'Other' && customClass ? customClass : selectedClass}
                </span>
              </div>

              <div className="space-y-1.5 border-b border-[#E8E4D9] pb-3">
                <span className="text-xs font-mono-code font-bold uppercase text-[#6B7267]">Subjects</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedSubjects.map((s) => (
                    <span
                      key={s}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-[#D5CFBF] text-[#1C1E1B]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-mono-code font-bold uppercase text-[#6B7267]">Learning Goals</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedGoals.map((g) => (
                    <span
                      key={g}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#E8F5E9] text-[#1B4332] border border-emerald-200"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E8E4D9]">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#D5CFBF] bg-white hover:bg-[#F4EFE6] text-xs font-bold text-[#1C1E1B] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                id="enter-studyflow-btn"
                onClick={handleFinish}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-sm sm:text-base font-bold flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(27,67,50,0.3)] active:scale-98 cursor-pointer"
              >
                <span>ENTER STUDYFLOW</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
