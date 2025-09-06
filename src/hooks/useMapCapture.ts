import type { RefObject } from 'react';
import type Mapbox from '@rnmapbox/maps';
import { useImageUpload } from '@/hooks/useImageUpload';

export type ImageProcessResult = {
  success: boolean;
  imageURL?: string;
  error?: string;
  captureSuccess?: boolean;
  uploadSuccess?: boolean;
  captureError?: string;
  uploadError?: string;
};

export function useMapCapture(mapRef: RefObject<Mapbox.MapView | null>) {
  const { uploadImage } = useImageUpload();

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

  const processImage = async (
    accessToken: string,
  ): Promise<ImageProcessResult> => {
    try {
      const capturedImageUri = await captureMap();
      const uploadedImageUrl = await uploadImage(capturedImageUri, accessToken);

      return {
        success: true,
        imageURL: uploadedImageUrl,
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
