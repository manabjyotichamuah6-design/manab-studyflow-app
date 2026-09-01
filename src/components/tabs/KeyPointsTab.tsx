import React, { useState } from 'react';
import { CheckCircle2, Circle, Copy, Check, ListChecks } from 'lucide-react';

interface KeyPointsTabProps {
  topic: string;
  keyPoints: string[];
}

export const KeyPointsTab: React.FC<KeyPointsTabProps> = ({ topic, keyPoints }) => {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  const toggleCheck = (idx: number) => {
    setCheckedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / (keyPoints.length || 1)) * 100);

  const handleCopy = () => {
    const text = `KEY POINTS: ${topic}\n\n` + keyPoints.map((kp, i) => `${i + 1}. ${kp}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl text-[#1C1E1B]">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E8E4D9]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-code font-semibold uppercase tracking-wider text-[#1B4332] bg-[#E8F5E9] border border-emerald-300 px-2 py-0.5 rounded">
              Core Takeaways
            </span>
            <span className="text-xs text-[#555A50] font-mono-code">
              {completedCount}/{keyPoints.length} verified
            </span>
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#1C1E1B] mt-1">
            Key Concepts & Principles
          </h2>
        </div>

        <button
          id="copy-keypoints-btn"
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
              <span>Copy Key Points</span>
            </>
          )}
        </button>
      </div>

      {/* Progress tracking bar */}
      <div className="bg-white rounded-xl p-4 border border-[#E5E0D3] shadow-xs">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-medium text-[#333830] flex items-center gap-1.5">
            <ListChecks className="w-4 h-4 text-[#1B4332]" />
            Concept Mastery Checklist
          </span>
          <span className="font-mono-code font-semibold text-[#1B4332]">
            {progressPercent}% Checked
          </span>
        </div>
        <div className="w-full bg-[#E8E4D9] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#1B4332] h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* List of key points */}
      <div className="space-y-3">
        {keyPoints.map((point, idx) => {
          const isChecked = Boolean(checkedItems[idx]);
          return (
            <div
              key={idx}
              onClick={() => toggleCheck(idx)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 select-none ${
                isChecked
                  ? 'bg-[#E8F5E9]/60 border-emerald-300 text-[#555A50]'
                  : 'bg-white border-[#E5E0D3] hover:border-emerald-500/40 text-[#1C1E1B] shadow-xs'
              }`}
            >
              <button
                type="button"
                className="mt-0.5 text-[#6B7267] hover:text-[#1B4332] shrink-0"
              >
                {isChecked ? (
                  <CheckCircle2 className="w-5 h-5 text-[#1B4332] fill-[#E8F5E9]" />
                ) : (
                  <Circle className="w-5 h-5 text-[#B8B2A4]" />
                )}
              </button>

              <div className="flex-1 space-y-1">
                <span className="text-[10px] font-mono-code font-bold uppercase text-[#2D6A4F]">
                  Concept 0{idx + 1}
                </span>
                <p
                  className={`text-sm sm:text-base leading-relaxed ${
                    isChecked ? 'line-through text-[#888E83]' : 'text-[#2C302A]'
                  }`}
                >
                  {point}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
