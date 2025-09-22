import { create } from 'zustand';
import * as Location from 'expo-location';
import type { Position } from 'geojson';
import type { CourseTopologyResponse } from '@/types/courses.types';
import type { RunStats } from '@/utils/runStats';
import type { CourseValidationResult } from '@/types/courseValidation.types';

// UI 상태 그룹
interface UIState {
  isLocked: boolean;
  showExitModal: boolean;
  showBackModal: boolean;
  loading: boolean;
  savingRecord: boolean;
}

// 에러 상태 그룹
interface ErrorState {
  topologyError: string | null;
  saveError: string | null;
}

// 런닝 상태 그룹
interface RunningState {
  startTime: Date | null;
  pausedTime: number;
  pauseStartTime: Date | null;
  stats: RunStats;
}

// 코스 데이터 그룹
interface CourseState {
  courseTopology: CourseTopologyResponse | null;
  currentCourseId: number | null;
  currentCourseData: any | null;
}

// 위치 추적 상태 그룹
interface LocationTrackingState {
  routeCoordinates: Position[];
  location: Location.LocationObject | null;
  isTracking: boolean;
  subscriber: { remove: () => void } | null;
  errorMsg: string | null;
}

// 코스 검증 상태 그룹
interface CourseValidationState {
  isOnCourse: boolean;
  courseDeviation: {
    isDeviating: boolean;
    severity: 'low' | 'medium' | 'high';
    distanceFromCourse: number | null;
  };
  validationHistory: CourseValidationResult[];
  lastValidationTime: Date | null;
}

interface RunState
  extends UIState,
    ErrorState,
    RunningState,
    CourseState,
    LocationTrackingState,
    CourseValidationState {
  // UI 액션들
  setUI: (ui: Partial<UIState>) => void;
  setModal: (modal: 'exit' | 'back' | null) => void;
  toggleLock: () => void;

  // 에러 액션들
  setError: (type: 'topology' | 'save', error: string | null) => void;
  clearErrors: () => void;

  // 런닝 액션들
  setRunning: (running: Partial<RunningState>) => void;
  startRun: () => void;
  pauseRun: () => void;
  resumeRun: () => void;
  stopRun: () => void;

  // 코스 액션들
  setCourseTopology: (topology: CourseTopologyResponse | null) => void;
  setCurrentCourse: (courseId: number, courseData: any) => void;
  clearCurrentCourse: () => void;

  // 위치 추적 액션들
  setRouteCoordinates: (coords: Position[]) => void;
  setLocation: (location: Location.LocationObject | null) => void;
  setIsTracking: (tracking: boolean) => void;
  setSubscriber: (sub: { remove: () => void } | null) => void;
  setLocationErrorMsg: (msg: string | null) => void;
  clearRouteCoordinates: () => void;
  resetLocationTracking: () => void;

  // 코스 검증 액션들
  setCourseValidation: (validation: Partial<CourseValidationState>) => void;
  updateCourseValidation: (result: CourseValidationResult) => void;
  clearValidationHistory: () => void;

  // 전체 리셋
  resetRunState: () => void;
}

const initialStats: RunStats = {
  distance: 0,
  calories: 0,
  pace: 0,
  runningTime: '00:00:00',
};

const initialUIState: UIState = {
  isLocked: false,
  showExitModal: false,
  showBackModal: false,
  loading: false,
  savingRecord: false,
};

const initialErrorState: ErrorState = {
  topologyError: null,
  saveError: null,
};

const initialRunningState: RunningState = {
  startTime: null,
  pausedTime: 0,
  pauseStartTime: null,
  stats: initialStats,
};

const initialCourseState: CourseState = {
  courseTopology: null,
  currentCourseId: null,
  currentCourseData: null,
};

const initialLocationTrackingState: LocationTrackingState = {
  routeCoordinates: [],
  location: null,
  isTracking: false,
  subscriber: null,
  errorMsg: null,
};

const initialCourseValidationState: CourseValidationState = {
  isOnCourse: false, // 초기값을 false로 변경
  courseDeviation: {
    isDeviating: false,
    severity: 'low',
    distanceFromCourse: null,
  },
  validationHistory: [],
  lastValidationTime: null,
};

