import React, { useState, useRef, useEffect } from 'react';
import { AppView, UserProfile } from '../types';
import {
  BookOpen,
  Sparkles,
  LayoutDashboard,
  Lightbulb,
  FileText,
  PlusCircle,
  Clock,
  Search,
  User,
  Layers,
  HelpCircle,
  Calendar,
  Folder,
  TrendingUp,
  Menu,
  X,
  ShieldCheck,
  MoreVertical,
  Home,
  Sliders,
  LogOut,
  LogIn,
  Edit3,
  UserCheck,
  Activity,
  Check,
  ArrowLeft,
} from 'lucide-react';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  canGoBack?: boolean;
  onOpenExplainModal: () => void;
  onOpenFocusModal: () => void;
  onOpenSearchModal: () => void;
  onOpenAuthModal: () => void;
  onSignOut?: () => void;
  userProfile: UserProfile | null;
  hasApiKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onGoBack,
  onGoHome,
  canGoBack = true,
  onOpenExplainModal,
  onOpenFocusModal,
  onOpenSearchModal,
  onOpenAuthModal,
  onSignOut,
  userProfile,
  hasApiKey,
}) => {
  const [dotsMenuOpen, setDotsMenuOpen] = useState<boolean>(false);
  const dotsMenuRef = useRef<HTMLDivElement>(null);

  // Close dots menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dotsMenuRef.current && !dotsMenuRef.current.contains(event.target as Node)) {
        setDotsMenuOpen(false);
      }
    };
    if (dotsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dotsMenuOpen]);

  const navLinks: { view: AppView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { view: 'subjects', label: 'Subjects', icon: BookOpen },
    { view: 'doubt-solver', label: 'Doubt Solver', icon: HelpCircle },
    { view: 'notes', label: 'Smart Notes', icon: FileText },
    { view: 'ai-tools', label: 'AI Tools', icon: Sparkles },
    { view: 'plan', label: 'Planner', icon: Calendar },
    { view: 'flashcards', label: 'Flashcards', icon: Layers },
    { view: 'quiz', label: 'Quiz', icon: HelpCircle },
    { view: 'progress', label: 'Progress', icon: TrendingUp },
    { view: 'library', label: 'Library', icon: Folder },
  ];

  return (
    <header id="app-header" className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E4D9] text-[#1C1E1B]">
      {/* Micro Top Strip */}
      <div className="w-full bg-[#1B4332] text-[#FAF8F5] text-[11px] px-3 sm:px-4 py-1 text-center font-medium flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-2">
          <span className="font-mono-code font-bold uppercase tracking-wider text-[#95D5B2]">
            STUDYFLOW AI
          </span>
          <span>•</span>
          <span className="text-[#D8F3DC]">LEARN SMARTER. STAY ORGANIZED. KEEP MOVING.</span>
        </div>

        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3">
          <span className="text-[10px] text-[#95D5B2] font-mono-code font-semibold truncate">
            ✨ Made by Manab Jyoti Chamuah
          </span>
          <button
            onClick={() => onNavigate('case-study')}
            className="hover:underline text-[10px] text-white/90 shrink-0"
          >
            Design Case Study →
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-3">
          {/* Left: Blue Back & Home Arrow Sign + Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {/* Top Blue Back / Home Arrow Navigation Buttons */}
            <div className="flex items-center gap-1.5 shrink-0" id="top-blue-nav-container">
              {/* Primary Blue Back Arrow Button */}
              <button
                id="top-blue-back-arrow-btn"
                type="button"
                onClick={onGoBack}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-500/25 border border-blue-500 transition-all cursor-pointer active:scale-95 shrink-0 group ring-2 ring-blue-400/20"
                title="Go back to previous page or Home (Blue Navigation Arrow)"
                aria-label="Go back to previous page or Home"
              >
                <ArrowLeft className="w-4 h-4 text-white group-hover:-translate-x-1 transition-transform shrink-0" />
                <span className="font-mono-code font-bold uppercase tracking-wider text-[11px] hidden sm:inline">
                  Back
                </span>
              </button>

              {/* Blue Home Quick Button */}
              <button
                id="top-blue-home-arrow-btn"
                type="button"
                onClick={onGoHome}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-xl bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 hover:text-blue-900 border border-blue-200 hover:border-blue-300 font-bold text-xs transition-all cursor-pointer active:scale-95 shrink-0 shadow-xs"
                title="Go directly to Home"
                aria-label="Go directly to Home"
              >
                <Home className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-mono-code font-semibold uppercase tracking-wider text-[10px] hidden md:inline">
                  Home
                </span>
              </button>
            </div>

            {/* Brand Logo */}
            <button
              id="brand-logo-btn"
              onClick={() => onNavigate(userProfile ? 'dashboard' : 'landing')}
              className="flex items-center gap-2 sm:gap-2.5 text-left group transition-transform active:scale-95 cursor-pointer shrink-0"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1B4332] text-[#FAF8F5] flex items-center justify-center font-serif-display text-base sm:text-lg font-bold shadow-md group-hover:bg-[#2D6A4F] transition-colors">
                S
              </div>
              <div className="min-w-0">
                <span className="font-serif-display font-bold tracking-tight text-base sm:text-xl text-[#1C1E1B] block leading-tight">
                  StudyFlow <span className="text-[#2D6A4F] font-mono-code text-xs font-semibold">AI</span>
                </span>
                <span className="text-[9px] text-[#6B7267] font-semibold tracking-wider hidden sm:block uppercase font-mono-code">
                  AI Study Companion
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1 ml-2" aria-label="Main Navigation">
              {navLinks.slice(0, 6).map((link) => {
                const Icon = link.icon;
                const isActive = currentView === link.view;
                return (
                  <button
                    key={link.view}
                    onClick={() => onNavigate(link.view)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-[#E3EDE5] text-[#1B4332] border border-[#2D6A4F]/30 font-bold'
                        : 'text-[#4B5047] hover:text-[#1B4332] hover:bg-[#EFEBE0]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Global Search Button */}
            <button
              onClick={onOpenSearchModal}
              className="hidden sm:flex px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#D5CFBF] bg-white hover:bg-[#F4EFE6] text-xs text-[#555A51] items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer"
              title="Search across all notes and topics (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span className="hidden md:inline">Search notes...</span>
              <kbd className="hidden md:inline text-[9px] bg-[#EAE4D5] px-1 py-0.5 rounded text-[#4B5047]">
                ⌘K
              </kbd>
            </button>

            {/* Focus Session Trigger */}
            <button
              onClick={onOpenFocusModal}
              className="hidden md:flex px-3 py-1.5 rounded-xl border border-[#2D6A4F] bg-[#E3EDE5] hover:bg-[#D5E5D8] text-[#1B4332] text-xs font-bold transition-all items-center gap-1.5 cursor-pointer"
              title="Start 25-minute Pomodoro focus block"
            >
              <Clock className="w-3.5 h-3.5 text-[#2D6A4F] animate-pulse" />
              <span>Focus Timer</span>
            </button>

            {/* Explain Modal Trigger */}
            <button
              onClick={onOpenExplainModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#4B5047] hover:text-[#1B4332] hover:bg-[#EFEBE0] transition-colors cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>Explain</span>
            </button>

            {/* User Profile / Auth Button */}
            {userProfile ? (
              <button
                onClick={() => onNavigate('settings')}
                className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white border border-[#D5CFBF] hover:border-[#1B4332] transition-colors cursor-pointer"
                title="View Profile & Settings"
              >
                <div className="w-6 h-6 rounded-lg bg-[#1B4332] text-white flex items-center justify-center text-xs font-bold">
                  {userProfile.name.charAt(0)}
                </div>
                <span className="text-xs font-bold text-[#1C1E1B] hidden sm:inline max-w-[90px] truncate">
                  {userProfile.name}
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onNavigate('auth')}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-[#4B5047] hover:text-[#1B4332] hover:bg-[#EFEBE0] transition-all cursor-pointer"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('auth')}
                  className="hidden sm:inline-flex px-3.5 py-1.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  Sign Up Free
                </button>
              </div>
            )}

            {/* THREE DOTS ACTION MENU - PROMINENT & ACCESSIBLE ACROSS ALL PAGES */}
            <div className="relative" ref={dotsMenuRef}>
              <button
                id="three-dots-menu-btn"
                type="button"
                onClick={() => setDotsMenuOpen(!dotsMenuOpen)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border font-semibold text-xs transition-all cursor-pointer shadow-xs shrink-0 ${
                  dotsMenuOpen
                    ? 'bg-[#1B4332] text-white border-[#1B4332] ring-2 ring-[#2D6A4F]/30 shadow-md'
                    : 'bg-[#1B4332] text-white hover:bg-[#2D6A4F] border-[#1B4332]'
                }`}
                title="Open Quick Menu & Options (Home, Profile, Progress, Study Tracker)"
                aria-label="Open options menu"
                aria-expanded={dotsMenuOpen}
              >
                <MoreVertical className="w-4 h-4 text-[#D8F3DC]" />
                <span className="font-bold tracking-wide">Menu</span>
              </button>

              {/* Dropdown Popup */}
              {dotsMenuOpen && (
                <div
                  id="three-dots-dropdown"
                  className="absolute right-0 mt-2 w-[calc(100vw-24px)] max-w-xs sm:max-w-sm sm:w-80 bg-[#FAF8F5] rounded-2xl border-2 border-[#1B4332]/20 shadow-[0_16px_48px_rgba(0,0,0,0.2)] py-2 z-50 animate-fade-in text-[#1C1E1B] max-h-[85vh] overflow-y-auto"
                >
                  {/* Account Header Badge */}
                  <div className="px-4 py-2.5 border-b border-[#E8E4D9] bg-[#F2EDE2]/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-[#2D6A4F]">
                        {userProfile ? 'Active Student' : 'Guest Mode'}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          userProfile ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                        }`}
                      />
                    </div>
                    <div className="font-bold text-sm text-[#1C1E1B] truncate mt-0.5">
                      {userProfile?.name || 'Welcome to StudyFlow'}
                    </div>
                    <div className="text-[11px] text-[#6B7267] truncate font-mono-code">
                      {userProfile?.email || 'Sign in to sync your study data'}
                    </div>
                  </div>

                  {/* SECTION 1: Core Navigation & Student Profile */}
                  <div className="py-1.5 px-1.5 space-y-0.5">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6B7267] font-mono-code flex items-center justify-between">
                      <span>Navigation</span>
                      <span className="text-blue-600 font-bold">Quick Controls</span>
                    </div>

                    {/* Quick Go Back Option with Blue Arrow */}
                    <button
                      type="button"
                      id="menu-opt-back"
                      onClick={() => {
                        if (onGoBack) onGoBack();
                        setDotsMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-blue-700 hover:bg-blue-50/80 flex items-center justify-between transition-colors cursor-pointer group text-left bg-blue-50/40 border border-blue-200/60"
                    >
                      <div className="flex items-center gap-2.5">
                        <ArrowLeft className="w-4 h-4 text-blue-600 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold">Go Back (Previous Page)</span>
                      </div>
                      <span className="text-[10px] font-mono-code text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200 font-bold">
                        ← Back
                      </span>
                    </button>

                    {/* Home Page Option */}
                    <button
                      type="button"
                      id="menu-opt-home"
                      onClick={() => {
                        if (onGoHome) {
                          onGoHome();
                        } else {
                          onNavigate(userProfile ? 'dashboard' : 'landing');
                        }
                        setDotsMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-[#1C1E1B] hover:bg-[#E3EDE5] hover:text-[#1B4332] flex items-center justify-between transition-colors cursor-pointer group text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Home className="w-4 h-4 text-[#2D6A4F] group-hover:scale-110 transition-transform" />
                        <span>Home Page</span>
                      </div>
                      <span className="text-[10px] font-mono-code text-[#6B7267] bg-white/80 px-1.5 py-0.5 rounded border border-[#E8E4D9]">
                        {userProfile ? 'Dashboard' : 'Landing'}
                      </span>
                    </button>

                    {/* Profile Option */}
                    <button
                      type="button"
                      id="menu-opt-profile"
                      onClick={() => {
                        onNavigate('settings');
                        setDotsMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-[#1C1E1B] hover:bg-[#E3EDE5] hover:text-[#1B4332] flex items-center justify-between transition-colors cursor-pointer group text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <User className="w-4 h-4 text-[#2D6A4F] group-hover:scale-110 transition-transform" />
                        <span>Profile & Overview</span>
                      </div>
                      <span className="text-[10px] font-mono-code text-[#6B7267] bg-white/80 px-1.5 py-0.5 rounded border border-[#E8E4D9]">
                        View
                      </span>
                    </button>

                    {/* Edit Profile Option */}
                    <button
                      type="button"
                      id="menu-opt-edit-profile"
                      onClick={() => {
                        onNavigate('settings');
                        setDotsMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-[#1C1E1B] hover:bg-[#E3EDE5] hover:text-[#1B4332] flex items-center justify-between transition-colors cursor-pointer group text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Edit3 className="w-4 h-4 text-[#2D6A4F] group-hover:scale-110 transition-transform" />
                        <span>Edit Profile</span>
                      </div>
                      <span className="text-[10px] text-[#2D6A4F] font-bold">Edit ✏️</span>
                    </button>

                    {/* Progress Option */}
                    <button
                      type="button"
                      id="menu-opt-progress"
                      onClick={() => {
                        onNavigate('progress');
                        setDotsMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-[#1C1E1B] hover:bg-[#E3EDE5] hover:text-[#1B4332] flex items-center justify-between transition-colors cursor-pointer group text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <TrendingUp className="w-4 h-4 text-[#2D6A4F] group-hover:scale-110 transition-transform" />
                        <span>Progress & Stats</span>
                      </div>
                      <span className="text-[10px] font-mono-code text-[#6B7267] bg-white/80 px-1.5 py-0.5 rounded border border-[#E8E4D9]">
                        Analytics
                      </span>
                    </button>

                    {/* Study Tracker / Focus Option */}
                    <button
                      type="button"
                      id="menu-opt-tracker"
                      onClick={() => {
                        onOpenFocusModal();
                        setDotsMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-[#1C1E1B] hover:bg-[#E3EDE5] hover:text-[#1B4332] flex items-center justify-between transition-colors cursor-pointer group text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-[#2D6A4F] group-hover:scale-110 transition-transform" />
                        <span>Study Tracker & Focus</span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                        Timer ⏱️
                      </span>
                    </button>

                    {/* Planner / Timetable Option */}
                    <button
                      type="button"
                      id="menu-opt-plan"
                      onClick={() => {
                        onNavigate('plan');
                        setDotsMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-[#1C1E1B] hover:bg-[#E3EDE5] hover:text-[#1B4332] flex items-center justify-between transition-colors cursor-pointer group text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-[#2D6A4F] group-hover:scale-110 transition-transform" />
                        <span>Study Timetable & Tasks</span>
                      </div>
                      <span className="text-[10px] font-mono-code text-[#6B7267] bg-white/80 px-1.5 py-0.5 rounded border border-[#E8E4D9]">
                        Schedule
                      </span>
                    </button>
                  </div>

                  {/* SECTION 2: Study Modules */}
                  <div className="pt-1.5 mt-1 border-t border-[#E8E4D9] px-1.5 space-y-0.5">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6B7267] font-mono-code">
                      Study Tools & Modules
                    </div>

                    <div className="grid grid-cols-2 gap-1 px-1">
                      <button
                        type="button"
                        onClick={() => {
                          onNavigate('notes');
                          setDotsMenuOpen(false);
                        }}
                        className="p-2 rounded-xl text-xs font-semibold text-[#1C1E1B] hover:bg-[#E3EDE5] hover:text-[#1B4332] flex items-center gap-2 transition-colors cursor-pointer text-left"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#2D6A4F]" />
                        <span>Smart Notes</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onNavigate('flashcards');
                          setDotsMenuOpen(false);
                        }}
                        className="p-2 rounded-xl text-xs font-semibold text-[#1C1E1B] hover:bg-[#E3EDE5] hover:text-[#1B4332] flex items-center gap-2 transition-colors cursor-pointer text-left"
                      >
                        <Layers className="w-3.5 h-3.5 text-[#2D6A4F]" />
                        <span>Flashcards</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onNavigate('quiz');
                          setDotsMenuOpen(false);
                        }}
                        className="p-2 rounded-xl text-xs font-semibold text-[#1C1E1B] hover:bg-[#E3EDE5] hover:text-[#1B4332] flex items-center gap-2 transition-colors cursor-pointer text-left"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-[#2D6A4F]" />
                        <span>Practice Quiz</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onNavigate('subjects');
                          setDotsMenuOpen(false);
                        }}
                        className="p-2 rounded-xl text-xs font-semibold text-[#1C1E1B] hover:bg-[#E3EDE5] hover:text-[#1B4332] flex items-center gap-2 transition-colors cursor-pointer text-left"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-[#2D6A4F]" />
                        <span>Subjects</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onNavigate('library');
                          setDotsMenuOpen(false);
                        }}
                        className="p-2 rounded-xl text-xs font-semibold text-[#1C1E1B] hover:bg-[#E3EDE5] hover:text-[#1B4332] flex items-center gap-2 transition-colors cursor-pointer text-left"
                      >
                        <Folder className="w-3.5 h-3.5 text-[#2D6A4F]" />
                        <span>Library</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onNavigate('doubt-solver');
                          setDotsMenuOpen(false);
                        }}
                        className="p-2 rounded-xl text-xs font-semibold text-[#1C1E1B] hover:bg-[#E3EDE5] hover:text-[#1B4332] flex items-center gap-2 transition-colors cursor-pointer text-left"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
                        <span>Doubt Solver</span>
                      </button>
                    </div>
                  </div>

                  {/* SECTION 3: Utilities & Options */}
                  <div className="pt-1.5 mt-1 border-t border-[#E8E4D9] px-1.5 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        onOpenSearchModal();
                        setDotsMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl text-xs font-semibold text-[#1C1E1B] hover:bg-[#E3EDE5] hover:text-[#1B4332] flex items-center justify-between transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-[#2D6A4F]" />
                        <span>Search Notes & Concepts</span>
                      </div>
                      <kbd className="text-[9px] bg-[#EAE4D5] px-1 py-0.5 rounded text-[#4B5047]">⌘K</kbd>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onOpenExplainModal();
                        setDotsMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl text-xs font-semibold text-[#1C1E1B] hover:bg-[#E3EDE5] hover:text-[#1B4332] flex items-center justify-between transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-3.5 h-3.5 text-[#2D6A4F]" />
                        <span>Explain Simply (Feynman)</span>
                      </div>
                      <span className="text-[10px] text-[#2D6A4F] font-bold">AI</span>
                    </button>

                    <button
                      type="button"
                      id="menu-opt-settings"
                      onClick={() => {
                        onNavigate('settings');
                        setDotsMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl text-xs font-semibold text-[#1C1E1B] hover:bg-[#E3EDE5] hover:text-[#1B4332] flex items-center justify-between transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Sliders className="w-3.5 h-3.5 text-[#2D6A4F]" />
                        <span>Options & Preferences</span>
                      </div>
                      <span className="text-[10px] font-mono-code text-[#6B7267]">Config</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onNavigate('case-study');
                        setDotsMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl text-xs font-semibold text-[#1C1E1B] hover:bg-[#E3EDE5] hover:text-[#1B4332] flex items-center justify-between transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-[#2D6A4F]" />
                        <span>Design Case Study</span>
                      </div>
                      <span className="text-[10px] font-mono-code text-[#6B7267]">Docs</span>
                    </button>
                  </div>

                  {/* SECTION 4: Auth Actions Section */}
                  <div className="pt-2 mt-1 border-t border-[#E8E4D9] px-2 space-y-1">
                    {userProfile ? (
                      <button
                        type="button"
                        id="menu-opt-signout"
                        onClick={() => {
                          setDotsMenuOpen(false);
                          if (onSignOut) {
                            onSignOut();
                          } else {
                            onNavigate('auth');
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50/90 hover:bg-rose-100 hover:text-rose-800 flex items-center justify-between transition-colors cursor-pointer text-left border border-rose-200/60"
                      >
                        <div className="flex items-center gap-2.5">
                          <LogOut className="w-4 h-4 text-rose-600" />
                          <span>Log Out / Sign Out</span>
                        </div>
                        <span className="text-[10px] font-mono-code bg-rose-200/50 px-1.5 py-0.5 rounded">Exit</span>
                      </button>
                    ) : (
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          id="menu-opt-login"
                          onClick={() => {
                            setDotsMenuOpen(false);
                            onNavigate('auth');
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-[#1C1E1B] bg-white border border-[#D5CFBF] hover:bg-[#EFEBE0] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <LogIn className="w-3.5 h-3.5 text-[#2D6A4F]" />
                          <span>Log In</span>
                        </button>
                        <button
                          type="button"
                          id="menu-opt-signup"
                          onClick={() => {
                            setDotsMenuOpen(false);
                            onNavigate('auth');
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#1B4332] hover:bg-[#2D6A4F] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Sign Up</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
