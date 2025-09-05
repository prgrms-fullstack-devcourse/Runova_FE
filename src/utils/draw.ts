import type { Position, Feature, LineString } from 'geojson';

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