const useRunStore = create<RunState>((set, get) => ({
  // 초기 상태
  ...initialUIState,
  ...initialErrorState,
  ...initialRunningState,
  ...initialCourseState,
  ...initialLocationTrackingState,
  ...initialCourseValidationState,

  // UI 액션들
  setUI: (ui) => set((state) => ({ ...state, ...ui })),

  setModal: (modal) =>
    set({
      showExitModal: modal === 'exit',
      showBackModal: modal === 'back',
    }),

  toggleLock: () => set((state) => ({ isLocked: !state.isLocked })),

  // 에러 액션들
  setError: (type, error) =>
    set({
      [`${type}Error`]: error,
    }),

  clearErrors: () => set(initialErrorState),

  // 런닝 액션들
  setRunning: (running) => set((state) => ({ ...state, ...running })),

  startRun: () => {
    const startTime = new Date();

    set({
      startTime,
      pausedTime: 0,
      pauseStartTime: null,
    });
  },

  pauseRun: () => {
    const pauseStartTime = new Date();

    set({
      pauseStartTime,
    });
  },

  resumeRun: () =>
    set((state) => {
      if (state.pauseStartTime) {
        const pauseDuration =
          (new Date().getTime() - state.pauseStartTime.getTime()) / 1000;

        return {
          pausedTime: state.pausedTime + pauseDuration,
          pauseStartTime: null,
        };
      }
      return state;
    }),

  stopRun: () => {
    set({
      startTime: null,
      pausedTime: 0,
      pauseStartTime: null,
      stats: initialStats,
    });
  },

  // 코스 액션들
  setCourseTopology: (courseTopology) => set({ courseTopology }),

  setCurrentCourse: (courseId, courseData) =>
    set({ currentCourseId: courseId, currentCourseData: courseData }),

  clearCurrentCourse: () =>
    set({ currentCourseId: null, currentCourseData: null }),

  // 위치 추적 액션들
  setRouteCoordinates: (coords) => set({ routeCoordinates: coords }),
  setLocation: (location) => set({ location }),
  setIsTracking: (tracking) => set({ isTracking: tracking }),
  setSubscriber: (sub) => set({ subscriber: sub }),
  setLocationErrorMsg: (msg) => set({ errorMsg: msg }),
  clearRouteCoordinates: () => set({ routeCoordinates: [] }),
  resetLocationTracking: () => {
    const state = get();
    if (state.subscriber) {
      state.subscriber.remove();
      set({ subscriber: null });
    }
    set({
      routeCoordinates: [],
      isTracking: false,
      errorMsg: null,
      location: null,
    });
  },

  // 코스 검증 액션들
  setCourseValidation: (validation) =>
    set((state) => ({ ...state, ...validation })),

  updateCourseValidation: (result) =>
    set((state) => {
      const now = new Date();
      const newHistory = [...state.validationHistory, result].slice(-50); // 최근 50개만 유지

      return {
        isOnCourse: result.isOnCourse,
        courseDeviation: {
          isDeviating: !result.isOnCourse,
          severity: !result.isOnCourse
            ? result.distanceFromCourse && result.distanceFromCourse > 100
              ? 'high'
              : result.distanceFromCourse && result.distanceFromCourse > 50
                ? 'medium'
                : 'low'
            : 'low',
          distanceFromCourse: result.distanceFromCourse || null,
        },
        validationHistory: newHistory,
        lastValidationTime: now,
      };
    }),

  clearValidationHistory: () =>
    set({
      validationHistory: [],
      lastValidationTime: null,
    }),

  resetRunState: () => {
    set((state) => {
      // isTracking이 true면 일시정지 상태이므로 상태 보존
      if (state.isTracking) {
        return {
          ...initialUIState,
          ...initialErrorState,
          // 런닝 상태는 보존
          startTime: state.startTime,
          pausedTime: state.pausedTime,
          pauseStartTime: state.pauseStartTime,
          stats: state.stats,
          // 코스 데이터는 유지 (currentCourseId, currentCourseData 보존)
          courseTopology: null,
          // 위치 추적 상태는 보존 (경로 데이터 유지)
          routeCoordinates: state.routeCoordinates,
          location: state.location,
          isTracking: state.isTracking,
          subscriber: state.subscriber,
          errorMsg: state.errorMsg,
          ...initialCourseValidationState,
        };
      }

      // isTracking이 false면 완전 초기화

      return {
        ...initialUIState,
        ...initialErrorState,
        ...initialRunningState,
        ...initialCourseState,
        ...initialLocationTrackingState,
        ...initialCourseValidationState,
      };
    });
  },
}));

export default useRunStore;
