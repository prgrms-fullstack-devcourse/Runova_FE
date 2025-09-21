import React from 'react';
import { Animated, View, Text } from 'react-native';
import { Clock, Map, Zap } from 'lucide-react-native';
import styled from '@emotion/native';

import {
  RunningStats,
  PhotoDecorationState,
} from '@/types/photoDecoration.types';
import { formatNumber } from '@/utils/formatters';

interface StatsRendererProps {
  runningStats: RunningStats;
  statsColor: string;
  visibility: PhotoDecorationState['visibility'];
  statsTranslateX: any; // Animated.Value
  statsTranslateY: any; // Animated.Value
  statsScaleAnimated: any; // Animated.Value
  statsPanResponder: any;
}

export default function StatsRenderer({
  runningStats,
  statsColor,
  visibility,
  statsTranslateX,
  statsTranslateY,
  statsScaleAnimated,
  statsPanResponder,
}: StatsRendererProps) {
  const visibleStats = [];

  if (visibility.time) {
    visibleStats.push(
      <StatItem key="time">
        <StatIcon>
          <Clock size={16} color={statsColor} />
        </StatIcon>
        <StatValue textColor={statsColor}>{runningStats.time}</StatValue>
        <StatLabel textColor={statsColor}>시간</StatLabel>
      </StatItem>,
    );
  }

  if (visibility.distance) {
    visibleStats.push(
      <StatItem key="distance">
        <StatIcon>
          <Map size={16} color={statsColor} />
        </StatIcon>
        <StatValue textColor={statsColor}>
          {formatNumber(runningStats.distance).toFixed(2)}km
        </StatValue>
        <StatLabel textColor={statsColor}>거리</StatLabel>
      </StatItem>,
    );
  }

  if (visibility.pace) {
    visibleStats.push(
      <StatItem key="pace">
        <StatIcon>
          <Zap size={16} color={statsColor} />
        </StatIcon>
        <StatValue textColor={statsColor}>{runningStats.pace}</StatValue>
        <StatLabel textColor={statsColor}>페이스</StatLabel>
      </StatItem>,
    );
  }

  if (visibility.calories) {
    visibleStats.push(
      <StatItem key="calories">
        <StatIcon>
          <Zap size={16} color={statsColor} />
        </StatIcon>
        <StatValue textColor={statsColor}>
          {formatNumber(runningStats.calories).toFixed(2)}
        </StatValue>
        <StatLabel textColor={statsColor}>칼로리</StatLabel>
      </StatItem>,
    );
  }

  if (visibleStats.length === 0) return null;

  return (
    <Animated.View
      style={[
        {
          transform: [
            { translateX: statsTranslateX },
            { translateY: statsTranslateY },
            { scale: statsScaleAnimated },
          ],
        },
      ]}
      {...statsPanResponder.panHandlers}
    >
      <StatsContainer textColor={statsColor}>{visibleStats}</StatsContainer>
    </Animated.View>
  );
}

const StatsContainer = styled.View<{ textColor: string }>(({ textColor }) => ({
  position: 'absolute',
  bottom: 140,
  left: 20,
  right: 20,

  padding: 16,
  flexDirection: 'row',
  justifyContent: 'space-around',
}));

const StatItem = styled.View({
  alignItems: 'center',
});

const StatIcon = styled.View({
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 4,
});

const StatValue = styled.Text<{ textColor: string }>(({ textColor }) => ({
  fontSize: 14,
  fontWeight: 'bold',
  color: textColor,
  marginBottom: 2,
}));

const StatLabel = styled.Text<{ textColor: string }>(({ textColor }) => ({
  fontSize: 10,
  color:
    textColor === '#FFFFFF' ? 'rgba(255, 255, 255, 0.8)' : `${textColor}CC`,
}));
