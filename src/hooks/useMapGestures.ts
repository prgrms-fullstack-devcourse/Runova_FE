import { RefObject, useRef } from 'react';
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
    matchedRoutes,
    setDrawnCoordinates,
    addCompletedDrawing,
    addMatchedRoute,
    setIsLoading,
    eraseRouteByIndex,
  } = useDrawStore();

  const pointsInCurrentGesture = useRef<Position[]>([]);
  const updateQueued = useRef(false);

  const handleMatchRoute = async (coordinates: Position[]) => {
    if (coordinates.length < 2) return;
    setIsLoading(true);
    try {
      const route = await getMatchedRoute(coordinates);
      addMatchedRoute(route);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '경로 보정 중 오류가 발생했습니다.';
      Alert.alert('경로 보정 실패', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const panGesture = Gesture.Pan()
    .enabled(drawMode === 'draw')
    .onBegin(() => {
      pointsInCurrentGesture.current = [];
    })
    .onUpdate(async (event) => {
      if (drawMode !== 'draw' || !mapRef.current) return;

      try {
        const newCoord = await mapRef.current.getCoordinateFromView([
          event.x,
          event.y,
        ]);
        pointsInCurrentGesture.current.push(newCoord);

        if (!updateQueued.current) {
          updateQueued.current = true;
          requestAnimationFrame(() => {
            setDrawnCoordinates([...pointsInCurrentGesture.current]);
            updateQueued.current = false;
          });
        }
      } catch (error) {
        console.warn('Coordinate conversion error:', error);
      }
    })
    .onEnd(() => {
      const finalPoints = pointsInCurrentGesture.current;
      if (drawMode === 'draw' && finalPoints.length > 1) {
        addCompletedDrawing(finalPoints);
        handleMatchRoute(finalPoints);
      } else {
        setDrawnCoordinates([]);
      }
      pointsInCurrentGesture.current = [];
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
