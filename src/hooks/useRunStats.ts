import { useEffect, useRef, useCallback } from 'react';
import type { Position } from 'geojson';
import { calculateRunStats } from '@/utils/runStats';
import useRunStore from '@/store/run';

export function useRunStats(routeCoordinates: Position[], isTracking: boolean) {
  const { startTime, pausedTime, pauseStartTime, setRunning, stats } =
    useRunStore();

  // 타이머 업데이트를 위한 ref들
  const routeCoordinatesRef = useRef(routeCoordinates);
  const isTrackingRef = useRef(isTracking);
  const pausedTimeRef = useRef(pausedTime);
  const pauseStartTimeRef = useRef(pauseStartTime);
  const lastStatsRef = useRef(stats || null);

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

  useEffect(() => {
    lastStatsRef.current = stats || null;
  }, [stats]);

  // 통계 업데이트 함수 (이전 값과 비교해서 변경된 경우에만 업데이트)
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
      !lastStats ||
      lastStats.distance !== newStats.distance ||
      lastStats.calories !== newStats.calories ||
      lastStats.pace !== newStats.pace ||
      lastStats.runningTime !== newStats.runningTime;

    if (hasChanged) {
      lastStatsRef.current = newStats;
      setRunning({ stats: newStats });
    }
  }, [startTime, setRunning]);

  // 초기 통계 계산 (startTime이 설정될 때만)
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
}
