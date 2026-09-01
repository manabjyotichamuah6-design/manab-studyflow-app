import React, { useState } from 'react';
import { StudyPlanDay, StudyPlanStep } from '../../types';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  ArrowDown,
  BookOpen,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Download,
  Check,
} from 'lucide-react';

interface StudyPlanTabProps {
  topic: string;
  studyPlan: StudyPlanDay[];
  onToggleStep?: (dayIndex: number, stepId: string) => void;
}

export const StudyPlanTab: React.FC<StudyPlanTabProps> = ({
  topic,
  studyPlan: initialPlan,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const totalMinutes = initialPlan.reduce((acc, day) => acc + day.estimatedMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Count completed steps
  let totalStepsCount = 0;
  let completedCount = 0;
  initialPlan.forEach((day) => {
    day.steps.forEach((step) => {
      totalStepsCount++;
      if (completedSteps[step.id]) {
        completedCount++;
      }
    });
  });

  const progressPercentage = Math.round((completedCount / (totalStepsCount || 1)) * 100);

  const handleExport = () => {
    let text = `MY STUDY PLAN: ${topic}\n`;
    text += `Total estimated time: ${totalHours} hours across ${initialPlan.length} sessions\n\n`;

    initialPlan.forEach((day) => {
      text += `===============================\n`;
      text += `DAY 0${day.dayNumber}: ${day.title} (${day.estimatedMinutes} min)\n`;
      text += `Focus: ${day.focus}\n`;
      text += `Steps:\n`;
      day.steps.forEach((step, idx) => {
        text += `  ${idx + 1}. [${step.type.toUpperCase()}] ${step.activity} (${step.durationMinutes} min)\n`;
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl text-[#1C1E1B]">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E8E4D9]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-code font-semibold uppercase tracking-wider text-[#1B4332] bg-[#E8F5E9] border border-emerald-300 px-2 py-0.5 rounded">
              Curated Roadmap
            </span>
            <span className="text-xs text-[#555A50] font-mono-code flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#2D6A4F]" />
              {totalHours} Total Hours ({initialPlan.length} Days)
            </span>
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#1C1E1B] mt-1">
            MY STUDY PLAN
          </h2>
        </div>

        <button
          id="export-study-plan-btn"
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#DCD6C7] text-[#333830] bg-white hover:bg-[#F4EFE6] hover:text-[#1C1E1B] text-xs font-medium transition-colors shadow-xs active:scale-95 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#1B4332]" />
              <span>Plan Copied!</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 text-[#6B7267]" />
              <span>Export Schedule</span>
            </>
          )}
        </button>
      </div>

      {/* Plan Completion Summary Widget */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E0D3] shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-[#333830] flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#1B4332]" />
            Session Milestones
          </span>
          <span className="font-mono-code font-semibold text-[#1B4332]">
            {completedCount} of {totalStepsCount} tasks completed ({progressPercentage}%)
          </span>
        </div>
        <div className="w-full bg-[#E8E4D9] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#1B4332] h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Day-by-Day Cards */}
      <div className="space-y-6">
        {initialPlan.map((day) => {
          const dayStepsCompleted = day.steps.filter((s) => completedSteps[s.id]).length;
          const isDayComplete = dayStepsCompleted === day.steps.length && day.steps.length > 0;

          return (
            <div
              key={day.dayNumber}
              className={`rounded-2xl border transition-all p-6 sm:p-7 ${
                isDayComplete
                  ? 'bg-[#FAF8F5] border-emerald-300'
                  : 'bg-white border-[#E5E0D3] shadow-xs'
              }`}
            >
              {/* Day Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8E4D9] pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <span className="font-mono-code font-bold text-xs uppercase px-2.5 py-1 bg-[#1B4332] text-[#FAF8F5] font-bold rounded-md tracking-wider">
                    DAY 0{day.dayNumber}
                  </span>
                  <div>
                    <h3 className="font-serif-display text-lg sm:text-xl font-semibold text-[#1C1E1B]">
                      {day.title}
                    </h3>
                    <p className="text-xs text-[#555A50]">{day.focus}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono-code text-[#1B4332]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{day.estimatedMinutes} min</span>
                </div>
              </div>

              {/* Vertical Step Sequence with Downward Arrows */}
              <div className="space-y-3">
                {day.steps.map((step, sIdx) => {
                  const isChecked = Boolean(completedSteps[step.id]);

                  return (
                    <React.Fragment key={step.id}>
                      <div
                        onClick={() => toggleStep(step.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                          isChecked
                            ? 'bg-[#E8F5E9]/60 border-emerald-300 text-[#555A50]'
                            : 'bg-[#FAF8F5] hover:bg-[#F4EFE6] border-[#E2DDCF] text-[#1C1E1B]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            aria-label={isChecked ? 'Mark incomplete' : 'Mark complete'}
                            className="text-[#6B7267] hover:text-[#1B4332] shrink-0"
                          >
                            {isChecked ? (
                              <CheckCircle2 className="w-5 h-5 text-[#1B4332] fill-[#E8F5E9]" />
                            ) : (
                              <Circle className="w-5 h-5 text-[#B8B2A4]" />
                            )}
                          </button>

                          <div>
                            <span
                              className={`text-sm sm:text-base font-medium ${
                                isChecked ? 'line-through text-[#888E83]' : 'text-[#2C302A]'
                              }`}
                            >
                              {step.activity}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-[#1B4332] bg-[#E8F5E9] border border-emerald-300 px-1.5 py-0.2 rounded">
                                {step.type}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Duration pill */}
                        <div className="shrink-0 text-xs font-mono-code font-semibold px-2 py-1 rounded bg-white border border-[#DCD6C7] text-[#333830]">
                          {step.durationMinutes} min
                        </div>
                      </div>

                      {/* Arrow Down Connector */}
                      {sIdx < day.steps.length - 1 && (
                        <div className="flex justify-center my-0.5">
                          <div className="w-6 h-6 rounded-full bg-[#EFECE3] border border-[#DCD6C7] flex items-center justify-center text-[#1B4332]">
                            <ArrowDown className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
