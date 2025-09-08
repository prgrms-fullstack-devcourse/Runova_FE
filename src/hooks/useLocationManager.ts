import { useRef, useEffect } from 'react';
import type { Position } from 'geojson';
import type Mapbox from '@rnmapbox/maps';
import { useInitialLocation } from '@/hooks/useInitialLocation';
import { FLY_TO_USER_LOCATION_DURATION } from '@/constants/draw';

export function useLocationManager() {
  const { location: initialLocation, loading: locationLoading } =
    useInitialLocation();
  const currentUserLocation = useRef<Position | null>(null);

  useEffect(() => {
    if (initialLocation) {
      currentUserLocation.current = initialLocation;
    }
  }, [initialLocation]);

  const flyToCurrentUserLocation = (
    cameraRef: React.RefObject<Mapbox.Camera | null>,
  ) => {
    if (currentUserLocation.current) {
      cameraRef.current?.flyTo(
        currentUserLocation.current,
        FLY_TO_USER_LOCATION_DURATION,
      );
    }
  };

  const handleUserLocationUpdate = (location: Mapbox.Location) => {
    currentUserLocation.current = [
      location.coords.longitude,
      location.coords.latitude,
    ];
  };

  return {
    initialLocation,
    locationLoading,
    flyToCurrentUserLocation,
    handleUserLocationUpdate,
  };
}
