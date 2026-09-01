import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Sparkles,
  Lightbulb,
  Layers,
  Upload,
  Camera,
  BookOpen,
  Clock,
  ArrowRight,
  Check,
  RotateCcw,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sigma,
  Zap,
  Image as ImageIcon,
  HelpCircle,
  Copy,
  ChevronRight,
  FolderOpen,
  Search,
  BookMarked,
  Flame,
  FileCheck2,
  Tag,
} from 'lucide-react';
import {
  NoteItem,
  SubjectItem,
  NoteSummaryData,
  ExplanationData,
  TermDefinition,
  FormulaItem,
  ExamNotesData,
  Flashcard,
  QuizQuestion,
} from '../types';
import { DeepNoteAnalysisModal } from './DeepNoteAnalysisModal';
import { useCameraAccess } from '../hooks/useCameraAccess';
import { CameraCaptureModal, VideoRecordedResult } from './CameraCaptureModal';

interface SmartNotesViewProps {
  notes: NoteItem[];
  subjects: SubjectItem[];
  onSaveNote: (note: NoteItem) => void;
  onDeleteNote: (id: string) => void;
  onGenerateFlashcardsFromNote: (note: NoteItem) => void;
  onGenerateQuizFromNote: (note: NoteItem) => void;
  hasApiKey: boolean;
}

