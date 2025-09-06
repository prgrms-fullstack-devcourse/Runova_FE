import { mergeMatchedRoutes, convertToApiFormat } from '@/utils/draw';
import useDrawStore from '@/store/draw';

export type ValidationResult = {
  isValid: boolean;
  error?: string;
  data?: {
    title: string;
    path: any[];
  };
};

export function useRouteValidation() {
  const { matchedRoutes } = useDrawStore();

  const validateRoute = (accessToken: string): ValidationResult => {
    if (!accessToken) {
      return { isValid: false, error: '로그인이 필요합니다.' };
    }
    if (matchedRoutes.length === 0) {
      return {
        isValid: false,
        error: '저장할 경로가 없습니다. 먼저 경로를 그려주세요.',
      };
    }
    const title = `GPS 아트 경로 ${new Date().toLocaleDateString()}`;
    const mergedCoordinates = mergeMatchedRoutes(matchedRoutes);
    if (mergedCoordinates.length < 2) {
      return {
        isValid: false,
        error: '유효한 경로 데이터가 없습니다. 최소 2개의 좌표가 필요합니다.',
      };
    }
    const pathData = convertToApiFormat(mergedCoordinates);
    const hasInvalidCoords = pathData.some(
      (point) =>
        !isFinite(point.lon) ||
        !isFinite(point.lat) ||
        Math.abs(point.lat) > 90 ||
        Math.abs(point.lon) > 180,
    );
    if (hasInvalidCoords) {
      return {
        isValid: false,
        error: '잘못된 좌표 데이터가 포함되어 있습니다.',
      };
    }
    return {
      isValid: true,
      data: {
        title,
        path: pathData,
      },
    };
  };

  return { validateRoute };
}
