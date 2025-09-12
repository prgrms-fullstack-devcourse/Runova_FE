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

  const { location: initialLocation, loading: locationLoading } =
    useInitialLocation({ requestPermission: true });

  useEffect(() => {
    if (initialLocation && !location) {
      setLocation(initialLocation);
    }
  }, [initialLocation, location]);

  const startTracking = useCallback(async () => {
    if (isTracking) return;

    const currentCoords = useRunStore.getState().routeCoordinates;
    if (currentCoords.length === 0 && location) {
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
    const { status: currentStatus } =
      await Location.getForegroundPermissionsAsync();

    if (currentStatus !== 'granted') {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationErrorMsg('위치 접근 권한이 거절되었습니다.');
        return;
      }
    }

    try {
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

  useEffect(() => {
    if (isTracking) {
      startTracking();
    } else {
      pauseTracking();
    }
  }, [isTracking, startTracking, pauseTracking]);

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
