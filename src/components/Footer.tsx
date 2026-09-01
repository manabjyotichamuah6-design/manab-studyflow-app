import React from 'react';
import { AppView } from '../types';
import { BookOpen, Sparkles, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: AppView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-20 border-t border-[#E8E4D9] bg-[#FAF8F5] py-12 text-[#555A50]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#1B4332] text-[#FAF8F5] flex items-center justify-center font-serif-display text-xs font-bold shadow-[0_2px_8px_rgba(27,67,50,0.2)]">
                S
              </div>
              <span className="font-serif-display font-semibold text-lg text-[#1C1E1B]">
                StudyFlow <span className="text-[#1B4332] font-mono-code text-xs font-bold">AI</span>
              </span>
            </div>
            <p className="text-xs text-[#555A50] max-w-sm">
              Turn notes into a smarter study plan with structured AI revision tools.
            </p>
          </div>

          {/* Footer Navigation Links */}
          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-[#333830]">
            <button
              onClick={() => onNavigate('landing')}
              className="hover:text-[#1B4332] transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="hover:text-[#1B4332] transition-colors cursor-pointer"
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('workspace')}
              className="hover:text-[#1B4332] transition-colors cursor-pointer"
            >
              AI Workspace
            </button>
            <button
              onClick={() => onNavigate('case-study')}
              className="hover:text-[#1B4332] transition-colors cursor-pointer"
            >
              Case Study
            </button>
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="pt-6 border-t border-[#E8E4D9] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#888E83]">
          <p>
            Personal experimental project exploring AI in education. Not a scientifically proven educational product.
          </p>
          <p className="font-mono-code text-[11px] text-[#555A50] font-medium">
            Powered by Manab Jyoti Chamuah
          </p>
        </div>
      </div>
    </footer>
  );
};
