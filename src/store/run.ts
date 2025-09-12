import { create } from 'zustand';
import * as Location from 'expo-location';
import type { Position } from 'geojson';
import type { CourseTopologyResponse } from '@/types/courses.types';
import type { RunStats } from '@/utils/runStats';
import type { CourseValidationResult } from '@/types/courseValidation.types';

interface UIState {
  isLocked: boolean;
  showExitModal: boolean;
  showBackModal: boolean;
  loading: boolean;
  savingRecord: boolean;
}

interface ErrorState {
  topologyError: string | null;
  saveError: string | null;
}

interface RunningState {
  startTime: Date | null;
  pausedTime: number;
  pauseStartTime: Date | null;
  stats: RunStats;
}

interface CourseState {
  courseTopology: CourseTopologyResponse | null;
}

interface LocationTrackingState {
  routeCoordinates: Position[];
  location: Location.LocationObject | null;
  isTracking: boolean;
  subscriber: { remove: () => void } | null;
  errorMsg: string | null;
}

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
  setUI: (ui: Partial<UIState>) => void;
  setModal: (modal: 'exit' | 'back' | null) => void;
  toggleLock: () => void;
  setError: (type: 'topology' | 'save', error: string | null) => void;
  clearErrors: () => void;
  setRunning: (running: Partial<RunningState>) => void;
  startRun: () => void;
  pauseRun: () => void;
  resumeRun: () => void;
  stopRun: () => void;
  toggleRun: () => void;
  setCourseTopology: (topology: CourseTopologyResponse | null) => void;
  setRouteCoordinates: (coords: Position[]) => void;
  setLocation: (location: Location.LocationObject | null) => void;
  setIsTracking: (tracking: boolean) => void;
  setSubscriber: (sub: { remove: () => void } | null) => void;
  setLocationErrorMsg: (msg: string | null) => void;
  clearRouteCoordinates: () => void;
  resetLocationTracking: () => void;
  setCourseValidation: (validation: Partial<CourseValidationState>) => void;
  updateCourseValidation: (result: CourseValidationResult) => void;
  clearValidationHistory: () => void;
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
  ...initialUIState,
  ...initialErrorState,
  ...initialRunningState,
  ...initialCourseState,
  ...initialLocationTrackingState,
  ...initialCourseValidationState,
  setUI: (ui) => set((state) => ({ ...state, ...ui })),

  setModal: (modal) =>
    set({
      showExitModal: modal === 'exit',
      showBackModal: modal === 'back',
    }),

  toggleLock: () => set((state) => ({ isLocked: !state.isLocked })),
  setError: (type, error) =>
    set({
      [`${type}Error`]: error,
    }),

  clearErrors: () => set(initialErrorState),
  setRunning: (running) => set((state) => ({ ...state, ...running })),

  startRun: () =>
    set({
      startTime: new Date(),
      pausedTime: 0,
      pauseStartTime: null,
    }),

  pauseRun: () =>
    set({
      pauseStartTime: new Date(),
    }),

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

  stopRun: () =>
    set({
      startTime: null,
      pausedTime: 0,
      pauseStartTime: null,
      stats: initialStats,
    }),

  toggleRun: () =>
    set((state) => {
      if (!state.startTime) {
        return {
          startTime: new Date(),
          pausedTime: 0,
          pauseStartTime: null,
          isTracking: true,
        };
      } else if (state.pauseStartTime) {
        const pauseDuration =
          (new Date().getTime() - state.pauseStartTime.getTime()) / 1000;
        return {
          pausedTime: state.pausedTime + pauseDuration,
          pauseStartTime: null,
          isTracking: true,
        };
      } else {
        return {
          pauseStartTime: new Date(),
          isTracking: false,
        };
      }
    }),
  setCourseTopology: (courseTopology) => set({ courseTopology }),
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
  setCourseValidation: (validation) =>
    set((state) => ({ ...state, ...validation })),

  updateCourseValidation: (result) =>
    set((state) => {
      const now = new Date();
      const newHistory = [...state.validationHistory, result].slice(-50);

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
    set({
      ...initialUIState,
      ...initialErrorState,
      ...initialRunningState,
      ...initialCourseState,
      ...initialLocationTrackingState,
      ...initialCourseValidationState,
    });
  },
}));

export default useRunStore;
