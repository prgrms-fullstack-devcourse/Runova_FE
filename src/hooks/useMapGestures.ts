import { RefObject } from 'react';
import { Alert } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { Gesture } from 'react-native-gesture-handler';
import { getMatchedRoute } from '@/lib/mapMatching';
import { findClosestRouteIndex } from '@/utils/draw';
import { ERASE_DISTANCE_THRESHOLD } from '@/constants/draw';
import useDrawStore from '@/store/draw';
import type { Position } from 'geojson';

export function useMapGestures(mapRef: RefObject<Mapbox.MapView | null>) {
  const {
    drawMode,
    drawnCoordinates,
    matchedRoutes,
    addDrawnCoordinates,
    setDrawnCoordinates,
    addCompletedDrawing,
    addMatchedRoute,
    setIsLoading,
    eraseRouteByIndex,
  } = useDrawStore();

  const handleMatchRoute = async (coordinates: Position[]) => {
    if (coordinates.length < 2) return;
    setIsLoading(true);
    try {
      const route = await getMatchedRoute(coordinates);
      addMatchedRoute(route);
    } catch (error: any) {
      Alert.alert('경로 보정 실패', error.message);
    } finally {
      setIsLoading(false);
    }
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
        addDrawnCoordinates(newCoord);
      } catch (error) {
        console.warn('Coordinate conversion error:', error);
      }
    })
    .onEnd(() => {
      if (drawMode === 'draw' && drawnCoordinates.length > 1) {
        addCompletedDrawing(drawnCoordinates);
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
          eraseRouteByIndex(closestRouteIndex);
        }
      } catch (error) {
        console.warn('Coordinate conversion error:', error);
      }
    });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  return { composedGesture };
}
