import React from 'react';
import {
  Sparkles,
  Lightbulb,
  Layers,
  HelpCircle,
  Calendar,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { AppView } from '../types';

interface AIToolsHubViewProps {
  onNavigate: (view: AppView) => void;
  onOpenExplainModal: () => void;
  onOpenFocusModal: () => void;
  hasApiKey: boolean;
}

export const AIToolsHubView: React.FC<AIToolsHubViewProps> = ({
  onNavigate,
  onOpenExplainModal,
  onOpenFocusModal,
  hasApiKey,
}) => {
  const tools = [
    {
      id: 'summarizer',
      title: 'Smart Notes Summarizer',
      badge: 'Quick Revision',
      description: 'Transform lengthy textbook chapters or lecture notes into 4-bullet summaries, key terms, and memorable takeaways.',
      icon: <Sparkles className="w-6 h-6 text-[#2D6A4F]" />,
      actionLabel: 'Open Notes to Summarize',
      action: () => onNavigate('notes'),
    },
    {
      id: 'explainer',
      title: '“Explain It Simply” (Feynman Tutor)',
      badge: 'Intuitive analogies',
      description: 'Break down any complex scientific, mathematical, or historical mechanism with relatable real-world analogies and ultra-simple language.',
      icon: <Lightbulb className="w-6 h-6 text-[#2D6A4F]" />,
      actionLabel: 'Try Explain Simply',
      action: onOpenExplainModal,
    },
    {
      id: 'flashcards',
      title: 'Active Recall Flashcards',
      badge: 'Spaced Retrieval',
      description: 'Generate 3D flipping flashcards from any topic or note. Mark cards as "Need Practice" or "Mastered" to focus on weak spots.',
      icon: <Layers className="w-6 h-6 text-[#2D6A4F]" />,
      actionLabel: 'Practice Flashcards',
      action: () => onNavigate('flashcards'),
    },
    {
      id: 'quiz',
      title: 'Practice Quiz Generator',
      badge: 'Self-Assessment',
      description: 'Create customizable practice quizzes (5, 10, or 15 questions) with detailed step-by-step diagnostic explanations for every choice.',
      icon: <HelpCircle className="w-6 h-6 text-[#2D6A4F]" />,
      actionLabel: 'Take Practice Quiz',
      action: () => onNavigate('quiz'),
    },
    {
      id: 'planner',
      title: 'Adaptive Study Planner',
      badge: 'Habit & Organization',
      description: 'Input your available minutes, target exam date, and topic priorities to generate a realistic, structured daily revision schedule.',
      icon: <Calendar className="w-6 h-6 text-[#2D6A4F]" />,
      actionLabel: 'View Study Planner',
      action: () => onNavigate('plan'),
    },
    {
      id: 'focus',
      title: 'Distraction-Free Focus Timer',
      badge: 'Pomodoro Flow',
      description: 'Set a 25-minute Pomodoro study block, eliminate multitasking, and log your completed topics to your authentic revision history.',
      icon: <ShieldCheck className="w-6 h-6 text-[#2D6A4F]" />,
      actionLabel: 'Start Focus Session',
      action: onOpenFocusModal,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-[#1C1E1B]">
      {/* Top Banner */}
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F] bg-[#E3EDE5] px-3 py-1 rounded-full inline-block mb-2">
          AI Study Companion Suite
        </span>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1E1B]">
          AI Learning & Revision Tools
        </h1>
        <p className="text-sm text-[#555A51] mt-1 max-w-2xl">
          Every tool is grounded in proven cognitive science: active recall, plain-language decomposition (Feynman technique), and structured practice.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="bg-[#FAF8F5] rounded-2xl border border-[#E8E4D9] p-6 hover:border-[#2D6A4F] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#E3EDE5] flex items-center justify-center">
                  {tool.icon}
                </div>
                <span className="text-[11px] font-mono-code font-bold bg-[#F4EFE6] text-[#1B4332] px-2.5 py-1 rounded-full border border-[#E8E4D9]">
                  {tool.badge}
                </span>
              </div>

              <h3 className="font-serif-display font-bold text-xl text-[#1C1E1B] mb-2">
                {tool.title}
              </h3>

              <p className="text-xs text-[#555A51] leading-relaxed mb-6">
                {tool.description}
              </p>
            </div>

            <button
              onClick={tool.action}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
            >
              <span>{tool.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Academic Honesty Guarantee Box */}
      <div className="bg-[#F4EFE6] rounded-2xl border border-[#E8E4D9] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-[#2D6A4F]" />
            <h3 className="font-serif-display font-bold text-lg text-[#1C1E1B]">
              Academic Integrity & Honest Learning
            </h3>
          </div>
          <p className="text-xs text-[#555A51] max-w-2xl leading-relaxed">
            StudyFlow AI is built to help you learn and understand topics deeply. Our tools prioritize hints, conceptual analogies, and step-by-step diagnostics rather than doing the thinking for you. Always verify critical course material against your syllabus.
          </p>
        </div>

        <button
          onClick={() => onNavigate('case-study')}
          className="px-5 py-2.5 rounded-xl border border-[#2D6A4F] text-[#1B4332] hover:bg-[#E3EDE5] text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
        >
          Read Design Case Study
        </button>
      </div>
    </div>
  );
};
