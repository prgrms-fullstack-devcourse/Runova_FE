import type { RefObject } from 'react';
import type Mapbox from '@rnmapbox/maps';

export function useMapCapture(mapRef: RefObject<Mapbox.MapView | null>) {
  const captureMap = async (): Promise<string> => {
    if (!mapRef.current) {
      throw new Error('맵이 준비되지 않았습니다.');
    }

    const uri = await mapRef.current.takeSnap(true);
    if (!uri) {
      throw new Error('맵 캡처에 실패했습니다.');
    }

    return uri;
  };

  return { captureMap };
}
