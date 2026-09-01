/**
 * Video processing utilities for extracting keyframe snapshots
 * and preparing video lessons for StudyFlow AI multimodal notes synthesis.
 */

export async function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Extracts evenly-spaced high-resolution snapshot frames from a video file or Blob.
 * These frames capture blackboard notes, slides, equations, and textbook excerpts.
 */
export async function extractKeyframesFromVideo(
  videoSource: Blob | File | string,
  frameCount: number = 4
): Promise<{ keyframes: string[]; durationSeconds: number }> {
  return new Promise((resolve, reject) => {
    let videoUrl = '';
    let isObjectUrl = false;

    if (typeof videoSource === 'string') {
      videoUrl = videoSource;
    } else {
      videoUrl = URL.createObjectURL(videoSource);
      isObjectUrl = true;
    }

    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';

    const cleanUp = () => {
      if (isObjectUrl && videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      video.remove();
    };

    video.onerror = (e) => {
      cleanUp();
      console.warn('Video load error for keyframe extraction:', e);
      resolve({ keyframes: [], durationSeconds: 0 });
    };

    video.onloadedmetadata = async () => {
      const duration = video.duration || 1;
      const targetFrames = Math.max(1, Math.min(frameCount, 8));
      const keyframes: string[] = [];

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Sample timestamps across the video (e.g., 15%, 40%, 65%, 90%)
      const timePoints: number[] = [];
      if (targetFrames === 1) {
        timePoints.push(duration * 0.5);
      } else {
        for (let i = 0; i < targetFrames; i++) {
          const ratio = (i + 1) / (targetFrames + 1);
          timePoints.push(Math.max(0.1, Math.min(duration - 0.1, duration * ratio)));
        }
      }

      const captureFrameAt = (time: number): Promise<string> => {
        return new Promise((res) => {
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked);
            try {
              const width = Math.min(video.videoWidth || 1280, 1280);
              const height = Math.min(
                video.videoHeight || 720,
                Math.round(width * ((video.videoHeight || 720) / (video.videoWidth || 1280)))
              );

              canvas.width = width;
              canvas.height = height;

              if (ctx) {
                ctx.drawImage(video, 0, 0, width, height);
                const base64 = canvas.toDataURL('image/jpeg', 0.85);
                res(base64);
              } else {
                res('');
              }
            } catch (err) {
              console.warn('Frame render error:', err);
              res('');
            }
          };

          video.addEventListener('seeked', onSeeked);
          video.currentTime = time;
        });
      };

      try {
        for (const time of timePoints) {
          const frameBase64 = await captureFrameAt(time);
          if (frameBase64) {
            keyframes.push(frameBase64);
          }
        }
        cleanUp();
        resolve({ keyframes, durationSeconds: Math.round(duration) });
      } catch (err) {
        cleanUp();
        console.warn('Keyframe extraction loop error:', err);
        resolve({ keyframes, durationSeconds: Math.round(duration) });
      }
    };

    video.src = videoUrl;
  });
}
