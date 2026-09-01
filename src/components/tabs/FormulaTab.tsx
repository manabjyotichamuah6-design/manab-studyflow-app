import React, { useState } from 'react';
import { FormulaItem } from '../../types';
import { Sigma, Copy, Check, Info, Sparkles, BookOpen, AlertCircle } from 'lucide-react';

interface FormulaTabProps {
  topic: string;
  subjectName?: string;
  formulas: FormulaItem[];
  keywords?: string[];
  isProblemSolving?: boolean;
}

export const FormulaTab: React.FC<FormulaTabProps> = ({
  topic,
  subjectName = 'Science / Problem Solving',
  formulas,
  keywords = [],
  isProblemSolving = true,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyFormula = (f: FormulaItem, idx: number) => {
    navigator.clipboard.writeText(`${f.name}\nFormula: ${f.formula}\nUnits: ${f.units || 'SI'}\nExplanation: ${f.explanation}`);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl text-[#1C1E1B]">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E8E4D9]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-code font-semibold uppercase tracking-wider text-[#1B4332] bg-[#E8F5E9] border border-emerald-300 px-2 py-0.5 rounded flex items-center gap-1">
              <Sigma className="w-3.5 h-3.5" />
              Formula & Keywords Engine
            </span>
            <span className="text-xs text-[#555A50]">
              {subjectName} • Precision Problem Solving
            </span>
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#1C1E1B] mt-1">
            Governing Equations & Keypoints
          </h2>
        </div>
      </div>

      {/* High-Yield Keywords Chips */}
      {keywords.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-[#E5E0D3] shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B4332]">
            <Sparkles className="w-4 h-4" />
            Core High-Yield Terminology & Exam Keywords
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#DCD6C7] text-xs font-mono-code font-semibold text-[#1C1E1B] hover:border-emerald-500 transition-colors"
              >
                #{kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Formula List */}
      {formulas.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#333830]">
              <Sigma className="w-4 h-4 text-[#1B4332]" />
              Master Formula Box ({formulas.length} Governing Relations)
            </div>
            <span className="text-xs font-mono-code text-[#6B7267]">
              LaTeX / Mathematical Notation
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {formulas.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-[#E5E0D3] hover:border-emerald-500/50 shadow-xs space-y-4 transition-all"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#E8E4D9] pb-3">
                  <div>
                    <span className="text-[10px] font-mono-code uppercase font-bold text-[#1B4332] bg-[#E8F5E9] px-2 py-0.5 rounded">
                      Equation #{idx + 1}
                    </span>
                    <h3 className="font-serif-display text-lg font-bold text-[#1C1E1B] mt-1">
                      {item.name}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleCopyFormula(item, idx)}
                    className="p-1.5 text-[#6B7267] hover:text-[#1B4332] rounded-lg hover:bg-[#FAF8F5] transition-colors cursor-pointer border border-[#DCD6C7] text-xs flex items-center gap-1 font-mono-code"
                    title="Copy equation"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#1B4332]" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Big Display Formula */}
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDCF] text-center overflow-x-auto">
                  <span className="font-mono-code text-lg sm:text-xl font-bold text-[#1B4332] tracking-wide inline-block py-1">
                    {item.formula}
                  </span>
                </div>

                {/* Explanation and Units */}
                <div className="space-y-2 text-xs sm:text-sm text-[#2C302A]">
                  <p className="leading-relaxed">
                    <strong className="text-[#1C1E1B] font-semibold">Physical Meaning: </strong>
                    {item.explanation}
                  </p>

                  {item.units && (
                    <div className="flex items-center gap-1.5 text-xs text-[#555A50] font-mono-code">
                      <strong className="text-[#1B4332]">Standard SI Units:</strong>
                      <span>{item.units}</span>
                    </div>
                  )}

                  {/* Variables Dictionary */}
                  {item.variables && item.variables.length > 0 && (
                    <div className="pt-2 border-t border-[#E8E4D9] grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {item.variables.map((v, vIdx) => (
                        <div key={vIdx} className="bg-white p-2 rounded-lg border border-[#E8E4D9] flex items-center gap-2">
                          <span className="font-mono-code font-bold text-[#1B4332] bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#DCD6C7]">
                            {v.symbol}
                          </span>
                          <span className="text-xs text-[#555A50]">{v.meaning}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 border border-[#E5E0D3] text-center max-w-xl mx-auto space-y-3">
          <Info className="w-8 h-8 text-[#1B4332] mx-auto opacity-70" />
          <h3 className="font-serif-display text-lg font-semibold text-[#1C1E1B]">
            Conceptual / Thematic Topic
          </h3>
          <p className="text-xs sm:text-sm text-[#555A50] leading-relaxed">
            This subject is qualitative/thematic rather than calculation-based. You can focus on the <strong className="text-[#1B4332]">Explain Simply</strong> and <strong className="text-[#1B4332]">Exam Revision</strong> tabs for high-yield thematic recall.
          </p>
        </div>
      )}

      {/* Professor Calculation Tips */}
      <div className="bg-[#FAF8F5] rounded-xl p-5 border border-[#E2DDCF] flex items-start gap-3">
        <div className="p-2 rounded-lg bg-[#E8F5E9] border border-emerald-300 text-[#1B4332] shrink-0 mt-0.5">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div className="text-xs sm:text-sm space-y-1">
          <h4 className="font-semibold uppercase tracking-wider text-[#1C1E1B]">
            Professor Dimensional Analysis Tip
          </h4>
          <p className="text-[#555A50] leading-relaxed">
            Before calculating final numerical answers on your exam, always perform a dimensional check: ensure both sides of the equality share identical SI unit exponents. Never forget negative signs in vector directions or thermodynamic heat transfers!
          </p>
        </div>
      </div>
    </div>
  );
};
