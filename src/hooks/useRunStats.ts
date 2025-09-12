import { useEffect, useRef } from 'react';
import type { Position } from 'geojson';
import { calculateRunStats } from '@/utils/runStats';
import useRunStore from '@/store/run';

export function useRunStats(routeCoordinates: Position[]) {
  const { startTime, pausedTime, pauseStartTime, setRunning } = useRunStore();

  const routeCoordinatesRef = useRef(routeCoordinates);
  const pausedTimeRef = useRef(pausedTime);
  const pauseStartTimeRef = useRef(pauseStartTime);

  useEffect(() => {
    routeCoordinatesRef.current = routeCoordinates;
  }, [routeCoordinates]);

  useEffect(() => {
    pausedTimeRef.current = pausedTime;
  }, [pausedTime]);

  useEffect(() => {
    pauseStartTimeRef.current = pauseStartTime;
  }, [pauseStartTime]);

  useEffect(() => {
    if (startTime) {
      const newStats = calculateRunStats(
        routeCoordinates,
        startTime,
        pausedTime,
        pauseStartTime,
      );
      setRunning({ stats: newStats });
    }
  }, [startTime, setRunning]);

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      if (pauseStartTime) return;

      const newStats = calculateRunStats(
        routeCoordinatesRef.current,
        startTime,
        pausedTimeRef.current,
        pauseStartTimeRef.current,
      );
      setRunning({ stats: newStats });
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, pauseStartTime, setRunning]);

  useEffect(() => {
    if (!startTime) return;

    const newStats = calculateRunStats(
      routeCoordinates,
      startTime,
      pausedTime,
      pauseStartTime,
    );
    setRunning({ stats: newStats });
  }, [pausedTime, pauseStartTime, startTime, setRunning]);
}
