import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface UseInitialLocationOptions {
  requestPermission?: boolean; // 권한 요청 여부 (기본값: true)
}

export function useInitialLocation(options: UseInitialLocationOptions = {}) {
  const { requestPermission = true } = options;
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // 권한 상태 체크
      const { status: currentStatus } =
        await Location.getForegroundPermissionsAsync();

      // 권한이 없고 요청이 필요한 경우에만 권한 요청
      if (currentStatus !== 'granted' && requestPermission) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('위치 접근 권한이 거절되었습니다.');
          setLoading(false);
          return;
        }
      }

      // 권한이 없으면 위치 가져오기 시도하지 않음
      if (currentStatus !== 'granted') {
        setError('위치 접근 권한이 필요합니다.');
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
        // 위치 가져오기 실패 시 무시
      }

      if (fetchedLocation) {
        setLocation(fetchedLocation);
      }
      setLoading(false);
    })();
  }, [requestPermission]);

  return { location, loading };
}
