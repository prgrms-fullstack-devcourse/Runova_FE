import React, { useEffect, useRef, useCallback, useState } from 'react';
import styled from '@emotion/native';
import { LinearGradient } from 'expo-linear-gradient';
import useRunStore from '@/store/run';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { calculateRunStats } from '@/utils/runStats';
import { formatPace } from '@/utils/formatters';
import type { Position } from 'geojson';
import type { RunStats } from '@/utils/runStats';

function StatsContainer() {
  const { routeCoordinates, isTracking } = useLocationTracking();
  const { startTime, pausedTime, pauseStartTime } = useRunStore();

  // 로컬 상태로 통계 관리 (전역 상태 업데이트 안함)
  const [localStats, setLocalStats] = useState<RunStats>({
    distance: 0,
    calories: 0,
    pace: 0,
    runningTime: '00:00:00',
  });

  const routeCoordinatesRef = useRef(routeCoordinates);
  const isTrackingRef = useRef(isTracking);
  const pausedTimeRef = useRef(pausedTime);
  const pauseStartTimeRef = useRef(pauseStartTime);
  const lastStatsRef = useRef(localStats);

  // ref 값들을 최신으로 유지
  useEffect(() => {
    routeCoordinatesRef.current = routeCoordinates;
  }, [routeCoordinates]);

  useEffect(() => {
    isTrackingRef.current = isTracking;
  }, [isTracking]);

  useEffect(() => {
    pausedTimeRef.current = pausedTime;
  }, [pausedTime]);

  useEffect(() => {
    pauseStartTimeRef.current = pauseStartTime;
  }, [pauseStartTime]);

  // 통계 업데이트 함수 (로컬 상태만 업데이트)
  const updateStats = useCallback(() => {
    if (!startTime) return;

    const newStats = calculateRunStats(
      routeCoordinatesRef.current,
      startTime,
      isTrackingRef.current,
      pausedTimeRef.current,
      pauseStartTimeRef.current,
    );

    // 이전 통계와 비교해서 변경된 경우에만 업데이트
    const lastStats = lastStatsRef.current;
    const hasChanged =
      lastStats.distance !== newStats.distance ||
      lastStats.calories !== newStats.calories ||
      lastStats.pace !== newStats.pace ||
      lastStats.runningTime !== newStats.runningTime;

    if (hasChanged) {
      lastStatsRef.current = newStats;
      setLocalStats(newStats);
    }
  }, [startTime]);

  // 초기 통계 계산
  useEffect(() => {
    if (startTime) {
      updateStats();
    }
  }, [startTime, updateStats]);

  // 실시간 통계 업데이트
  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      updateStats();
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, updateStats]);
  return (
    <StatsContainerWrapper>
      <RunningTimeContainer>
        <RunningTimeGradient
          colors={['#1a1a1a', '#2d2d2d', '#404040']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <RunningTimeLabel>달린 시간</RunningTimeLabel>
        <RunningTimeValue>{localStats.runningTime}</RunningTimeValue>
      </RunningTimeContainer>
      <StatsRow>
        <StatItem>
          <StatValue>{localStats.distance}m</StatValue>
          <StatLabel>거리</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{localStats.calories}</StatValue>
          <StatLabel>칼로리</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{formatPace(localStats.pace)}</StatValue>
          <StatLabel>페이스</StatLabel>
        </StatItem>
      </StatsRow>
    </StatsContainerWrapper>
  );
}

const StatsContainerWrapper = styled.View(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  padding: 20,
  shadowColor: theme.colors.gray[900],
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 8,
  paddingBottom: 48,
}));

const StatsRow = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
});

const StatItem = styled.View({
  alignItems: 'center',
  flex: 1,
});

const StatValue = styled.Text(({ theme }) => ({
  fontSize: 20,
  fontWeight: '700',
  color: theme.colors.gray[900],
  marginBottom: 4,
}));

const StatLabel = styled.Text(({ theme }) => ({
  fontSize: 12,
  fontWeight: '500',
  color: theme.colors.gray[600],
}));

const RunningTimeContainer = styled.View(({ theme }) => ({
  borderRadius: 12,
  paddingVertical: 16,
  paddingHorizontal: 20,
  marginBottom: 16,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
}));

const RunningTimeGradient = styled(LinearGradient)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: 12,
});

const RunningTimeLabel = styled.Text({
  fontSize: 16,
  fontWeight: '600',
  color: '#ffffff',
  zIndex: 1,
});

const RunningTimeValue = styled.Text({
  fontSize: 24,
  fontWeight: '700',
  color: '#ffffff',
  zIndex: 1,
});

export default React.memo(StatsContainer);
