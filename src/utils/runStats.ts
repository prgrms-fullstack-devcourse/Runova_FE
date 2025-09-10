import type { Position } from 'geojson';
import { haversineDistance } from '@/utils/location';

export interface RunStats {
  distance: number;
  calories: number;
  pace: string;
}

export function calculateRunStats(
  routeCoordinates: Position[],
  startTime: Date | null,
): RunStats {
  if (routeCoordinates.length < 2) {
    return {
      distance: 0,
      calories: 0,
      pace: '0\'00"',
    };
  }

  // 총 거리 계산
  let totalDistance = 0;
  for (let i = 1; i < routeCoordinates.length; i++) {
    const distance = haversineDistance(
      routeCoordinates[i - 1],
      routeCoordinates[i],
    );
    totalDistance += distance;
  }

  // 칼로리 계산 (대략적인 공식: 체중 70kg 기준, km당 50칼로리)
  const calories = Math.round((totalDistance / 1000) * 50);

  // 페이스 계산 (분/km)
  const currentTime = new Date();
  const elapsedTime = startTime
    ? (currentTime.getTime() - startTime.getTime()) / 1000
    : 0;
  const distanceKm = totalDistance / 1000;
  const paceSeconds = distanceKm > 0 ? elapsedTime / distanceKm : 0;
  const minutes = Math.floor(paceSeconds / 60);
  const seconds = Math.floor(paceSeconds % 60);
  const pace = `${minutes}'${seconds.toString().padStart(2, '0')}"`;

  return {
    distance: Math.round(totalDistance),
    calories,
    pace,
  };
}
