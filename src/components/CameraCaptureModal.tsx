import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Video,
  X,
  RotateCw,
  Check,
  RefreshCw,
  AlertCircle,
  Upload,
  Plus,
  Trash2,
  Square,
  Sparkles,
  Layers,
  Play,
  Film,
} from 'lucide-react';
import { extractKeyframesFromVideo } from '../utils/videoUtils';

export interface ScannedPageItem {
  id: string;
  base64Data: string;
  filename: string;
  timestamp: string;
}

export interface VideoRecordedResult {
  blob: Blob;
  base64Data: string;
  previewUrl: string;
  videoThumbnails: string[];
  durationSeconds: number;
  filename: string;
}

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'photo' | 'multi-photo' | 'video';
  onCapture?: (base64Image: string, filename: string) => void;
  onCaptureMultiple?: (photos: { base64Data: string; filename: string }[]) => void;
  onCaptureVideo?: (videoResult: VideoRecordedResult) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'photo',
  onCapture,
  onCaptureMultiple,
  onCaptureVideo,
}) => {
  const [activeTab, setActiveTab] = useState<'photo' | 'video'>(
    initialMode === 'video' ? 'video' : 'photo'
  );
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Multi-photo scan stack
  const [scannedPages, setScannedPages] = useState<ScannedPageItem[]>([]);
  const [selectedPreviewPage, setSelectedPreviewPage] = useState<ScannedPageItem | null>(null);

  // Video recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedVideo, setRecordedVideo] = useState<VideoRecordedResult | null>(null);
  const [isExtractingFrames, setIsExtractingFrames] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const fileFallbackPhotoRef = useRef<HTMLInputElement | null>(null);
  const fileFallbackVideoRef = useRef<HTMLInputElement | null>(null);

  const stopCurrentStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(
    async (mode: 'environment' | 'user', withAudio: boolean = false) => {
      setIsLoading(true);
      setCameraError(null);
      stopCurrentStream();

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Live camera streaming is not supported on this browser/device.');
        }

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: withAudio,
        };

        let newStream: MediaStream;
        try {
          newStream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (audioErr) {
          // If audio access fails or is denied, retry with video-only
          console.warn('Audio constraint failed, retrying video only:', audioErr);
          newStream = await navigator.mediaDevices.getUserMedia({
            video: constraints.video,
            audio: false,
          });
        }

        setStream(newStream);
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          await videoRef.current.play();
        }
        setIsLoading(false);
      } catch (err: any) {
        console.warn('Live camera stream error, offering fallback:', err);
        setIsLoading(false);
        setCameraError(
          err.message || 'Unable to access live camera stream. You can still upload photos or videos.'
        );
      }
    },
    [stopCurrentStream]
  );

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode, activeTab === 'video');
    } else {
      stopCurrentStream();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      stopCurrentStream();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isOpen, facingMode, activeTab]);

  useEffect(() => {
    if (initialMode === 'video') {
      setActiveTab('video');
    } else {
      setActiveTab('photo');
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleFlipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode, activeTab === 'video');
  };

  // --- PHOTO CAPTURE LOGIC ---
  const handleTakePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    const base64 = canvas.toDataURL('image/jpeg', 0.92);
    const newPage: ScannedPageItem = {
      id: `page-${Date.now()}-${scannedPages.length + 1}`,
      base64Data: base64,
      filename: `chapter-page-${scannedPages.length + 1}-${Date.now()}.jpg`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setScannedPages((prev) => [...prev, newPage]);
    setSelectedPreviewPage(newPage);
  };

  const handleRemovePage = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = scannedPages.filter((p) => p.id !== id);
    setScannedPages(updated);
    if (selectedPreviewPage?.id === id) {
      setSelectedPreviewPage(updated[updated.length - 1] || null);
    }
  };

  const handleConfirmPhotos = () => {
    if (scannedPages.length === 0) return;

    if (scannedPages.length === 1 && onCapture) {
      onCapture(scannedPages[0].base64Data, scannedPages[0].filename);
    }

    if (onCaptureMultiple) {
      onCaptureMultiple(
        scannedPages.map((p) => ({ base64Data: p.base64Data, filename: p.filename }))
      );
    } else if (onCapture) {
      onCapture(scannedPages[0].base64Data, scannedPages[0].filename);
    }

    stopCurrentStream();
    onClose();
  };

  // --- VIDEO RECORDING LOGIC ---
  const handleStartVideoRecording = () => {
    if (!stream) return;
    recordedChunksRef.current = [];
    setRecordedVideo(null);
    setRecordingSeconds(0);

    try {
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4',
      ];
      const supportedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || '';

      const recorder = new MediaRecorder(stream, supportedMime ? { mimeType: supportedMime } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        setIsExtractingFrames(true);
        const mimeType = recorder.mimeType || 'video/webm';
        const videoBlob = new Blob(recordedChunksRef.current, { type: mimeType });
        const previewUrl = URL.createObjectURL(videoBlob);

        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Data = (reader.result as string) || '';
          const filename = `lesson-recording-${Date.now()}.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`;

          // Extract keyframes from the recorded lesson video
          const { keyframes, durationSeconds } = await extractKeyframesFromVideo(videoBlob, 4);

          setRecordedVideo({
            blob: videoBlob,
            base64Data,
            previewUrl,
            videoThumbnails: keyframes,
            durationSeconds: durationSeconds || recordingSeconds || 5,
            filename,
          });
          setIsExtractingFrames(false);
        };
        reader.readAsDataURL(videoBlob);
      };

      recorder.start(1000);
      setIsRecording(true);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((sec) => {
          // Auto-stop at 2 minutes to keep payload optimal
          if (sec >= 120) {
            handleStopVideoRecording();
            return 120;
          }
          return sec + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('MediaRecorder start error:', err);
      setCameraError('Unable to start video recorder on this device. You can upload a video file instead.');
    }
  };

  const handleStopVideoRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleConfirmVideo = () => {
    if (!recordedVideo) return;
    if (onCaptureVideo) {
      onCaptureVideo(recordedVideo);
    }
    stopCurrentStream();
    onClose();
  };

  const handleFallbackPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const newPage: ScannedPageItem = {
          id: `upload-${Date.now()}-${idx}`,
          base64Data: base64,
          filename: file.name || `photo-${idx + 1}.jpg`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setScannedPages((prev) => [...prev, newPage]);
        setSelectedPreviewPage(newPage);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFallbackVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtractingFrames(true);
    const previewUrl = URL.createObjectURL(file);
    const reader = new FileReader();

    reader.onload = async () => {
      const base64Data = reader.result as string;
      const { keyframes, durationSeconds } = await extractKeyframesFromVideo(file, 4);

      setRecordedVideo({
        blob: file,
        base64Data,
        previewUrl,
        videoThumbnails: keyframes,
        durationSeconds: durationSeconds || 10,
        filename: file.name,
      });
      setIsExtractingFrames(false);
    };
    reader.readAsDataURL(file);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      id="camera-capture-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white"
    >
      <div className="bg-[#141815] w-full max-w-3xl rounded-3xl border border-[#2D3830] shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
        {/* Top Header with Mode Tabs */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-[#2D3830] flex items-center justify-between bg-[#1A201C]">
          <div className="flex items-center gap-3">
            {/* Mode Switch Tabs */}
            <div className="flex items-center bg-[#252E28] p-1 rounded-2xl border border-[#313C34]">
              <button
                type="button"
                onClick={() => {
                  if (isRecording) handleStopVideoRecording();
                  setActiveTab('photo');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'photo'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#A2ADA5] hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>📸 Multi-Photo Scan</span>
                {scannedPages.length > 0 && (
                  <span className="ml-1 bg-emerald-500 text-black text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {scannedPages.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedPreviewPage(null);
                  setActiveTab('video');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'video'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#A2ADA5] hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-red-400" />
                <span>🎥 Record Lesson Video</span>
              </button>
            </div>
          </div>

          <button
            id="btn-close-camera-capture"
            onClick={() => {
              if (isRecording) handleStopVideoRecording();
              stopCurrentStream();
              onClose();
            }}
            className="p-2 rounded-xl text-[#A2ADA5] hover:text-white hover:bg-[#252E28] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Canvas Area */}
        <div className="relative bg-black flex-1 min-h-[320px] sm:min-h-[420px] flex items-center justify-center overflow-hidden">
          <canvas ref={canvasRef} className="hidden" />

          {/* Hidden Fallbacks */}
          <input
            type="file"
            ref={fileFallbackPhotoRef}
            accept="image/*"
            multiple
            capture="environment"
            onChange={handleFallbackPhoto}
            className="hidden"
          />
          <input
            type="file"
            ref={fileFallbackVideoRef}
            accept="video/*"
            capture="environment"
            onChange={handleFallbackVideo}
            className="hidden"
          />

          {/* TAB 1: PHOTO PREVIEW OR LIVE VIEWFINDER */}
          {activeTab === 'photo' && (
            <>
              {selectedPreviewPage ? (
                /* Preview Selected Photo */
                <div className="relative w-full h-full flex flex-col items-center justify-center p-3 bg-black">
                  <img
                    src={selectedPreviewPage.base64Data}
                    alt="Captured study page"
                    className="max-h-[50vh] sm:max-h-[58vh] w-auto object-contain rounded-2xl border border-[#2D3830]"
                  />
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-xs text-xs text-white px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Page {scannedPages.findIndex((p) => p.id === selectedPreviewPage.id) + 1} of {scannedPages.length}</span>
                  </div>

                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRemovePage(selectedPreviewPage.id)}
                      className="px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Page</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPreviewPage(null)}
                      className="px-3 py-1.5 rounded-xl bg-[#252E28] hover:bg-[#313C34] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Scan Another Page</span>
                    </button>
                  </div>
                </div>
              ) : cameraError ? (
                /* Fallback on Error */
                <div className="p-8 text-center max-w-md space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-950/80 text-amber-400 border border-amber-800/60 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-white">Camera Viewfinder Ready</h3>
                    <p className="text-xs text-[#A2ADA5] leading-relaxed">{cameraError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileFallbackPhotoRef.current?.click()}
                    className="px-6 py-3 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 mx-auto cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Upload or Snap from Device</span>
                  </button>
                </div>
              ) : (
                /* Live Camera Stream for Photos */
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                  {isLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                      <span className="text-xs text-[#A2ADA5]">Starting high-res camera...</span>
                    </div>
                  )}

                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full max-h-[58vh] object-cover ${
                      facingMode === 'user' ? 'scale-x-[-1]' : ''
                    }`}
                  />

                  {/* Corner Guides */}
                  <div className="absolute inset-6 sm:inset-10 border-2 border-dashed border-white/30 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                    <div className="flex justify-between">
                      <div className="w-5 h-5 border-t-2 border-l-2 border-emerald-400 -mt-1 -ml-1" />
                      <div className="w-5 h-5 border-t-2 border-r-2 border-emerald-400 -mt-1 -mr-1" />
                    </div>
                    <div className="text-center">
                      <span className="bg-black/70 backdrop-blur-xs text-[11px] font-mono-code text-[#E8F5E9] px-3 py-1 rounded-full border border-white/20">
                        {scannedPages.length > 0
                          ? `Ready for Page ${scannedPages.length + 1} • Align chapter or notes`
                          : 'Align textbook, notebook, or problem sheet'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <div className="w-5 h-5 border-b-2 border-l-2 border-emerald-400 -mb-1 -ml-1" />
                      <div className="w-5 h-5 border-b-2 border-r-2 border-emerald-400 -mb-1 -mr-1" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: VIDEO RECORDING OR PREVIEW */}
          {activeTab === 'video' && (
            <>
              {recordedVideo ? (
                /* Review Recorded Lesson Video */
                <div className="relative w-full h-full flex flex-col items-center justify-center p-3 sm:p-4 bg-black space-y-3">
                  <div className="relative max-h-[50vh] w-full flex items-center justify-center">
                    <video
                      src={recordedVideo.previewUrl}
                      controls
                      playsInline
                      className="max-h-[48vh] w-auto max-w-full rounded-2xl border border-[#2D3830] shadow-xl"
                    />
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-xs text-white px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-red-400" />
                      <span>{recordedVideo.durationSeconds}s Lesson Video Ready</span>
                    </div>
                  </div>

                  {/* Extracted Keyframe Snippets Badge */}
                  {recordedVideo.videoThumbnails.length > 0 && (
                    <div className="bg-[#1A201C] p-2.5 rounded-2xl border border-[#2D3830] w-full max-w-md">
                      <div className="text-[10px] font-mono-code uppercase tracking-wider text-emerald-400 font-bold mb-1.5 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        <span>AI Video Keyframes Sampled ({recordedVideo.videoThumbnails.length})</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {recordedVideo.videoThumbnails.map((thumb, idx) => (
                          <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-white/20 bg-black">
                            <img src={thumb} alt={`Frame ${idx + 1}`} className="w-full h-full object-cover" />
                            <span className="absolute bottom-0.5 right-1 text-[8px] bg-black/80 text-white px-1 rounded font-mono-code">
                              #{idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : isExtractingFrames ? (
                /* Processing Keyframes */
                <div className="p-8 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
                  <h3 className="font-bold text-sm text-white">Analyzing Lesson Video & Extracting Keyframes...</h3>
                  <p className="text-xs text-[#A2ADA5]">Sampling slides, whiteboard notes, and formulas for the AI.</p>
                </div>
              ) : (
                /* Live Camera for Video Recording */
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full max-h-[58vh] object-cover ${
                      facingMode === 'user' ? 'scale-x-[-1]' : ''
                    }`}
                  />

                  {/* Recording Duration Indicator Overlay */}
                  {isRecording && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-950/90 border border-red-500/80 text-white px-4 py-1.5 rounded-full flex items-center gap-2 shadow-xl animate-pulse">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                      <span className="font-mono-code font-bold text-xs">{formatTimer(recordingSeconds)} / 02:00</span>
                      <span className="text-[10px] text-red-200 uppercase tracking-wider font-semibold">Recording Lesson</span>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-xs text-[11px] text-white px-4 py-1 rounded-full border border-white/20 text-center pointer-events-none">
                    Record teacher explanation, whiteboard notes, or textbook demo
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Scanned Pages Gallery Tray (Multi-Photo Mode) */}
        {activeTab === 'photo' && scannedPages.length > 0 && (
          <div className="px-4 py-2.5 bg-[#121613] border-t border-[#252E28] flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-mono-code font-bold uppercase text-[#A2ADA5] shrink-0 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pages ({scannedPages.length}):</span>
            </span>

            {scannedPages.map((page, idx) => (
              <div
                key={page.id}
                onClick={() => setSelectedPreviewPage(page)}
                className={`relative shrink-0 w-12 h-16 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                  selectedPreviewPage?.id === page.id
                    ? 'border-emerald-400 ring-2 ring-emerald-400/40 scale-105'
                    : 'border-[#313C34] opacity-80 hover:opacity-100'
                }`}
              >
                <img src={page.base64Data} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] font-mono-code text-center text-white py-0.5">
                  P.{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleRemovePage(page.id, e)}
                  className="absolute top-0.5 right-0.5 bg-red-600/90 text-white rounded-full p-0.5 hover:bg-red-700"
                  title="Remove page"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setSelectedPreviewPage(null)}
              className="shrink-0 h-16 px-3 rounded-lg border border-dashed border-[#313C34] hover:border-emerald-400 text-[#A2ADA5] hover:text-white flex flex-col items-center justify-center gap-1 text-[10px] font-bold cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Add Page</span>
            </button>
          </div>
        )}

        {/* Footer Action Bar */}
        <div className="p-4 sm:p-5 bg-[#1A201C] border-t border-[#2D3830] flex items-center justify-between">
          {activeTab === 'photo' ? (
            /* PHOTO MODE CONTROLS */
            <div className="w-full flex items-center justify-between gap-3">
              {/* Device photo fallback */}
              <button
                type="button"
                onClick={() => fileFallbackPhotoRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-[#252E28] hover:bg-[#313C34] text-[#A2ADA5] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Upload Photo(s)</span>
              </button>

              {/* Snap Button */}
              <button
                id="btn-snap-camera-photo"
                type="button"
                onClick={() => {
                  setSelectedPreviewPage(null);
                  handleTakePhoto();
                }}
                disabled={isLoading || !!cameraError}
                className="w-16 h-16 rounded-full bg-white hover:bg-emerald-100 p-1.5 shadow-xl transition-transform active:scale-90 disabled:opacity-50 cursor-pointer flex items-center justify-center group shrink-0"
                title="Snap Page Photo"
              >
                <div className="w-full h-full rounded-full border-4 border-[#1B4332] bg-white group-hover:bg-emerald-50 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-[#1B4332]" />
                </div>
              </button>

              {/* Confirm / Finish All Pages Button */}
              {scannedPages.length > 0 ? (
                <button
                  id="btn-confirm-all-photos"
                  type="button"
                  onClick={handleConfirmPhotos}
                  className="px-5 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer animate-fade-in"
                >
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Done ({scannedPages.length} {scannedPages.length === 1 ? 'Page' : 'Pages'})</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFlipCamera}
                  disabled={isLoading || !!cameraError}
                  className="px-3.5 py-2 rounded-xl bg-[#252E28] hover:bg-[#313C34] text-[#A2ADA5] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
                  title="Switch Front / Rear Camera"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Flip</span>
                </button>
              )}
            </div>
          ) : (
            /* VIDEO MODE CONTROLS */
            <div className="w-full flex items-center justify-between gap-3">
              {recordedVideo ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setRecordedVideo(null);
                      setRecordingSeconds(0);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#252E28] hover:bg-[#313C34] text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Record Again</span>
                  </button>

                  <button
                    id="btn-confirm-recorded-video"
                    type="button"
                    onClick={handleConfirmVideo}
                    className="px-6 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                    <span>Generate AI Notes from Lesson Video</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Upload video file */}
                  <button
                    type="button"
                    onClick={() => fileFallbackVideoRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-[#252E28] hover:bg-[#313C34] text-[#A2ADA5] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Upload Video File</span>
                  </button>

                  {/* Big Record / Stop Button */}
                  {isRecording ? (
                    <button
                      type="button"
                      onClick={handleStopVideoRecording}
                      className="px-8 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xl animate-pulse cursor-pointer"
                    >
                      <Square className="w-4 h-4 fill-white" />
                      <span>Stop Recording ({formatTimer(recordingSeconds)})</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartVideoRecording}
                      disabled={isLoading || !!cameraError}
                      className="w-16 h-16 rounded-full bg-white hover:bg-red-100 p-1.5 shadow-xl transition-transform active:scale-90 disabled:opacity-50 cursor-pointer flex items-center justify-center group shrink-0"
                      title="Start Recording Lesson Video"
                    >
                      <div className="w-full h-full rounded-full border-4 border-red-600 bg-white group-hover:bg-red-50 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-red-600" />
                      </div>
                    </button>
                  )}

                  {/* Flip camera */}
                  <button
                    type="button"
                    onClick={handleFlipCamera}
                    disabled={isRecording || isLoading || !!cameraError}
                    className="px-3.5 py-2 rounded-xl bg-[#252E28] hover:bg-[#313C34] text-[#A2ADA5] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
                    title="Switch Front / Rear Camera"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Flip</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
