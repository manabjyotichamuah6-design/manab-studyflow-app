import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Camera,
  Upload,
  Sparkles,
  Lightbulb,
  HelpCircle,
  Layers,
  FileText,
  RotateCcw,
  AlertCircle,
  Loader2,
  X,
  Bot,
  User,
  Check,
  Bookmark,
  Video,
  Plus,
  Trash2,
  Film,
} from 'lucide-react';
import { SubjectItem, SubjectChatMessage, FileAttachmentData } from '../types';
import {
  getStoredSubjectChats,
  saveStoredSubjectMessage,
  clearStoredSubjectChat,
} from '../utils/storage';
import { useCameraAccess } from '../hooks/useCameraAccess';
import { CameraCaptureModal, VideoRecordedResult } from './CameraCaptureModal';
import { extractKeyframesFromVideo } from '../utils/videoUtils';

interface SubjectChatBoxProps {
  subject: SubjectItem;
  onSaveAsNote?: (title: string, content: string, subject: string) => void;
  onGenerateFlashcards?: (topic: string, content: string) => void;
}

export const SubjectChatBox: React.FC<SubjectChatBoxProps> = ({
  subject,
  onSaveAsNote,
  onGenerateFlashcards,
}) => {
  const [messages, setMessages] = useState<SubjectChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<FileAttachmentData[]>([]);
  const [activeMode, setActiveMode] = useState<
    'direct' | 'step_by_step' | 'concept_breakdown' | 'hint'
  >('direct');
  const [savedNoteIdx, setSavedNoteIdx] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const multiFileInputRef = useRef<HTMLInputElement | null>(null);
  const videoFileInputRef = useRef<HTMLInputElement | null>(null);

  const cameraAccess = useCameraAccess();

  // Load chat history for this specific subject
  useEffect(() => {
    const history = getStoredSubjectChats(subject.name);
    if (history.length > 0) {
      setMessages(history);
    } else {
      // Welcome message customized for this subject
      const welcomeMsg: SubjectChatMessage = {
        id: `welcome-${subject.name}-${Date.now()}`,
        subjectName: subject.name,
        role: 'assistant',
        content: `👋 Hello! I am your **${subject.name} AI Academic Solver & Tutor**.\n\nSend any problem, numerical, reaction, theorem, multi-page chapter notes photo, or lesson video. I will provide direct solutions, complete step-by-step derivations, and instant notes!`,
        timestamp: new Date().toISOString(),
        suggestions: [
          `⚡ Solve a tricky ${subject.topics[0] || subject.name} numerical step-by-step`,
          `🔢 Give direct answer and derivation for key formula`,
          `💡 Explain core concept mechanism with an analogy`,
        ],
      };
      setMessages([welcomeMsg]);
    }
  }, [subject.name]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Multi-photo camera scan handler
  const handleOpenMultiPhotoCamera = () => {
    cameraAccess.requestMultiPhotoScan((photos) => {
      if (!photos || photos.length === 0) return;
      const newItems: FileAttachmentData[] = photos.map((p, idx) => ({
        name: p.filename || `Chapter Page ${attachments.length + idx + 1}`,
        type: 'image/jpeg',
        base64Data: p.base64Data,
        previewUrl: p.base64Data,
        isImage: true,
      }));
      setAttachments((prev) => [...prev, ...newItems]);
    });
  };

  // Video lesson recording handler
  const handleOpenVideoRecorder = () => {
    cameraAccess.requestVideoLessonRecorder((videoResult: VideoRecordedResult) => {
      const videoItem: FileAttachmentData = {
        name: videoResult.filename,
        type: videoResult.blob.type || 'video/webm',
        base64Data: videoResult.base64Data,
        previewUrl: videoResult.previewUrl,
        isImage: false,
        isVideo: true,
        durationSeconds: videoResult.durationSeconds,
        videoThumbnails: videoResult.videoThumbnails,
      };
      setAttachments((prev) => [...prev, videoItem]);
    });
  };

  // Multi-file selection from disk / gallery
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImg = file.type.startsWith('image/');
      const isVid = file.type.startsWith('video/');

      if (isVid) {
        const previewUrl = URL.createObjectURL(file);
        const { keyframes, durationSeconds } = await extractKeyframesFromVideo(file, 4);
        const reader = new FileReader();
        const base64Data = await new Promise<string>((res) => {
          reader.onload = () => res(reader.result as string);
          reader.readAsDataURL(file);
        });

        const videoItem: FileAttachmentData = {
          name: file.name,
          type: file.type,
          size: file.size,
          base64Data,
          previewUrl,
          isImage: false,
          isVideo: true,
          durationSeconds,
          videoThumbnails: keyframes,
        };
        setAttachments((prev) => [...prev, videoItem]);
      } else {
        const reader = new FileReader();
        const base64Data = await new Promise<string>((res) => {
          reader.onload = () => res(reader.result as string);
          reader.readAsDataURL(file);
        });

        const item: FileAttachmentData = {
          name: file.name,
          type: file.type,
          size: file.size,
          base64Data,
          previewUrl: isImg ? base64Data : undefined,
          isImage: isImg,
        };
        setAttachments((prev) => [...prev, item]);
      }
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSendMessage = async (
    customText?: string,
    overrideMode?: 'direct' | 'step_by_step' | 'concept_breakdown' | 'hint'
  ) => {
    const textToSend = customText !== undefined ? customText : inputMessage;
    if ((!textToSend.trim() && attachments.length === 0) || isLoading) return;

    const modeToUse = overrideMode || activeMode;

    const userMsg: SubjectChatMessage = {
      id: `user-${Date.now()}`,
      subjectName: subject.name,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toISOString(),
      attachments: attachments.length > 0 ? attachments : undefined,
      attachment: attachments[0] || undefined,
      mode: modeToUse,
    };

    // Save and update state
    saveStoredSubjectMessage(subject.name, userMsg);
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    const currentAttachments = [...attachments];
    setAttachments([]);
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-8).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        content: m.content,
      }));

      const res = await fetch('/api/study/subject-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName: subject.name,
          message: textToSend.trim(),
          history: historyPayload,
          mode: modeToUse,
          attachments: currentAttachments.map((att) => ({
            base64Data: att.base64Data,
            mimeType: att.type,
            name: att.name,
            isVideo: att.isVideo,
            videoThumbnails: att.videoThumbnails,
          })),
        }),
      });

      const data = await res.json();
      if (data.data) {
        const assistantMsg: SubjectChatMessage = {
          id: `ai-${Date.now()}`,
          subjectName: subject.name,
          role: 'assistant',
          content: data.data.reply,
          finalAnswer: data.data.finalAnswer,
          stepByStep: data.data.stepByStep,
          timestamp: new Date().toISOString(),
          suggestions: data.data.suggestions || [],
        };
        saveStoredSubjectMessage(subject.name, assistantMsg);
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (e: any) {
      console.error('Chat error:', e);
      const fallbackMsg: SubjectChatMessage = {
        id: `ai-err-${Date.now()}`,
        subjectName: subject.name,
        role: 'assistant',
        content: `I am ready to solve any problem in **${subject.name}**. Please share the exact question, given variables, or numerical data.`,
        timestamp: new Date().toISOString(),
        suggestions: ['Solve numerical with steps', 'Show direct final answer'],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm(`Clear chat history for ${subject.name}?`)) {
      clearStoredSubjectChat(subject.name);
      setMessages([
        {
          id: `welcome-${subject.name}-${Date.now()}`,
          subjectName: subject.name,
          role: 'assistant',
          content: `Chat history cleared. Send any question or numerical in **${subject.name}** to get an immediate solution.`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  const handleSaveToNote = (msg: SubjectChatMessage, index: number) => {
    if (!onSaveAsNote) return;
    const title = `${subject.name}: Academic Solution`;
    onSaveAsNote(title, msg.content, subject.name);
    setSavedNoteIdx(index);
    setTimeout(() => setSavedNoteIdx(null), 2500);
  };

  return (
    <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8E4D9] shadow-xs flex flex-col h-[650px] overflow-hidden text-[#1C1E1B]">
      {/* Subject Chat Header */}
      <div className="px-5 py-4 bg-white border-b border-[#E8E4D9] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1B4332] text-[#FAF8F5] flex items-center justify-center font-serif-display font-bold text-lg shadow-xs">
            {subject.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[#1C1E1B]">{subject.name} Academic Solver</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-[#6B7267]">
              Specialized in {subject.topics.slice(0, 3).join(', ')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-lg text-[#8A9085] hover:text-[#1C1E1B] hover:bg-[#F4EFE6] transition-colors text-xs flex items-center gap-1 cursor-pointer"
            title="Clear Chat History"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Clear</span>
          </button>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={multiFileInputRef}
        accept="image/*,application/pdf,.txt,.md,.doc,.docx"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        type="file"
        ref={videoFileInputRef}
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          const msgAttachments = msg.attachments || (msg.attachment ? [msg.attachment] : []);

          return (
            <div
              key={msg.id || idx}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-[#1B4332] text-[#FAF8F5] flex-shrink-0 flex items-center justify-center font-bold text-xs mt-1 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#1B4332] text-[#FAF8F5] rounded-tr-xs shadow-xs'
                    : 'bg-white text-[#1C1E1B] border border-[#E8E4D9] rounded-tl-xs shadow-xs'
                }`}
              >
                {/* Media Attachments Ribbon if included */}
                {msgAttachments.length > 0 && (
                  <div className="mb-2.5 space-y-1.5">
                    <div className="flex flex-wrap gap-1.5">
                      {msgAttachments.map((att, aIdx) => (
                        <div
                          key={aIdx}
                          className="p-1.5 rounded-xl bg-black/15 border border-white/20 flex items-center gap-2"
                        >
                          {att.isImage && att.previewUrl ? (
                            <img
                              src={att.previewUrl}
                              alt="attachment"
                              className="w-12 h-12 object-cover rounded-lg border border-white/30"
                            />
                          ) : att.isVideo ? (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-red-200 bg-red-950/60 px-2 py-1 rounded-lg">
                              <Film className="w-3.5 h-3.5 text-red-400" />
                              <span>{att.durationSeconds || 10}s Lesson Video</span>
                            </div>
                          ) : (
                            <FileText className="w-4 h-4 text-white" />
                          )}
                          <span className="text-[10px] truncate max-w-[120px] font-medium text-white">
                            {att.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mode Indicator */}
                {msg.mode && msg.mode !== 'direct' && (
                  <div className="mb-1.5 text-[10px] uppercase font-mono-code font-bold tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded inline-block">
                    {msg.mode === 'hint' ? '🎯 Guiding Hint Mode' : msg.mode === 'step_by_step' ? '🔢 Step-by-Step Solution' : '💡 Concept Breakdown'}
                  </div>
                )}

                {/* Prominent Final Answer */}
                {msg.finalAnswer && (
                  <div className="mb-3 p-3 rounded-xl bg-[#E8F5E9] border border-emerald-300 text-[#0D2818]">
                    <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-[#1B4332] block mb-0.5">
                      🎯 Final Answer:
                    </span>
                    <span className="font-bold text-sm font-sans">{msg.finalAnswer}</span>
                  </div>
                )}

                {/* Message Body with Markdown */}
                <div className="space-y-2 prose prose-xs max-w-none text-inherit leading-relaxed font-normal">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>

                {/* AI Response Tools: Save to Notes, Generate Flashcards */}
                {!isUser && idx > 0 && (
                  <div className="mt-3 pt-2 border-t border-[#E8E4D9] flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#6B7267]">
                    <div className="flex items-center gap-2">
                      {onSaveAsNote && (
                        <button
                          onClick={() => handleSaveToNote(msg, idx)}
                          className="hover:text-[#1B4332] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          {savedNoteIdx === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">Saved to Notes!</span>
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-3 h-3 text-[#2D6A4F]" />
                              <span>Save to Notes</span>
                            </>
                          )}
                        </button>
                      )}

                      {onGenerateFlashcards && (
                        <button
                          onClick={() => onGenerateFlashcards(subject.name, msg.content)}
                          className="hover:text-[#1B4332] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Layers className="w-3 h-3 text-[#2D6A4F]" />
                          <span>Make Flashcards</span>
                        </button>
                      )}
                    </div>

                    <span className="text-[9px] text-[#8A9085]">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}

                {/* Follow-up Suggestions */}
                {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-[#E8E4D9]/60 flex flex-wrap gap-1.5">
                    {msg.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSendMessage(sug)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#E3EDE5] text-[#1B4332] border border-[#E8E4D9] font-medium transition-colors text-left cursor-pointer"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-[#E3EDE5] text-[#1B4332] flex-shrink-0 flex items-center justify-center font-bold text-xs mt-1 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-[#1B4332] text-[#FAF8F5] flex-shrink-0 flex items-center justify-center font-bold text-xs mt-1">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-xs p-4 border border-[#E8E4D9] text-xs text-[#6B7267] flex items-center gap-2 shadow-xs">
              <Loader2 className="w-4 h-4 animate-spin text-[#1B4332]" />
              <span>{subject.name} Academic Solver is processing chapter visuals & notes...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Multi-Media Attachment Tray */}
      {attachments.length > 0 && (
        <div className="px-4 py-2.5 bg-[#E3EDE5] border-t border-[#2D6A4F]/20 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-mono-code font-bold uppercase text-[#1B4332] shrink-0 mr-1">
            Attached ({attachments.length}):
          </span>

          {attachments.map((att, idx) => (
            <div
              key={idx}
              className="relative shrink-0 flex items-center gap-1.5 px-2 py-1 bg-white rounded-xl border border-[#2D6A4F]/30 shadow-xs"
            >
              {att.isImage && att.previewUrl ? (
                <img src={att.previewUrl} alt={att.name} className="w-6 h-6 object-cover rounded-md" />
              ) : att.isVideo ? (
                <Film className="w-4 h-4 text-red-600" />
              ) : (
                <FileText className="w-4 h-4 text-[#1B4332]" />
              )}
              <span className="text-[11px] font-semibold text-[#1C1E1B] truncate max-w-[100px]">
                {att.isVideo ? `Video (${att.durationSeconds}s)` : `Page ${idx + 1}`}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveAttachment(idx)}
                className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => multiFileInputRef.current?.click()}
            className="shrink-0 px-2 py-1 rounded-lg bg-white/70 hover:bg-white text-[10px] font-bold text-[#1B4332] border border-dashed border-[#2D6A4F] flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add More</span>
          </button>
        </div>
      )}

      {/* Solver Style Modes Selector */}
      <div className="px-4 py-2 bg-white border-t border-[#E8E4D9] flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-mono-code font-bold uppercase text-[#6B7267] mr-1">
          Solver Mode:
        </span>
        <button
          type="button"
          onClick={() => setActiveMode('direct')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
            activeMode === 'direct'
              ? 'bg-[#1B4332] text-[#FAF8F5] border border-[#1B4332] shadow-xs'
              : 'bg-[#FAF8F5] hover:bg-[#F4EFE6] text-[#555A51] border border-[#E8E4D9]'
          }`}
        >
          <span>⚡ Direct Answer</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('step_by_step')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
            activeMode === 'step_by_step'
              ? 'bg-[#1B4332] text-[#FAF8F5] border border-[#1B4332] shadow-xs'
              : 'bg-[#FAF8F5] hover:bg-[#F4EFE6] text-[#555A51] border border-[#E8E4D9]'
          }`}
        >
          <span>🔢 Step-by-Step</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('concept_breakdown')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
            activeMode === 'concept_breakdown'
              ? 'bg-[#1B4332] text-[#FAF8F5] border border-[#1B4332] shadow-xs'
              : 'bg-[#FAF8F5] hover:bg-[#F4EFE6] text-[#555A51] border border-[#E8E4D9]'
          }`}
        >
          <span>💡 Concept Breakdown</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('hint')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
            activeMode === 'hint'
              ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
              : 'bg-[#FAF8F5] hover:bg-[#F4EFE6] text-[#555A51] border border-[#E8E4D9]'
          }`}
        >
          <Lightbulb className="w-3 h-3 text-amber-600" />
          <span>🎯 Hint</span>
        </button>
      </div>

      {/* Input Box & Action Buttons */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-4 bg-white border-t border-[#E8E4D9] flex items-center gap-2"
      >
        {/* Multi-Photo Camera Scan Trigger */}
        <button
          type="button"
          onClick={handleOpenMultiPhotoCamera}
          className="p-2.5 rounded-xl border border-[#D5CFBF] hover:border-[#1B4332] hover:bg-[#E3EDE5] text-[#1B4332] transition-colors cursor-pointer flex items-center gap-1"
          title="Scan Multiple Chapter Photos"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Video Lesson Recorder Trigger */}
        <button
          type="button"
          onClick={handleOpenVideoRecorder}
          className="p-2.5 rounded-xl border border-red-200 hover:border-red-600 hover:bg-red-50 text-red-600 transition-colors cursor-pointer flex items-center gap-1"
          title="Record Lesson Video"
        >
          <Video className="w-4 h-4" />
        </button>

        {/* File/Doc Upload Trigger */}
        <button
          type="button"
          onClick={() => multiFileInputRef.current?.click()}
          className="p-2.5 rounded-xl border border-[#D5CFBF] hover:border-[#1B4332] hover:bg-[#E3EDE5] text-[#1B4332] transition-colors cursor-pointer"
          title="Upload Photos, PDF, or Video Files"
        >
          <Upload className="w-4 h-4" />
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Enter any ${subject.name} problem, or attach chapter photos / lesson video...`}
          className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-[#D5CFBF] bg-[#FCFBF8] text-[#1C1E1B] focus:outline-hidden focus:ring-2 focus:ring-[#1B4332]"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={(!inputMessage.trim() && attachments.length === 0) || isLoading}
          className="p-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] transition-all disabled:opacity-50 cursor-pointer shadow-sm active:scale-95 flex items-center gap-1 font-bold text-xs"
          title="Solve Question"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Live In-App Viewfinder & Photo/Video Capture Modal */}
      <CameraCaptureModal
        isOpen={cameraAccess.isCaptureModalOpen}
        onClose={cameraAccess.closeCaptureModal}
        initialMode={cameraAccess.activeMode}
        onCapture={cameraAccess.handleCapturePhoto}
        onCaptureMultiple={cameraAccess.handleCaptureMultiple}
        onCaptureVideo={cameraAccess.handleCaptureVideo}
      />
    </div>
  );
};
