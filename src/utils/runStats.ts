import type { Position } from 'geojson';
import { haversineDistance } from '@/utils/location';

export interface RunStats {
  distance: number;
  calories: number;
  pace: string;
  runningTime: string;
}

export const calculateRunStats = (
  routeCoordinates: Position[],
  startTime: Date | null,
  isTracking: boolean = true,
  pausedTime: number = 0,
  pauseStartTime: Date | null = null,
): RunStats => {
  const currentTime = new Date();
  let actualRunningTime = 0;

  if (startTime) {
    if (isTracking) {
      const totalElapsedTime =
        (currentTime.getTime() - startTime.getTime()) / 1000;
      actualRunningTime = Math.max(0, totalElapsedTime - pausedTime);
    } else {
      const pauseTime = pauseStartTime || currentTime;
      const totalElapsedTime =
        (pauseTime.getTime() - startTime.getTime()) / 1000;
      actualRunningTime = Math.max(0, totalElapsedTime - pausedTime);
    }
  }

  const hours = Math.floor(actualRunningTime / 3600);
  const minutes = Math.floor((actualRunningTime % 3600) / 60);
  const seconds = Math.floor(actualRunningTime % 60);
  const runningTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // 거리 계산 (경로 좌표가 2개 이상일 때만)
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

  // TODO:칼로리 계산 로직 고도화 필요
  const calories = Math.round((totalDistance / 1000) * 50);

  // 페이스 계산 (분/km) - 실제 달린 시간 기준
  const distanceKm = totalDistance / 1000;
  const paceSeconds = distanceKm > 0 ? actualRunningTime / distanceKm : 0;
  const paceMinutes = Math.floor(paceSeconds / 60);
  const paceSecs = Math.floor(paceSeconds % 60);
  const pace = `${paceMinutes}'${paceSecs.toString().padStart(2, '0')}"`;

  return {
    distance: Math.round(totalDistance),
    calories,
    pace,
    runningTime,
  };
};
