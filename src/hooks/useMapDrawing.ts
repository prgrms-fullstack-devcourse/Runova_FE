import { useState, RefObject } from 'react';
import { Alert } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { Gesture } from 'react-native-gesture-handler';
import type { Position, Feature, LineString } from 'geojson';
import { getMatchedRoute } from '@/lib/mapMatching';

export function useMapDrawing(mapRef: RefObject<Mapbox.MapView | null>) {
  const [drawnCoordinates, setDrawnCoordinates] = useState<Position[]>([]);
  const [matchedRoute, setMatchedRoute] = useState<Feature<LineString> | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleMatchRoute = async (coordinates: Position[]) => {
    if (coordinates.length < 2) return;
    setIsLoading(true);
    try {
      const route = await getMatchedRoute(coordinates);
      setMatchedRoute(route);
      setDrawnCoordinates([]);
    } catch (error: any) {
      Alert.alert('경로 보정 실패', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      setDrawnCoordinates([]);
      setMatchedRoute(null);
    })
    .onUpdate(async (event) => {
      if (!mapRef.current) return;
      try {
        const newCoord = await mapRef.current.getCoordinateFromView([
          event.x,
          event.y,
        ]);
        setDrawnCoordinates((prev) => [...prev, newCoord]);
      } catch (error) {
        console.warn('Coordinate conversion error:', error);
      }
    })
    .onEnd(() => {
      handleMatchRoute(drawnCoordinates);
    })
    .minDistance(1);

  return {
    drawnCoordinates,
    matchedRoute,
    isLoading,
    panGesture,
  };
}
