import * as turf from '@turf/turf';
import { Position } from 'geojson';
import {
  CourseValidationResult,
  CoursePolygon,
  CourseValidationOptions,
} from '../types/courseValidation.types';
import { CourseTopologyResponse } from '../types/courses.types';

/**
 * CourseTopologyResponse의 shape 데이터를 Turf.js MultiPolygon으로 변환
 */
export function convertTopologyToMultiPolygon(
  topology: CourseTopologyResponse,
): any {
  const coordinates = topology.shape.map((polygon) =>
    polygon.map((ring) =>
      ring.map(
        (coord) =>
          [Number((coord as any)[0]), Number((coord as any)[1])] as [
            number,
            number,
          ],
      ),
    ),
  );

  return turf.multiPolygon(coordinates);
}

/**
 * 실시간 위치가 코스 영역 내에 있는지 확인
 */
export function validateLocationOnCourse(
  currentLocation: Position,
  coursePolygon: CoursePolygon,
  options: CourseValidationOptions = {},
): CourseValidationResult {
  const {
    tolerance = 50, // 기본 50미터 허용 오차
    enableDistanceCalculation = true,
  } = options;

  try {
    // 현재 위치를 Turf Point로 변환
    const currentPoint = turf.point([currentLocation[0], currentLocation[1]]);

    // 코스 폴리곤을 Turf MultiPolygon으로 변환
    const multiPolygon = turf.multiPolygon(coursePolygon.coordinates as any);

    // 점이 폴리곤 내부에 있는지 확인
    const isInside = turf.booleanPointInPolygon(currentPoint, multiPolygon);

    // 거리 계산
    let distanceFromCourse = 0;
    let nearestPointOnCourse: [number, number] | undefined;

    if (enableDistanceCalculation) {
      // 모든 폴리곤의 모든 링에 대해 최단 거리 계산
      let minDistance = Infinity;
      let nearestPoint: any = null;

      coursePolygon.coordinates.forEach((polygon) => {
        polygon.forEach((ring) => {
          const lineString = turf.lineString(ring as any);
          const nearest = turf.nearestPointOnLine(lineString, currentPoint);
          const distance = turf.distance(currentPoint, nearest, {
            units: 'meters',
          });

          if (distance < minDistance) {
            minDistance = distance;
            nearestPoint = nearest;
          }
        });
      });

      distanceFromCourse = minDistance;
      if (nearestPoint) {
        nearestPointOnCourse = [
          nearestPoint.geometry.coordinates[0],
          nearestPoint.geometry.coordinates[1],
        ] as [number, number];
      }
    }

    // tolerance를 고려한 최종 판정
    const isOnCourse = isInside || distanceFromCourse <= tolerance;

    // 디버깅 로그
    console.log('🔍 코스 검증 결과:', {
      currentLocation: [
        currentLocation[0].toFixed(6),
        currentLocation[1].toFixed(6),
      ],
      isInside,
      distanceFromCourse: distanceFromCourse.toFixed(2) + 'm',
      tolerance: tolerance + 'm',
      finalResult: isOnCourse ? '경로 내부' : '경로 외부',
    });

    const result: CourseValidationResult = {
      isOnCourse,
      distanceFromCourse,
      nearestPointOnCourse,
    };

    return result;
  } catch (error) {
    console.error('코스 검증 중 오류 발생:', error);
    return {
      isOnCourse: false,
      distanceFromCourse: Infinity,
    };
  }
}

/**
 * CourseTopologyResponse를 사용하여 위치 검증
 */
export function validateLocationWithTopology(
  currentLocation: Position,
  topology: CourseTopologyResponse,
  options: CourseValidationOptions = {},
): CourseValidationResult {
  // 🔍 라인 데이터를 그대로 사용하여 검증
  return validateLocationWithLines(currentLocation, topology, options);
}

/**
 * 라인 데이터를 사용하여 위치 검증
 */
