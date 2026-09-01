import React, { useState } from 'react';
import { Lightbulb, X, Sparkles, Loader2, BookOpen, CheckCircle2 } from 'lucide-react';
import { ExplanationData } from '../types';

interface ExplainSimplyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExplainSimplyModal: React.FC<ExplainSimplyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [concept, setConcept] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExplanationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExplain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim() || loading) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/study/explain-simply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept: concept.trim() }),
      });
      const data = await res.json();
      if (data.data) {
        setResult(data.data);
      } else {
        throw new Error('Could not simplify concept');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate simple explanation');
    } finally {
      setLoading(false);
    }
  };

  const popularConcepts = [
    'Photosystem II',
    'Gradient Descent',
    'The Phillips Curve',
    'Atmospheric Pressure',
    'Quantum Superposition',
    'Cognitive Load Theory',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1E1B]/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#E5E0D3] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 text-[#1C1E1B]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E8E4D9] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F5E9] text-[#1B4332] flex items-center justify-center border border-emerald-300">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4332]">
                Feynman Engine
              </span>
              <h2 className="font-serif-display text-2xl font-bold text-[#1C1E1B]">
                EXPLAIN IT SIMPLY
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#6B7267] hover:text-[#1C1E1B] hover:bg-[#F4EFE6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleExplain} className="space-y-3">
          <label htmlFor="modal-concept-input" className="block text-xs font-semibold uppercase tracking-wider text-[#333830]">
            Enter a difficult concept, term, or mechanism:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="modal-concept-input"
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="e.g., Atmospheric Pressure, Epigenetics, Opportunity Cost..."
              className="flex-1 px-4 py-3 rounded-xl border border-[#DCD6C7] bg-[#FAF8F5] text-[#1C1E1B] placeholder:text-[#888E83] text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-600"
            />
            <button
              type="submit"
              disabled={!concept.trim() || loading}
              className="px-6 py-3 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] disabled:bg-[#E2DDCF] disabled:text-[#888E83] text-[#FAF8F5] text-xs font-bold transition-all shadow-[0_4px_16px_rgba(27,67,50,0.25)] flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#FAF8F5]" />
                  <span>Explaining...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#FAF8F5]" />
                  <span>Explain Simply</span>
                </>
              )}
            </button>
          </div>

          {/* Quick concept pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs font-mono-code text-[#6B7267]">Quick suggestions:</span>
            {popularConcepts.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setConcept(item)}
                className="text-xs px-2.5 py-0.5 rounded-lg border border-[#DCD6C7] bg-[#FAF8F5] hover:bg-[#EFECE3] text-[#333830] hover:text-[#1B4332] transition-colors cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
        </form>

        {/* Results display */}
        {result && (
          <div className="space-y-4 pt-2 animate-in fade-in duration-300">
            {/* Simple Explanation */}
            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E2DDCF] space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1B4332] block">
                Simple Explanation
              </span>
              <p className="text-sm sm:text-base text-[#2C302A] leading-relaxed font-normal">
                {result.simpleExplanation}
              </p>
            </div>

            {/* Analogy */}
            <div className="bg-[#E8F5E9]/70 p-5 rounded-2xl border border-emerald-300 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1B4332] block">
                Everyday Analogy
              </span>
              <p className="text-sm sm:text-base text-[#1B4332] font-serif-display italic leading-relaxed">
                "{result.everydayAnalogy}"
              </p>
            </div>

            {/* Key Terms */}
            {result.keyTerms && result.keyTerms.length > 0 && (
              <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E2DDCF] space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1C1E1B] block">
                  Important Terms
                </span>
                <div className="space-y-2">
                  {result.keyTerms.map((kt, i) => (
                    <div key={i} className="text-xs sm:text-sm">
                      <strong className="text-[#1B4332] font-mono-code font-semibold">{kt.term}: </strong>
                      <span className="text-[#555A50]">{kt.definition}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Recap */}
            {result.quickRecap && result.quickRecap.length > 0 && (
              <div className="bg-white text-[#1C1E1B] p-5 rounded-2xl border border-[#E5E0D3] space-y-2 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1B4332] block">
                  Quick Recap
                </span>
                <ul className="space-y-1.5 text-xs sm:text-sm text-[#333830]">
                  {result.quickRecap.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1B4332] mt-1.5 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
