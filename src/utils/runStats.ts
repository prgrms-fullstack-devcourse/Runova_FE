import type { Position } from 'geojson';
import { haversineDistance } from '@/utils/location';

export interface RunStats {
  distance: number;
  calories: number;
  pace: number;
  runningTime: string;
}

export const calculateRunStats = (
  routeCoordinates: Position[],
  startTime: Date | null,
  pausedTime: number = 0,
  pauseStartTime: Date | null = null,
): RunStats => {
  const currentTime = new Date();
  const totalElapsedTime = startTime
    ? (currentTime.getTime() - startTime.getTime()) / 1000
    : 0;

  const currentPauseTime = pauseStartTime
    ? (currentTime.getTime() - pauseStartTime.getTime()) / 1000
    : 0;

  const totalPausedTime = pausedTime + currentPauseTime;

  const actualRunningTime = Math.max(0, totalElapsedTime - totalPausedTime);

  const hours = Math.floor(actualRunningTime / 3600);
  const minutes = Math.floor((actualRunningTime % 3600) / 60);
  const seconds = Math.floor(actualRunningTime % 60);
  const runningTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  let totalDistance = 0;
  if (routeCoordinates.length >= 2) {
    for (let i = 1; i < routeCoordinates.length; i++) {
      const distance = haversineDistance(
        routeCoordinates[i - 1],
        routeCoordinates[i],
      );
      totalDistance += distance;
    }
  }

  const calories = Math.round((totalDistance / 1000) * 50);

  const distanceKm = totalDistance / 1000;
  const pace = distanceKm > 0 ? actualRunningTime / distanceKm : 0;

  return {
    distance: Math.round(totalDistance),
    calories,
    pace,
    runningTime,
  };
};
