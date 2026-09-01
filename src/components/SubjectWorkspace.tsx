import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Plus,
  FileText,
  Layers,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Trash2,
  MessageSquare,
  Camera,
  Upload,
} from 'lucide-react';
import { SubjectItem, NoteItem, AppView, ExtractedMaterial } from '../types';
import { SubjectChatBox } from './SubjectChatBox';
import { UploadMaterialModal } from './UploadMaterialModal';

interface SubjectWorkspaceProps {
  subject: SubjectItem;
  notes: NoteItem[];
  allSubjects: SubjectItem[];
  onBack: () => void;
  onSelectNote: (note: NoteItem) => void;
  onCreateNoteInSubject: (subjectName: string, topicName?: string) => void;
  onAddTopicToSubject: (subjectName: string, topicName: string) => void;
  onStartQuizForTopic: (topic: string, subject: string) => void;
  onStartFlashcardsForTopic: (topic: string, subject: string) => void;
  onSaveExtractedNote?: (note: NoteItem) => void;
  onNavigate: (view: AppView) => void;
}

export const SubjectWorkspace: React.FC<SubjectWorkspaceProps> = ({
  subject,
  notes,
  allSubjects,
  onBack,
  onSelectNote,
  onCreateNoteInSubject,
  onAddTopicToSubject,
  onStartQuizForTopic,
  onStartFlashcardsForTopic,
  onSaveExtractedNote,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'notes' | 'topics' | 'practice'>('chat');
  const [newTopicName, setNewTopicName] = useState<string>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  const subjectNotes = notes.filter((n) => n.subject.toLowerCase() === subject.name.toLowerCase());

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTopicName.trim()) {
      onAddTopicToSubject(subject.name, newTopicName.trim());
      setNewTopicName('');
    }
  };

  const handleExtractedForNotes = (extracted: ExtractedMaterial, targetSubj: string) => {
    if (onSaveExtractedNote) {
      const newNote: NoteItem = {
        id: `note-${Date.now()}`,
        title: extracted.topic || `${targetSubj} Note`,
        subject: targetSubj,
        topic: extracted.topic || 'General',
        content: extracted.extractedText,
        tags: extracted.keyConcepts || ['Revision'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        summaryData: {
          quickSummary: extracted.summaryPreview,
          keyPoints: extracted.keyConcepts.map((c) => `Core mechanism: ${c}`),
          importantTerms: extracted.keyConcepts.slice(0, 3).map((c) => ({
            term: c,
            definition: `Key concept in ${extracted.topic}`,
          })),
          rememberThis: `Focus on mastering the underlying mechanism of ${extracted.topic}.`,
        },
      };
      onSaveExtractedNote(newNote);
      setActiveTab('notes');
    }
  };

  const handleSaveChatAsNote = (title: string, content: string, subjName: string) => {
    if (onSaveExtractedNote) {
      const newNote: NoteItem = {
        id: `note-${Date.now()}`,
        title: title,
        subject: subjName,
        topic: subject.topics[0] || 'Tutor Chat',
        content: content,
        tags: ['AI Tutor', 'Chat Summary'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onSaveExtractedNote(newNote);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-[#1C1E1B]">
      {/* Upload Modal */}
      <UploadMaterialModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        subjects={allSubjects}
        defaultSubject={subject.name}
        onExtractedForNotes={handleExtractedForNotes}
        onExtractedForWorkspace={() => onNavigate('workspace')}
      />

      {/* Back button with Blue Arrow */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition-all mb-6 cursor-pointer shadow-xs active:scale-95 group"
      >
        <ArrowLeft className="w-4 h-4 text-blue-600 group-hover:-translate-x-0.5 transition-transform" />
        <span>← Back to All Subjects</span>
      </button>

      {/* Subject Banner */}
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8E4D9] p-6 sm:p-8 mb-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1B4332] text-[#FAF8F5] flex items-center justify-center font-serif-display text-2xl font-bold shadow-md">
              {subject.name.charAt(0)}
            </div>
            <div>
              <span className="text-xs font-mono-code uppercase tracking-wider text-[#2D6A4F] bg-[#E3EDE5] px-2.5 py-0.5 rounded-full inline-block mb-1 font-bold">
                Subject Workspace & AI Tutor
              </span>
              <h1 className="font-serif-display text-3xl font-bold tracking-tight text-[#1C1E1B]">
                {subject.name}
              </h1>
              <p className="text-xs text-[#6B7267] mt-1">
                {subject.topics.length} syllabus topics • {subjectNotes.length} notes saved • Dedicated AI Tutor
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('doubt-solver')}
              className="px-4 py-2.5 rounded-xl border border-amber-400/80 bg-[#FFF9E6] hover:bg-[#FFF3CC] text-amber-900 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <HelpCircle className="w-4 h-4 text-amber-700" />
              <span>Solve Doubts</span>
            </button>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-[#2D6A4F] bg-[#E3EDE5] hover:bg-[#D5E5D8] text-[#1B4332] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Camera className="w-4 h-4 text-[#2D6A4F]" />
              <span>Snap / Upload Notes</span>
            </button>

            <button
              onClick={() => onCreateNoteInSubject(subject.name)}
              className="px-4 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Note</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-[#E8E4D9]">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-[#1B4332] text-[#FAF8F5]'
                : 'bg-[#F4EFE6] text-[#4B5047] hover:bg-[#EAE4D5]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Tutor Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-[#1B4332] text-[#FAF8F5]'
                : 'bg-[#F4EFE6] text-[#4B5047] hover:bg-[#EAE4D5]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notes ({subjectNotes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('topics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'topics'
                ? 'bg-[#1B4332] text-[#FAF8F5]'
                : 'bg-[#F4EFE6] text-[#4B5047] hover:bg-[#EAE4D5]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Topics ({subject.topics.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('practice')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'practice'
                ? 'bg-[#1B4332] text-[#FAF8F5]'
                : 'bg-[#F4EFE6] text-[#4B5047] hover:bg-[#EAE4D5]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Practice & Flashcards</span>
          </button>
        </div>
      </div>

      {/* Tab 0: AI Subject Tutor Chat */}
      {activeTab === 'chat' && (
        <div className="space-y-4">
          <SubjectChatBox
            subject={subject}
            onSaveAsNote={handleSaveChatAsNote}
            onGenerateFlashcards={(top, cont) => onStartFlashcardsForTopic(top, subject.name)}
          />
        </div>
      )}

      {/* Tab 1: Notes List */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          {subjectNotes.length === 0 ? (
            <div className="bg-[#FAF8F5] rounded-2xl border border-dashed border-[#D5CFBF] p-10 text-center">
              <FileText className="w-10 h-10 text-[#8A9085] mx-auto mb-2" />
              <h3 className="font-bold text-base text-[#1C1E1B]">No notes in {subject.name} yet</h3>
              <p className="text-xs text-[#6B7267] max-w-sm mx-auto mt-1 mb-4">
                Snap a photo of your textbook, upload a PDF chapter, or write down your class notes.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl border border-[#2D6A4F] bg-[#E3EDE5] text-[#1B4332] text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Photo / Upload File</span>
                </button>
                <button
                  onClick={() => onCreateNoteInSubject(subject.name)}
                  className="px-5 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-bold cursor-pointer"
                >
                  + Create Note Manually
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjectNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => onSelectNote(note)}
                  className="bg-[#FAF8F5] rounded-2xl border border-[#E8E4D9] p-5 hover:border-[#2D6A4F] hover:shadow-xs transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono-code uppercase font-bold bg-[#E3EDE5] text-[#1B4332] px-2 py-0.5 rounded-md">
                      {note.topic}
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

                  <div className="pt-3 border-t border-[#E8E4D9] flex items-center justify-between text-xs text-[#6B7267]">
                    <span className="text-[11px] font-medium text-[#2D6A4F]">Open Note & AI Tools →</span>
                    {note.summaryData && (
                      <span className="text-[10px] bg-[#FFF8E7] text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                        Summary Ready
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Topics Checklist */}
      {activeTab === 'topics' && (
        <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E4D9] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif-display font-bold text-lg text-[#1C1E1B]">
                Curriculum Topics for {subject.name}
              </h3>
              <p className="text-xs text-[#6B7267] mt-0.5">
                Track each syllabus topic and launch quick study sessions.
              </p>
            </div>

            <form onSubmit={handleAddTopic} className="flex gap-2">
              <input
                type="text"
                placeholder="+ Add new topic"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                className="px-3.5 py-1.5 text-xs rounded-xl border border-[#D5CFBF] bg-white text-[#1C1E1B] focus:ring-2 focus:ring-[#1B4332]"
              />
              <button
                type="submit"
                disabled={!newTopicName.trim()}
                className="px-3.5 py-1.5 rounded-xl bg-[#1B4332] text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                Add
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subject.topics.map((t, idx) => {
              const matchingNotes = subjectNotes.filter((n) => n.topic.toLowerCase() === t.toLowerCase());
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white border border-[#E8E4D9] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" />
                    <div>
                      <div className="font-bold text-sm text-[#1C1E1B]">{t}</div>
                      <div className="text-[11px] text-[#6B7267]">
                        {matchingNotes.length} {matchingNotes.length === 1 ? 'note' : 'notes'} attached
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onStartFlashcardsForTopic(t, subject.name)}
                      className="p-2 rounded-lg bg-[#F4EFE6] hover:bg-[#EAE4D5] text-[#1B4332] text-xs font-bold transition-colors cursor-pointer"
                      title="Practice Flashcards for this Topic"
                    >
                      <Layers className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onStartQuizForTopic(t, subject.name)}
                      className="p-2 rounded-lg bg-[#F4EFE6] hover:bg-[#EAE4D5] text-[#1B4332] text-xs font-bold transition-colors cursor-pointer"
                      title="Practice Quiz for this Topic"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Practice & Flashcards Hub */}
      {activeTab === 'practice' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E4D9] p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#E3EDE5] text-[#1B4332] flex items-center justify-center mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-serif-display font-bold text-xl text-[#1C1E1B] mb-1">
                Active Recall Flashcards
              </h3>
              <p className="text-xs text-[#6B7267] mb-4">
                Generate and test yourself on key definitions, equations, and mechanisms across {subject.name}.
              </p>
            </div>
            <button
              onClick={() => onStartFlashcardsForTopic(subject.topics[0] || subject.name, subject.name)}
              className="w-full py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Practice Flashcards</span>
              <Layers className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E4D9] p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#E3EDE5] text-[#1B4332] flex items-center justify-center mb-3">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="font-serif-display font-bold text-xl text-[#1C1E1B] mb-1">
                Practice Quiz Generator
              </h3>
              <p className="text-xs text-[#6B7267] mb-4">
                Take a quick 5 or 10-question multiple choice test with step-by-step reasoning for wrong answers.
              </p>
            </div>
            <button
              onClick={() => onStartQuizForTopic(subject.topics[0] || subject.name, subject.name)}
              className="w-full py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Start Practice Quiz</span>
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

