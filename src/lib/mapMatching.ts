import {
  MAP_MATCHING_API_PROFILE,
  MAP_MATCHING_MAX_COORDS,
} from '@/constants/mapMatching';
import type { Feature, LineString, Position } from 'geojson';

export async function getMatchedRoute(
  coordinates: Position[],
): Promise<Feature<LineString>> {
  if (coordinates.length < 2) {
    throw new Error('Not enough coordinates for map matching.');
  }

  const coordsForApi =
    coordinates.length > MAP_MATCHING_MAX_COORDS
      ? coordinates.filter(
          (_, i) =>
            i % Math.ceil(coordinates.length / MAP_MATCHING_MAX_COORDS) === 0,
        )
      : coordinates;

  const coordsString = coordsForApi.map((c) => c.join(',')).join(';');
  const accessToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const url = `https://api.mapbox.com/matching/v5/mapbox/${MAP_MATCHING_API_PROFILE}/${coordsString}?geometries=geojson&access_token=${accessToken}`;

  const response = await fetch(url);
  const data = await response.json();

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
}
