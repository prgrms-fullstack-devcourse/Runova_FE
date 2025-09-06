import type { Position, Feature, LineString } from 'geojson';
import type { RouteCoordinate } from '@/types/courses.types';

export function findClosestRouteIndex(
  tappedCoord: Position,
  matchedRoutes: Feature<LineString>[],
): { closestRouteIndex: number; minDistance: number } {
  let closestRouteIndex = -1;
  let minDistance = Infinity;

  matchedRoutes.forEach((route, index) => {
    if (route.geometry.type === 'LineString') {
      const coordinates = route.geometry.coordinates;
      coordinates.forEach((coord) => {
        const distance = Math.sqrt(
          Math.pow(coord[0] - tappedCoord[0], 2) +
            Math.pow(coord[1] - tappedCoord[1], 2),
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestRouteIndex = index;
        }
      });
    }
  });

  return { closestRouteIndex, minDistance };
}

export function mergeMatchedRoutes(
  matchedRoutes: Feature<LineString>[],
): Position[] {
  const mergedCoordinates: Position[] = [];
  matchedRoutes.forEach((route) => {
    if (route.geometry.type === 'LineString') {
      const coordinates = route.geometry.coordinates;

      if (mergedCoordinates.length > 0) {
        const lastCoord = mergedCoordinates[mergedCoordinates.length - 1];
        const firstCoord = coordinates[0];

        if (lastCoord[0] === firstCoord[0] && lastCoord[1] === firstCoord[1]) {
          mergedCoordinates.push(...coordinates.slice(1));
        } else {
          mergedCoordinates.push(...coordinates);
        }
      } else {
        mergedCoordinates.push(...coordinates);
      }
    }
  });

  return mergedCoordinates;
}

export function convertToApiFormat(coordinates: Position[]): RouteCoordinate[] {
  return coordinates.map(([lon, lat]) => ({ lon, lat }));
}
