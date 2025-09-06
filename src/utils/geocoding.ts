import type { Position } from 'geojson';

export interface GeocodingResult {
  address: string;
  placeName: string;
}

export async function reverseGeocode(
  coordinates: Position,
): Promise<GeocodingResult> {
  const [longitude, latitude] = coordinates;
  const accessToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('Mapbox 액세스 토큰이 설정되지 않았습니다.');
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken}&types=address,poi`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      return {
        address: feature.place_name || '알 수 없는 위치',
        placeName: feature.text || '알 수 없는 위치',
      };
    }

    return {
      address: '알 수 없는 위치',
      placeName: '알 수 없는 위치',
    };
  } catch (error) {
    console.error('지오코딩 오류:', error);
    return {
      address: '알 수 없는 위치',
      placeName: '알 수 없는 위치',
    };
  }
}
