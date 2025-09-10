import { RouteCoordinate } from '@/types/courses.types';

export function convertPathToApiFormat(
  path: RouteCoordinate[],
): [number, number][] {
  return path.map((coord) => [coord.lon, coord.lat] as [number, number]);
}
