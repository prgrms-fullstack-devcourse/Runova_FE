import { create } from 'zustand';
import * as Location from 'expo-location';
import type { Position } from 'geojson';
import type { CourseTopologyResponse } from '@/types/courses.types';
import type { RunStats } from '@/utils/runStats';

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
}

// 위치 추적 상태 그룹
interface LocationTrackingState {
  routeCoordinates: Position[];
  location: Location.LocationObject | null;
  isTracking: boolean;
  subscriber: { remove: () => void } | null;
  errorMsg: string | null;
}

interface RunState
  extends UIState,
    ErrorState,
    RunningState,
    CourseState,
    LocationTrackingState {
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

  // 위치 추적 액션들
  setRouteCoordinates: (coords: Position[]) => void;
  setLocation: (location: Location.LocationObject | null) => void;
  setIsTracking: (tracking: boolean) => void;
  setSubscriber: (sub: { remove: () => void } | null) => void;
  setLocationErrorMsg: (msg: string | null) => void;
  clearRouteCoordinates: () => void;
  resetLocationTracking: () => void;

  // 전체 리셋
  resetRunState: () => void;
}

const initialStats: RunStats = {
  distance: 0,
  calories: 0,
  pace: '0\'00"',
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

const useRunStore = create<RunState>((set, get) => ({
  // 초기 상태
  ...initialUIState,
  ...initialErrorState,
  ...initialRunningState,
  ...initialCourseState,
  ...initialLocationTrackingState,

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

  // 코스 액션들
  setCourseTopology: (courseTopology) => set({ courseTopology }),

  // 위치 추적 액션들
  setRouteCoordinates: (coords) => set({ routeCoordinates: coords }),
  setLocation: (location) => set({ location }),
  setIsTracking: (tracking) => set({ isTracking: tracking }),
  setSubscriber: (sub) => set({ subscriber: sub }),
  setLocationErrorMsg: (msg) => set({ errorMsg: msg }),
  clearRouteCoordinates: () => set({ routeCoordinates: [] }),
  resetLocationTracking: () => {
    console.log('🔄 [DEBUG] resetLocationTracking 호출됨');
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
    console.log(
      '✅ [DEBUG] resetLocationTracking 완료 - isTracking: false로 설정됨',
    );
  },

  resetRunState: () => {
    console.log('🔄 [DEBUG] resetRunState 호출됨');
    set({
      ...initialUIState,
      ...initialErrorState,
      ...initialRunningState,
      ...initialCourseState,
      ...initialLocationTrackingState,
    });
    console.log('✅ [DEBUG] resetRunState 완료');
  },
}));

export default useRunStore;
