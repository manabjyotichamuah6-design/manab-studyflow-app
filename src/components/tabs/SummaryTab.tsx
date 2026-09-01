import React, { useState } from 'react';
import { Copy, Check, BookOpen, Clock, Sparkles } from 'lucide-react';

interface SummaryTabProps {
  topic: string;
  summary: string;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({ topic, summary }) => {
  const [copied, setCopied] = useState(false);

  const wordCount = summary.split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const handleCopy = () => {
    navigator.clipboard.writeText(`SUMMARY: ${topic}\n\n${summary}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const paragraphs = summary.split('\n\n').filter(Boolean);

  return (
    <div className="space-y-6 max-w-4xl text-[#1C1E1B]">
      {/* Header bar with meta information */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E8E4D9]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-code font-semibold uppercase tracking-wider text-[#1B4332] bg-[#E8F5E9] border border-emerald-300 px-2 py-0.5 rounded">
              Synthesis
            </span>
            <span className="text-xs text-[#555A50] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#2D6A4F]" />
              ~{readTimeMinutes} min read ({wordCount} words)
            </span>
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#1C1E1B] mt-1">
            Executive Summary
          </h2>
        </div>

        <button
          id="copy-summary-btn"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DCD6C7] text-[#333830] bg-white hover:bg-[#F4EFE6] hover:text-[#1C1E1B] text-xs font-medium transition-colors shadow-xs active:scale-95 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#1B4332]" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#6B7267]" />
              <span>Copy Summary</span>
            </>
          )}
        </button>
      </div>

      {/* Main summary editorial container */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E0D3] shadow-xs space-y-4">
        {paragraphs.map((p, idx) => (
          <p
            key={idx}
            className="text-[#2C302A] text-base sm:text-lg leading-relaxed font-normal"
          >
            {p}
          </p>
        ))}
      </div>

      {/* Revision tip card */}
      <div className="bg-[#FAF8F5] rounded-xl p-4 border border-[#E2DDCF] flex items-start gap-3">
        <div className="p-2 rounded-lg bg-[#E8F5E9] border border-emerald-300 text-[#1B4332] shrink-0 mt-0.5">
          <BookOpen className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1C1E1B]">
            Active Study Recommendation
          </h4>
          <p className="text-xs sm:text-sm text-[#555A50] mt-0.5 leading-relaxed">
            After reading this summary, switch to the <strong className="text-[#1B4332]">Flashcards</strong> or <strong className="text-[#1B4332]">Quiz</strong> tab to test active retrieval. Testing your recall is 3x more effective than passive re-reading.
          </p>
        </div>
      </div>
    </div>
  );
};
