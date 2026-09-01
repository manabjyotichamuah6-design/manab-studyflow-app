import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Layers,
  FileText,
  HelpCircle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FolderPlus,
  Trash2,
} from 'lucide-react';
import { SubjectItem, NoteItem, AppView } from '../types';

interface SubjectsViewProps {
  subjects: SubjectItem[];
  notes: NoteItem[];
  onSelectSubject: (subject: SubjectItem) => void;
  onAddSubject: (subject: SubjectItem) => void;
  onNavigate: (view: AppView) => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  notes,
  onSelectSubject,
  onAddSubject,
  onNavigate,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newSubjectName, setNewSubjectName] = useState<string>('');
  const [initialTopic, setInitialTopic] = useState<string>('');

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    const newSubj: SubjectItem = {
      id: `subj-${Date.now()}`,
      name: newSubjectName.trim(),
      topics: initialTopic.trim() ? [initialTopic.trim()] : ['General Concepts'],
      color: '#1B4332',
    };
    onAddSubject(newSubj);
    setNewSubjectName('');
    setInitialTopic('');
    setShowAddModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-[#1C1E1B]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F] bg-[#E3EDE5] px-3 py-1 rounded-full inline-block mb-2">
            Organize by Subject
          </span>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1E1B]">
            My Subjects & Topics
          </h1>
          <p className="text-sm text-[#555A51] mt-1">
            Keep your revision organized across all your courses, syllabi, and exams.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-sm font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subj) => {
          const subjectNotes = notes.filter((n) => n.subject.toLowerCase() === subj.name.toLowerCase());

          return (
            <div
              key={subj.id}
              onClick={() => onSelectSubject(subj)}
              className="bg-[#FAF8F5] rounded-2xl border border-[#E8E4D9] p-6 hover:border-[#2D6A4F] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Top Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1B4332] text-[#FAF8F5] flex items-center justify-center font-serif-display text-lg font-bold">
                    {subj.name.charAt(0)}
                  </div>
                  <span className="text-xs font-mono-code bg-[#F4EFE6] text-[#2D6A4F] px-2.5 py-1 rounded-full font-semibold">
                    {subj.topics.length} {subj.topics.length === 1 ? 'Topic' : 'Topics'}
                  </span>
                </div>

                <h3 className="font-serif-display text-xl font-bold text-[#1C1E1B] group-hover:text-[#1B4332] transition-colors mb-2">
                  {subj.name}
                </h3>

                {/* Topics Preview */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {subj.topics.slice(0, 4).map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] bg-[#F4EFE6] text-[#4B5047] px-2 py-0.5 rounded-md border border-[#E8E4D9]"
                    >
                      {t}
                    </span>
                  ))}
                  {subj.topics.length > 4 && (
                    <span className="text-[11px] text-[#8A9085] px-1 py-0.5">
                      +{subj.topics.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Metrics Bar */}
              <div className="pt-4 border-t border-[#E8E4D9] flex items-center justify-between text-xs text-[#6B7267]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>{subjectNotes.length} notes</span>
                  </span>
                </div>

                <span className="font-bold text-[#1B4332] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Open Workspace <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}

        {/* Add Subject Card */}
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-transparent border-2 border-dashed border-[#D5CFBF] hover:border-[#1B4332] hover:bg-[#F4EFE6]/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all min-h-[220px] cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-[#E3EDE5] text-[#1B4332] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <FolderPlus className="w-6 h-6 stroke-[2]" />
          </div>
          <h4 className="font-bold text-sm text-[#1C1E1B] mb-1">+ Add New Subject</h4>
          <p className="text-xs text-[#6B7267] max-w-xs">
            Create a custom subject workspace with its own topics, notes, and flashcard decks.
          </p>
        </button>
      </div>

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B4332]/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#FAF8F5] rounded-2xl border border-[#E8E4D9] shadow-2xl p-6 text-[#1C1E1B]">
            <h3 className="font-serif-display text-xl font-bold mb-1">Create New Subject</h3>
            <p className="text-xs text-[#6B7267] mb-4">
              Add a new course or subject to your StudyFlow workspace.
            </p>

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4B5047] mb-1">Subject Name</label>
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="e.g. Psychology, World History, Organic Chemistry"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#D5CFBF] bg-white text-[#1C1E1B] focus:ring-2 focus:ring-[#1B4332]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4B5047] mb-1">First Topic (Optional)</label>
                <input
                  type="text"
                  value={initialTopic}
                  onChange={(e) => setInitialTopic(e.target.value)}
                  placeholder="e.g. Cognitive Biases, French Revolution"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#D5CFBF] bg-white text-[#1C1E1B] focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B7267] hover:bg-[#EFEBE0] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newSubjectName.trim()}
                  className="px-5 py-2 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
