import { useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import useRunStore from '@/store/run';
import { useInitialLocation } from '@/hooks/useInitialLocation';
import {
  LOCATION_UPDATE_INTERVAL_MS,
  LOCATION_DISTANCE_INTERVAL_M,
  MIN_DISTANCE_THRESHOLD_M,
} from '@/constants/location';
import { haversineDistance } from '@/utils/location';
import type { Position } from 'geojson';

export function useLocationTracking() {
  const {
    routeCoordinates,
    errorMsg,
    location,
    isTracking,
    subscriber,
    setRouteCoordinates,
    setLocation,
    setIsTracking,
    setSubscriber,
    setLocationErrorMsg,
    clearRouteCoordinates,
    resetLocationTracking,
  } = useRunStore();

  // useInitialLocation 훅 사용 (Run 스크린 접속 시마다 새로 실행됨, 권한 상태 체크 후 필요시에만 요청)
  const { location: initialLocation, loading: locationLoading } =
    useInitialLocation({ requestPermission: true });

  // 초기 위치를 store에 설정
  useEffect(() => {
    if (initialLocation && !location) {
      setLocation(initialLocation);
    }
  }, [initialLocation, location]);

  const startTracking = useCallback(async () => {
    if (isTracking) return;

    if (location) {
      const { latitude, longitude } = location.coords;
      setRouteCoordinates([[longitude, latitude]]);
    }

    const newSubscriber = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: LOCATION_UPDATE_INTERVAL_MS,
        distanceInterval: LOCATION_DISTANCE_INTERVAL_M,
      },
      (newLocation) => {
        const { latitude, longitude } = newLocation.coords;

        // 디버깅 로그
        console.log('📍 [LocationTracking] 위치 업데이트:', {
          latitude,
          longitude,
          timestamp: new Date().toISOString(),
        });

        setLocation(newLocation);

        const newCoordinate: Position = [longitude, latitude];
        const currentCoords = useRunStore.getState().routeCoordinates;
        if (currentCoords.length > 0) {
          const lastCoord = currentCoords[currentCoords.length - 1];
          const distance = haversineDistance(lastCoord, newCoordinate);

          if (distance > MIN_DISTANCE_THRESHOLD_M) {
            setRouteCoordinates([...currentCoords, newCoordinate]);
          }
        } else {
          setRouteCoordinates([...currentCoords, newCoordinate]);
        }

        // 위치 업데이트 시 즉시 코스 검증 실행을 위한 플래그 설정
        // useCourseValidation의 useEffect가 이를 감지하여 검증 실행
      },
    );

    setSubscriber(newSubscriber);
    setIsTracking(true);
  }, [
    isTracking,
    location,
    setRouteCoordinates,
    setSubscriber,
    setIsTracking,
    setLocation,
  ]);

  const pauseTracking = useCallback(() => {
    if (subscriber) {
      subscriber.remove();
      setSubscriber(null);
    }
    setIsTracking(false);
  }, [subscriber, setSubscriber, setIsTracking]);

  const stopTracking = useCallback(() => {
    if (subscriber) {
      subscriber.remove();
      setSubscriber(null);
    }
    setIsTracking(false);
    clearRouteCoordinates();
  }, [subscriber, setSubscriber, setIsTracking, clearRouteCoordinates]);

  const toggleTracking = useCallback(async () => {
    if (isTracking) {
      pauseTracking();
    } else {
      await startTracking();
    }
  }, [isTracking, pauseTracking, startTracking]);

  const refreshLocation = useCallback(async () => {
    // 권한 상태 체크
    const { status: currentStatus } =
      await Location.getForegroundPermissionsAsync();

    // 권한이 없으면 권한 요청
    if (currentStatus !== 'granted') {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationErrorMsg('위치 접근 권한이 거절되었습니다.');
        return;
      }
    }

    try {
      // useInitialLocation과 동일한 로직 사용
      let fetchedLocation: Location.LocationObject | null = null;
      fetchedLocation = await Location.getLastKnownPositionAsync({});
      if (!fetchedLocation) {
        fetchedLocation = await Location.getCurrentPositionAsync({});
      }

      if (fetchedLocation) {
        setLocation(fetchedLocation);
        setLocationErrorMsg(null);
      } else {
        setLocationErrorMsg('현재 위치를 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('위치 새로고침 오류', error);
      setLocationErrorMsg('현재 위치를 가져올 수 없습니다.');
    }
  }, [setLocationErrorMsg, setLocation]);

  return {
    routeCoordinates,
    location,
    errorMsg,
    isTracking,
    locationLoading,
    startTracking,
    pauseTracking,
    stopTracking,
    toggleTracking,
    refreshLocation,
    clearRouteCoordinates,
    resetLocationTracking,
  };
}
