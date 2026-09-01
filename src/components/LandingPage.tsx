import React, { useState } from 'react';
import { SAMPLE_TOPICS } from '../data/sampleMaterials';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Layers,
  HelpCircle,
  Lightbulb,
  Calendar,
  CheckCircle2,
  FileText,
  Clock,
  Zap,
  RotateCcw,
  Eye,
  Check,
  ChevronDown,
  Brain,
  ShieldCheck,
  Flame,
  Atom,
} from 'lucide-react';

interface LandingPageProps {
  onStartStudying: () => void;
  onExploreFeatures: () => void;
  onSelectSample: (sampleId: string) => void;
  onNavigateCaseStudy: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartStudying,
  onExploreFeatures,
  onSelectSample,
  onNavigateCaseStudy,
}) => {
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string>('All');
  
  // Interactive Hero Preview State
  const [heroTab, setHeroTab] = useState<'notes' | 'flashcard' | 'quiz' | 'plan' | 'visual'>('flashcard');
  const [heroCardFlipped, setHeroCardFlipped] = useState(false);
  const [heroQuizAnswered, setHeroQuizAnswered] = useState<number | null>(null);

  const filteredTopics =
    selectedQuickFilter === 'All'
      ? SAMPLE_TOPICS
      : SAMPLE_TOPICS.filter((t) => t.category.toLowerCase().includes(selectedQuickFilter.toLowerCase()));

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onExploreFeatures();
    }
  };

  return (
    <div className="relative space-y-16 sm:space-y-28 py-4 sm:py-12 text-[#1C1E1B] w-full overflow-x-clip">
      {/* Background Decorative Glow in Creamy Vanilla & Deep Forest Green */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-emerald-100/50 via-amber-50/40 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />
      <div className="absolute top-1/3 right-4 w-72 h-72 bg-emerald-100/30 blur-[120px] pointer-events-none -z-10 rounded-full" />
      <div className="absolute top-2/3 left-4 w-72 h-72 bg-teal-50/40 blur-[130px] pointer-events-none -z-10 rounded-full" />

      {/* 03 — LANDING PAGE HERO */}
      <section className="text-center max-w-4xl mx-auto px-3 sm:px-6 space-y-5 sm:space-y-8 animate-fade-in">
        {/* Positioning Pill */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-[#E8F5E9] border border-emerald-300 text-[10px] sm:text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4332] shadow-xs max-w-full text-center">
          <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
          <span className="truncate">STUDYFLOW • HOW DO YOU WANT TO STUDY?</span>
        </div>

        {/* Large Headline */}
        <div className="space-y-2 sm:space-y-3">
          <h1 className="font-serif-display text-3xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#1C1E1B] leading-[1.08] sm:leading-[1.05]">
            HOW DO YOU
            <br />
            <span className="text-[#1B4332]">WANT TO STUDY?</span>
          </h1>
          <p className="font-serif-display text-xl sm:text-3xl lg:text-4xl font-semibold text-[#40534C] tracking-tight">
            MASTER WHATEVER YOU'RE LEARNING.
          </p>
        </div>

        {/* Supporting Paragraph */}
        <p className="text-sm sm:text-lg text-[#555A50] max-w-2xl mx-auto leading-relaxed font-normal">
          StudyFlow brings notes, AI explanations, flashcards, practice and visual learning into one personal study space.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1 sm:pt-2 max-w-md sm:max-w-none mx-auto w-full">
          <button
            id="hero-start-free-btn"
            onClick={onStartStudying}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] font-bold text-sm sm:text-base transition-all shadow-[0_4px_20px_rgba(27,67,50,0.3)] hover:shadow-[0_6px_24px_rgba(27,67,50,0.4)] flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>START FOR FREE</span>
            <ArrowRight className="w-4 h-4 text-[#FAF8F5]" />
          </button>

          <button
            id="hero-explore-btn"
            onClick={() => scrollToSection('features-section')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[#D5CFBF] bg-white hover:bg-[#F4EFE6] text-[#1C1E1B] font-bold text-sm sm:text-base transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>EXPLORE STUDYFLOW</span>
            <ChevronDown className="w-4 h-4 text-[#6B7267]" />
          </button>
        </div>

        {/* Feature line */}
        <div className="pt-1 sm:pt-2">
          <p className="text-[11px] sm:text-xs font-mono-code font-bold uppercase tracking-wider sm:tracking-widest text-[#6B7267]">
            SMART NOTES • FLASHCARDS • PRACTICE • AI HELP • STUDY PLANS
          </p>
        </div>
      </section>

      {/* 04 — LANDING PAGE HERO VISUAL: REALISTIC INTERACTIVE WORKSPACE PREVIEW */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-[#FAF8F5] rounded-3xl p-4 sm:p-7 border border-[#E5E0D3] shadow-[0_12px_40px_rgba(45,106,79,0.08)] space-y-5">
          {/* Workspace Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-5 py-3.5 rounded-2xl border border-[#E8E4D9]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#1B4332] text-white flex items-center justify-center font-serif-display font-bold text-sm">
                S
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono-code font-bold uppercase tracking-wider text-[#1B4332] bg-[#E8F5E9] px-2 py-0.5 rounded border border-emerald-300">
                    MY STUDY
                  </span>
                  <span className="text-xs font-bold text-[#1C1E1B]">Science</span>
                  <span className="text-[10px] font-mono-code text-[#6B7267] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E8E4D9]">
                    DEMO PREVIEW
                  </span>
                </div>
                <h3 className="font-serif-display text-base sm:text-lg font-bold text-[#1C1E1B]">
                  Current topic: Earth's Atmosphere & Heat Balance
                </h3>
              </div>
            </div>

            {/* Study Progress Badge */}
            <div className="flex items-center gap-2 self-start sm:self-auto bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#E8E4D9]">
              <span className="text-xs font-mono-code font-semibold text-[#6B7267]">Study progress:</span>
              <div className="w-20 bg-[#E8E4D9] h-2 rounded-full overflow-hidden">
                <div className="bg-[#1B4332] h-full w-[65%]" />
              </div>
              <span className="text-xs font-bold font-mono-code text-[#1B4332]">65%</span>
            </div>
          </div>

          {/* Interactive Mode Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#EFEBE0] p-1.5 rounded-2xl border border-[#DCD6C7]">
            {[
              { id: 'notes', label: 'Smart Notes', icon: FileText },
              { id: 'flashcard', label: '3D Flashcard', icon: Layers },
              { id: 'quiz', label: 'Practice Quiz', icon: HelpCircle },
              { id: 'plan', label: 'Study Plan', icon: Calendar },
              { id: 'visual', label: 'Visual Learning', icon: Atom },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = heroTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setHeroTab(tab.id as any);
                    if (tab.id === 'flashcard') setHeroCardFlipped(false);
                  }}
                  className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#1B4332] shadow-sm border border-[#D5CFBF]'
                      : 'text-[#555A50] hover:text-[#1C1E1B] hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#1B4332]' : 'text-[#6B7267]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Hero Tab Content Area */}
          <div className="bg-white rounded-2xl p-5 sm:p-7 border border-[#E8E4D9] min-h-[260px] flex flex-col justify-center">
            {/* 1. Smart Notes Preview */}
            {heroTab === 'notes' && (
              <div className="space-y-4 animate-fade-in text-left">
                <div className="flex items-center justify-between border-b border-[#E8E4D9] pb-3">
                  <span className="text-xs font-mono-code font-bold uppercase text-[#1B4332] bg-[#E8F5E9] px-2.5 py-1 rounded">
                    Executive Summary & Key Points
                  </span>
                  <span className="text-xs text-[#6B7267] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#2D6A4F]" /> 2 min read
                  </span>
                </div>
                <div className="space-y-2.5">
                  <p className="text-xs sm:text-sm text-[#1C1E1B] leading-relaxed font-medium">
                    The Earth's atmosphere is divided into 5 thermal layers: <span className="bg-[#E8F5E9] font-bold px-1 rounded text-[#1B4332]">Troposphere</span> (weather), Stratosphere (ozone layer), Mesosphere, Thermosphere, and Exosphere.
                  </p>
                  <ul className="space-y-1.5 text-xs text-[#4B5047]">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0 mt-0.5" />
                      <span><strong>Greenhouse Effect:</strong> Traps outgoing infrared radiation to maintain a habitable global average temperature (~15°C).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0 mt-0.5" />
                      <span><strong>Formula:</strong> Radiative equilibrium balance: <em>E_in = E_out = σ · T_eff⁴</em>.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* 2. Interactive 3D Flashcard Preview */}
            {heroTab === 'flashcard' && (
              <div className="text-center space-y-4 animate-fade-in max-w-lg mx-auto w-full">
                <p className="text-xs text-[#6B7267] font-medium">
                  Click the card or button below to test your active recall with 3D flip animation:
                </p>

                <div
                  onClick={() => setHeroCardFlipped(!heroCardFlipped)}
                  className={`p-6 sm:p-8 rounded-2xl border cursor-pointer transition-all duration-300 select-none shadow-sm flex flex-col justify-between min-h-[160px] ${
                    heroCardFlipped
                      ? 'bg-[#E8F5E9] border-emerald-400 text-[#1B4332]'
                      : 'bg-[#FAF8F5] border-[#DCD6C7] hover:border-emerald-500 text-[#1C1E1B]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono-code font-bold uppercase tracking-wider">
                    <span className="text-[#6B7267]">{heroCardFlipped ? 'ANSWER / EXPLANATION' : 'QUESTION (FRONT)'}</span>
                    <span className="text-[#1B4332] flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" /> Flip
                    </span>
                  </div>

                  <div className="my-3">
                    {heroCardFlipped ? (
                      <p className="font-serif-display text-base sm:text-lg font-bold text-[#1B4332] leading-snug">
                        The Stratosphere — because the ozone layer absorbs ultraviolet (UV) radiation from the Sun and releases thermal energy!
                      </p>
                    ) : (
                      <p className="font-serif-display text-base sm:text-lg font-bold text-[#1C1E1B] leading-snug">
                        Which atmospheric layer contains the ozone layer and gets warmer with increasing altitude?
                      </p>
                    )}
                  </div>

                  <p className="text-[11px] text-[#6B7267]">
                    {heroCardFlipped ? 'Click again to flip back' : 'Click card to reveal answer'}
                  </p>
                </div>
              </div>
            )}

            {/* 3. Interactive Practice Quiz Preview */}
            {heroTab === 'quiz' && (
              <div className="space-y-3.5 animate-fade-in max-w-xl mx-auto w-full text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-code font-bold text-[#1B4332] bg-[#E8F5E9] px-2.5 py-0.5 rounded">
                    Practice Question 1 of 5
                  </span>
                  <span className="text-xs text-[#6B7267]">Multiple Choice</span>
                </div>

                <p className="text-sm font-serif-display font-bold text-[#1C1E1B]">
                  What is the primary greenhouse gas by total volume in Earth's natural atmosphere?
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 0, label: 'A. Carbon Dioxide (CO₂)', correct: false },
                    { id: 1, label: 'B. Water Vapor (H₂O)', correct: true },
                    { id: 2, label: 'C. Methane (CH₄)', correct: false },
                    { id: 3, label: 'D. Nitrous Oxide (N₂O)', correct: false },
                  ].map((opt) => {
                    const isSelected = heroQuizAnswered === opt.id;
                    const isCorrect = opt.correct;
                    let btnClass = 'bg-[#FAF8F5] border-[#DCD6C7] text-[#1C1E1B] hover:border-emerald-400';
                    if (heroQuizAnswered !== null) {
                      if (isCorrect) btnClass = 'bg-[#E8F5E9] border-emerald-500 text-[#1B4332] font-bold';
                      else if (isSelected && !isCorrect) btnClass = 'bg-rose-50 border-rose-300 text-rose-800 font-semibold';
                    }
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setHeroQuizAnswered(opt.id)}
                        className={`p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${btnClass}`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {heroQuizAnswered !== null && (
                  <div className="p-3 rounded-xl bg-[#E8F5E9] border border-emerald-300 text-xs text-[#1B4332] flex items-start gap-2">
                    <Check className="w-4 h-4 shrink-0 mt-0.5 font-bold" />
                    <span><strong>Rationale:</strong> Water vapor accounts for 60% of the natural greenhouse effect, followed by CO₂. Great active recall drill!</span>
                  </div>
                )}
              </div>
            )}

            {/* 4. Study Plan Checklist Preview */}
            {heroTab === 'plan' && (
              <div className="space-y-3 animate-fade-in max-w-lg mx-auto w-full text-left">
                <div className="flex items-center justify-between border-b border-[#E8E4D9] pb-2">
                  <span className="text-xs font-mono-code font-bold uppercase text-[#1B4332]">
                    Day 1 Revision Roadmap • 45 Mins
                  </span>
                  <span className="text-xs text-[#6B7267]">Exam in 5 Days</span>
                </div>
                <div className="space-y-2">
                  {[
                    { title: 'Read Atmospheric Pressure Derivations', dur: '15 min', done: true },
                    { title: 'Practice 10 Active Recall Flashcards', dur: '10 min', done: true },
                    { title: 'Take Self-Assessment Multiple Choice Quiz', dur: '15 min', done: false },
                    { title: 'Review Mistakes & Formula Cheat Sheet', dur: '5 min', done: false },
                  ].map((task, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                        task.done ? 'bg-[#E8F5E9]/60 border-emerald-200 text-[#1B4332]' : 'bg-[#FAF8F5] border-[#E8E4D9] text-[#1C1E1B]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                            task.done ? 'bg-[#1B4332] text-white' : 'border border-[#DCD6C7]'
                          }`}
                        >
                          {task.done && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className={task.done ? 'line-through text-[#6B7267]' : 'font-medium'}>{task.title}</span>
                      </div>
                      <span className="text-[11px] font-mono-code text-[#6B7267]">{task.dur}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Visual Learning Diagram Preview */}
            {heroTab === 'visual' && (
              <div className="space-y-3 animate-fade-in text-center max-w-lg mx-auto w-full">
                <span className="text-xs font-mono-code font-bold text-[#1B4332] bg-[#E8F5E9] px-2.5 py-0.5 rounded">
                  Interactive Concept Diagram • Atmospheric Layers
                </span>
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E4D9] flex items-center justify-center gap-4 text-xs font-mono-code">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-[#6B7267]">Exosphere (600km)</span>
                    <div className="w-16 h-4 bg-teal-900/10 rounded border border-teal-800/30 flex items-center justify-center text-[9px]">Space</div>
                    <div className="w-20 h-4 bg-cyan-900/10 rounded border border-cyan-800/30 flex items-center justify-center text-[9px]">Thermosphere</div>
                    <div className="w-24 h-4 bg-emerald-900/10 rounded border border-emerald-800/30 flex items-center justify-center text-[9px]">Mesosphere</div>
                    <div className="w-28 h-5 bg-amber-900/10 rounded border border-amber-600/40 flex items-center justify-center text-[10px] font-bold text-amber-900">Stratosphere (Ozone)</div>
                    <div className="w-32 h-6 bg-emerald-700/20 rounded border border-emerald-700/40 flex items-center justify-center text-[10px] font-bold text-[#1B4332]">Troposphere (Weather)</div>
                    <span className="text-[10px] text-[#1B4332] font-bold">🌍 Earth's Surface (0km)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 05 — LANDING PAGE FEATURES: ONE WORKSPACE. MANY WAYS TO LEARN. */}
      <section id="features-section" className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4332] bg-[#E8F5E9] border border-emerald-300 px-3 py-1 rounded-full inline-block">
            Comprehensive Learning Ecosystem
          </span>
          <h2 className="font-serif-display text-3xl sm:text-5xl font-bold text-[#1C1E1B]">
            ONE WORKSPACE.
            <br />
            <span className="text-[#1B4332]">MANY WAYS TO LEARN.</span>
          </h2>
          <p className="text-[#555A50] text-sm sm:text-base leading-relaxed">
            StudyFlow gives you everything you need to understand difficult concepts, test your memory, and prepare for exams with confidence.
          </p>
        </div>

        {/* 6 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* 1. SMART NOTES */}
          <div className="bg-white p-7 rounded-2xl border border-[#E5E0D3] hover:border-emerald-500/60 hover:shadow-[0_6px_24px_rgba(45,106,79,0.08)] transition-all space-y-3.5 shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] border border-emerald-200 flex items-center justify-center text-[#1B4332]">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-serif-display text-xl font-bold text-[#1C1E1B]">
              SMART NOTES
            </h3>
            <p className="text-[#555A50] text-sm leading-relaxed">
              Organize and improve study material with executive summaries, key terms, and highlighted takeaways.
            </p>
          </div>

          {/* 2. AI EXPLAINER */}
          <div className="bg-white p-7 rounded-2xl border border-[#E5E0D3] hover:border-emerald-500/60 hover:shadow-[0_6px_24px_rgba(45,106,79,0.08)] transition-all space-y-3.5 shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] border border-emerald-200 flex items-center justify-center text-[#1B4332]">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h3 className="font-serif-display text-xl font-bold text-[#1C1E1B]">
              AI EXPLAINER
            </h3>
            <p className="text-[#555A50] text-sm leading-relaxed">
              Break difficult concepts into understandable explanations using intuitive analogies and step-by-step guidance.
            </p>
          </div>

          {/* 3. FLASHCARDS */}
          <div className="bg-white p-7 rounded-2xl border border-[#E5E0D3] hover:border-emerald-500/60 hover:shadow-[0_6px_24px_rgba(45,106,79,0.08)] transition-all space-y-3.5 shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] border border-emerald-200 flex items-center justify-center text-[#1B4332]">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-serif-display text-xl font-bold text-[#1C1E1B]">
              FLASHCARDS
            </h3>
            <p className="text-[#555A50] text-sm leading-relaxed">
              Turn important concepts into active recall practice with smooth flips and spaced repetition tracking.
            </p>
          </div>

          {/* 4. PRACTICE */}
          <div className="bg-white p-7 rounded-2xl border border-[#E5E0D3] hover:border-emerald-500/60 hover:shadow-[0_6px_24px_rgba(45,106,79,0.08)] transition-all space-y-3.5 shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] border border-emerald-200 flex items-center justify-center text-[#1B4332]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="font-serif-display text-xl font-bold text-[#1C1E1B]">
              PRACTICE
            </h3>
            <p className="text-[#555A50] text-sm leading-relaxed">
              Create questions from the student's learning material with instant feedback and mistake reviews.
            </p>
          </div>

          {/* 5. STUDY PLAN */}
          <div className="bg-white p-7 rounded-2xl border border-[#E5E0D3] hover:border-emerald-500/60 hover:shadow-[0_6px_24px_rgba(45,106,79,0.08)] transition-all space-y-3.5 shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] border border-emerald-200 flex items-center justify-center text-[#1B4332]">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-serif-display text-xl font-bold text-[#1C1E1B]">
              STUDY PLAN
            </h3>
            <p className="text-[#555A50] text-sm leading-relaxed">
              Organize upcoming learning tasks with clear deadlines, session durations, and realistic daily goals.
            </p>
          </div>

          {/* 6. VISUAL LEARNING */}
          <div className="bg-white p-7 rounded-2xl border border-[#E5E0D3] hover:border-emerald-500/60 hover:shadow-[0_6px_24px_rgba(45,106,79,0.08)] transition-all space-y-3.5 shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] border border-emerald-200 flex items-center justify-center text-[#1B4332]">
              <Atom className="w-5 h-5" />
            </div>
            <h3 className="font-serif-display text-xl font-bold text-[#1C1E1B]">
              VISUAL LEARNING
            </h3>
            <p className="text-[#555A50] text-sm leading-relaxed">
              Understand selected topics through diagrams, interactive models, and visual step-by-step explanations.
            </p>
          </div>
        </div>
      </section>

      {/* 06 — HOW IT WORKS: 4 STEPS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4332] bg-[#E8F5E9] border border-emerald-300 px-3 py-1 rounded-full inline-block">
            Simple 4-Step Process
          </span>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#1C1E1B]">
            HOW STUDYFLOW WORKS
          </h2>
          <p className="text-[#555A50] text-sm sm:text-base">
            From raw study materials to exam-ready confidence in four straightforward steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E0D3] space-y-3 relative shadow-xs">
            <div className="text-3xl font-serif-display font-bold text-[#1B4332]/30">
              01
            </div>
            <h3 className="font-serif-display text-lg font-bold text-[#1C1E1B]">
              CHOOSE
            </h3>
            <p className="text-xs sm:text-sm text-[#555A50] leading-relaxed">
              Choose the subjects and topics you want to learn, tailored to your academic standard.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E0D3] space-y-3 relative shadow-xs">
            <div className="text-3xl font-serif-display font-bold text-[#1B4332]/30">
              02
            </div>
            <h3 className="font-serif-display text-lg font-bold text-[#1C1E1B]">
              ADD
            </h3>
            <p className="text-xs sm:text-sm text-[#555A50] leading-relaxed">
              Add your notes, paste syllabus topics, or snap textbook pages with your camera.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E0D3] space-y-3 relative shadow-xs">
            <div className="text-3xl font-serif-display font-bold text-[#1B4332]/30">
              03
            </div>
            <h3 className="font-serif-display text-lg font-bold text-[#1C1E1B]">
              STUDY
            </h3>
            <p className="text-xs sm:text-sm text-[#555A50] leading-relaxed">
              Use AI-assisted explanations, 3D active-recall flashcards, and instant practice tests.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E0D3] space-y-3 relative shadow-xs">
            <div className="text-3xl font-serif-display font-bold text-[#1B4332]/30">
              04
            </div>
            <h3 className="font-serif-display text-lg font-bold text-[#1C1E1B]">
              MASTER
            </h3>
            <p className="text-xs sm:text-sm text-[#555A50] leading-relaxed">
              Review difficult areas, track real progress, and continue practising until you're ready.
            </p>
          </div>
        </div>
      </section>

      {/* INTERACTIVE QUICK-START SAMPLE LAUNCHER */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E5E0D3] shadow-[0_4px_24px_rgba(45,106,79,0.06)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E4D9] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#2D6A4F] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Instant Preview
                </span>
              </div>
              <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#1C1E1B] mt-1">
                Try Preloaded Study Materials
              </h2>
            </div>
            
            {/* Category Filter Badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              {['All', 'Biology', 'AI', 'Psychology', 'Economics'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedQuickFilter(cat)}
                  className={`text-xs px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                    selectedQuickFilter === cat
                      ? 'bg-[#E3EDE5] border-emerald-300 text-[#1B4332] font-semibold'
                      : 'bg-[#FAF8F5] border-[#E2DDCF] text-[#555A50] hover:text-[#1C1E1B] hover:bg-[#F3EFE6]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTopics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => onSelectSample(topic.id)}
                className="group p-5 rounded-2xl border border-[#E8E4D9] hover:border-emerald-500/60 hover:shadow-[0_6px_24px_rgba(45,106,79,0.1)] bg-[#FCFBF8] hover:bg-white transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono-code font-semibold px-2.5 py-0.5 rounded bg-[#E8F5E9] text-[#1B4332] border border-emerald-200">
                      {topic.category}
                    </span>
                    <span className="text-xs text-[#6B7267] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#2D6A4F]" />
                      {topic.estimatedReadTime}
                    </span>
                  </div>
                  <h3 className="font-serif-display text-lg font-semibold text-[#1C1E1B] group-hover:text-[#1B4332] transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-[#555A50] line-clamp-2 mt-1.5 leading-relaxed font-normal">
                    {topic.notes}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#EFECE3] flex items-center justify-between text-xs font-semibold text-[#555A50] group-hover:text-[#1B4332] transition-colors">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    Load notes & test workspace
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 08 — SOCIAL PROOF & AUTHENTIC TRUST */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-[#FAF8F5] rounded-3xl p-8 sm:p-10 border border-[#E5E0D3] space-y-6 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] border border-emerald-200 text-[#1B4332] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4332]">
              Active Learning Framework
            </span>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1C1E1B]">
              BUILT FOR ACTIVE LEARNING
            </h2>
            <p className="text-sm text-[#555A50] max-w-xl mx-auto leading-relaxed">
              Real understanding happens when you engage actively with concepts rather than passively reading.
            </p>
          </div>

          {/* Authentic Core Pillars Loop */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <span className="px-4 py-2 rounded-xl bg-white border border-[#D5CFBF] font-mono-code text-xs font-bold text-[#1B4332] shadow-xs">
              Notes
            </span>
            <span className="text-[#8A9085] font-bold text-sm">+</span>
            <span className="px-4 py-2 rounded-xl bg-white border border-[#D5CFBF] font-mono-code text-xs font-bold text-[#1B4332] shadow-xs">
              Understanding
            </span>
            <span className="text-[#8A9085] font-bold text-sm">+</span>
            <span className="px-4 py-2 rounded-xl bg-white border border-[#D5CFBF] font-mono-code text-xs font-bold text-[#1B4332] shadow-xs">
              Practice
            </span>
            <span className="text-[#8A9085] font-bold text-sm">+</span>
            <span className="px-4 py-2 rounded-xl bg-white border border-[#D5CFBF] font-mono-code text-xs font-bold text-[#1B4332] shadow-xs">
              Revision
            </span>
          </div>
        </div>
      </section>

      {/* 47 — FINAL CALL TO ACTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="bg-gradient-to-b from-[#1B4332] to-[#143225] text-white rounded-3xl p-8 sm:p-12 space-y-6 shadow-xl">
          <div className="space-y-3">
            <h2 className="font-serif-display text-3xl sm:text-5xl font-bold tracking-tight">
              READY TO BUILD
              <br />
              YOUR STUDY SPACE?
            </h2>
            <p className="text-sm sm:text-base text-[#D8F3DC] max-w-lg mx-auto leading-relaxed">
              Start for free and bring your notes, practice and learning goals into one place.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onStartStudying}
              className="px-8 py-3.5 rounded-xl bg-[#FAF8F5] hover:bg-white text-[#1B4332] font-bold text-sm sm:text-base transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <span>START FOR FREE</span>
              <ArrowRight className="w-4 h-4 text-[#1B4332]" />
            </button>
          </div>
        </div>
      </section>

      {/* 48 — FOOTER */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 border-t border-[#E8E4D9] text-[#6B7267] text-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#1B4332] text-white flex items-center justify-center font-serif-display font-bold text-xs">
              S
            </div>
            <span className="font-serif-display font-bold text-sm text-[#1C1E1B]">STUDYFLOW</span>
            <span>•</span>
            <span className="font-mono-code text-[11px] text-[#2D6A4F] font-bold">LEARN • PRACTISE • REVISE</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-medium">
            <button onClick={() => scrollToSection('features-section')} className="hover:text-[#1B4332] cursor-pointer">
              Features
            </button>
            <button onClick={() => scrollToSection('features-section')} className="hover:text-[#1B4332] cursor-pointer">
              How it works
            </button>
            <button onClick={onNavigateCaseStudy} className="hover:text-[#1B4332] cursor-pointer">
              Privacy
            </button>
            <button onClick={onNavigateCaseStudy} className="hover:text-[#1B4332] cursor-pointer">
              Terms
            </button>
            <button onClick={onNavigateCaseStudy} className="hover:text-[#1B4332] cursor-pointer">
              Contact
            </button>
            <button onClick={onStartStudying} className="text-[#1B4332] font-bold hover:underline cursor-pointer">
              Sign In
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
