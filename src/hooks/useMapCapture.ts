import type { RefObject } from 'react';
import type Mapbox from '@rnmapbox/maps';
import type { Position } from 'geojson';
import useDrawStore from '@/store/draw';
import { ImageProcessResult } from '@/types/image.types';

const BOUNDS_PADDING = 0.6;
const ANIMATION_DURATION = 1000;
const TIMEOUT = 1200;

export function useMapCapture(
  mapRef: RefObject<Mapbox.MapView | null>,
  cameraRef: RefObject<Mapbox.Camera | null>,
) {
  const { matchedRoutes, setIsCapturing } = useDrawStore();

  const captureMap = async (routeCoordinates?: Position[]): Promise<string> => {
    if (!mapRef.current) {
      throw new Error('맵이 준비되지 않았습니다.');
    }

    // 캡처 전에 잠시 대기하여 현재 렌더링이 완료되도록 함
    await new Promise((resolve) => setTimeout(resolve, 100));

    setIsCapturing(true);

    // 소스 제거 후 추가 대기
    await new Promise((resolve) => setTimeout(resolve, 200));

    try {
      const coordinatesToUse =
        routeCoordinates ||
        matchedRoutes.flatMap((route) =>
          route.geometry.type === 'LineString'
            ? route.geometry.coordinates
            : [],
        );

      if (coordinatesToUse.length > 0) {
        try {
          const lons = coordinatesToUse.map((coord) => coord[0]);
          const lats = coordinatesToUse.map((coord) => coord[1]);

          const minLon = Math.min(...lons);
          const maxLon = Math.max(...lons);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);

          const lonDiff = maxLon - minLon;
          const latDiff = maxLat - minLat;

          const maxDiff = Math.max(lonDiff, latDiff);
          const padding = maxDiff * BOUNDS_PADDING;

          const lonPadding = padding;
          const latPadding = padding;

          const bounds = {
            ne: [maxLon + lonPadding, maxLat + latPadding],
            sw: [minLon - lonPadding, minLat - latPadding],
          };

          cameraRef.current?.setCamera({
            bounds: bounds,
            animationDuration: ANIMATION_DURATION,
          } as any);

          await new Promise((resolve) => setTimeout(resolve, TIMEOUT));
        } catch (error) {
          console.warn('카메라 조정 실패:', error);
        }
      }

      const uri = await mapRef.current.takeSnap(true);
      if (!uri) {
        throw new Error('맵 캡처에 실패했습니다.');
      }

      return uri;
    } finally {
      setIsCapturing(false);
    }
  };

  const processImage = async (): Promise<ImageProcessResult> => {
    try {
      const capturedImageUri = await captureMap();

      return {
        success: true,
        imageURL: capturedImageUri,
        captureSuccess: true,
        uploadSuccess: true,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '이미지 처리 중 오류가 발생했습니다.';
      const isCaptureError =
        errorMessage.includes('맵') || errorMessage.includes('캡처');

      return {
        success: false,
        imageURL: '',
        error: errorMessage,
        captureSuccess: !isCaptureError,
        uploadSuccess: isCaptureError,
        captureError: isCaptureError ? errorMessage : undefined,
        uploadError: !isCaptureError ? errorMessage : undefined,
      };
    }
  };

  return { captureMap, processImage };
}
