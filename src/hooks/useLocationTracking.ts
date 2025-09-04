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

  useEffect(() => {
    let subscriber: { remove: () => void } | undefined;

    const startWatching = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const lastKnownPosition = await Location.getLastKnownPositionAsync();
      if (lastKnownPosition) {
        setLocation(lastKnownPosition);
        const { latitude, longitude } = lastKnownPosition.coords;
        setRouteCoordinates([[longitude, latitude]]);
      }

      subscriber = await Location.watchPositionAsync(
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
    };

    startWatching();

    return () => {
      subscriber?.remove();
    };
  }, []);

  return { routeCoordinates, location, errorMsg };
}
