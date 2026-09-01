import React, { useState } from 'react';
import { ExplanationData } from '../../types';
import { Lightbulb, BookOpen, Sparkles, HelpCircle, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

interface ExplanationTabProps {
  topic: string;
  explanation: ExplanationData;
  onExplainCustomConcept?: (concept: string) => Promise<void>;
  isLoadingCustom?: boolean;
}

export const ExplanationTab: React.FC<ExplanationTabProps> = ({
  topic,
  explanation,
  onExplainCustomConcept,
  isLoadingCustom = false,
}) => {
  const [customConcept, setCustomConcept] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customConcept.trim() || !onExplainCustomConcept) return;
    onExplainCustomConcept(customConcept.trim());
  };

  return (
    <div className="space-y-8 max-w-4xl text-[#1C1E1B]">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E8E4D9]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-code font-semibold uppercase tracking-wider text-[#1B4332] bg-[#E8F5E9] border border-emerald-300 px-2 py-0.5 rounded">
              Feynman Technique
            </span>
            <span className="text-xs text-[#555A50] font-medium">
              Intuitive, jargon-free breakdown
            </span>
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#1C1E1B] mt-1">
            Explain It Simply
          </h2>
        </div>
      </div>

      {/* Drill-down concept search bar */}
      <form onSubmit={handleCustomSubmit} className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E0D3] shadow-xs">
        <label htmlFor="custom-concept-input" className="block text-xs font-semibold uppercase tracking-wider text-[#333830] mb-2">
          Have a specific difficult term or concept to simplify?
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="custom-concept-input"
            type="text"
            value={customConcept}
            onChange={(e) => setCustomConcept(e.target.value)}
            placeholder="e.g., Photosystem II, Gradient Descent, The Phillips Curve..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#DCD6C7] bg-[#FAF8F5] text-[#1C1E1B] placeholder:text-[#888E83] text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-600"
          />
          <button
            type="submit"
            disabled={!customConcept.trim() || isLoadingCustom}
            className="px-5 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] disabled:bg-[#E2DDCF] disabled:text-[#888E83] text-[#FAF8F5] text-xs font-bold transition-all shadow-[0_4px_14px_rgba(27,67,50,0.2)] flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoadingCustom ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FAF8F5]" />
                <span>Explaining...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#FAF8F5]" />
                <span>Explain Term</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* 1. Plain-Language Explanation */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E0D3] shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B4332]">
          <div className="w-6 h-6 rounded-lg bg-[#E8F5E9] border border-emerald-300 text-[#1B4332] flex items-center justify-center">
            <Lightbulb className="w-3.5 h-3.5" />
          </div>
          Simple Explanation
        </div>
        <p className="text-base sm:text-lg text-[#2C302A] leading-relaxed font-normal">
          {explanation.simpleExplanation}
        </p>
      </div>

      {/* 2. Real-World Analogy / Example */}
      <div className="bg-[#FAF8F5] rounded-2xl p-6 sm:p-8 border border-[#E2DDCF] shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B4332]">
          <div className="w-6 h-6 rounded-lg bg-[#E8F5E9] border border-emerald-300 text-[#1B4332] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          Real-World Analogy & Example
        </div>
        <p className="text-base sm:text-lg text-[#1C1E1B] font-serif-display italic leading-relaxed">
          "{explanation.everydayAnalogy}"
        </p>
      </div>

      {/* 3. Important Terms Dictionary */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#333830]">
          <BookOpen className="w-4 h-4 text-[#1B4332]" />
          Important Terms (Clear Language)
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {explanation.keyTerms.map((t, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-xl border border-[#E5E0D3] shadow-xs space-y-1.5"
            >
              <span className="font-mono-code font-bold text-xs uppercase tracking-wide text-[#1B4332] block">
                {t.term}
              </span>
              <p className="text-xs sm:text-sm text-[#555A50] leading-relaxed">
                {t.definition}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Quick Recap */}
      <div className="bg-white text-[#1C1E1B] rounded-2xl p-6 sm:p-8 border border-[#E5E0D3] space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B4332]">
          <CheckCircle2 className="w-4 h-4" />
          Quick Recap (30-Second Summary)
        </div>
        <ul className="space-y-2.5">
          {explanation.quickRecap.map((recap, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm text-[#333830]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1B4332] mt-2 shrink-0" />
              <span className="leading-relaxed">{recap}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