function validateLocationWithLines(
  currentLocation: Position,
  topology: CourseTopologyResponse,
  options: CourseValidationOptions = {},
): CourseValidationResult {
  const {
    tolerance = 50, // 기본 50미터 허용 오차
    enableDistanceCalculation = true,
  } = options;

  try {
    const currentPoint = turf.point([currentLocation[0], currentLocation[1]]);

    // 모든 라인에 대해 검증
    let isOnCourse = false;
    let minDistance = Infinity;
    let nearestPointOnCourse: [number, number] | undefined;

    // 모든 라인 세그먼트를 하나의 연속된 라인으로 연결
    const allCoords: [number, number][] = [];

    topology.shape.forEach((polygon, polygonIndex) => {
      polygon.forEach((ring, ringIndex) => {
        if (ring.length >= 2) {
          // 각 ring은 [경도, 위도] 형태의 2개 좌표
          const lng = Number(ring[0]);
          const lat = Number(ring[1]);

          if (!isNaN(lng) && !isNaN(lat)) {
            allCoords.push([lng, lat]);
          }
        }
      });
    });

    if (allCoords.length < 2) {
      console.warn('⚠️ 유효한 좌표가 부족합니다:', { allCoords });
      return {
        isOnCourse: false,
        distanceFromCourse: Infinity,
      };
    }

    // 좌표 유효성 검사
    const validCoords = allCoords.filter(
      (coord) =>
        !isNaN(coord[0]) &&
        !isNaN(coord[1]) &&
        isFinite(coord[0]) &&
        isFinite(coord[1]),
    );

    if (validCoords.length < 2) {
      console.warn('⚠️ 유효한 좌표가 부족합니다:', { validCoords });
      return {
        isOnCourse: false,
        distanceFromCourse: Infinity,
      };
    }

    // 좌표 배열을 명시적으로 변환 (Turf.js는 [lng, lat] 형식 기대)
    const convertedCoords = validCoords.map(
      (coord) => [Number(coord[0]), Number(coord[1])] as [number, number],
    );

    // 좌표 배열을 완전히 새로 생성
    const freshCoords: [number, number][] = [];
    for (let i = 0; i < convertedCoords.length; i++) {
      const coord = convertedCoords[i];
      if (Array.isArray(coord) && coord.length === 2) {
        freshCoords.push([Number(coord[0]), Number(coord[1])]);
      }
    }

    // 좌표 배열을 완전히 새로 생성하여 타입 안전성 보장
    const safeCoords: [number, number][] = [];
    for (let i = 0; i < freshCoords.length; i++) {
      const coord = freshCoords[i];
      if (Array.isArray(coord) && coord.length === 2) {
        const lng = Number(coord[0]);
        const lat = Number(coord[1]);
        if (!isNaN(lng) && !isNaN(lat) && isFinite(lng) && isFinite(lat)) {
          safeCoords.push([lng, lat]);
        }
      }
    }

    if (safeCoords.length < 2) {
      return {
        isOnCourse: false,
        distanceFromCourse: Infinity,
      };
    }

    let lineString;
    try {
      lineString = turf.lineString(safeCoords);
    } catch (lineError) {
      return {
        isOnCourse: false,
        distanceFromCourse: Infinity,
      };
    }

    // 점이 라인 위에 있는지 확인 (매우 엄격하게)
    let isOnLine;
    try {
      isOnLine = turf.booleanPointOnLine(currentPoint, lineString, {
        epsilon: 0.00001, // 매우 엄격한 오차 허용
      });
    } catch (pointError) {
      return {
        isOnCourse: false,
        distanceFromCourse: Infinity,
      };
    }

    // 거리 계산 - Turf.js 사용 (안전한 방법)
    if (enableDistanceCalculation) {
      try {
        // 현재 위치를 안전하게 Point로 생성
        const currentLng = Number(currentLocation[0]);
        const currentLat = Number(currentLocation[1]);

        if (
          isNaN(currentLng) ||
          isNaN(currentLat) ||
          !isFinite(currentLng) ||
          !isFinite(currentLat)
        ) {
          minDistance = 0;
        } else {
          const currentPoint = turf.point([currentLng, currentLat]);

          // 현재 위치에서 가장 가까운 라인 좌표까지의 거리 계산
          let minDist = Infinity;
          let nearestPoint: [number, number] | undefined;

          for (const coord of safeCoords) {
            const coordLng = Number(coord[0]);
            const coordLat = Number(coord[1]);

            if (
              !isNaN(coordLng) &&
              !isNaN(coordLat) &&
              isFinite(coordLng) &&
              isFinite(coordLat)
            ) {
              const coordPoint = turf.point([coordLng, coordLat]);
              const distance = turf.distance(currentPoint, coordPoint, {
                units: 'meters',
              });

              if (distance < minDist) {
                minDist = distance;
                nearestPoint = coord;
              }
            }
          }

          minDistance = minDist;
          nearestPointOnCourse = nearestPoint;
        }
      } catch (distanceError) {
        minDistance = 0; // 거리 계산 실패 시 0으로 설정
      }
    }

    // tolerance를 고려한 최종 판정
    const distanceFromCourse = minDistance === Infinity ? 0 : minDistance;

    // 더 엄격한 검증: 거리가 tolerance 이내여야 함 (isOnLine 무시)
    const finalIsOnCourse = distanceFromCourse <= tolerance;

    return {
      isOnCourse: finalIsOnCourse,
      distanceFromCourse,
      nearestPointOnCourse,
    };
  } catch (error) {
    return {
      isOnCourse: false,
      distanceFromCourse: Infinity,
    };
  }
}

