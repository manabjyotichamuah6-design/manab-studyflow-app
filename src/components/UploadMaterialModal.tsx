import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  FileText,
  BookOpen,
  X,
  Sparkles,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Image as ImageIcon,
  AlertCircle,
  Video,
  Plus,
  Trash2,
  Layers,
  Film,
  Play,
} from 'lucide-react';
import { SubjectItem, ExtractedMaterial, FileAttachmentData } from '../types';
import { useCameraAccess } from '../hooks/useCameraAccess';
import { CameraCaptureModal, VideoRecordedResult } from './CameraCaptureModal';
import { extractKeyframesFromVideo } from '../utils/videoUtils';

interface UploadMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: SubjectItem[];
  defaultSubject?: string;
  onExtractedForNotes: (extracted: ExtractedMaterial, subject: string) => void;
  onExtractedForWorkspace: (extracted: ExtractedMaterial) => void;
}

export const UploadMaterialModal: React.FC<UploadMaterialModalProps> = ({
  isOpen,
  onClose,
  subjects,
  defaultSubject,
  onExtractedForNotes,
  onExtractedForWorkspace,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>(
    defaultSubject || subjects[0]?.name || 'Science'
  );

  // Array of files (supporting multiple photos of chapter/notes or video)
  const [mediaList, setMediaList] = useState<FileAttachmentData[]>([]);
  const [activeVideo, setActiveVideo] = useState<FileAttachmentData | null>(null);

  const [typedTopic, setTypedTopic] = useState<string>('');
  const [typedContent, setTypedContent] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractedResult, setExtractedResult] = useState<ExtractedMaterial | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const multiFileInputRef = useRef<HTMLInputElement | null>(null);
  const videoFileInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  const cameraAccess = useCameraAccess();

  if (!isOpen) return null;

  // Multi-photo camera scan trigger
  const handleOpenMultiPhotoCamera = () => {
    cameraAccess.requestMultiPhotoScan((photos) => {
      if (!photos || photos.length === 0) return;
      const newItems: FileAttachmentData[] = photos.map((p, idx) => ({
        name: p.filename || `Chapter Page ${mediaList.length + idx + 1}`,
        type: 'image/jpeg',
        base64Data: p.base64Data,
        previewUrl: p.base64Data,
        isImage: true,
      }));
      setMediaList((prev) => [...prev, ...newItems]);
      setActiveVideo(null);
    });
  };

  // Video recording trigger
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
      setActiveVideo(videoItem);
      setMediaList([videoItem]);
    });
  };

  // Multiple files selection from gallery/disk
  const handleSelectFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg(null);
    const newItems: FileAttachmentData[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImg = file.type.startsWith('image/');
      const isVid = file.type.startsWith('video/');
      const isPdf = file.type === 'application/pdf';

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
        setActiveVideo(videoItem);
        setMediaList([videoItem]);
        return;
      } else {
        const reader = new FileReader();
        const base64Data = await new Promise<string>((res) => {
          reader.onload = () => res(reader.result as string);
          reader.readAsDataURL(file);
        });

        newItems.push({
          name: file.name,
          type: file.type,
          size: file.size,
          base64Data,
          previewUrl: isImg ? base64Data : undefined,
          isImage: isImg,
        });
      }
    }

    setMediaList((prev) => [...prev, ...newItems]);
    setActiveVideo(null);
  };

  const handleRemoveMedia = (index: number) => {
    setMediaList((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      if (next.length === 0) setActiveVideo(null);
      return next;
    });
  };

  const handleProcessMediaList = async () => {
    if (mediaList.length === 0 && !typedContent.trim() && !typedTopic.trim()) return;

    setIsExtracting(true);
    setErrorMsg(null);
    setExtractedResult(null);

    try {
      const isVideo = activeVideo !== null || mediaList.some((m) => m.isVideo);
      const payload: any = {
        isVideo,
        filename: mediaList[0]?.name || typedTopic || 'Study Material',
        textContent: typedContent.trim() || typedTopic.trim(),
        files: mediaList.map((m) => ({
          base64Data: m.base64Data,
          mimeType: m.type || 'image/jpeg',
          filename: m.name,
          isVideo: m.isVideo,
          videoThumbnails: m.videoThumbnails,
        })),
        videoThumbnails: activeVideo?.videoThumbnails || [],
      };

      const res = await fetch('/api/study/extract-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.data) {
        setExtractedResult(data.data);
        if (data.data.subjectSuggestion) {
          const match = subjects.find(
            (s) => s.name.toLowerCase() === data.data.subjectSuggestion.toLowerCase()
          );
          if (match) setSelectedSubject(match.name);
        }
      } else {
        setErrorMsg(data.error || 'Could not extract content from the files.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to process study material. You can still paste your notes directly.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleApplyToNotes = () => {
    if (!extractedResult) return;
    onExtractedForNotes(extractedResult, selectedSubject);
    onClose();
  };

  const handleApplyToWorkspace = () => {
    if (!extractedResult) return;
    onExtractedForWorkspace(extractedResult);
    onClose();
  };

  const resetModal = () => {
    setMediaList([]);
    setActiveVideo(null);
    setExtractedResult(null);
    setTypedTopic('');
    setTypedContent('');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF8F5] w-full max-w-2xl rounded-3xl border border-[#E8E4D9] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-[#1C1E1B]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E4D9]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#1B4332] text-[#FAF8F5] flex items-center justify-center shadow-md">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-display font-bold text-xl sm:text-2xl text-[#1C1E1B]">
                Upload Study Material
              </h2>
              <p className="text-xs text-[#6B7267]">
                Add multiple photos of chapters/notes or record video lesson for instant AI notes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8A9085] hover:text-[#1C1E1B] hover:bg-[#F4EFE6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden inputs */}
        <input
          type="file"
          ref={multiFileInputRef}
          accept="image/*,application/pdf,.txt,.md,.doc,.docx"
          multiple
          onChange={handleSelectFiles}
          className="hidden"
        />
        <input
          type="file"
          ref={videoFileInputRef}
          accept="video/*"
          onChange={handleSelectFiles}
          className="hidden"
        />
        <input
          type="file"
          ref={pdfInputRef}
          accept="application/pdf"
          onChange={handleSelectFiles}
          className="hidden"
        />

        {/* Content Section */}
        {!extractedResult ? (
          <div className="space-y-6 pt-6">
            {/* Subject Selector */}
            <div>
              <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#333830] mb-1.5">
                Target Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#DCD6C7] bg-white text-sm font-semibold text-[#1C1E1B] focus:ring-2 focus:ring-[#1B4332]"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Media Upload Options Grid (Multi-Photo, Video Lesson, File Upload) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Multi-Photo Camera Scan */}
              <button
                id="btn-trigger-camera-snap"
                type="button"
                onClick={handleOpenMultiPhotoCamera}
                disabled={isExtracting}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E4D9] hover:border-[#1B4332] hover:bg-[#E3EDE5] transition-all text-center flex flex-col items-center justify-center gap-2 group cursor-pointer shadow-xs active:scale-98 disabled:opacity-50 relative"
              >
                <div className="w-12 h-12 rounded-xl bg-[#E3EDE5] text-[#1B4332] group-hover:bg-[#1B4332] group-hover:text-white transition-colors flex items-center justify-center shadow-xs">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="font-bold text-xs text-[#1C1E1B] group-hover:text-[#1B4332] flex items-center gap-1">
                  <span>📸 Scan Chapter Photos</span>
                </div>
                <div className="text-[10px] text-[#6B7267] leading-tight">
                  Snap multiple pages of notes, textbook or whiteboard
                </div>
              </button>

              {/* Option 2: Record Video Lesson */}
              <button
                id="btn-trigger-video-record"
                type="button"
                onClick={handleOpenVideoRecorder}
                disabled={isExtracting}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E4D9] hover:border-[#1B4332] hover:bg-[#E3EDE5] transition-all text-center flex flex-col items-center justify-center gap-2 group cursor-pointer shadow-xs active:scale-98 disabled:opacity-50"
              >
                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors flex items-center justify-center shadow-xs">
                  <Video className="w-6 h-6" />
                </div>
                <div className="font-bold text-xs text-[#1C1E1B] group-hover:text-[#1B4332]">
                  🎥 Record Lesson Video
                </div>
                <div className="text-[10px] text-[#6B7267] leading-tight">
                  Take a video of the lesson, lecture or teacher explanation
                </div>
              </button>

              {/* Option 3: Choose Multiple Files / PDF / Video */}
              <button
                type="button"
                onClick={() => multiFileInputRef.current?.click()}
                disabled={isExtracting}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E4D9] hover:border-[#1B4332] hover:bg-[#E3EDE5] transition-all text-center flex flex-col items-center justify-center gap-2 group cursor-pointer shadow-xs active:scale-98 disabled:opacity-50"
              >
                <div className="w-12 h-12 rounded-xl bg-[#E3EDE5] text-[#1B4332] group-hover:bg-[#1B4332] group-hover:text-white transition-colors flex items-center justify-center shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="font-bold text-xs text-[#1C1E1B] group-hover:text-[#1B4332]">
                  📁 Select Files
                </div>
                <div className="text-[10px] text-[#6B7267] leading-tight">
                  Upload multiple chapter photos, PDF, or video files
                </div>
              </button>
            </div>

            {/* Uploaded Media Tray / Preview if any media added */}
            {mediaList.length > 0 && (
              <div className="bg-white p-4 rounded-2xl border border-[#D5CFBF] space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1B4332]">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>
                      {activeVideo
                        ? `🎥 Lesson Video Attached (${activeVideo.durationSeconds}s)`
                        : `📸 Chapter Pages Attached (${mediaList.length} ${mediaList.length === 1 ? 'photo' : 'photos'})`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => multiFileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-[#E3EDE5] hover:bg-[#D5E3D8] text-[#1B4332] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add More Photos</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMediaList([]);
                        setActiveVideo(null);
                      }}
                      className="text-xs text-red-600 hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Video Preview if video attached */}
                {activeVideo ? (
                  <div className="space-y-2">
                    <div className="relative aspect-video max-h-48 rounded-xl overflow-hidden bg-black flex items-center justify-center">
                      <video src={activeVideo.previewUrl} controls className="w-full h-full object-contain" />
                    </div>
                    {activeVideo.videoThumbnails && activeVideo.videoThumbnails.length > 0 && (
                      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                        <span className="text-[10px] font-mono-code text-[#6B7267] shrink-0 mr-1">
                          Keyframes:
                        </span>
                        {activeVideo.videoThumbnails.map((thumb, idx) => (
                          <img
                            key={idx}
                            src={thumb}
                            alt={`Frame ${idx + 1}`}
                            className="h-10 w-16 object-cover rounded-md border border-[#E8E4D9] shrink-0"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Photo Grid */
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                    {mediaList.map((item, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-3/4 rounded-xl overflow-hidden border border-[#E8E4D9] bg-[#F4EFE6] group shadow-xs"
                      >
                        {item.previewUrl ? (
                          <img src={item.previewUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                            <FileText className="w-6 h-6 text-[#1B4332] mb-1" />
                            <span className="text-[9px] font-bold text-[#1C1E1B] truncate max-w-full">
                              {item.name}
                            </span>
                          </div>
                        )}
                        <span className="absolute bottom-1 left-1 bg-black/75 text-white text-[9px] font-mono-code px-1.5 py-0.5 rounded">
                          Page {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                          title="Remove photo"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Direct Action Trigger */}
                <button
                  type="button"
                  id="btn-process-attached-media"
                  onClick={handleProcessMediaList}
                  disabled={isExtracting}
                  className="w-full py-3 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>
                    Generate AI Notes in Seconds (from {mediaList.length} {activeVideo ? 'Video' : mediaList.length === 1 ? 'Page' : 'Pages'})
                  </span>
                </button>
              </div>
            )}

            {/* Loading Indicator */}
            {isExtracting && (
              <div className="bg-[#E3EDE5] p-5 rounded-2xl border border-[#2D6A4F]/40 flex items-center gap-3 animate-pulse">
                <Loader2 className="w-6 h-6 animate-spin text-[#1B4332]" />
                <div>
                  <div className="font-bold text-sm text-[#1B4332]">
                    Synthesizing complete chapter notes with AI in seconds...
                  </div>
                  <div className="text-xs text-[#2D6A4F]">
                    Transcribing all pages, extracting equations, definitions, and building study pack.
                  </div>
                </div>
              </div>
            )}

            {/* Error banner */}
            {errorMsg && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-[#E8E4D9]" />
              <span className="text-xs font-mono-code text-[#8A9085] uppercase">
                Or Type / Paste Notes Directly
              </span>
              <div className="flex-1 h-px bg-[#E8E4D9]" />
            </div>

            {/* Direct Paste / Type Box */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#4B5047] mb-1">
                  Topic Title (Optional)
                </label>
                <input
                  type="text"
                  value={typedTopic}
                  onChange={(e) => setTypedTopic(e.target.value)}
                  placeholder="e.g., Photosynthesis Reactions, Calculus Integration by Parts"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D5CFBF] bg-white text-[#1C1E1B] focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4B5047] mb-1">
                  Notes, Textbook Text, or Questions
                </label>
                <textarea
                  rows={3}
                  value={typedContent}
                  onChange={(e) => setTypedContent(e.target.value)}
                  placeholder="Paste any notes, syllabus paragraphs, or questions you want to learn..."
                  className="w-full p-3.5 text-xs rounded-xl border border-[#D5CFBF] bg-white text-[#1C1E1B] focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>

              <button
                type="button"
                onClick={handleProcessMediaList}
                disabled={!typedContent.trim() && !typedTopic.trim() && mediaList.length === 0}
                className="w-full py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Process & Generate Notes</span>
              </button>
            </div>
          </div>
        ) : (
          /* Extraction Result Preview & Choice Section */
          <div className="space-y-5 pt-6 animate-fade-in">
            <div className="bg-[#E3EDE5] rounded-2xl p-4 border border-[#2D6A4F] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#1B4332]" />
                <div>
                  <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-[#2D6A4F]">
                    {extractedResult.isVideoLesson
                      ? '🎥 Video Lesson Notes Ready in Seconds'
                      : `📚 ${extractedResult.sourceMediaCount || 1} Chapter Pages Processed`}
                  </span>
                  <h3 className="font-bold text-base text-[#1B4332]">{extractedResult.topic}</h3>
                  <p className="text-xs text-[#2D6A4F]">
                    Suggested Subject: <strong>{selectedSubject}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={resetModal}
                className="text-xs font-bold text-[#1B4332] hover:underline cursor-pointer"
              >
                Upload More Material
              </button>
            </div>

            {/* Summary preview */}
            <div className="bg-white p-4 rounded-xl border border-[#E8E4D9] space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F]">
                Executive Summary
              </div>
              <p className="text-xs text-[#1C1E1B] leading-relaxed">
                {extractedResult.summaryPreview}
              </p>
            </div>

            {/* Key Concepts Extracted */}
            {extractedResult.keyConcepts && extractedResult.keyConcepts.length > 0 && (
              <div className="bg-white p-4 rounded-xl border border-[#E8E4D9] space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F]">
                  Key Concepts Identified
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {extractedResult.keyConcepts.map((kc, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-semibold bg-[#E3EDE5] text-[#1B4332] px-2.5 py-1 rounded-lg"
                    >
                      ✓ {kc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted text snippet */}
            <div className="bg-white p-4 rounded-xl border border-[#E8E4D9] space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F]">
                Transcribed Notes & Formulas
              </div>
              <div className="text-xs text-[#555A51] max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed font-sans bg-[#FAF8F5] p-3 rounded-lg border border-[#E8E4D9]">
                {extractedResult.extractedText}
              </div>
            </div>

            {/* Choice Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleApplyToNotes}
                className="p-4 rounded-2xl bg-white border border-[#2D6A4F] hover:bg-[#E3EDE5] text-[#1B4332] transition-all text-left group cursor-pointer shadow-xs"
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>Save to {selectedSubject} Notes</span>
                  <FileText className="w-4 h-4 text-[#2D6A4F]" />
                </div>
                <p className="text-[11px] text-[#6B7267] mt-1">
                  Keep in your notes library to summarize, explain, and review anytime.
                </p>
              </button>

              <button
                onClick={handleApplyToWorkspace}
                className="p-4 rounded-2xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] transition-all text-left group cursor-pointer shadow-md"
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>Generate Full Study Pack</span>
                  <ArrowRight className="w-4 h-4 text-[#FAF8F5]" />
                </div>
                <p className="text-[11px] text-white/80 mt-1">
                  Instant flashcards, practice quiz, Feynman explanation & revision plan.
                </p>
              </button>
            </div>
          </div>
        )}
      </div>

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
