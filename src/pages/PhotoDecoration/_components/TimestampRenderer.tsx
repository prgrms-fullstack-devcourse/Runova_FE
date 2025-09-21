import React from 'react';
import { Animated, Text } from 'react-native';
import styled from '@emotion/native';

import { RunningStats } from '@/types/photoDecoration.types';

interface TimestampRendererProps {
  showTimestamp: boolean;
  runningStats: RunningStats;
  timestampColor: string;
  timestampTranslateX: any; // Animated.Value
  timestampTranslateY: any; // Animated.Value
  timestampScaleAnimated: any; // Animated.Value
  timestampPanResponder: any;
}

export default function TimestampRenderer({
  showTimestamp,
  runningStats,
  timestampColor,
  timestampTranslateX,
  timestampTranslateY,
  timestampScaleAnimated,
  timestampPanResponder,
}: TimestampRendererProps) {
  console.log('📊 [TimestampRenderer] renderTimestamp 호출:', {
    showTimestamp,
    runningStatsDate: runningStats.date,
  });

  if (!showTimestamp) {
    console.log('📊 [TimestampRenderer] showTimestamp가 false');
    return null;
  }

  return (
    <Animated.View
      style={[
        {
          transform: [
            { translateX: timestampTranslateX },
            { translateY: timestampTranslateY },
            { scale: timestampScaleAnimated },
          ],
        },
      ]}
      {...timestampPanResponder.panHandlers}
    >
      <TimestampContainer textColor={timestampColor}>
        <TimestampText textColor={timestampColor}>
          {runningStats.date}
        </TimestampText>
      </TimestampContainer>
    </Animated.View>
  );
}

const TimestampContainer = styled.View<{ textColor: string }>(
  ({ textColor }) => ({
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 8,
  }),
);

const TimestampText = styled.Text<{ textColor: string }>(({ textColor }) => ({
  fontSize: 18,
  fontWeight: 'bold',
  color: textColor,
}));
