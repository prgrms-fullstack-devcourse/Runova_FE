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

  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const startPress = useCallback(() => {
    setIsPressing(true);

    pressTimer.current = setTimeout(() => {
      onComplete();
      stopPress();
    }, duration);

    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      useNativeDriver: false,
    }).start();
  }, [duration, onComplete, animatedValue]);

  const stopPress = useCallback(() => {
    setIsPressing(false);

    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }

    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [animatedValue]);

  return {
    isPressing,
    animatedValue,
    startPress,
    stopPress,
  };
}
