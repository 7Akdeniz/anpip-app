import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, Platform, GestureResponderEvent, LayoutChangeEvent } from 'react-native';
import { useVideoTimeline } from '@/contexts/VideoTimelineContext';

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export function TabBarTimeline() {
  const {
    progress,
    scrubbingProgress,
    isScrubbing,
    startScrub,
    moveScrub,
    endScrub,
    cancelScrub,
  } = useVideoTimeline();

  const [layoutWidth, setLayoutWidth] = useState(0);
  const [pointerDown, setPointerDown] = useState(false);
  const timelineRef = useRef<View>(null);

  const displayProgress = isScrubbing ? scrubbingProgress : progress;
  const lineHeight = isScrubbing ? 6 : 2;

  const getRelativeProgress = useCallback(
    (event: GestureResponderEvent | any) => {
      const width = layoutWidth || 1;
      let relativeX = 0;

      if (Platform.OS === 'web') {
        const native = event.nativeEvent;
        if (typeof native.offsetX === 'number') {
          relativeX = native.offsetX;
        } else if (typeof native.layerX === 'number') {
          relativeX = native.layerX;
        } else if (typeof native.clientX === 'number') {
          const target = event.currentTarget;
          const rect = target?.getBoundingClientRect?.();
          if (rect) {
            relativeX = native.clientX - rect.left;
          }
        }
      } else {
        relativeX = event.nativeEvent.locationX ?? 0;
      }

      return clamp(relativeX / width);
    },
    [layoutWidth]
  );

  const handleResponderGrant = useCallback(
    (event: GestureResponderEvent) => {
      const relative = getRelativeProgress(event);
      setPointerDown(true);
      startScrub(relative);
      moveScrub(relative);
    },
    [getRelativeProgress, moveScrub, startScrub]
  );

  const handleResponderMove = useCallback(
    (event: GestureResponderEvent) => {
      if (!pointerDown) return;
      const relative = getRelativeProgress(event);
      moveScrub(relative);
    },
    [getRelativeProgress, moveScrub, pointerDown]
  );

  const handleResponderRelease = useCallback(
    async (event: GestureResponderEvent) => {
      if (!pointerDown) return;
      setPointerDown(false);
      const relative = getRelativeProgress(event);
      await endScrub(relative);
    },
    [endScrub, getRelativeProgress, pointerDown]
  );

  const handleResponderTerminate = useCallback(() => {
    if (!pointerDown) return;
    setPointerDown(false);
    cancelScrub();
  }, [cancelScrub, pointerDown]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setLayoutWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View
        ref={timelineRef}
        style={[styles.track, { height: lineHeight }]}
        onLayout={handleLayout}
        onStartShouldSetResponder={() => true}
        onStartShouldSetResponderCapture={() => true}
        onResponderGrant={handleResponderGrant}
        onResponderMove={handleResponderMove}
        onMoveShouldSetResponder={() => true}
        onMoveShouldSetResponderCapture={() => pointerDown}
        onResponderRelease={handleResponderRelease}
        onResponderTerminate={handleResponderTerminate}
        onResponderTerminationRequest={() => true}
        hitSlop={{ top: 24, bottom: 4 }}
      >
        <View style={styles.background} />
        <View
          style={[
            styles.progress,
            {
              width: `${displayProgress * 100}%`,
              height: lineHeight,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 46,
    zIndex: 30,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  track: {
    width: '100%',
    borderRadius: 3,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  progress: {
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
});