// 경계 계산 헬퍼 함수
function calculateBounds(shape: [number, number][][]) {
  let minLng = Infinity,
    maxLng = -Infinity;
  let minLat = Infinity,
    maxLat = -Infinity;

  shape.forEach((polygon) => {
    polygon.forEach((ring) => {
      // 각 ring은 [경도, 위도] 형태의 2개 좌표
      if (ring.length >= 2) {
        const lng = Number(ring[0]);
        const lat = Number(ring[1]);

        // NaN 체크
        if (!isNaN(lng) && !isNaN(lat)) {
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        }
      }
    });
  });

  // 유효한 좌표가 없는 경우
  if (
    minLng === Infinity ||
    maxLng === -Infinity ||
    minLat === Infinity ||
    maxLat === -Infinity
  ) {
    return {
      minLng: 'N/A',
      maxLng: 'N/A',
      minLat: 'N/A',
      maxLat: 'N/A',
      centerLng: 'N/A',
      centerLat: 'N/A',
    };
  }

  return {
    minLng: minLng.toFixed(6),
    maxLng: maxLng.toFixed(6),
    minLat: minLat.toFixed(6),
    maxLat: maxLat.toFixed(6),
    centerLng: ((minLng + maxLng) / 2).toFixed(6),
    centerLat: ((minLat + maxLat) / 2).toFixed(6),
  };
}

/**
 * 연속적인 위치 추적에서 코스 이탈 감지
 */
export function detectCourseDeviation(
  currentLocation: Position,
  previousLocation: Position | null,
  topology: CourseTopologyResponse,
  options: CourseValidationOptions = {},
): {
  isDeviating: boolean;
  validationResult: CourseValidationResult;
  deviationSeverity: 'low' | 'medium' | 'high';
} {
  const validationResult = validateLocationWithTopology(
    currentLocation,
    topology,
    options,
  );

  let isDeviating = false;
  let deviationSeverity: 'low' | 'medium' | 'high' = 'low';

  if (!validationResult.isOnCourse) {
    isDeviating = true;

    // 이전 위치와의 거리를 고려하여 이탈 심각도 결정
    if (previousLocation && validationResult.distanceFromCourse) {
      const distanceFromPrevious = turf.distance(
        turf.point([previousLocation[0], previousLocation[1]]),
        turf.point([currentLocation[0], currentLocation[1]]),
        { units: 'meters' },
      );

      if (validationResult.distanceFromCourse > 100) {
        deviationSeverity = 'high';
      } else if (validationResult.distanceFromCourse > 50) {
        deviationSeverity = 'medium';
      } else {
        deviationSeverity = 'low';
      }
    }
  }

  return {
    isDeviating,
    validationResult,
    deviationSeverity,
  };
}

/**
 * 코스 경계에서의 안전 거리 계산
 */
export function calculateSafetyDistance(
  currentLocation: Position,
  topology: CourseTopologyResponse,
): number {
  try {
    const currentPoint = turf.point([currentLocation[0], currentLocation[1]]);
    const multiPolygon = turf.multiPolygon(
      topology.shape.map((polygon) =>
        polygon.map((ring) =>
          ring.map(
            (coord) =>
              [Number((coord as any)[0]), Number((coord as any)[1])] as [
                number,
                number,
              ],
          ),
        ),
      ),
    );

    // 폴리곤 경계까지의 최단 거리 계산
    let minDistance = Infinity;

    // 각 폴리곤의 각 링에 대해 거리 계산
    topology.shape.forEach((polygon) => {
      polygon.forEach((ring) => {
        const lineString = turf.lineString(
          ring.map(
            (coord) =>
              [Number((coord as any)[0]), Number((coord as any)[1])] as [
                number,
                number,
              ],
          ),
        );
        const nearestPoint = turf.nearestPointOnLine(lineString, currentPoint);
        const distance = turf.distance(currentPoint, nearestPoint, {
          units: 'meters',
        });

        if (distance < minDistance) {
          minDistance = distance;
        }
      });
    });

    return minDistance;
  } catch (error) {
    console.error('안전 거리 계산 중 오류 발생:', error);
    return Infinity;
  }
}
