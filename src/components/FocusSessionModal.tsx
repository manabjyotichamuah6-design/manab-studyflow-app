import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { FocusSessionLog } from '../types';

interface FocusSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionComplete: (log: FocusSessionLog) => void;
  defaultTopic?: string;
  defaultSubject?: string;
}

const PRESET_DURATIONS = [
  { label: '15 min', minutes: 15 },
  { label: '25 min (Pomodoro)', minutes: 25 },
  { label: '45 min (Deep Study)', minutes: 45 },
  { label: '60 min', minutes: 60 },
];

export const FocusSessionModal: React.FC<FocusSessionModalProps> = ({
  isOpen,
  onClose,
  onSessionComplete,
  defaultTopic = 'General Revision',
  defaultSubject = 'Science',
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(25);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [studiedTopic, setStudiedTopic] = useState<string>(defaultTopic);
  const [studiedSubject, setStudiedSubject] = useState<string>(defaultSubject);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setSecondsRemaining(selectedMinutes * 60);
      setIsActive(false);
      setIsCompleted(false);
      setStudiedTopic(defaultTopic);
      setStudiedSubject(defaultSubject);
    }
  }, [isOpen, selectedMinutes, defaultTopic, defaultSubject]);

  useEffect(() => {
    if (isActive && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsActive(false);
            setIsCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, secondsRemaining]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectPreset = (minutes: number) => {
    setSelectedMinutes(minutes);
    setSecondsRemaining(minutes * 60);
    setIsActive(false);
  };

  const handleToggleTimer = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setSecondsRemaining(selectedMinutes * 60);
  };

  const handleSaveLog = () => {
    const log: FocusSessionLog = {
      id: `focus-${Date.now()}`,
      topicStudied: studiedTopic.trim() || 'General Revision',
      subject: studiedSubject.trim() || 'General',
      durationMinutes: selectedMinutes,
      timestamp: new Date().toISOString(),
    };
    onSessionComplete(log);
    onClose();
  };

  const progressPercent = ((selectedMinutes * 60 - secondsRemaining) / (selectedMinutes * 60)) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B4332]/50 backdrop-blur-sm animate-fade-in">
      <div
        id="focus-session-modal"
        className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl border border-[#E8E4D9] shadow-2xl p-6 sm:p-8 text-[#1C1E1B] overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#6B7267] hover:text-[#1B4332] hover:bg-[#EFEBE0] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!isCompleted ? (
          <div>
            {/* Header */}
            <div className="text-center mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F] bg-[#E3EDE5] px-3 py-1 rounded-full inline-block mb-2">
                Distraction-Free Focus
              </span>
              <h2 className="font-serif-display text-2xl font-bold text-[#1C1E1B]">
                Focus Study Session
              </h2>
              <p className="text-xs text-[#6B7267] mt-1">
                Put your phone aside, choose your topic, and enter active flow state.
              </p>
            </div>

            {/* Presets */}
            {!isActive && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                {PRESET_DURATIONS.map((preset) => (
                  <button
                    key={preset.minutes}
                    type="button"
                    onClick={() => handleSelectPreset(preset.minutes)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      selectedMinutes === preset.minutes
                        ? 'bg-[#1B4332] text-[#FAF8F5] border-[#1B4332]'
                        : 'bg-white text-[#4B5047] border-[#D5CFBF] hover:bg-[#F4EFE6]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}

            {/* Big Timer Circle Display */}
            <div className="my-6 flex flex-col items-center justify-center">
              <div className="relative w-56 h-56 rounded-full bg-[#FAF8F5] border-8 border-[#E8E4D9] flex flex-col items-center justify-center shadow-inner">
                {/* SVG Progress Circle */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="112"
                    cy="112"
                    r="100"
                    className="stroke-[#E8E4D9]"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="112"
                    cy="112"
                    r="100"
                    className="stroke-[#1B4332] transition-all duration-1000 ease-linear"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 100}
                    strokeDashoffset={2 * Math.PI * 100 * (1 - progressPercent / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                <div className="relative text-center z-10">
                  <div className="font-mono-code text-4xl sm:text-5xl font-bold tracking-tight text-[#1B4332]">
                    {formatTime(secondsRemaining)}
                  </div>
                  <div className="text-xs font-medium text-[#6B7267] mt-1">
                    {isActive ? 'In Progress • Keep Going' : 'Ready when you are'}
                  </div>
                </div>
              </div>
            </div>

            {/* Subject/Topic Indicator */}
            <div className="bg-[#F4EFE6] rounded-xl p-3 mb-6 text-center border border-[#E8E4D9]">
              <span className="text-xs text-[#6B7267]">Currently studying:</span>
              <div className="text-sm font-bold text-[#1B4332] truncate">
                {studiedSubject ? `${studiedSubject} — ` : ''}{studiedTopic}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleToggleTimer}
                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5]'
                }`}
              >
                {isActive ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>{secondsRemaining < selectedMinutes * 60 ? 'Resume' : 'Start Focus'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="p-3 rounded-xl border border-[#D5CFBF] bg-white hover:bg-[#EFEBE0] text-[#6B7267] transition-colors cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Completion State */
          <div className="text-center py-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#E3EDE5] text-[#1B4332] mx-auto flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 stroke-[2.5]" />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F] bg-[#E3EDE5] px-3 py-1 rounded-full inline-block mb-2">
              Well Done
            </span>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1C1E1B] mb-2">
              Focus Session Completed!
            </h2>
            <p className="text-sm text-[#555A51] mb-6">
              You completed <span className="font-bold text-[#1B4332]">{selectedMinutes} minutes</span> of uninterrupted study. Log what you accomplished to track your progress:
            </p>

            <div className="space-y-3 max-w-sm mx-auto text-left mb-6">
              <div>
                <label className="block text-xs font-semibold text-[#4B5047] mb-1">Topic Studied</label>
                <input
                  type="text"
                  value={studiedTopic}
                  onChange={(e) => setStudiedTopic(e.target.value)}
                  placeholder="e.g. Atmospheric Layers, Calculus derivatives"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#D5CFBF] bg-white focus:ring-2 focus:ring-[#1B4332] text-[#1C1E1B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4B5047] mb-1">Subject</label>
                <input
                  type="text"
                  value={studiedSubject}
                  onChange={(e) => setStudiedSubject(e.target.value)}
                  placeholder="e.g. Science, Maths, English"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#D5CFBF] bg-white focus:ring-2 focus:ring-[#1B4332] text-[#1C1E1B]"
                />
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={handleSaveLog}
                className="px-6 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-sm font-bold transition-all shadow-md cursor-pointer active:scale-98"
              >
                Log Session & Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