export const SmartNotesView: React.FC<SmartNotesViewProps> = ({
  notes,
  subjects,
  onSaveNote,
  onDeleteNote,
  onGenerateFlashcardsFromNote,
  onGenerateQuizFromNote,
  hasApiKey,
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || 'new');
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'master' | 'summary' | 'keywords' | 'keypoints' | 'important' | 'formulas' | 'explain' | 'ask'>('master');

  // Current active note form state
  const activeNote = notes.find((n) => n.id === selectedNoteId);
  const [title, setTitle] = useState<string>(activeNote?.title || '');
  const [subject, setSubject] = useState<string>(activeNote?.subject || subjects[0]?.name || 'Science');
  const [topic, setTopic] = useState<string>(activeNote?.topic || 'General Topic');
  const [content, setContent] = useState<string>(activeNote?.content || '');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>(activeNote?.tags || []);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [copied, setCopied] = useState<boolean>(false);
  const [isEditingRaw, setIsEditingRaw] = useState<boolean>(false);

  // Structured Notes Fields
  const [summaryResult, setSummaryResult] = useState<NoteSummaryData | null>(activeNote?.summaryData || null);
  const [explanationResult, setExplanationResult] = useState<ExplanationData | null>(activeNote?.explanationData || null);
  const [formulas, setFormulas] = useState<FormulaItem[]>(activeNote?.formulas || []);
  const [keywords, setKeywords] = useState<string[]>(activeNote?.keywords || []);
  const [keyPoints, setKeyPoints] = useState<string[]>(activeNote?.keyPoints || []);
  const [importantPoints, setImportantPoints] = useState<string[]>(activeNote?.importantPoints || []);
  const [examNotes, setExamNotes] = useState<ExamNotesData | null>(activeNote?.examRevisionNotes || null);
  const [attachedFlashcards, setAttachedFlashcards] = useState<Flashcard[]>(activeNote?.flashcards || []);
  const [attachedQuiz, setAttachedQuiz] = useState<QuizQuestion[]>(activeNote?.quiz || []);

  // 60-Second Deep Analysis Modal State
  const [isDeepAnalyzing, setIsDeepAnalyzing] = useState<boolean>(false);
  const [analysisTopicTitle, setAnalysisTopicTitle] = useState<string>('');
  const [analysisSourceLabel, setAnalysisSourceLabel] = useState<string>('');
  const [pendingGeneratedNote, setPendingGeneratedNote] = useState<NoteItem | null>(null);
  const [isLoadingBackend, setIsLoadingBackend] = useState<boolean>(false);

  // Quick Book/Topic input state
  const [quickTopicPrompt, setQuickTopicPrompt] = useState<string>('');
  const [quickGradeLevel, setQuickGradeLevel] = useState<string>('class-11-12-pcm');
  const [isGeneratingTopic, setIsGeneratingTopic] = useState<boolean>(false);

  // AI Output States
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [evenSimplerActive, setEvenSimplerActive] = useState<boolean>(false);

  // Ask AI about note state
  const [askQuestion, setAskQuestion] = useState<string>('');
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [tutorReply, setTutorReply] = useState<{ reply: string; disclaimer: string; type?: string } | null>(null);

  // Multi-file inputs
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);
  const singleFileInputRef = useRef<HTMLInputElement | null>(null);

  const cameraAccess = useCameraAccess();

  // Sync state when active note changes
  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setSubject(activeNote.subject);
      setTopic(activeNote.topic);
      setContent(activeNote.content);
      setTags(activeNote.tags || []);
      setSummaryResult(activeNote.summaryData || null);
      setExplanationResult(activeNote.explanationData || null);
      setFormulas(activeNote.formulas || []);
      setKeywords(activeNote.keywords || []);
      setKeyPoints(activeNote.keyPoints || []);
      setImportantPoints(activeNote.importantPoints || []);
      setExamNotes(activeNote.examRevisionNotes || null);
      setAttachedFlashcards(activeNote.flashcards || []);
      setAttachedQuiz(activeNote.quiz || []);
      setTutorReply(null);
    }
  }, [activeNote]);

  const handleSelectNote = (note: NoteItem) => {
    setSelectedNoteId(note.id);
    setIsEditingRaw(false);
  };

  const handleCreateNewNote = () => {
    const newId = `note-${Date.now()}`;
    setSelectedNoteId(newId);
    setTitle('Untitled Study Note');
    setSubject(subjects[0]?.name || 'Science');
    setTopic('New Topic');
    setContent('');
    setTags(['Revision']);
    setSummaryResult(null);
    setExplanationResult(null);
    setFormulas([]);
    setKeywords([]);
    setKeyPoints([]);
    setImportantPoints([]);
    setExamNotes(null);
    setAttachedFlashcards([]);
    setAttachedQuiz([]);
    setTutorReply(null);
    setIsEditingRaw(false);
  };

  const handleSaveCurrentNote = () => {
    if (!title.trim() && !content.trim()) return;
    const noteToSave: NoteItem = {
      id: selectedNoteId.startsWith('new') ? `note-${Date.now()}` : selectedNoteId,
      title: title.trim() || 'Untitled Study Note',
      subject: subject || 'Science',
      topic: topic.trim() || 'General',
      content: content,
      tags: tags,
      createdAt: activeNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      summaryData: summaryResult || undefined,
      explanationData: explanationResult || undefined,
      formulas: formulas.length > 0 ? formulas : undefined,
      keywords: keywords.length > 0 ? keywords : undefined,
      keyPoints: keyPoints.length > 0 ? keyPoints : undefined,
      importantPoints: importantPoints.length > 0 ? importantPoints : undefined,
      examRevisionNotes: examNotes || undefined,
      flashcards: attachedFlashcards.length > 0 ? attachedFlashcards : undefined,
      quiz: attachedQuiz.length > 0 ? attachedQuiz : undefined,
    };
    onSaveNote(noteToSave);
    setSelectedNoteId(noteToSave.id);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  // Helper to trigger deep analysis & master note generation
  const startDeepAnalysisPipeline = async (
    sourceLabel: string,
    topicName: string,
    payload: {
      topic?: string;
      content?: string;
      subjectName?: string;
      gradeLevel?: string;
      files?: any[];
      base64Data?: string;
      mimeType?: string;
      filename?: string;
    }
  ) => {
    setAnalysisSourceLabel(sourceLabel);
    setAnalysisTopicTitle(topicName || 'Academic Chapter');
    setPendingGeneratedNote(null);
    setIsDeepAnalyzing(true);
    setIsLoadingBackend(true);

    try {
      const res = await fetch('/api/study/generate-full-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicName,
          subjectName: payload.subjectName || subject || 'Science',
          gradeLevel: payload.gradeLevel || quickGradeLevel,
          content: payload.content || '',
          files: payload.files || [],
          base64Data: payload.base64Data || '',
          mimeType: payload.mimeType || 'image/jpeg',
          filename: payload.filename || '',
        }),
      });

      const data = await res.json();
      if (data.data) {
        const d = data.data;
        const newNote: NoteItem = {
          id: `note-${Date.now()}`,
          title: d.title || topicName || 'Master Study Note',
          subject: d.subject || payload.subjectName || subject,
          topic: d.topic || topicName || 'Key Topic',
          content: d.content || d.summary || '',
          tags: d.tags || [d.subject, 'AI Master Note', 'High Yield'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          summaryData: d.summaryData || {
            quickSummary: d.summary,
            keyPoints: d.keyPoints || [],
            importantTerms: (d.keywords || []).map((k: string) => ({ term: k, definition: `Key terminology in ${d.topic}` })),
            rememberThis: d.examRevisionNotes?.cheatSheetSummary || 'Master the core governing mechanisms.',
            formulas: d.formulas,
            keywords: d.keywords,
          },
          explanationData: d.explanationData,
          formulas: d.formulas || [],
          keywords: d.keywords || [],
          keyPoints: d.keyPoints || [],
          importantPoints: d.importantPoints || [],
          examRevisionNotes: d.examRevisionNotes,
          flashcards: d.flashcards || [],
          quiz: d.quiz || [],
        };
        setPendingGeneratedNote(newNote);
      }
    } catch (err) {
      console.error('Deep analysis note generation failed:', err);
    } finally {
      setIsLoadingBackend(false);
    }
  };

  // 1. Photo Camera Capture Handler
  const handleCameraSnap = () => {
    cameraAccess.requestMultiPhotoScan((photos) => {
      if (!photos || photos.length === 0) return;
      const filesPayload = photos.map((p, idx) => ({
        filename: p.filename || `Notebook Scan Page ${idx + 1}`,
        mimeType: 'image/jpeg',
        base64Data: p.base64Data,
      }));

      startDeepAnalysisPipeline(
        `Camera Scan (${photos.length} photos)`,
        `Notebook Scan: ${photos[0]?.filename?.replace(/\.[^/.]+$/, '') || 'Chapter'}`,
        {
          files: filesPayload,
          subjectName: subject,
          gradeLevel: quickGradeLevel,
        }
      );
    });
  };

  // 2. Gallery / Photos Upload Handler
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const filesPayload: any[] = [];
    let loadedCount = 0;

    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        filesPayload.push({
          filename: file.name,
          mimeType: file.type || 'image/jpeg',
          base64Data: event.target?.result as string,
        });
        loadedCount++;
        if (loadedCount === fileList.length) {
          startDeepAnalysisPipeline(
            `Gallery Upload (${fileList.length} images)`,
            fileList[0].name.replace(/\.[^/.]+$/, ''),
            {
              files: filesPayload,
              subjectName: subject,
              gradeLevel: quickGradeLevel,
            }
          );
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // 3. Document / Field Notebook / PDF Upload Handler
  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf';
    const reader = new FileReader();

    if (isPdf || file.type.startsWith('image/')) {
      reader.onload = (ev) => {
        const base64Data = ev.target?.result as string;
        startDeepAnalysisPipeline(`Document (${file.name})`, file.name.replace(/\.[^/.]+$/, ''), {
          base64Data,
          mimeType: file.type || 'application/pdf',
          filename: file.name,
          subjectName: subject,
          gradeLevel: quickGradeLevel,
        });
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        startDeepAnalysisPipeline(`Text Document (${file.name})`, file.name.replace(/\.[^/.]+$/, ''), {
          content: text,
          filename: file.name,
          subjectName: subject,
          gradeLevel: quickGradeLevel,
        });
      };
      reader.readAsText(file);
    }

    e.target.value = '';
  };

  // 4. Instant Topic / Book Chapter Generator Handler
  const handleGenerateFromTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTopicPrompt.trim()) return;

    const chosenTopic = quickTopicPrompt.trim();
    setQuickTopicPrompt('');
    startDeepAnalysisPipeline(`Book Topic / Chapter`, chosenTopic, {
      topic: chosenTopic,
      subjectName: subject,
      gradeLevel: quickGradeLevel,
    });
  };

  // When 60s Deep Analysis completes
  const handleDeepAnalysisComplete = (finalNote: NoteItem) => {
    setIsDeepAnalyzing(false);
    onSaveNote(finalNote);
    setSelectedNoteId(finalNote.id);
    handleSelectNote(finalNote);
    setActiveTab('master');
  };

  // AI Summarize Action
  const handleSummarize = async () => {
    if (!content.trim()) return;
    setIsSummarizing(true);
    try {
      const res = await fetch('/api/study/summarize-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      if (data.data) {
        setSummaryResult(data.data);
        setActiveTab('summary');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSummarizing(false);
    }
  };

  // AI Explain Simply Action
  const handleExplainSimply = async (evenSimpler = false) => {
    if (!content.trim() && !topic) return;
    setIsExplaining(true);
    setEvenSimplerActive(evenSimpler);
    try {
      const res = await fetch('/api/study/explain-simply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: topic || title,
          context: content.slice(0, 3000),
          evenSimpler,
        }),
      });
      const data = await res.json();
      if (data.data) {
        setExplanationResult(data.data);
        setActiveTab('explain');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsExplaining(false);
    }
  };

  // Ask AI Tutor
  const handleAskTutor = async (mode: 'answer' | 'hint' | 'explain_solution' = 'answer') => {
    if (!askQuestion.trim() && mode === 'answer') return;
    const q = askQuestion.trim() || `Explain the core mechanism in ${topic || title}`;
    setIsAsking(true);
    try {
      const res = await fetch('/api/study/ask-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          noteContent: content,
          noteTitle: title,
          mode,
        }),
      });
      const data = await res.json();
      if (data.data) {
        setTutorReply(data.data);
        setActiveTab('ask');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAsking(false);
    }
  };

  const handleCopyNote = () => {
    navigator.clipboard.writeText(`${title}\n\n${content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tToRemove: string) => {
    setTags(tags.filter((t) => t !== tToRemove));
  };

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const matchSubj = activeSubjectFilter === 'all' || n.subject.toLowerCase() === activeSubjectFilter.toLowerCase();
    const matchQuery =
      !searchQuery.trim() ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubj && matchQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-[#1C1E1B]">
      {/* 60-Second Deep Analysis Modal */}
      <DeepNoteAnalysisModal
        isOpen={isDeepAnalyzing}
        onClose={() => setIsDeepAnalyzing(false)}
        topicTitle={analysisTopicTitle}
        sourceLabel={analysisSourceLabel}
        generatedNote={pendingGeneratedNote}
        isLoadingBackend={isLoadingBackend}
        onComplete={handleDeepAnalysisComplete}
      />

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/*"
        multiple
        onChange={handleGalleryUpload}
        className="hidden"
      />
      <input
        type="file"
        ref={docInputRef}
        accept="application/pdf,.txt,.md,.doc,.docx"
        onChange={handleDocUpload}
        className="hidden"
      />

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F] bg-[#E3EDE5] px-3 py-1 rounded-full inline-block mb-2">
            Automated Smart Notes & Analysis
          </span>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1E1B]">
            Smart Study Notes
          </h1>
          <p className="text-sm text-[#555A51] mt-1 max-w-3xl">
            Upload your notebook photos, gallery scans, or enter any book topic. AI will take 60 seconds to synthesize complete structured notes with formulas, keywords, keypoints, and summaries—no manual writing required!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateNewNote}
            className="px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#D5CFBF] hover:bg-[#F4EFE6] text-[#1C1E1B] text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#1B4332]" />
            <span>Blank Note</span>
          </button>
        </div>
      </div>

      {/* AUTOMATED UPLOAD & GENERATION BANNER (No Manual Effort Required!) */}
      <div className="mb-8 p-6 rounded-3xl bg-linear-to-br from-[#1B4332] via-[#2D6A4F] to-[#1B4332] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/15">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-mono-code font-bold uppercase tracking-wider border border-emerald-400/30">
                  Zero-Effort AI Note Synthesizer
                </span>
                <span className="text-xs text-white/80 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-300" />
                  60s Deep Academic Analysis
                </span>
              </div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-white">
                Add Notes from Camera, Gallery, Notebook, or Book Topic
              </h2>
              <p className="text-xs text-white/80 mt-0.5">
                Upload your materials in any form. AI automatically organizes them with formulas (Maths/Physics), keywords, keypoints, important points, and summaries.
              </p>
            </div>

            {/* Target Subject Selector inside banner */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-white/80 font-medium">Subject:</span>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold focus:ring-2 focus:ring-emerald-400 focus:outline-none backdrop-blur-xs cursor-pointer"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.name} className="text-[#1C1E1B] bg-white">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4 Action Pathways */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
            {/* 1. Camera Snap */}
            <button
              onClick={handleCameraSnap}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-left group cursor-pointer hover:shadow-lg active:scale-95 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono-code bg-white/10 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  Snap
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                  Take Photo of Notebook / Board
                </h3>
                <p className="text-[11px] text-white/70 mt-1 leading-snug">
                  Use your device camera to snap textbook pages or lecture notes.
                </p>
              </div>
            </button>

            {/* 2. Gallery / Photos */}
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-left group cursor-pointer hover:shadow-lg active:scale-95 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-400/20 text-blue-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono-code bg-white/10 text-blue-200 px-2 py-0.5 rounded-full font-bold">
                  Photos
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors">
                  Upload from Gallery / Photos
                </h3>
                <p className="text-[11px] text-white/70 mt-1 leading-snug">
                  Select multiple photos of handwritten notes or book chapters.
                </p>
              </div>
            </button>

            {/* 3. Document / Field Notebook / PDF */}
            <button
              onClick={() => docInputRef.current?.click()}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-left group cursor-pointer hover:shadow-lg active:scale-95 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-400/20 text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono-code bg-white/10 text-purple-200 px-2 py-0.5 rounded-full font-bold">
                  Document
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
                  Upload PDF or Field Notebook
                </h3>
                <p className="text-[11px] text-white/70 mt-1 leading-snug">
                  Upload scanned PDF chapters, word files, or assignment sheets.
                </p>
              </div>
            </button>

            {/* 4. Generate by Book or Topic */}
            <div className="p-4 rounded-2xl bg-white/10 border border-white/20 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                  <BookMarked className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono-code bg-white/10 text-amber-200 px-2 py-0.5 rounded-full font-bold">
                  AI Book Generator
                </span>
              </div>

              <form onSubmit={handleGenerateFromTopic} className="space-y-2">
                <input
                  type="text"
                  value={quickTopicPrompt}
                  onChange={(e) => setQuickTopicPrompt(e.target.value)}
                  placeholder="Enter book topic or chapter..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-black/25 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <button
                  type="submit"
                  disabled={!quickTopicPrompt.trim()}
                  className="w-full py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#1C1E1B] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Synthesize Notes</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout: Notes List Sidebar + Master Note Workspace (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Notes Directory (4 cols) */}
        <div className="lg:col-span-4 bg-[#FAF8F5] rounded-3xl border border-[#E8E4D9] p-4 shadow-xs">
          {/* Search & Subject Filters */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-[#8A9085] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search notes, formulas, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D5CFBF] bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332] text-[#1C1E1B]"
            />
          </div>

          {/* Subject Pills */}
          <div className="flex flex-wrap gap-1.5 mb-4 pb-3 border-b border-[#E8E4D9]">
            <button
              onClick={() => setActiveSubjectFilter('all')}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                activeSubjectFilter === 'all'
                  ? 'bg-[#1B4332] text-white'
                  : 'bg-[#F4EFE6] text-[#4B5047] hover:bg-[#EAE4D5]'
              }`}
            >
              All ({notes.length})
            </button>
            {subjects.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSubjectFilter(s.name)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  activeSubjectFilter === s.name
                    ? 'bg-[#1B4332] text-white'
                    : 'bg-[#F4EFE6] text-[#4B5047] hover:bg-[#EAE4D5]'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* Notes List */}
          <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl bg-white border border-dashed border-[#DCD6C7]">
                <BookOpen className="w-8 h-8 text-[#8A9085] mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold text-[#4B5047]">No study notes found</p>
                <p className="text-[11px] text-[#8A9085] mt-1">
                  Upload a photo or enter a topic above to auto-generate master notes.
                </p>
              </div>
            ) : (
              filteredNotes.map((n) => {
                const isSelected = n.id === selectedNoteId;
                const formulaCount = n.formulas?.length || 0;
                const keywordCount = n.keywords?.length || 0;

                return (
                  <div
                    key={n.id}
                    onClick={() => handleSelectNote(n)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-[#E3EDE5] border-[#2D6A4F] text-[#1B4332] shadow-md ring-1 ring-[#2D6A4F]/20'
                        : 'bg-white border-[#E8E4D9] text-[#1C1E1B] hover:border-[#D5CFBF] hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold leading-snug line-clamp-1">
                        {n.title || 'Untitled Master Note'}
                      </h4>
                      <span className="text-[10px] font-mono-code bg-[#F4EFE6] text-[#2D6A4F] px-2 py-0.5 rounded-md font-bold shrink-0">
                        {n.subject}
                      </span>
                    </div>

                    <p className="text-xs text-[#555A51] line-clamp-2 mt-1.5 leading-relaxed">
                      {n.summaryData?.quickSummary || n.content || 'Comprehensive study note...'}
                    </p>

                    {/* Meta Badges */}
                    <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-[#E8E4D9]/60 text-[10px] text-[#6B7267]">
                      {formulaCount > 0 && (
                        <span className="flex items-center gap-1 bg-[#F4EFE6] px-1.5 py-0.5 rounded text-[#2D6A4F] font-bold">
                          <Sigma className="w-3 h-3" />
                          {formulaCount} {formulaCount === 1 ? 'formula' : 'formulas'}
                        </span>
                      )}
                      {keywordCount > 0 && (
                        <span className="flex items-center gap-1 bg-[#F4EFE6] px-1.5 py-0.5 rounded text-[#1B4332] font-semibold">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          {keywordCount} keywords
                        </span>
                      )}
                      <span className="ml-auto font-mono-code">
                        {new Date(n.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Note Workspace with Organized Tabs & Study Tools (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Note Workspace Card */}
          <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8E4D9] p-6 shadow-xs">
            {/* Top Note Title & Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#E8E4D9]">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-code font-bold uppercase bg-[#E3EDE5] text-[#1B4332]">
                    {subject}
                  </span>
                  <span className="text-xs text-[#6B7267] font-medium">
                    Topic: <strong>{topic}</strong>
                  </span>
                </div>
                <h2 className="font-serif-display text-2xl font-bold text-[#1C1E1B] leading-tight">
                  {title || 'Master Study Notes'}
                </h2>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopyNote}
                  className="p-2 rounded-xl bg-white border border-[#D5CFBF] hover:bg-[#F4EFE6] text-[#4B5047] text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  title="Copy full notes"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => onGenerateFlashcardsFromNote({
                    id: selectedNoteId,
                    title,
                    subject,
                    topic,
                    content,
                    tags,
                    createdAt: activeNote?.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    formulas,
                    keywords,
                    keyPoints,
                    importantPoints,
                  })}
                  className="px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#2D6A4F]/40 hover:bg-[#E3EDE5] text-[#1B4332] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  title="Practice 3D Flashcards"
                >
                  <Layers className="w-4 h-4 text-[#2D6A4F]" />
                  <span>Flashcards</span>
                </button>

                <button
                  onClick={() => onGenerateQuizFromNote({
                    id: selectedNoteId,
                    title,
                    subject,
                    topic,
                    content,
                    tags,
                    createdAt: activeNote?.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    formulas,
                    keywords,
                    keyPoints,
                    importantPoints,
                  })}
                  className="px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#2D6A4F]/40 hover:bg-[#E3EDE5] text-[#1B4332] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  title="Take Practice Quiz"
                >
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>Practice Quiz</span>
                </button>

                <button
                  onClick={handleSaveCurrentNote}
                  className="px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  {saveStatus === 'saved' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Saved! ✓</span>
                    </>
                  ) : (
                    <span>Save Note</span>
                  )}
                </button>
              </div>
            </div>

            {/* ORGANIZED NAVIGATION TABS */}
            <div className="flex flex-wrap gap-2 mt-5 pb-3 border-b border-[#E8E4D9]">
              <button
                onClick={() => setActiveTab('master')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'master'
                    ? 'bg-[#1B4332] text-white shadow-sm'
                    : 'bg-white border border-[#E8E4D9] text-[#4B5047] hover:bg-[#F4EFE6]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Full Master Notes</span>
              </button>

              <button
                onClick={() => setActiveTab('summary')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'summary'
                    ? 'bg-[#1B4332] text-white shadow-sm'
                    : 'bg-white border border-[#E8E4D9] text-[#4B5047] hover:bg-[#F4EFE6]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Executive Summary</span>
              </button>

              <button
                onClick={() => setActiveTab('keywords')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'keywords'
                    ? 'bg-[#1B4332] text-white shadow-sm'
                    : 'bg-white border border-[#E8E4D9] text-[#4B5047] hover:bg-[#F4EFE6]'
                }`}
              >
                <Tag className="w-3.5 h-3.5 text-blue-500" />
                <span>Keywords & Glossary ({keywords.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('keypoints')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'keypoints'
                    ? 'bg-[#1B4332] text-white shadow-sm'
                    : 'bg-white border border-[#E8E4D9] text-[#4B5047] hover:bg-[#F4EFE6]'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Core Keypoints ({keyPoints.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('important')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'important'
                    ? 'bg-[#1B4332] text-white shadow-sm'
                    : 'bg-white border border-[#E8E4D9] text-[#4B5047] hover:bg-[#F4EFE6]'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                <span>Important Points & Pitfalls ({importantPoints.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('formulas')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'formulas'
                    ? 'bg-[#1B4332] text-white shadow-sm'
                    : 'bg-white border border-[#E8E4D9] text-[#4B5047] hover:bg-[#F4EFE6]'
                }`}
              >
                <Sigma className="w-3.5 h-3.5 text-purple-600" />
                <span>Formulae & SI Units ({formulas.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('explain')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'explain'
                    ? 'bg-[#1B4332] text-white shadow-sm'
                    : 'bg-white border border-[#E8E4D9] text-[#4B5047] hover:bg-[#F4EFE6]'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Explain Simply (Feynman)</span>
              </button>

              <button
                onClick={() => setActiveTab('ask')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'ask'
                    ? 'bg-[#1B4332] text-white shadow-sm'
                    : 'bg-white border border-[#E8E4D9] text-[#4B5047] hover:bg-[#F4EFE6]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                <span>Ask AI Tutor</span>
              </button>
            </div>

            {/* TAB CONTENT 1: FULL MASTER NOTES */}
            {activeTab === 'master' && (
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4B5047]">
                    Master Textbook Notes
                  </span>
                  <button
                    onClick={() => setIsEditingRaw(!isEditingRaw)}
                    className="text-xs text-[#2D6A4F] hover:underline font-semibold cursor-pointer"
                  >
                    {isEditingRaw ? 'Preview Formatted View' : 'Edit Text'}
                  </button>
                </div>

                {isEditingRaw ? (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={16}
                    placeholder="Enter or paste study notes..."
                    className="w-full p-4 text-sm font-sans rounded-2xl border border-[#D5CFBF] bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332] text-[#1C1E1B] leading-relaxed resize-y"
                  />
                ) : (
                  <div className="bg-white rounded-2xl border border-[#E8E4D9] p-6 text-sm text-[#2D312E] leading-relaxed max-h-[600px] overflow-y-auto space-y-4 prose prose-emerald max-w-none">
                    {content ? (
                      <div className="whitespace-pre-wrap font-sans">
                        {content}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-[#8A9085] text-xs">
                        No notes content yet. Snap a photo, upload a document, or generate from book topic above.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 2: EXECUTIVE SUMMARY */}
            {activeTab === 'summary' && (
              <div className="mt-5 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-[#E8E4D9] shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#1B4332] tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Executive Concept Breakdown</span>
                  </div>
                  <p className="text-sm text-[#1C1E1B] leading-relaxed">
                    {summaryResult?.quickSummary || (activeNote?.content ? 'Click Summarize below to generate.' : 'No summary available.')}
                  </p>

                  {summaryResult?.rememberThis && (
                    <div className="p-3.5 rounded-xl bg-[#E3EDE5] border border-[#2D6A4F]/30 text-xs text-[#1B4332] font-semibold mt-3">
                      💡 <strong>Key Takeaway:</strong> {summaryResult.rememberThis}
                    </div>
                  )}

                  {!summaryResult && (
                    <button
                      onClick={handleSummarize}
                      disabled={isSummarizing || !content.trim()}
                      className="mt-2 px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSummarizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span>Generate Executive Summary</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: KEYWORDS & GLOSSARY */}
            {activeTab === 'keywords' && (
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4B5047]">
                    High-Yield Academic Vocabulary & Terms
                  </span>
                  <span className="text-xs font-mono-code text-[#2D6A4F] font-bold">
                    {keywords.length} terms extracted
                  </span>
                </div>

                {keywords.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {keywords.map((kw, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-white border border-[#E8E4D9] shadow-xs flex items-start gap-3"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#E3EDE5] text-[#1B4332] flex items-center justify-center text-xs font-bold shrink-0">
                          {i + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#1C1E1B]">{kw}</h4>
                          <p className="text-xs text-[#555A51] mt-1 leading-relaxed">
                            Essential terminology governing mechanisms in {topic || subject}.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 rounded-2xl bg-white border border-[#E8E4D9] text-xs text-[#8A9085]">
                    No keywords extracted yet. Upload photos or generate notes above.
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 4: CORE KEYPOINTS */}
            {activeTab === 'keypoints' && (
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4B5047]">
                    Core Governing Principles & Keypoints
                  </span>
                </div>

                {keyPoints.length > 0 ? (
                  keyPoints.map((kp, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-[#E8E4D9] shadow-xs flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-xs sm:text-sm text-[#2D312E] leading-relaxed font-medium">
                        {kp}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 rounded-2xl bg-white border border-[#E8E4D9] text-xs text-[#8A9085]">
                    No keypoints extracted yet. Generate complete notes from photos or topic above.
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 5: IMPORTANT POINTS & EXAM PITFALLS */}
            {activeTab === 'important' && (
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4B5047]">
                    Must-Know Exam Points, Boundary Limits & Common Traps
                  </span>
                </div>

                {importantPoints.length > 0 ? (
                  importantPoints.map((ip, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-xs flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        ⚠️
                      </div>
                      <div>
                        <div className="text-xs font-bold text-amber-900 mb-0.5">
                          High-Yield Exam Trap #{idx + 1}
                        </div>
                        <p className="text-xs sm:text-sm text-[#45270c] leading-relaxed font-medium">
                          {ip}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 rounded-2xl bg-white border border-[#E8E4D9] text-xs text-[#8A9085]">
                    No exam pitfalls extracted yet.
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 6: FORMULAE & DERIVATIONS (Maths / Physics / Chemistry) */}
            {activeTab === 'formulas' && (
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#4B5047]">
                      Mathematical & Physics Formulae with SI Units
                    </span>
                    <p className="text-xs text-[#6B7267] mt-0.5">
                      Equations with variable breakdown and SI units for rapid numerical problem solving.
                    </p>
                  </div>
                </div>

                {formulas.length > 0 ? (
                  <div className="space-y-3.5">
                    {formulas.map((f, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-white border border-[#E8E4D9] shadow-xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-[#1C1E1B]">{f.name}</h4>
                          {f.units && (
                            <span className="text-[11px] font-mono-code font-bold bg-[#E3EDE5] text-[#1B4332] px-2 py-0.5 rounded">
                              SI: {f.units}
                            </span>
                          )}
                        </div>

                        {/* LaTeX Formula Display Box */}
                        <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#DCD6C7] font-mono-code text-sm text-[#1B4332] font-extrabold text-center overflow-x-auto shadow-inner">
                          {f.formula}
                        </div>

                        <p className="text-xs text-[#555A51] leading-relaxed">
                          {f.explanation}
                        </p>

                        {/* Variables breakdown */}
                        {f.variables && f.variables.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#E8E4D9]">
                            {f.variables.map((v, vIdx) => (
                              <div key={vIdx} className="text-xs flex items-center gap-1.5 text-[#333830]">
                                <span className="font-mono-code font-bold text-[#1B4332] bg-[#EAE4D5] px-1.5 py-0.5 rounded">
                                  {v.symbol}
                                </span>
                                <span>= {v.meaning}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 rounded-2xl bg-white border border-[#E8E4D9] text-xs text-[#8A9085]">
                    No formulas extracted for this topic. Upload maths/physics notes or generate a quantitative topic above.
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 7: EXPLAIN SIMPLY (FEYNMAN) */}
            {activeTab === 'explain' && (
              <div className="mt-5 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-[#E8E4D9] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#1B4332] tracking-wider">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span>Feynman Technique Simple Explanation</span>
                    </div>

                    <button
                      onClick={() => handleExplainSimply(!evenSimplerActive)}
                      disabled={isExplaining}
                      className="px-3 py-1 rounded-xl bg-[#FAF8F5] border border-[#2D6A4F]/40 hover:bg-[#E3EDE5] text-[#1B4332] text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      {isExplaining ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      <span>{evenSimplerActive ? 'Standard Explanation' : 'Make It Even Simpler'}</span>
                    </button>
                  </div>

                  {explanationResult ? (
                    <div className="space-y-3 text-xs leading-relaxed text-[#2D312E]">
                      <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4D9]">
                        <h5 className="font-bold text-xs text-[#1B4332] mb-1">Simple Concept</h5>
                        <p>{explanationResult.simpleExplanation}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 text-amber-950">
                        <h5 className="font-bold text-xs text-amber-900 mb-1">🚲 Everyday Analogy</h5>
                        <p>{explanationResult.everydayAnalogy}</p>
                      </div>

                      {explanationResult.quickRecap && (
                        <div className="p-3.5 rounded-xl bg-[#E3EDE5] border border-[#2D6A4F]/20 text-[#1B4332]">
                          <h5 className="font-bold text-xs mb-1">⚡ Quick Recap</h5>
                          <ul className="list-disc list-inside space-y-1">
                            {explanationResult.quickRecap.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-xs text-[#8A9085] mb-3">
                        Break down complex concepts into simple analogies that a 10-year-old could understand.
                      </p>
                      <button
                        onClick={() => handleExplainSimply(false)}
                        disabled={isExplaining || !content.trim()}
                        className="px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 mx-auto cursor-pointer disabled:opacity-50"
                      >
                        {isExplaining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
                        <span>Explain Simply with AI</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT 8: ASK AI TUTOR */}
            {activeTab === 'ask' && (
              <div className="mt-5 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-[#E8E4D9] shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#1B4332] tracking-wider">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    <span>Ask AI Tutor About This Note</span>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={askQuestion}
                      onChange={(e) => setAskQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAskTutor('answer')}
                      placeholder="Ask a question, ask for derivation steps, or request exam tips..."
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#D5CFBF] bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332] text-[#1C1E1B]"
                    />

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => handleAskTutor('answer')}
                        disabled={isAsking}
                        className="px-3 py-1.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isAsking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        <span>Get Solution</span>
                      </button>

                      <button
                        onClick={() => handleAskTutor('hint')}
                        disabled={isAsking}
                        className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#D5CFBF] hover:bg-[#F4EFE6] text-[#1C1E1B] text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                      >
                        <span>Give me a Hint</span>
                      </button>

                      <button
                        onClick={() => handleAskTutor('explain_solution')}
                        disabled={isAsking}
                        className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#D5CFBF] hover:bg-[#F4EFE6] text-[#1C1E1B] text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                      >
                        <span>Step-by-Step Breakdown</span>
                      </button>
                    </div>
                  </div>

                  {tutorReply && (
                    <div className="mt-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#DCD6C7] space-y-2">
                      <div className="text-xs font-bold text-[#1B4332] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>AI Tutor Response:</span>
                      </div>
                      <div className="text-xs text-[#2D312E] leading-relaxed whitespace-pre-wrap font-sans">
                        {tutorReply.reply}
                      </div>
                      {tutorReply.disclaimer && (
                        <div className="text-[10px] text-[#8A9085] pt-2 border-t border-[#E8E4D9]">
                          {tutorReply.disclaimer}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
