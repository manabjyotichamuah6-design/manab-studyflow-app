import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, BookOpen, Layers, HelpCircle, FileText, CheckSquare, Sparkles, ArrowRight } from 'lucide-react';
import { NoteItem, SubjectItem, StudyPlanTask, AppView } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: NoteItem[];
  subjects: SubjectItem[];
  planTasks: StudyPlanTask[];
  onSelectNote: (note: NoteItem) => void;
  onSelectSubject: (subject: SubjectItem) => void;
  onNavigate: (view: AppView) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  notes,
  subjects,
  planTasks,
  onSelectNote,
  onSelectSubject,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle handled by parent
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return { notes: [], subjects: [], topics: [], tasks: [] };
    const q = query.toLowerCase();

    const matchedNotes = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.subject.toLowerCase().includes(q) ||
        n.topic.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
    );

    const matchedSubjects = subjects.filter((s) => s.name.toLowerCase().includes(q));

    const matchedTopics: { subjectName: string; topicName: string }[] = [];
    subjects.forEach((s) => {
      s.topics.forEach((t) => {
        if (t.toLowerCase().includes(q)) {
          matchedTopics.push({ subjectName: s.name, topicName: t });
        }
      });
    });

    const matchedTasks = planTasks.filter(
      (t) => t.topic.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q))
    );

    return {
      notes: matchedNotes.slice(0, 5),
      subjects: matchedSubjects.slice(0, 3),
      topics: matchedTopics.slice(0, 5),
      tasks: matchedTasks.slice(0, 4),
    };
  }, [query, notes, subjects, planTasks]);

  if (!isOpen) return null;

  const totalResults = results.notes.length + results.subjects.length + results.topics.length + results.tasks.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-[#1B4332]/40 backdrop-blur-sm animate-fade-in">
      <div
        id="global-search-dialog"
        className="w-full max-w-2xl bg-[#FAF8F5] rounded-2xl border border-[#E8E4D9] shadow-2xl overflow-hidden flex flex-col text-[#1C1E1B]"
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#E8E4D9] flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-[#2D6A4F] flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes, subjects, topics, or study tasks... (e.g. Atmosphere, Motion)"
            className="flex-1 text-base text-[#1C1E1B] placeholder-[#8A9085] bg-transparent focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-[#8A9085] hover:text-[#1C1E1B] px-1.5 py-0.5 rounded cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#6B7267] hover:bg-[#EFEBE0] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="text-center py-8 text-[#8A9085]">
              <div className="w-10 h-10 rounded-full bg-[#E3EDE5] text-[#2D6A4F] mx-auto flex items-center justify-center mb-2">
                <Search className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-[#4B5047]">Search across your entire study library</p>
              <p className="text-xs text-[#6B7267] mt-1">Type a keyword, formula, or subject to jump right into your material.</p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => setQuery('Science')}
                  className="text-xs px-2.5 py-1 rounded-full bg-[#F4EFE6] text-[#1B4332] hover:bg-[#EAE4D5] cursor-pointer"
                >
                  Science
                </button>
                <button
                  onClick={() => setQuery('Atmosphere')}
                  className="text-xs px-2.5 py-1 rounded-full bg-[#F4EFE6] text-[#1B4332] hover:bg-[#EAE4D5] cursor-pointer"
                >
                  Atmosphere
                </button>
                <button
                  onClick={() => setQuery('Motion')}
                  className="text-xs px-2.5 py-1 rounded-full bg-[#F4EFE6] text-[#1B4332] hover:bg-[#EAE4D5] cursor-pointer"
                >
                  Motion
                </button>
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-8 text-[#8A9085]">
              <p className="text-sm font-medium text-[#4B5047]">No matching study items found for "{query}"</p>
              <p className="text-xs text-[#6B7267] mt-1">Try another keyword or create a new note in your workspace.</p>
            </div>
          ) : (
            <>
              {/* Notes */}
              {results.notes.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold font-mono-code uppercase tracking-wider text-[#2D6A4F] mb-2 px-2">
                    Study Notes ({results.notes.length})
                  </div>
                  <div className="space-y-1">
                    {results.notes.map((note) => (
                      <button
                        key={note.id}
                        onClick={() => {
                          onSelectNote(note);
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[#EFEBE0] transition-colors flex items-start justify-between group cursor-pointer"
                      >
                        <div className="flex items-start gap-2.5">
                          <FileText className="w-4 h-4 text-[#2D6A4F] mt-0.5" />
                          <div>
                            <div className="text-sm font-bold text-[#1C1E1B] group-hover:text-[#1B4332]">
                              {note.title}
                            </div>
                            <div className="text-xs text-[#6B7267]">
                              {note.subject} • {note.topic}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#8A9085] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Subjects */}
              {results.subjects.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold font-mono-code uppercase tracking-wider text-[#2D6A4F] mb-2 px-2">
                    Subjects ({results.subjects.length})
                  </div>
                  <div className="space-y-1">
                    {results.subjects.map((subj) => (
                      <button
                        key={subj.id}
                        onClick={() => {
                          onSelectSubject(subj);
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[#EFEBE0] transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <BookOpen className="w-4 h-4 text-[#2D6A4F]" />
                          <div>
                            <div className="text-sm font-bold text-[#1C1E1B]">{subj.name}</div>
                            <div className="text-xs text-[#6B7267]">{subj.topics.length} topics</div>
                          </div>
                        </div>
                        <span className="text-xs text-[#2D6A4F] font-semibold">Open Subject →</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Topics */}
              {results.topics.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold font-mono-code uppercase tracking-wider text-[#2D6A4F] mb-2 px-2">
                    Topics ({results.topics.length})
                  </div>
                  <div className="space-y-1">
                    {results.topics.map((t, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          const matchedSubject = subjects.find((s) => s.name === t.subjectName);
                          if (matchedSubject) onSelectSubject(matchedSubject);
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[#EFEBE0] transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Layers className="w-4 h-4 text-[#2D6A4F]" />
                          <div>
                            <div className="text-sm font-bold text-[#1C1E1B]">{t.topicName}</div>
                            <div className="text-xs text-[#6B7267]">In subject: {t.subjectName}</div>
                          </div>
                        </div>
                        <span className="text-xs text-[#2D6A4F]">View Topic →</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Study Plan Tasks */}
              {results.tasks.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold font-mono-code uppercase tracking-wider text-[#2D6A4F] mb-2 px-2">
                    Study Tasks ({results.tasks.length})
                  </div>
                  <div className="space-y-1">
                    {results.tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => {
                          onNavigate('plan');
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[#EFEBE0] transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckSquare className="w-4 h-4 text-[#2D6A4F]" />
                          <div>
                            <div className="text-sm font-medium text-[#1C1E1B]">
                              {task.subject}: {task.topic}
                            </div>
                            <div className="text-xs text-[#6B7267]">Target: {task.targetDate} ({task.availableMinutes} min)</div>
                          </div>
                        </div>
                        <span className="text-xs text-[#2D6A4F]">View Plan →</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-[#F4EFE6] border-t border-[#E8E4D9] flex items-center justify-between text-xs text-[#6B7267]">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white border text-[10px]">ESC</kbd> to close</span>
          <span>Tip: Use Cmd+K / Ctrl+K anywhere</span>
        </div>
      </div>
    </div>
  );
};
