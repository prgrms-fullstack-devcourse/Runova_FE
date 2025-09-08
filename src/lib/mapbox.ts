import type { Position } from 'geojson';

export interface MapboxGeocodingResponse {
  features: Array<{
    place_name: string;
    text: string;
  }>;
}

export interface MapboxMapMatchingResponse {
  code: string;
  message?: string;
  matchings: Array<{
    geometry: {
      type: 'LineString';
      coordinates: Position[];
    };
  }>;
}

// Mapbox Geocoding API 호출
export async function callMapboxGeocoding(
  coordinates: Position,
): Promise<MapboxGeocodingResponse> {
  const [longitude, latitude] = coordinates;
  const accessToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('Mapbox 액세스 토큰이 설정되지 않았습니다.');
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken}&types=address,poi`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Mapbox Geocoding API 호출 실패: ${response.status}`);
  }

  return response.json();
}

// Mapbox Map Matching API 호출
export async function callMapboxMapMatching(
  coordinates: Position[],
  profile: string = 'walking',
  radiuses: number[] = [],
): Promise<MapboxMapMatchingResponse> {
  const accessToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('Mapbox 액세스 토큰이 설정되지 않았습니다.');
  }

  const coordsString = coordinates.map((c) => c.join(',')).join(';');
  const radiusesString = radiuses.length > 0 ? radiuses.join(';') : '';

  const url = `https://api.mapbox.com/matching/v5/mapbox/${profile}/${coordsString}?geometries=geojson&radiuses=${radiusesString}&access_token=${accessToken}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Mapbox Map Matching API 호출 실패: ${response.status}`);
  }

  return response.json();
}
