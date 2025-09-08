import {
  MAP_MATCHING_API_PROFILE,
  MAP_MATCHING_MAX_COORDS,
  MAP_MATCHING_RADIUS,
} from '@/constants/mapMatching';
import type { Feature, LineString, Position } from 'geojson';
import { callMapboxMapMatching } from './mapbox';

export async function getMatchedRoute(
  coordinates: Position[],
): Promise<Feature<LineString>> {
  if (coordinates.length < 2) {
    throw new Error('Not enough coordinates for map matching.');
  }

  // 좌표가 너무 많으면 샘플링
  const coordsForApi =
    coordinates.length > MAP_MATCHING_MAX_COORDS
      ? coordinates.filter(
          (_, i) =>
            i % Math.ceil(coordinates.length / MAP_MATCHING_MAX_COORDS) === 0,
        )
      : coordinates;

  // 각 좌표에 스냅 반경 적용
  const radiuses = coordsForApi.map(() => MAP_MATCHING_RADIUS);

  try {
    const data = await callMapboxMapMatching(
      coordsForApi,
      MAP_MATCHING_API_PROFILE,
      radiuses,
    );

    if (data.code !== 'Ok' || data.matchings.length === 0) {
      console.log('Map matching failed response:', data);
      throw new Error(
        data.message || '유효한 경로를 찾지 못했습니다. 다시 시도해 주세요.',
      );
    }

    return {
      type: 'Feature',
      properties: {},
      geometry: data.matchings[0].geometry,
    };
  } catch (error) {
    console.error('맵매칭 오류:', error);
    throw error;
  }
}
