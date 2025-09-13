import { useRef, useEffect } from 'react';
import type { Position } from 'geojson';
import type Mapbox from '@rnmapbox/maps';
import { useInitialLocation } from '@/hooks/useInitialLocation';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { FLY_TO_USER_LOCATION_DURATION } from '@/constants/draw';

export function useLocationManager() {
  const { location: initialLocation, loading: locationLoading } =
    useInitialLocation();
  const { location, errorMsg, refreshLocation } = useLocationTracking();
  const currentUserLocation = useRef<Position | null>(null);

  useEffect(() => {
    if (initialLocation) {
      currentUserLocation.current = [
        initialLocation.coords.longitude,
        initialLocation.coords.latitude,
      ];
    }
  }, [initialLocation]);

  useEffect(() => {
    if (!location && !errorMsg) {
      refreshLocation();
    }
  }, [location, errorMsg, refreshLocation]);

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

  const fitToCoordinates = (
    cameraRef: React.RefObject<Mapbox.Camera | null>,
    coordinates: Position[],
  ) => {
    if (coordinates.length === 0 || !cameraRef.current) return;

    const lngs = coordinates.map((coord) => coord[0]);
    const lats = coordinates.map((coord) => coord[1]);

    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    const centerLng = (minLng + maxLng) / 2;
    const centerLat = (minLat + maxLat) / 2;

    const lngDiff = maxLng - minLng;
    const latDiff = maxLat - minLat;
    const maxDiff = Math.max(lngDiff, latDiff);
    const zoom = Math.max(10, Math.min(18, 14 - Math.log2(maxDiff * 100)));

    cameraRef.current.setCamera({
      centerCoordinate: [centerLng, centerLat],
      zoomLevel: zoom,
      animationDuration: 1000,
    });
  };

  return {
    initialLocation: currentUserLocation.current || [127.0276, 37.4979], // 기본값: 서울
    locationLoading: locationLoading || !currentUserLocation.current,
    location,
    errorMsg,
    refreshLocation,
    flyToCurrentUserLocation,
    handleUserLocationUpdate,
    fitToCoordinates,
  };
}
