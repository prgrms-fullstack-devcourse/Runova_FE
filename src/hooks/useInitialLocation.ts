import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import type { Position } from 'geojson';

export function useInitialLocation() {
  const [location, setLocation] = useState<Position | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('위치 접근 권한이 거절되었습니다.');
        setLoading(false);
        return;
      }

      let fetchedLocation: Location.LocationObject | null = null;
      try {
        fetchedLocation = await Location.getLastKnownPositionAsync({});
        if (!fetchedLocation) {
          fetchedLocation = await Location.getCurrentPositionAsync({});
        }
      } catch (error) {
        console.error('위치 가져오기 오류', error);
      }

      if (fetchedLocation) {
        setLocation([
          fetchedLocation.coords.longitude,
          fetchedLocation.coords.latitude,
        ]);
      }
      setLoading(false);
    })();
  }, []);

  return { location, loading };
}
