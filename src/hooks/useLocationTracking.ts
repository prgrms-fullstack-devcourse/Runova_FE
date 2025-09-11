import { useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import useRunStore from '@/store/run';
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

  useEffect(() => {
    const getInitialLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationErrorMsg('Permission to access location was denied');
        return;
      }

      const lastKnownPosition = await Location.getLastKnownPositionAsync();
      if (lastKnownPosition) {
        setLocation(lastKnownPosition);
      }
    };

    getInitialLocation();
  }, [setLocationErrorMsg, setLocation]);

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
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationErrorMsg('Permission to access location was denied');
      return;
    }

    try {
      const currentPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      setLocation(currentPosition);
      setLocationErrorMsg(null);
    } catch (error) {
      setLocationErrorMsg('Failed to get current location');
    }
  }, [setLocationErrorMsg, setLocation]);

  return {
    routeCoordinates,
    location,
    errorMsg,
    isTracking,
    startTracking,
    pauseTracking,
    stopTracking,
    toggleTracking,
    refreshLocation,
    clearRouteCoordinates,
    resetLocationTracking,
  };
}
