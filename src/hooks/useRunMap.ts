import { useRef, useEffect } from 'react';
import type { Feature, LineString, Position } from 'geojson';
import Mapbox from '@rnmapbox/maps';
import { useLocationManager } from '@/hooks/useLocationManager';
import useRunStore from '@/store/run';

export function useRunMap(
  cameraRef?: React.RefObject<Mapbox.Camera | null>,
  location?: Position | null,
  routeCoordinates?: Position[],
  courseId?: number,
) {
  const { courseTopology, isLocked } = useRunStore();
  const { fitToCoordinates } = useLocationManager();

  const internalCameraRef = useRef<Mapbox.Camera>(null);
  const finalCameraRef = cameraRef || internalCameraRef;

  const routeGeoJSON: Feature<LineString> = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: routeCoordinates || [],
    },
  };

  // 코스 shape 폴리곤들 생성 - courseId가 있을 때만
  const courseShapePolygons =
    courseId && courseTopology?.shape
      ? courseTopology.shape.map((polygonCoords, index) => ({
          type: 'Feature' as const,
          properties: { id: index },
          geometry: {
            type: 'Polygon' as const,
            coordinates: [polygonCoords],
          },
        }))
      : [];

  const courseShapeGeoJSON = {
    type: 'FeatureCollection' as const,
    features: courseShapePolygons,
  };

  // 코스 토폴로지가 로드되면 지도에 맞춤 - courseId가 있을 때만
  useEffect(() => {
    if (courseId && courseTopology && courseTopology.shape.length > 0) {
      const allCoordinates: [number, number][] = courseTopology.shape.flat(1);

      if (allCoordinates.length > 0) {
        fitToCoordinates(finalCameraRef, allCoordinates);
      }
    }
  }, [courseId, courseTopology, fitToCoordinates, finalCameraRef]);

  return {
    cameraRef: finalCameraRef,
    location,
    routeGeoJSON,
    courseShapeGeoJSON,
    courseShapePolygons,
    isLocked,
  };
}
