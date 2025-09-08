import type { Position } from 'geojson';
import { callMapboxGeocoding } from './mapbox';

export interface GeocodingResult {
  address: string;
  placeName: string;
}

export async function reverseGeocode(
  coordinates: Position,
): Promise<GeocodingResult> {
  try {
    const data = await callMapboxGeocoding(coordinates);

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
