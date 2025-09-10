import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import type { Position } from 'geojson';
import {
  LOCATION_UPDATE_INTERVAL_MS,
  LOCATION_DISTANCE_INTERVAL_M,
  MIN_DISTANCE_THRESHOLD_M,
} from '@/constants/location';
import { haversineDistance } from '@/utils/location';

export function useLocationTracking() {
  const [routeCoordinates, setRouteCoordinates] = useState<Position[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [isTracking, setIsTracking] = useState(false);
  const [subscriber, setSubscriber] = useState<{ remove: () => void } | null>(
    null,
  );

  useEffect(() => {
    const getInitialLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const lastKnownPosition = await Location.getLastKnownPositionAsync();
      if (lastKnownPosition) {
        setLocation(lastKnownPosition);
      }
    };

    getInitialLocation();
  }, []);

  const startTracking = async () => {
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
        setRouteCoordinates((prevCoords) => {
          if (prevCoords.length > 0) {
            const lastCoord = prevCoords[prevCoords.length - 1];
            const distance = haversineDistance(lastCoord, newCoordinate);

            if (distance > MIN_DISTANCE_THRESHOLD_M) {
              return [...prevCoords, newCoordinate];
            }
          } else {
            return [...prevCoords, newCoordinate];
          }
          return prevCoords;
        });
      },
    );

    setSubscriber(newSubscriber);
    setIsTracking(true);
  };

  const pauseTracking = () => {
    if (subscriber) {
      subscriber.remove();
      setSubscriber(null);
    }
    setIsTracking(false);
  };

  const stopTracking = () => {
    if (subscriber) {
      subscriber.remove();
      setSubscriber(null);
    }
    setIsTracking(false);
    setRouteCoordinates([]);
  };

  const toggleTracking = () => {
    if (isTracking) {
      pauseTracking();
    } else {
      startTracking();
    }
  };

  const refreshLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    try {
      const currentPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      setLocation(currentPosition);
      setErrorMsg(null);
    } catch (error) {
      setErrorMsg('Failed to get current location');
    }
  };

  const clearRouteCoordinates = () => {
    setRouteCoordinates([]);
  };

  const resetLocationTracking = () => {
    if (subscriber) {
      subscriber.remove();
      setSubscriber(null);
    }
    setRouteCoordinates([]);
    setIsTracking(false);
    setErrorMsg(null);
  };

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
