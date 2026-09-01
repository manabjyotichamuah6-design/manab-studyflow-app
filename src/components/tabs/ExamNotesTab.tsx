import React, { useState } from 'react';
import { ExamNotesData } from '../../types';
import { Sparkles, AlertTriangle, HelpCircle, Copy, Check, Printer, FileText, CheckCircle2, Bookmark } from 'lucide-react';

interface ExamNotesTabProps {
  topic: string;
  subjectName?: string;
  examNotes?: ExamNotesData;
  onSaveAsNote?: () => void;
}

export const ExamNotesTab: React.FC<ExamNotesTabProps> = ({
  topic,
  subjectName = 'Science',
  examNotes,
  onSaveAsNote,
}) => {
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const notes = examNotes || {
    cheatSheetSummary: `⚡ Last-Minute Exam Booster for ${topic}: Identify primary boundary assumptions, state governing theorems explicitly before substituting numbers, and perform an SI unit dimensional check on all final values.`,
    mustRememberFormulas: [
      `Primary Governing Law: Balance inputs against rate of change`,
      `Boundary check: Evaluate limits at initial state (t=0) and steady state (t→∞)`,
    ],
    keyPitfalls: [
      `Ignoring sign conventions (+ / - directions or exothermic / endothermic sign rules).`,
      `Confusing instantaneous rates with average values over an interval.`,
      `Substituting non-SI unit magnitudes into standard equations.`,
    ],
    highYieldQuestions: [
      `Derive the governing relationship from first principles under steady state constraints.`,
      `Explain the qualitative and quantitative impact when the primary driving variable is doubled.`,
    ],
  };

  const handleCopyCheatSheet = () => {
    const text = `=== LAST-MINUTE EXAM BOOSTER: ${topic} (${subjectName}) ===\n\nEXAM SUMMARY:\n${notes.cheatSheetSummary}\n\nMUST REMEMBER RULES / FORMULAS:\n${(notes.mustRememberFormulas || []).map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\nEXAM PITFALLS & TRAPS TO AVOID:\n${notes.keyPitfalls.map((p, i) => `⚠ ${p}`).join('\n')}\n\nHIGH-YIELD EXAM QUESTIONS:\n${notes.highYieldQuestions.map((q, i) => `Q: ${q}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    if (onSaveAsNote) {
      onSaveAsNote();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl text-[#1C1E1B]">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E8E4D9]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-code font-semibold uppercase tracking-wider text-[#1B4332] bg-[#E8F5E9] border border-emerald-300 px-2 py-0.5 rounded flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Exam Time Booster
            </span>
            <span className="text-xs text-[#555A50]">
              Last-Minute Revision Sheet • High-Yield Notes
            </span>
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#1C1E1B] mt-1">
            Exam Revision Sheet: {topic}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {onSaveAsNote && (
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#DCD6C7] text-[#1C1E1B] hover:border-emerald-600 text-xs font-semibold transition-colors cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" />
                  <span>Saved to Notes!</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5 text-[#1B4332]" />
                  <span>Save to Notes</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleCopyCheatSheet}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DCD6C7] bg-white hover:bg-[#F4EFE6] text-[#333830] text-xs font-medium transition-colors cursor-pointer shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#1B4332]" />
                <span>Copied Sheet</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#6B7267]" />
                <span>Copy Cheat-Sheet</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* 1. Core Summary Box */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E0D3] shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B4332]">
          <FileText className="w-4 h-4" />
          ⚡ 30-Second Exam Snapshot
        </div>
        <p className="text-base sm:text-lg text-[#2C302A] leading-relaxed font-normal">
          {notes.cheatSheetSummary}
        </p>
      </div>

      {/* 2. Must-Remember Formulas & Theorems */}
      {notes.mustRememberFormulas && notes.mustRememberFormulas.length > 0 && (
        <div className="bg-[#FAF8F5] rounded-2xl p-6 border border-[#E2DDCF] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B4332]">
            <Sparkles className="w-4 h-4" />
            Must-Remember Rules & Formulas for the Exam
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {notes.mustRememberFormulas.map((formula, idx) => (
              <div
                key={idx}
                className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#DCD6C7] flex items-center gap-3"
              >
                <span className="w-6 h-6 rounded-md bg-[#E8F5E9] text-[#1B4332] text-xs font-mono-code font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="font-mono-code text-xs sm:text-sm font-semibold text-[#1C1E1B]">
                  {formula}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Key Pitfalls & Common Exam Mistakes */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E0D3] shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
          <div className="w-6 h-6 rounded-lg bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          Common Exam Traps & Pitfalls to Avoid
        </div>
        <div className="space-y-3">
          {notes.keyPitfalls.map((pitfall, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3 text-xs sm:text-sm text-amber-950 leading-relaxed"
            >
              <span className="w-2 h-2 rounded-full bg-amber-600 mt-2 shrink-0" />
              <span>{pitfall}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. High-Yield Practice Questions */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E0D3] shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B4332]">
          <HelpCircle className="w-4 h-4" />
          High-Yield Probable Exam Questions
        </div>
        <div className="space-y-3">
          {notes.highYieldQuestions.map((q, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDCF] space-y-1.5"
            >
              <div className="text-[11px] font-mono-code font-bold uppercase text-[#1B4332]">
                Question #{idx + 1}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[#1C1E1B] leading-relaxed">
                {q}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
