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
      setLoading(true);

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
        // 무조건 현재 위치를 가져오려고 시도
        console.log('📍 현재 위치 요청 중...');
        fetchedLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        console.log('📍 현재 위치 획득 성공:', fetchedLocation.coords);
      } catch (error) {
        console.log('📍 현재 위치 실패, 마지막 알려진 위치 시도...');
        try {
          // 현재 위치 실패 시 마지막 알려진 위치 시도
          fetchedLocation = await Location.getLastKnownPositionAsync({});
          if (fetchedLocation) {
            console.log('📍 마지막 알려진 위치 획득:', fetchedLocation.coords);
          }
        } catch (lastKnownError) {
          console.log('📍 모든 위치 시도 실패');
        }
      }

      if (fetchedLocation) {
        setLocation(fetchedLocation);
        console.log('📍 위치 설정 완료');
      } else {
        console.log('📍 위치 정보 없음, 기본값 사용');
      }
      setLoading(false);
    })();
  }, [requestPermission]);

  return { location, loading };
}
