import { useState, useRef, useCallback } from 'react';
import { Animated } from 'react-native';

interface UseLongPressOptions {
  duration?: number;
  onComplete: () => void;
}

export function useLongPress({
  duration = 3000,
  onComplete,
}: UseLongPressOptions) {
  const [isPressing, setIsPressing] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);

  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const progressTimer = useRef<NodeJS.Timeout | null>(null);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const startPress = useCallback(() => {
    setIsPressing(true);
    setPressProgress(0);

    pressTimer.current = setTimeout(() => {
      onComplete();
      stopPress();
    }, duration);

    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      useNativeDriver: false,
    }).start();

    progressTimer.current = setInterval(() => {
      setPressProgress((prev) => {
        const newProgress = prev + 100 / (duration / 100);
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 100);
  }, [duration, onComplete, animatedValue]);

  const stopPress = useCallback(() => {
    setIsPressing(false);
    setPressProgress(0);

    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }

    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }

    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [animatedValue]);

  return {
    isPressing,
    pressProgress,
    animatedValue,
    startPress,
    stopPress,
  };
}
