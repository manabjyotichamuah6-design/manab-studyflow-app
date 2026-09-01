import React, { useState } from 'react';
import {
  User,
  Mail,
  BookOpen,
  Target,
  Settings,
  LogOut,
  LogIn,
  ShieldCheck,
  Check,
  Trash2,
  Edit3,
  Building,
  Calendar,
  Clock,
  Sparkles,
  RefreshCw,
  UserCheck,
  HelpCircle,
  Award,
} from 'lucide-react';
import { UserProfile, SubjectItem, AppView } from '../types';

interface ProfileSettingsViewProps {
  profile: UserProfile | null;
  subjects: SubjectItem[];
  onSaveProfile: (profile: UserProfile) => void;
  onSignOut: () => void;
  onOpenAuth?: () => void;
  onResetToBrandNew?: () => void;
  onResetProgress?: () => void;
  onNavigate: (view: AppView) => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  profile,
  subjects,
  onSaveProfile,
  onSignOut,
  onOpenAuth,
  onResetToBrandNew,
  onResetProgress,
  onNavigate,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>(profile?.name || 'Student');
  const [email, setEmail] = useState<string>(profile?.email || 'student@studyflow.ai');
  const [institution, setInstitution] = useState<string>(profile?.institution || '');
  const [gradeLabel, setGradeLabel] = useState<string>(profile?.gradeLabel || 'Class 12 - Science (PCM)');
  const [targetExamYear, setTargetExamYear] = useState<string>(profile?.targetExamYear || '2026');
  const [dailyMinutes, setDailyMinutes] = useState<number>(profile?.studyPreferences?.dailyGoalMinutes || 45);
  const [showHintsFirst, setShowHintsFirst] = useState<boolean>(
    profile?.studyPreferences?.showHintsFirst !== false
  );
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState<boolean>(false);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated: UserProfile = {
      id: profile?.id || `usr-${Date.now()}`,
      name: name.trim() || 'Student',
      email: email.trim() || 'student@studyflow.ai',
      institution: institution.trim() || undefined,
      gradeLabel: gradeLabel.trim(),
      targetExamYear: targetExamYear,
      subjects: profile?.subjects && profile.subjects.length > 0 ? profile.subjects : ['Mathematics', 'Science'],
      mainGoals: profile?.mainGoals || ['Understanding concepts', 'Practice'],
      createdAt: profile?.createdAt || new Date().toISOString(),
      isLoggedIn: profile?.isLoggedIn ?? true,
      onboarded: true,
      studyPreferences: {
        theme: 'light',
        dailyGoalMinutes: Number(dailyMinutes) || 45,
        showHintsFirst,
      },
    };
    onSaveProfile(updated);
    setSavedSuccess(true);
    setIsEditing(false);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCancelEdit = () => {
    setName(profile?.name || 'Student');
    setEmail(profile?.email || 'student@studyflow.ai');
    setInstitution(profile?.institution || '');
    setGradeLabel(profile?.gradeLabel || 'Class 12 - Science (PCM)');
    setTargetExamYear(profile?.targetExamYear || '2026');
    setDailyMinutes(profile?.studyPreferences?.dailyGoalMinutes || 45);
    setShowHintsFirst(profile?.studyPreferences?.showHintsFirst !== false);
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-[#1C1E1B]">
      {/* Header Banner */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#2D6A4F] bg-[#E3EDE5] px-3 py-1 rounded-full inline-block mb-2">
            Student Account & Preferences
          </span>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1E1B]">
            Profile & Study Settings
          </h1>
          <p className="text-sm text-[#555A51] mt-1">
            Manage your personal student details, class standard, enrolled subjects, and session preferences.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('onboarding')}
            className="px-3.5 py-2 rounded-xl bg-[#E3EDE5] hover:bg-[#D0E2D4] border border-[#2D6A4F]/30 text-[#1B4332] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Target className="w-3.5 h-3.5 text-[#1B4332]" />
            <span>Academic Wizard</span>
          </button>
        </div>
      </div>

      {/* Profile Overview Card with Quick Action Buttons */}
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8E4D9] p-6 sm:p-7 mb-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#1B4332] text-[#FAF8F5] flex items-center justify-center font-serif-display text-2xl font-bold shadow-md ring-4 ring-[#E3EDE5]">
              {(name || 'S').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-display text-2xl font-bold text-[#1C1E1B]">
                  {name || 'Student'}
                </h2>
                {profile?.isLoggedIn ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono-code font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                    <Check className="w-3 h-3" /> Logged In
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono-code font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                    Guest Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B7267] font-mono-code mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>{email}</span>
              </p>
              <div className="text-xs text-[#2D6A4F] font-semibold mt-1 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>{gradeLabel}</span>
              </div>
            </div>
          </div>

          {/* Quick Profile Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="edit-profile-toggle-btn"
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isEditing
                  ? 'bg-[#1B4332] text-white'
                  : 'bg-white hover:bg-[#EFEBE0] text-[#1B4332] border border-[#2D6A4F]'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Close Edit Form' : 'Edit Profile'}</span>
            </button>

            {profile?.isLoggedIn ? (
              <button
                type="button"
                id="profile-signout-btn"
                onClick={() => setShowSignOutConfirm(true)}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out / Sign Out</span>
              </button>
            ) : (
              <button
                type="button"
                id="profile-login-btn"
                onClick={() => {
                  if (onOpenAuth) onOpenAuth();
                  else onNavigate('auth');
                }}
                className="px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In / Sign Up</span>
              </button>
            )}
          </div>
        </div>

        {savedSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile information successfully updated and saved to your device.</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Main Profile Info & Edit Form */}
        <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8E4D9] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E8E4D9]">
            <h3 className="font-serif-display font-bold text-xl text-[#1C1E1B] flex items-center gap-2">
              <User className="w-5 h-5 text-[#2D6A4F]" />
              <span>Personal & Academic Details</span>
            </h3>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#E3EDE5] hover:bg-[#D5E5D8] text-[#1B4332] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#6B7267] hover:bg-[#EFEBE0] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave()}
                    className="px-4 py-1.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#4B5047] mb-1.5">
                  Student Name (e.g. XYZ, Alex)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A9085]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    placeholder="e.g. XYZ or your full name"
                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border transition-colors ${
                      isEditing
                        ? 'border-[#2D6A4F] bg-white text-[#1C1E1B] focus:ring-2 focus:ring-[#1B4332]'
                        : 'border-[#D5CFBF] bg-[#F2EDE2]/50 text-[#1C1E1B] cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#4B5047] mb-1.5">
                  Email Address / Identifier
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A9085]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                    placeholder="student@example.com"
                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border transition-colors ${
                      isEditing
                        ? 'border-[#2D6A4F] bg-white text-[#1C1E1B] focus:ring-2 focus:ring-[#1B4332]'
                        : 'border-[#D5CFBF] bg-[#F2EDE2]/50 text-[#1C1E1B] cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              {/* Class / Standard */}
              <div>
                <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#4B5047] mb-1.5">
                  Class / Examination Standard
                </label>
                <select
                  value={gradeLabel}
                  onChange={(e) => setGradeLabel(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl border transition-colors ${
                    isEditing
                      ? 'border-[#2D6A4F] bg-white text-[#1C1E1B] focus:ring-2 focus:ring-[#1B4332]'
                      : 'border-[#D5CFBF] bg-[#F2EDE2]/50 text-[#1C1E1B] cursor-not-allowed'
                  }`}
                >
                  <optgroup label="🩺 MBBS & Medical Students">
                    <option value="MBBS - 1st Year (1st Prof)">MBBS - 1st Year (1st Prof)</option>
                    <option value="MBBS - 2nd Year (2nd Prof)">MBBS - 2nd Year (2nd Prof)</option>
                    <option value="MBBS - 3rd & Final Year (Clinical Prof)">MBBS - 3rd & Final Year (Clinical Prof)</option>
                    <option value="NEET-PG / USMLE / NEXT Licensing">NEET-PG / USMLE / NEXT Licensing</option>
                    <option value="B.Sc Nursing / Allied Health Sciences">B.Sc Nursing / Allied Health Sciences</option>
                  </optgroup>
                  <optgroup label="🎓 Degree & Higher Education">
                    <option value="B.Tech / B.E. (Computer Science & Engineering)">B.Tech / B.E. (Computer Science & Engineering)</option>
                    <option value="B.Tech / B.E. (Core Engineering)">B.Tech / B.E. (Core Engineering)</option>
                    <option value="B.Sc (Physical & Life Sciences)">B.Sc (Physical & Life Sciences)</option>
                    <option value="B.Com / BBA / Finance & Accounting">B.Com / BBA / Finance & Accounting</option>
                    <option value="B.A. (Humanities / Social Sciences)">B.A. (Humanities / Social Sciences)</option>
                    <option value="Masters / Post-Graduation (M.Tech, M.Sc, MBA, M.A.)">Masters / Post-Graduation (M.Tech, M.Sc, MBA, M.A.)</option>
                  </optgroup>
                  <optgroup label="🎯 Competitive Examinations">
                    <option value="NEET-UG (Medical Entrance Exam)">NEET-UG (Medical Entrance Exam)</option>
                    <option value="JEE Main & Advanced (Engineering Entrance)">JEE Main & Advanced (Engineering Entrance)</option>
                    <option value="UPSC Civil Services / State PSC">UPSC Civil Services / State PSC</option>
                    <option value="GATE / CAT / GRE / GMAT">GATE / CAT / GRE / GMAT</option>
                    <option value="Banking, SSC & Government Job Exams">Banking, SSC & Government Job Exams</option>
                  </optgroup>
                  <optgroup label="📘 Class 11 & 12 (Higher Secondary)">
                    <option value="Class 12 - Science (PCM / Physics, Chem, Maths)">Class 12 - Science (PCM)</option>
                    <option value="Class 12 - Medical (PCB / Physics, Chem, Biology)">Class 12 - Medical (PCB)</option>
                    <option value="Class 12 - Commerce (Accountancy, Eco, BST)">Class 12 - Commerce</option>
                    <option value="Class 12 - Humanities / Arts">Class 12 - Humanities / Arts</option>
                    <option value="Class 11 - Science (PCM)">Class 11 - Science (PCM)</option>
                    <option value="Class 11 - Medical (PCB)">Class 11 - Medical (PCB)</option>
                    <option value="Class 11 - Commerce">Class 11 - Commerce</option>
                  </optgroup>
                  <optgroup label="📗 Secondary School (Class 6 - 10)">
                    <option value="Class 10 - Board Preparation">Class 10 - Board Preparation</option>
                    <option value="Class 9 - Foundation">Class 9 - Foundation</option>
                    <option value="Class 8 - Middle School">Class 8 - Middle School</option>
                    <option value="Class 6 - 7 - Foundation">Class 6 - 7 - Foundation</option>
                  </optgroup>
                </select>
              </div>

              {/* Institution / College */}
              <div>
                <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#4B5047] mb-1.5">
                  School / College / University
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A9085]" />
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    disabled={!isEditing}
                    placeholder="e.g. Apex Institute / Model School"
                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border transition-colors ${
                      isEditing
                        ? 'border-[#2D6A4F] bg-white text-[#1C1E1B] focus:ring-2 focus:ring-[#1B4332]'
                        : 'border-[#D5CFBF] bg-[#F2EDE2]/50 text-[#1C1E1B] cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Preferences Sub-section */}
            <div className="pt-4 border-t border-[#E8E4D9] grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#4B5047] mb-1.5">
                  Daily Study Goal (Minutes)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A9085]" />
                  <input
                    type="number"
                    min="15"
                    max="600"
                    step="15"
                    value={dailyMinutes}
                    onChange={(e) => setDailyMinutes(Number(e.target.value))}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border transition-colors ${
                      isEditing
                        ? 'border-[#2D6A4F] bg-white text-[#1C1E1B] focus:ring-2 focus:ring-[#1B4332]'
                        : 'border-[#D5CFBF] bg-[#F2EDE2]/50 text-[#1C1E1B] cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#4B5047] mb-1.5">
                  Target Exam Year
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A9085]" />
                  <input
                    type="text"
                    value={targetExamYear}
                    onChange={(e) => setTargetExamYear(e.target.value)}
                    disabled={!isEditing}
                    placeholder="2026"
                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border transition-colors ${
                      isEditing
                        ? 'border-[#2D6A4F] bg-white text-[#1C1E1B] focus:ring-2 focus:ring-[#1B4332]'
                        : 'border-[#D5CFBF] bg-[#F2EDE2]/50 text-[#1C1E1B] cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Hints Preference */}
            <div className="pt-2">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#E8E4D9] cursor-pointer hover:bg-[#F9F7F2]">
                <input
                  type="checkbox"
                  checked={showHintsFirst}
                  onChange={(e) => setShowHintsFirst(e.target.checked)}
                  disabled={!isEditing}
                  className="rounded text-[#1B4332] focus:ring-[#1B4332] w-4 h-4 cursor-pointer"
                />
                <div>
                  <div className="text-xs font-bold text-[#1C1E1B]">
                    Active Recall Hint Mode (Recommended)
                  </div>
                  <div className="text-[11px] text-[#6B7267]">
                    Provide step-by-step guidance and hint prompts before showing full answers.
                  </div>
                </div>
              </label>
            </div>

            {/* Save Buttons Row */}
            {isEditing && (
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E4D9] animate-fade-in">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B7267] hover:bg-[#EFEBE0] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Enrolled Subjects Card */}
        <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8E4D9] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-[#1C1E1B] mb-1">Enrolled Subjects</h4>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {subjects.map((s) => (
                <span key={s.id} className="text-xs bg-[#E3EDE5] text-[#1B4332] px-3 py-1 rounded-full font-bold">
                  {s.name}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('subjects')}
            className="px-4 py-2 rounded-xl border border-[#2D6A4F] text-[#1B4332] text-xs font-bold hover:bg-[#E3EDE5] transition-colors cursor-pointer"
          >
            Manage Subjects →
          </button>
        </div>

        {/* Account Actions & Authentication Section */}
        <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8E4D9] p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="font-serif-display font-bold text-lg text-[#1C1E1B] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#2D6A4F]" />
            <span>Account & Access Management</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Log In / Switch Account Button */}
            <div className="p-4 rounded-2xl bg-white border border-[#D5CFBF] flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#2D6A4F] mb-1">
                  Switch or Connect Account
                </div>
                <div className="text-xs text-[#555A51]">
                  Sign in with your name (XYZ), email, or Google to sync study progress.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onOpenAuth) onOpenAuth();
                  else onNavigate('auth');
                }}
                className="mt-3 w-full py-2 px-3 rounded-xl bg-[#E3EDE5] hover:bg-[#D0E2D4] text-[#1B4332] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-[#1B4332]" />
                <span>{profile?.isLoggedIn ? 'Switch / Connect Another Account' : 'Log In / Sign Up'}</span>
              </button>
            </div>

            {/* Log Out / Sign Out Button */}
            <div className="p-4 rounded-2xl bg-white border border-rose-200 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono-code font-bold uppercase tracking-wider text-rose-700 mb-1">
                  Session Log Out
                </div>
                <div className="text-xs text-[#555A51]">
                  End your current session on this browser. All notes remain securely saved.
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSignOut()}
                className="mt-3 w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Log Out / Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reset Progress to 0% Card */}
        {onResetProgress && (
          <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8E4D9] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <div className="text-sm font-bold text-[#1C1E1B] flex items-center gap-2">
                <span>📊 Clear Progress & Activity Counters</span>
                <span className="text-[10px] font-mono-code bg-[#E3EDE5] text-[#1B4332] px-2 py-0.5 rounded-full font-semibold">
                  Honest Tracking
                </span>
              </div>
              <div className="text-xs text-[#6B7267] mt-0.5">
                Reset your syllabus completion %, quiz counts, and flashcard mastery counters to 0% without affecting your profile or notes.
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all your progress counters to 0%?')) {
                  onResetProgress();
                }
              }}
              className="px-4 py-2 rounded-xl bg-white border border-[#D5CFBF] hover:border-red-400 hover:bg-red-50 text-[#6B7267] hover:text-red-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Reset Progress to 0%</span>
            </button>
          </div>
        )}

        {/* Make App Brand New / Start Fresh Card */}
        <div className="bg-[#FAF8F5] rounded-3xl border border-amber-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="text-sm font-bold text-[#1C1E1B] flex items-center gap-2">
              <span>✨ Make App Brand New (Fresh Reset)</span>
              <span className="text-[10px] font-mono-code bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
                Clean Slate
              </span>
            </div>
            <div className="text-xs text-[#6B7267] mt-0.5">
              Reset all study sessions, tasks, and history to a brand new state without breaking any features or functions.
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5 text-amber-700" />
            <span>Reset to Brand New</span>
          </button>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B4332]/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8E4D9] p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 text-[#1C1E1B]">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-800 font-bold">
              <LogOut className="w-5 h-5 text-rose-700" />
            </div>
            <div>
              <h3 className="font-serif-display text-xl font-bold text-[#1C1E1B]">
                Sign Out of StudyFlow?
              </h3>
              <p className="text-xs text-[#6B7267] mt-1 leading-relaxed">
                You will be signed out of your current session ({name || 'Student'}). Your stored notes and flashcards will remain saved on this device.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E4D9]">
              <button
                type="button"
                onClick={() => setShowSignOutConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B7267] hover:bg-[#EFEBE0] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSignOutConfirm(false);
                  onSignOut();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset to Brand New Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B4332]/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8E4D9] p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 text-[#1C1E1B]">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 font-bold">
              ✨
            </div>
            <div>
              <h3 className="font-serif-display text-xl font-bold text-[#1C1E1B]">
                Make Web App Brand New?
              </h3>
              <p className="text-xs text-[#6B7267] mt-1 leading-relaxed">
                This will clear all local practice sessions, notes, and timetable tasks to give you a pristine brand new workspace, while keeping all features, tools, and AI abilities completely intact.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E4D9]">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B7267] hover:bg-[#EFEBE0] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                  if (onResetToBrandNew) {
                    onResetToBrandNew();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Yes, Start Brand New
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
