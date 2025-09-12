import { Position } from 'geojson';

export interface CourseValidationResult {
  isOnCourse: boolean;
  distanceFromCourse?: number; // 코스로부터의 거리 (미터)
  nearestPointOnCourse?: Position; // 코스에서 가장 가까운 점
}

export interface CoursePolygon {
  coordinates: [number, number][][][]; // MultiPolygon 형태의 좌표 배열
}

export interface CourseValidationOptions {
  tolerance?: number; // 허용 오차 (미터, 기본값: 50)
  enableDistanceCalculation?: boolean; // 거리 계산 활성화 여부
}
