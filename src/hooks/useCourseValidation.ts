import { useCallback, useEffect, useRef } from 'react';
import { Position } from 'geojson';
import useRunStore from '../store/run';
import {
  validateLocationWithTopology,
  detectCourseDeviation,
  calculateSafetyDistance,
} from '../utils/courseValidation';
import { CourseValidationOptions } from '../types/courseValidation.types';

interface UseCourseValidationOptions {
  validationOptions?: CourseValidationOptions;
  enableRealTimeValidation?: boolean;
  validationInterval?: number; // 밀리초
  courseId?: number; // 코스 ID 추가
}

export function useCourseValidation(options: UseCourseValidationOptions = {}) {
  const {
    validationOptions = { tolerance: 50, enableDistanceCalculation: true },
    enableRealTimeValidation = true,
    validationInterval = 5000, // 5초마다 검증
    courseId,
  } = options;

  const {
    courseTopology,
    location,
    isTracking,
    routeCoordinates,
    isOnCourse,
    courseDeviation,
    validationHistory,
    lastValidationTime,
    updateCourseValidation,
    clearValidationHistory,
  } = useRunStore();

  // 이전 좌표를 저장할 ref
  const lastValidatedCoordinateRef = useRef<Position | null>(null);

  // 실시간 위치 검증 (트래킹 중이고 좌표가 실제로 이동했을 때만)
  const validateCurrentLocation = useCallback(() => {
    if (
      !courseId ||
      !location ||
      !location.coords ||
      !courseTopology ||
      !isTracking ||
      routeCoordinates.length === 0
    ) {
      return null;
    }

    // routeCoordinates의 마지막 위치를 사용 (실제 이동한 위치)
    const lastCoordinate = routeCoordinates[routeCoordinates.length - 1];
    const currentPosition: Position = [lastCoordinate[0], lastCoordinate[1]];

    // 이전에 검증한 좌표와 같은지 확인
    const lastValidated = lastValidatedCoordinateRef.current;
    if (
      lastValidated &&
      Math.abs(lastValidated[0] - currentPosition[0]) < 0.000001 &&
      Math.abs(lastValidated[1] - currentPosition[1]) < 0.000001
    ) {
      // 좌표가 거의 변하지 않았으면 검증하지 않음
      return null;
    }

    // 현재 좌표를 저장
    lastValidatedCoordinateRef.current = currentPosition;

    // 이전 위치 가져오기 (검증 히스토리에서)
    const previousResult = validationHistory[validationHistory.length - 1];
    const previousLocation = previousResult?.nearestPointOnCourse || null;

    // 코스 이탈 감지
    const deviationResult = detectCourseDeviation(
      currentPosition,
      previousLocation,
      courseTopology,
      validationOptions,
    );

    // 검증 결과 업데이트
    updateCourseValidation(deviationResult.validationResult);

    return deviationResult;
  }, [
    courseId,
    location,
    courseTopology,
    isTracking,
    routeCoordinates,
    validationHistory,
    validationOptions,
    updateCourseValidation,
  ]);

  // 안전 거리 계산
  const getSafetyDistance = useCallback(() => {
    if (!courseId || !location || !location.coords || !courseTopology) {
      return null;
    }

    const currentPosition: Position = [
      location.coords.longitude,
      location.coords.latitude,
    ];
    return calculateSafetyDistance(currentPosition, courseTopology);
  }, [courseId, location, courseTopology]);

  // 코스 복귀 여부 확인
  const checkCourseReturn = useCallback(() => {
    if (!isOnCourse || courseDeviation.isDeviating) {
      return false;
    }

    // 최근 3번의 검증이 모두 코스 내부에 있는지 확인
    const recentValidations = validationHistory.slice(-3);
    return (
      recentValidations.length >= 3 &&
      recentValidations.every((v) => v.isOnCourse)
    );
  }, [isOnCourse, courseDeviation.isDeviating, validationHistory]);

  // 연속 이탈 시간 계산
  const getDeviationDuration = useCallback(() => {
    if (!courseDeviation.isDeviating || !lastValidationTime) {
      return 0;
    }

    const deviationStartIndex = validationHistory.findIndex(
      (v) => !v.isOnCourse,
    );
    if (deviationStartIndex === -1) {
      return 0;
    }

    const now = new Date();
    const deviationStartTime = new Date(
      lastValidationTime.getTime() -
        (validationHistory.length - deviationStartIndex) * validationInterval,
    );

    return now.getTime() - deviationStartTime.getTime();
  }, [
    courseDeviation.isDeviating,
    lastValidationTime,
    validationHistory,
    validationInterval,
  ]);

  // routeCoordinates 변경 시에만 검증 실행 (트래킹 중일 때만)
  useEffect(() => {
    if (
      !courseId ||
      !enableRealTimeValidation ||
      !courseTopology ||
      !location ||
      !isTracking ||
      routeCoordinates.length === 0
    ) {
      return;
    }

    // routeCoordinates가 변경될 때만 검증 실행
    validateCurrentLocation();
  }, [
    courseId,
    enableRealTimeValidation,
    courseTopology,
    location,
    isTracking,
    routeCoordinates,
  ]);

  // 코스 변경 시 검증 히스토리 초기화 및 즉시 검증 실행 (트래킹 중일 때만)
  useEffect(() => {
    if (courseId && courseTopology) {
      clearValidationHistory();
      // 이전 좌표 ref 초기화
      lastValidatedCoordinateRef.current = null;
      // 코스 토폴로지가 로드된 후 즉시 검증 실행 (트래킹 중이고 좌표가 있을 때만)
      if (
        location &&
        location.coords &&
        isTracking &&
        routeCoordinates.length > 0
      ) {
        validateCurrentLocation();
      }
    }
  }, [
    courseId,
    courseTopology,
    clearValidationHistory,
    location,
    isTracking,
    routeCoordinates,
  ]);

  return {
    // 상태
    isOnCourse,
    courseDeviation,
    validationHistory,
    lastValidationTime,

    // 액션
    validateCurrentLocation,
    getSafetyDistance,
    checkCourseReturn,
    getDeviationDuration,
    clearValidationHistory,

    // 유틸리티
    isDeviating: courseDeviation.isDeviating,
    deviationSeverity: courseDeviation.severity,
    distanceFromCourse: courseDeviation.distanceFromCourse,
  };
}
