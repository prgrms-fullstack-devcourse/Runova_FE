import { RefObject, useRef } from 'react';
import { Alert } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
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

  // gesture 시작 시 초기화를 위한 JS 함수
  const initializeGesture = () => {
    pointsInCurrentGesture.current = [];
    setDrawnCoordinates([]);
  };

  // gesture 완료 시 처리를 위한 JS 함수
  const finalizeGesture = () => {
    const finalPoints = [...pointsInCurrentGesture.current];
    pointsInCurrentGesture.current = [];

    if (drawMode === 'draw' && finalPoints.length > 1) {
      addCompletedDrawing(finalPoints);
      handleMatchRoute(finalPoints);
    } else {
      setDrawnCoordinates([]);
    }
  };

  // JS 스레드에서 실행될 coordinate 변환 및 업데이트 함수
  const handleCoordinateUpdate = async (x: number, y: number) => {
    if (!mapRef.current) {
      console.warn('MapRef is not available');
      return;
    }

    try {
      const coord = await mapRef.current.getCoordinateFromView([x, y]);

      if (!coord || !Array.isArray(coord) || coord.length !== 2) {
        console.warn('Invalid coordinate received:', coord);
        return;
      }

      // 새로운 배열을 생성하여 immutability 문제 해결
      const newPoints = [...pointsInCurrentGesture.current, coord];
      pointsInCurrentGesture.current = newPoints;

      if (!updateQueued.current) {
        updateQueued.current = true;
        requestAnimationFrame(() => {
          setDrawnCoordinates([...pointsInCurrentGesture.current]);
          updateQueued.current = false;
        });
      }
    } catch (error) {
      console.warn('Coordinate conversion error:', error);
      console.warn('Error type:', error?.constructor?.name);
      console.warn('Event coordinates:', x, y);
    }
  };

  // erase 모드용 coordinate 변환 함수
  const handleTapCoordinate = async (x: number, y: number) => {
    if (!mapRef.current) return;

    try {
      const tappedCoord = await mapRef.current.getCoordinateFromView([x, y]);
      const { closestRouteIndex, minDistance } = findClosestRouteIndex(
        tappedCoord,
        matchedRoutes,
      );
      if (closestRouteIndex !== -1 && minDistance < ERASE_DISTANCE_THRESHOLD) {
        eraseRouteByIndex(closestRouteIndex);
      }
    } catch (error) {
      console.warn('Coordinate conversion error:', error);
    }
  };

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
      // ref 수정을 JS 스레드에서 실행
      runOnJS(initializeGesture)();
    })
    .onUpdate((event) => {
      if (drawMode !== 'draw') return;

      // coordinate 변환과 업데이트를 JS 스레드에서 실행
      runOnJS(handleCoordinateUpdate)(event.x, event.y);
    })
    .onEnd(() => {
      // gesture 완료 처리를 JS 스레드에서 실행
      runOnJS(finalizeGesture)();
    })
    .minDistance(1);

  const tapGesture = Gesture.Tap()
    .enabled(drawMode === 'erase')
    .onEnd((event) => {
      if (drawMode !== 'erase') return;

      // tap coordinate 처리를 JS 스레드에서 실행
      runOnJS(handleTapCoordinate)(event.x, event.y);
    });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  return { composedGesture };
}
