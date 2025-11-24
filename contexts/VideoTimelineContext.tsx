import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';

export type SeekHandler = (progress: number) => Promise<void> | void;

interface PlaybackUpdate {
  videoId: string | null;
  positionMillis?: number;
  durationMillis?: number;
  isPlaying?: boolean;
}

interface VideoTimelineContextValue {
  currentVideoId: string | null;
  progress: number;
  isScrubbing: boolean;
  scrubbingProgress: number;
  activateVideo: (videoId: string | null) => void;
  updatePlaybackStatus: (payload: PlaybackUpdate) => void;
  resetTimeline: () => void;
  startScrub: (progress: number) => void;
  moveScrub: (progress: number) => void;
  endScrub: (progress: number) => Promise<void>;
  cancelScrub: () => void;
  registerSeekHandler: (handler: SeekHandler | null) => void;
}

const VideoTimelineContext = React.createContext<VideoTimelineContextValue | null>(null);

export function VideoTimelineProvider({ children }: { children: React.ReactNode }) {
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [scrubbingProgress, setScrubbingProgress] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const durationRef = useRef(0);
  const playbackProgressRef = useRef(0);
  const seekHandlerRef = useRef<SeekHandler | null>(null);

  const activateVideo = useCallback((videoId: string | null) => {
    durationRef.current = 0;
    setProgress(0);
    setScrubbingProgress(0);
    playbackProgressRef.current = 0;
    setIsScrubbing(false);
    setCurrentVideoId(videoId);
  }, []);

  const resetTimeline = useCallback(() => {
    durationRef.current = 0;
    setProgress(0);
    setScrubbingProgress(0);
    playbackProgressRef.current = 0;
    setIsScrubbing(false);
  }, []);

  const updatePlaybackStatus = useCallback(
    ({ videoId, positionMillis = 0, durationMillis = 0 }: PlaybackUpdate) => {
      if (!videoId || videoId !== currentVideoId) return;

      if (durationMillis > 0) {
        durationRef.current = durationMillis;
      }

      const duration = durationRef.current || 1;
      const safePosition = Math.min(Math.max(positionMillis, 0), duration);
      const nextProgress = Math.min(safePosition / duration, 1);
      setProgress(nextProgress);
      playbackProgressRef.current = nextProgress;

      if (!isScrubbing) {
        setScrubbingProgress(nextProgress);
      }
    },
    [currentVideoId, isScrubbing]
  );

  const startScrub = useCallback((progressValue: number) => {
    setIsScrubbing(true);
    setScrubbingProgress(progressValue);
    const handler = seekHandlerRef.current;
    if (handler) {
      handler(progressValue);
    }
  }, []);

  const moveScrub = useCallback((progressValue: number) => {
    if (!isScrubbing) {
      setIsScrubbing(true);
    }
    setScrubbingProgress(progressValue);
    const handler = seekHandlerRef.current;
    if (handler) {
      handler(progressValue);
    }
  }, [isScrubbing]);

  const endScrub = useCallback(
    async (progressValue: number) => {
      setIsScrubbing(false);
      const normalized = Math.min(Math.max(progressValue, 0), 1);
      setScrubbingProgress(normalized);
      setProgress(normalized);
      playbackProgressRef.current = normalized;

      const handler = seekHandlerRef.current;
      if (handler) {
        await handler(normalized);
      }
    },
    []
  );

  const cancelScrub = useCallback(() => {
    setIsScrubbing(false);
    setScrubbingProgress(playbackProgressRef.current);
  }, []);

  const registerSeekHandler = useCallback((handler: SeekHandler | null) => {
    seekHandlerRef.current = handler;
  }, []);

  const contextValue = useMemo(
    () => ({
      currentVideoId,
      progress,
      isScrubbing,
      scrubbingProgress,
      activateVideo,
      updatePlaybackStatus,
      resetTimeline,
      startScrub,
      moveScrub,
      endScrub,
      cancelScrub,
      registerSeekHandler,
    }),
    [
      currentVideoId,
      progress,
      isScrubbing,
      scrubbingProgress,
      activateVideo,
      updatePlaybackStatus,
      resetTimeline,
      startScrub,
      moveScrub,
      endScrub,
      cancelScrub,
      registerSeekHandler,
    ]
  );

  return <VideoTimelineContext.Provider value={contextValue}>{children}</VideoTimelineContext.Provider>;
}

export function useVideoTimeline() {
  const context = useContext(VideoTimelineContext);
  if (!context) {
    throw new Error('useVideoTimeline must be used within a VideoTimelineProvider');
  }
  return context;
}

export function useVideoTimelineUpdater() {
  const context = useContext(VideoTimelineContext);

  if (!context) {
    return {
      activateVideo: () => {},
      updatePlaybackStatus: () => {},
      resetTimeline: () => {},
      registerSeekHandler: () => {},
    };
  }

  return {
    activateVideo: context.activateVideo,
    updatePlaybackStatus: context.updatePlaybackStatus,
    resetTimeline: context.resetTimeline,
    registerSeekHandler: context.registerSeekHandler,
  };
}
