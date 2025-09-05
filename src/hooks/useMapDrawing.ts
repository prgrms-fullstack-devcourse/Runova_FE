import { useState, RefObject } from 'react';
import { Alert } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { Gesture } from 'react-native-gesture-handler';
import type { Position, Feature, LineString } from 'geojson';
import { getMatchedRoute } from '@/lib/mapMatching';
import type { DrawMode } from '@/types/draw.types';
import { ERASE_DISTANCE_THRESHOLD } from '@/constants/draw';
import { findClosestRouteIndex } from '@/utils/draw';

export function useMapDrawing(mapRef: RefObject<Mapbox.MapView | null>) {
  const [drawnCoordinates, setDrawnCoordinates] = useState<Position[]>([]);
  const [completedDrawings, setCompletedDrawings] = useState<Position[][]>([]);
  const [matchedRoutes, setMatchedRoutes] = useState<Feature<LineString>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [drawMode, setDrawMode] = useState<DrawMode>('none');

  const handleMatchRoute = async (coordinates: Position[]) => {
    if (coordinates.length < 2) return;
    setIsLoading(true);
    try {
      const route = await getMatchedRoute(coordinates);
      setMatchedRoutes((prev) => [...prev, route]);
      setDrawnCoordinates([]);
    } catch (error: any) {
      Alert.alert('경로 보정 실패', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrawModeToggle = () => {
    setDrawMode((prev) => (prev === 'draw' ? 'none' : 'draw'));
    setDrawnCoordinates([]);
  };

  const handleEraseModeToggle = () => {
    setDrawMode((prev) => (prev === 'erase' ? 'none' : 'erase'));
    setDrawnCoordinates([]);
  };

  const handleEraseRoute = (routeIndex: number) => {
    setMatchedRoutes((prev) => prev.filter((_, index) => index !== routeIndex));
    setCompletedDrawings((prev) =>
      prev.filter((_, index) => index !== routeIndex),
    );
  };

  const clearAllRoutes = () => {
    setMatchedRoutes([]);
    setCompletedDrawings([]);
    setDrawnCoordinates([]);
  };

  const panGesture = Gesture.Pan()
    .enabled(drawMode === 'draw')
    .onBegin(() => {
      if (drawMode === 'draw') {
        setDrawnCoordinates([]);
      }
    })
    .onUpdate(async (event) => {
      if (drawMode !== 'draw' || !mapRef.current) return;
      try {
        const newCoord = await mapRef.current.getCoordinateFromView([
          event.x,
          event.y,
        ]);
        setDrawnCoordinates((prev) => [...prev, newCoord]);
      } catch (error) {
        console.warn('Coordinate conversion error:', error);
      }
    })
    .onEnd(() => {
      if (drawMode === 'draw' && drawnCoordinates.length > 1) {
        setCompletedDrawings((prev) => [...prev, drawnCoordinates]);
        handleMatchRoute(drawnCoordinates);
      } else if (drawMode === 'draw') {
        setDrawnCoordinates([]);
      }
    })
    .minDistance(1);

  const tapGesture = Gesture.Tap()
    .enabled(drawMode === 'erase')
    .onEnd(async (event) => {
      if (drawMode !== 'erase' || !mapRef.current) return;

      try {
        const tappedCoord = await mapRef.current.getCoordinateFromView([
          event.x,
          event.y,
        ]);

        const { closestRouteIndex, minDistance } = findClosestRouteIndex(
          tappedCoord,
          matchedRoutes,
        );

        if (
          closestRouteIndex !== -1 &&
          minDistance < ERASE_DISTANCE_THRESHOLD
        ) {
          handleEraseRoute(closestRouteIndex);
        }
      } catch (error) {
        console.warn('Coordinate conversion error:', error);
      }
    });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  return {
    drawnCoordinates,
    completedDrawings,
    matchedRoutes,
    isLoading,
    drawMode,
    composedGesture,
    handleDrawModeToggle,
    handleEraseModeToggle,
    clearAllRoutes,
  };
}
