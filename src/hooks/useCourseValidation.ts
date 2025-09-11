import { useCallback, useEffect } from 'react';
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
}

export function useCourseValidation(options: UseCourseValidationOptions = {}) {
  const {
    validationOptions = { tolerance: 50, enableDistanceCalculation: true },
    enableRealTimeValidation = true,
    validationInterval = 5000, // 5초마다 검증
  } = options;

  const {
    courseTopology,
    location,
    isOnCourse,
    courseDeviation,
    validationHistory,
    lastValidationTime,
    updateCourseValidation,
    clearValidationHistory,
  } = useRunStore();

  // 실시간 위치 검증
  const validateCurrentLocation = useCallback(() => {
    if (!location || !courseTopology) {
      return null;
    }

    const currentPosition: Position = [
      location.coords.longitude,
      location.coords.latitude,
    ];

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
    location,
    courseTopology,
    validationHistory,
    validationOptions,
    updateCourseValidation,
  ]);

  // 안전 거리 계산
  const getSafetyDistance = useCallback(() => {
    if (!location || !courseTopology) {
      return null;
    }

    const currentPosition: Position = [
      location.coords.longitude,
      location.coords.latitude,
    ];
    return calculateSafetyDistance(currentPosition, courseTopology);
  }, [location, courseTopology]);

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

  // 실시간 검증 활성화/비활성화
  useEffect(() => {
    if (!enableRealTimeValidation || !courseTopology || !location) {
      return;
    }

    const interval = setInterval(() => {
      validateCurrentLocation();
    }, validationInterval);

    return () => clearInterval(interval);
  }, [
    enableRealTimeValidation,
    courseTopology,
    location,
    validateCurrentLocation,
    validationInterval,
  ]);

  // 코스 변경 시 검증 히스토리 초기화
  useEffect(() => {
    if (courseTopology) {
      clearValidationHistory();
    }
  }, [courseTopology, clearValidationHistory]);

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
