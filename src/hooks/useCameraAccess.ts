import { useState, useCallback } from 'react';
import { VideoRecordedResult } from '../components/CameraCaptureModal';

export interface UseCameraAccessReturn {
  isCaptureModalOpen: boolean;
  activeMode: 'photo' | 'multi-photo' | 'video';
  requestCamera: (
    onPhotoCaptured: (base64Image: string, filename: string) => void,
    mode?: 'photo' | 'multi-photo' | 'video'
  ) => void;
  requestMultiPhotoScan: (
    onPhotosCaptured: (photos: { base64Data: string; filename: string }[]) => void
  ) => void;
  requestVideoLessonRecorder: (
    onVideoCaptured: (videoResult: VideoRecordedResult) => void
  ) => void;
  handleCapturePhoto: (base64Image: string, filename: string) => void;
  handleCaptureMultiple: (photos: { base64Data: string; filename: string }[]) => void;
  handleCaptureVideo: (videoResult: VideoRecordedResult) => void;
  closeCaptureModal: () => void;
}

export function useCameraAccess(): UseCameraAccessReturn {
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState<boolean>(false);
  const [activeMode, setActiveMode] = useState<'photo' | 'multi-photo' | 'video'>('photo');

  const [pendingPhotoCallback, setPendingPhotoCallback] = useState<
    ((base64Image: string, filename: string) => void) | null
  >(null);

  const [pendingMultiPhotoCallback, setPendingMultiPhotoCallback] = useState<
    ((photos: { base64Data: string; filename: string }[]) => void) | null
  >(null);

  const [pendingVideoCallback, setPendingVideoCallback] = useState<
    ((videoResult: VideoRecordedResult) => void) | null
  >(null);

  const requestCamera = useCallback(
    (
      onPhotoCaptured: (base64Image: string, filename: string) => void,
      mode: 'photo' | 'multi-photo' | 'video' = 'photo'
    ) => {
      setActiveMode(mode);
      setPendingPhotoCallback(() => onPhotoCaptured);
      setIsCaptureModalOpen(true);
    },
    []
  );

  const requestMultiPhotoScan = useCallback(
    (onPhotosCaptured: (photos: { base64Data: string; filename: string }[]) => void) => {
      setActiveMode('multi-photo');
      setPendingMultiPhotoCallback(() => onPhotosCaptured);
      setIsCaptureModalOpen(true);
    },
    []
  );

  const requestVideoLessonRecorder = useCallback(
    (onVideoCaptured: (videoResult: VideoRecordedResult) => void) => {
      setActiveMode('video');
      setPendingVideoCallback(() => onVideoCaptured);
      setIsCaptureModalOpen(true);
    },
    []
  );

  const handleCapturePhoto = useCallback(
    (base64Image: string, filename: string) => {
      if (pendingPhotoCallback) {
        pendingPhotoCallback(base64Image, filename);
      }
      setIsCaptureModalOpen(false);
      setPendingPhotoCallback(null);
    },
    [pendingPhotoCallback]
  );

  const handleCaptureMultiple = useCallback(
    (photos: { base64Data: string; filename: string }[]) => {
      if (pendingMultiPhotoCallback) {
        pendingMultiPhotoCallback(photos);
      } else if (pendingPhotoCallback && photos.length > 0) {
        pendingPhotoCallback(photos[0].base64Data, photos[0].filename);
      }
      setIsCaptureModalOpen(false);
      setPendingMultiPhotoCallback(null);
      setPendingPhotoCallback(null);
    },
    [pendingMultiPhotoCallback, pendingPhotoCallback]
  );

  const handleCaptureVideo = useCallback(
    (videoResult: VideoRecordedResult) => {
      if (pendingVideoCallback) {
        pendingVideoCallback(videoResult);
      }
      setIsCaptureModalOpen(false);
      setPendingVideoCallback(null);
    },
    [pendingVideoCallback]
  );

  const closeCaptureModal = useCallback(() => {
    setIsCaptureModalOpen(false);
    setPendingPhotoCallback(null);
    setPendingMultiPhotoCallback(null);
    setPendingVideoCallback(null);
  }, []);

  return {
    isCaptureModalOpen,
    activeMode,
    requestCamera,
    requestMultiPhotoScan,
    requestVideoLessonRecorder,
    handleCapturePhoto,
    handleCaptureMultiple,
    handleCaptureVideo,
    closeCaptureModal,
  };
}
