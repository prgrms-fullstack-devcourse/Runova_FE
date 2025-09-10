import { useEffect, useRef } from 'react';
import type { Position } from 'geojson';
import { calculateRunStats } from '@/utils/runStats';
import useRunStore from '@/store/run';

export function useRunStats(routeCoordinates: Position[], isTracking: boolean) {
  const { startTime, pausedTime, pauseStartTime, setRunning } = useRunStore();

  // 타이머 업데이트를 위한 ref들
  const routeCoordinatesRef = useRef(routeCoordinates);
  const isTrackingRef = useRef(isTracking);
  const pausedTimeRef = useRef(pausedTime);
  const pauseStartTimeRef = useRef(pauseStartTime);

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

  // 초기 통계 계산 (startTime이 설정될 때만)
  useEffect(() => {
    if (startTime) {
      const newStats = calculateRunStats(
        routeCoordinates,
        startTime,
        isTracking,
        pausedTime,
        pauseStartTime,
      );
      setRunning({ stats: newStats });
    }
  }, [startTime, setRunning]);

  // 실시간 통계 업데이트
  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const newStats = calculateRunStats(
        routeCoordinatesRef.current,
        startTime,
        isTrackingRef.current,
        pausedTimeRef.current,
        pauseStartTimeRef.current,
      );
      setRunning({ stats: newStats });
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, setRunning]);
}
