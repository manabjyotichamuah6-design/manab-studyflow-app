import React from 'react';
import {
  FileText,
  Lightbulb,
  CheckCircle2,
  Code2,
  Cpu,
  Layers,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  BookOpen,
  ArrowLeft,
  Home,
} from 'lucide-react';
import { AppView } from '../types';

interface CaseStudyViewProps {
  onNavigate?: (view: AppView) => void;
}

export const CaseStudyView: React.FC<CaseStudyViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-12 max-w-4xl mx-auto py-8 text-[#1C1E1B]">
      {/* Top Blue Back to Home / App Navigation Sign */}
      <div className="flex items-center justify-between pb-2">
        <button
          type="button"
          onClick={() => onNavigate ? onNavigate('landing') : window.history.back()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-900 border border-blue-200 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 group"
        >
          <ArrowLeft className="w-4 h-4 text-blue-600 group-hover:-translate-x-1 transition-transform" />
          <span>← Back to App / Home</span>
        </button>
      </div>

      {/* Case study Header */}
      <div className="border-b border-[#E8E4D9] pb-8 space-y-4">
        <div className="flex items-center gap-2">
          <span className="bg-[#1B4332] text-[#FAF8F5] text-xs font-mono-code font-bold uppercase tracking-wider px-2.5 py-1 rounded">
            PERSONAL PROJECT
          </span>
          <span className="text-xs font-mono-code text-[#555A50]">
            Case Study & Architecture Blueprint
          </span>
        </div>

        <h1 className="font-serif-display text-4xl sm:text-5xl font-bold text-[#1C1E1B] leading-tight">
          StudyFlow AI: Transforming Raw Notes into Active Study Systems
        </h1>

        <p className="text-base sm:text-lg text-[#555A50] leading-relaxed font-normal">
          An exploration into educational user experience, structured LLM generation, and cognitive load reduction for independent learners.
        </p>
      </div>

      {/* 1. THE PROBLEM */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E5E0D3] shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4332]">
          <AlertTriangle className="w-4 h-4" />
          THE PROBLEM
        </div>
        <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#1C1E1B]">
          The Passive Re-Reading Trap
        </h2>
        <p className="text-[#333830] text-base leading-relaxed">
          Students often possess extensive study materials—lecture slides, textbook PDFs, and handwritten notes—but struggle to convert them into structured, active revision resources.
        </p>
        <p className="text-[#333830] text-base leading-relaxed">
          Cognitive psychology repeatedly proves that passive re-reading and linear highlighting provide an illusion of competence while yielding poor long-term retention. However, manually creating flashcards, writing practice questions, and formulating day-by-day study schedules demands significant time and cognitive overhead.
        </p>
      </section>

      {/* 2. THE IDEA */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E5E0D3] shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4332]">
          <Lightbulb className="w-4 h-4" />
          THE IDEA
        </div>
        <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#1C1E1B]">
          AI-Assisted Educational Synthesis
        </h2>
        <p className="text-[#333830] text-base leading-relaxed">
          Use generative AI not as an open-ended conversational bot, but as a specialized compilation engine that takes raw source material and deterministically outputs structured learning artifacts across five proven learning modalities:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDCF]">
            <strong className="text-sm font-semibold text-[#1C1E1B] block">1. Executive Summaries</strong>
            <span className="text-xs text-[#555A50]">High-level conceptual anchor for macro understanding.</span>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDCF]">
            <strong className="text-sm font-semibold text-[#1C1E1B] block">2. Active Recall Flashcards</strong>
            <span className="text-xs text-[#555A50]">Retrieval cues with Easy/Practice/Mastered tracking.</span>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDCF]">
            <strong className="text-sm font-semibold text-[#1C1E1B] block">3. Practice Quizzes</strong>
            <span className="text-xs text-[#555A50]">Multiple-choice checks with immediate diagnostic rationales.</span>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDCF]">
            <strong className="text-sm font-semibold text-[#1C1E1B] block">4. "Explain Simply" (Feynman)</strong>
            <span className="text-xs text-[#555A50]">De-jargonized explanations with real-world analogies.</span>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDCF] sm:col-span-2">
            <strong className="text-sm font-semibold text-[#1C1E1B] block">5. Structured Study Schedules</strong>
            <span className="text-xs text-[#555A50]">Step-by-step day-by-day revision roadmaps based on available minutes.</span>
          </div>
        </div>
      </section>

      {/* 3. MY ROLE */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E5E0D3] shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4332]">
          <GraduationCap className="w-4 h-4" />
          MY ROLE
        </div>
        <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#1C1E1B]">
          End-to-End Product Architecture
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1">
            <h4 className="font-semibold text-sm text-[#1B4332]">Product Concept</h4>
            <p className="text-xs text-[#555A50] leading-relaxed">
              Formulated the core value proposition, modal taxonomy, and botanical vanilla aesthetic guidelines.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm text-[#1B4332]">UI/UX Design</h4>
            <p className="text-xs text-[#555A50] leading-relaxed">
              Designed the editorial typography hierarchy, responsive touch targets, and tactile card flip mechanics.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm text-[#1B4332]">AI-Assisted Development</h4>
            <p className="text-xs text-[#555A50] leading-relaxed">
              Architected structured GenAI schema definitions, temperature tuning, and fallback recovery pathways.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm text-[#1B4332]">Frontend Development</h4>
            <p className="text-xs text-[#555A50] leading-relaxed">
              Engineered React 19 state machines, local storage persistence engines, and accessible keyboard navigation.
            </p>
          </div>
        </div>
      </section>

      {/* 4. TECHNOLOGY */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E5E0D3] shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4332]">
          <Code2 className="w-4 h-4" />
          TECHNOLOGY STACK
        </div>
        <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#1C1E1B]">
          Technologies Implemented
        </h2>
        <p className="text-xs text-[#555A50] font-mono-code">
          Only technologies actually employed in this application are listed:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDCF]">
            <span className="text-xs font-mono-code font-bold text-[#1C1E1B] block">React 19</span>
            <span className="text-[11px] text-[#555A50]">Component architecture & hooks</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDCF]">
            <span className="text-xs font-mono-code font-bold text-[#1C1E1B] block">TypeScript 5.8</span>
            <span className="text-[11px] text-[#555A50]">Strict type safety & schema sync</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDCF]">
            <span className="text-xs font-mono-code font-bold text-[#1C1E1B] block">Tailwind CSS v4</span>
            <span className="text-[11px] text-[#555A50]">Creamy vanilla palette & responsive grid</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDCF]">
            <span className="text-xs font-mono-code font-bold text-[#1C1E1B] block">Express 4.21</span>
            <span className="text-[11px] text-[#555A50]">Backend API & Gemini proxy</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDCF]">
            <span className="text-xs font-mono-code font-bold text-[#1C1E1B] block">@google/genai SDK</span>
            <span className="text-[11px] text-[#555A50]">Gemini 3.7 Flash structured inference</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDCF]">
            <span className="text-xs font-mono-code font-bold text-[#1C1E1B] block">Lucide React</span>
            <span className="text-[11px] text-[#555A50]">Minimal vector iconography</span>
          </div>
        </div>
      </section>

      {/* 5. CHALLENGES */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E5E0D3] shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4332]">
          <Cpu className="w-4 h-4" />
          CHALLENGES
        </div>
        <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#1C1E1B]">
          Engineering & Product Hurdles
        </h2>
        <div className="space-y-3 pt-1">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDCF] space-y-1">
            <h4 className="font-semibold text-sm text-[#1B4332]">1. Strict JSON Output Schema Reliability</h4>
            <p className="text-xs sm:text-sm text-[#555A50] leading-relaxed">
              Study material can range from raw medical terminology to historical chronologies. Defining a universal Type schema for flashcards, multi-choice distractors, and day-by-day steps required fine-tuning prompts to ensure valid parsing without hallucinated array formats.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDCF] space-y-1">
            <h4 className="font-semibold text-sm text-[#1B4332]">2. Balancing Simplification with Academic Rigor</h4>
            <p className="text-xs sm:text-sm text-[#555A50] leading-relaxed">
              The "Explain Simply" module needed to avoid condescending or oversimplified metaphors that lose scientific accuracy. The prompt explicitly instructs Gemini to focus on cause-and-effect mechanisms rather than empty catchphrases.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDCF] space-y-1">
            <h4 className="font-semibold text-sm text-[#1B4332]">3. Honest Statistics vs. Fabricated Vanity Metrics</h4>
            <p className="text-xs sm:text-sm text-[#555A50] leading-relaxed">
              Resisted the common AI prototype trend of showing fake user counts, fabricated streaks, or inflated mastery scores. If a user is new, the system presents an honest "START YOUR FIRST SESSION" prompt and only tracks authentic local actions.
            </p>
          </div>
        </div>
      </section>

      {/* 6. WHAT I LEARNED */}
      <section className="bg-[#FAF8F5] text-[#1C1E1B] rounded-3xl p-6 sm:p-10 border border-[#E2DDCF] space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4332]">
          <Sparkles className="w-4 h-4" />
          WHAT I LEARNED
        </div>
        <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#1C1E1B]">
          Key Takeaways
        </h2>
        <ul className="space-y-3 text-sm text-[#333830] leading-relaxed">
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-[#1B4332] mt-2 shrink-0" />
            <span>
              <strong className="text-[#1C1E1B]">LLMs excel as structured compilers:</strong> Rather than forcing users to chat back-and-forth, converting raw material into fixed educational artifacts yields a much higher UX completion rate.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-[#1B4332] mt-2 shrink-0" />
            <span>
              <strong className="text-[#1C1E1B]">Frictionless fallback pathways build trust:</strong> Integrating a robust local educational engine prevents blank loading screens if API keys are missing or rate limits occur.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-[#1B4332] mt-2 shrink-0" />
            <span>
              <strong className="text-[#1C1E1B]">Editorial botanical design fosters focus:</strong> Warm creamy vanilla tones, deep botanical forest greens, and high-contrast typography create a calm learning environment free from distracting visual noise.
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
};
