import React, { useState } from 'react';
import {
  Folder,
  FileText,
  Layers,
  HelpCircle,
  Calendar,
  Lightbulb,
  Search,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { NoteItem, StudySession, SubjectItem, AppView } from '../types';

interface MyLibraryViewProps {
  notes: NoteItem[];
  sessions: StudySession[];
  subjects: SubjectItem[];
  onSelectNote: (note: NoteItem) => void;
  onSelectSession: (session: StudySession) => void;
  onNavigate: (view: AppView) => void;
}

export const MyLibraryView: React.FC<MyLibraryViewProps> = ({
  notes,
  sessions,
  subjects,
  onSelectNote,
  onSelectSession,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'notes' | 'flashcards' | 'quizzes' | 'plans'>('all');
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const filteredNotes = notes.filter((n) => {
    const matchSubj = selectedSubject === 'all' || n.subject.toLowerCase() === selectedSubject.toLowerCase();
    const matchSearch = !search.trim() || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    return matchSubj && matchSearch;
  });

  const filteredSessions = sessions.filter((s) => {
    const matchSearch = !search.trim() || s.topic.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-[#1C1E1B]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F] bg-[#E3EDE5] px-3 py-1 rounded-full inline-block mb-2">
            Organized Library
          </span>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1E1B]">
            My Study Library
          </h1>
          <p className="text-sm text-[#555A51] mt-1">
            Access all your notes, flashcard decks, saved practice tests, and study blueprints.
          </p>
        </div>

        <button
          onClick={() => onNavigate('notes')}
          className="px-4 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-bold shadow-md hover:bg-[#2D6A4F] cursor-pointer"
        >
          + Add New Notes
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E4D9] p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8A9085] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search library..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D5CFBF] bg-white text-[#1C1E1B] focus:ring-2 focus:ring-[#1B4332]"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'all' ? 'bg-[#1B4332] text-white' : 'bg-[#F4EFE6] text-[#4B5047] hover:bg-[#EAE4D5]'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'notes' ? 'bg-[#1B4332] text-white' : 'bg-[#F4EFE6] text-[#4B5047] hover:bg-[#EAE4D5]'
            }`}
          >
            Notes ({filteredNotes.length})
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'flashcards' ? 'bg-[#1B4332] text-white' : 'bg-[#F4EFE6] text-[#4B5047] hover:bg-[#EAE4D5]'
            }`}
          >
            Flashcard Decks
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'quizzes' ? 'bg-[#1B4332] text-white' : 'bg-[#F4EFE6] text-[#4B5047] hover:bg-[#EAE4D5]'
            }`}
          >
            Practice Tests
          </button>
        </div>
      </div>

      {/* Grid of Library Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Notes Items */}
        {(activeTab === 'all' || activeTab === 'notes') &&
          filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => onSelectNote(note)}
              className="bg-[#FAF8F5] rounded-2xl border border-[#E8E4D9] p-5 hover:border-[#2D6A4F] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-mono-code font-bold uppercase bg-[#E3EDE5] text-[#1B4332] px-2 py-0.5 rounded">
                    {note.subject}
                  </span>
                  <span className="text-[10px] text-[#8A9085]">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-serif-display font-bold text-lg text-[#1C1E1B] group-hover:text-[#1B4332] transition-colors mb-2">
                  {note.title}
                </h3>
                <p className="text-xs text-[#555A51] line-clamp-3 leading-relaxed mb-4">
                  {note.content}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E8E4D9] flex items-center justify-between text-xs text-[#2D6A4F] font-bold">
                <span>View Note & Tools</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}

        {/* AI Generated Decks / Sessions */}
        {(activeTab === 'all' || activeTab === 'flashcards' || activeTab === 'quizzes') &&
          filteredSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onSelectSession(session)}
              className="bg-[#FAF8F5] rounded-2xl border border-[#E8E4D9] p-5 hover:border-[#2D6A4F] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-mono-code font-bold uppercase bg-[#FFF8E7] text-amber-900 border border-amber-300 px-2 py-0.5 rounded">
                    AI Revision Package
                  </span>
                  <span className="text-[10px] text-[#8A9085]">
                    {new Date(session.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-serif-display font-bold text-lg text-[#1C1E1B] group-hover:text-[#1B4332] transition-colors mb-2">
                  {session.topic}
                </h3>

                <div className="flex items-center gap-3 text-xs text-[#6B7267] mb-4">
                  <span>{session.flashcards.length} flashcards</span>
                  <span>•</span>
                  <span>{session.quiz.length} quiz questions</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8E4D9] flex items-center justify-between text-xs text-[#2D6A4F] font-bold">
                <span>Open Full Package</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
