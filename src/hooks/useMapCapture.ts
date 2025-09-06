import type { RefObject } from 'react';
import type Mapbox from '@rnmapbox/maps';
import useDrawStore from '@/store/draw';

const BOUNDS_PADDING = 0.6;
const ANIMATION_DURATION = 1000;
const TIMEOUT = 1200;

export type ImageProcessResult = {
  success: boolean;
  imageURL?: string;
  error?: string;
  captureSuccess?: boolean;
  uploadSuccess?: boolean;
  captureError?: string;
  uploadError?: string;
};

export function useMapCapture(
  mapRef: RefObject<Mapbox.MapView | null>,
  cameraRef: RefObject<Mapbox.Camera | null>,
) {
  const { matchedRoutes, setIsCapturing } = useDrawStore();

  const captureMap = async (): Promise<string> => {
    if (!mapRef.current) {
      throw new Error('맵이 준비되지 않았습니다.');
    }

    setIsCapturing(true);

    if (matchedRoutes.length > 0) {
      try {
        const allCoordinates: number[][] = [];
        matchedRoutes.forEach((route) => {
          if (route.geometry.type === 'LineString') {
            allCoordinates.push(...route.geometry.coordinates);
          }
        });

        if (allCoordinates.length > 0) {
          const lons = allCoordinates.map((coord) => coord[0]);
          const lats = allCoordinates.map((coord) => coord[1]);

          const minLon = Math.min(...lons);
          const maxLon = Math.max(...lons);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);

          const lonDiff = maxLon - minLon;
          const latDiff = maxLat - minLat;

          // 더 큰 차원을 기준으로 정사각형에 맞춰 패딩 설정
          const maxDiff = Math.max(lonDiff, latDiff);
          const padding = maxDiff * BOUNDS_PADDING; // 60% 패딩

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
        }
      } catch (error) {
        console.warn('카메라 조정 실패:', error);
      }
    }

    const uri = await mapRef.current.takeSnap(true);
    if (!uri) {
      throw new Error('맵 캡처에 실패했습니다.');
    }

    setIsCapturing(false);
    return uri;
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
    } catch (error: any) {
      const errorMessage =
        error.message || '이미지 처리 중 오류가 발생했습니다.';
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
