import { create } from 'zustand';
import type { CourseSearchItem } from '@/types/courses.types';
import type { RouteTabId } from '@/types/navigation.types';

interface RouteState {
  activeTab: RouteTabId;
  courses: CourseSearchItem[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  error: string | null;
  cursor: number | null;
  setActiveTab: (tab: RouteTabId) => void;
  setCourses: (courses: CourseSearchItem[]) => void;
  appendCourses: (courses: CourseSearchItem[]) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  setError: (error: string | null) => void;
  setCursor: (cursor: number | null) => void;
  handleRouteCardPress: (course: CourseSearchItem) => void;
}

const useRouteStore = create<RouteState>((set) => ({
  activeTab: 'created',
  courses: [],
  loading: false,
  refreshing: false,
  hasMore: true,
  error: null,
  cursor: null,

  setActiveTab: (tab: RouteTabId) => {
    set({
      activeTab: tab,
      courses: [],
      cursor: null,
      error: null,
      hasMore: true,
    });
  },

  setCourses: (courses: CourseSearchItem[]) => {
    set({ courses });
  },

  appendCourses: (courses: CourseSearchItem[]) => {
    set((state) => ({
      courses: [...state.courses, ...courses],
    }));
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setRefreshing: (refreshing: boolean) => {
    set({ refreshing });
  },

  setHasMore: (hasMore: boolean) => {
    set({ hasMore });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setCursor: (cursor: number | null) => {
    set({ cursor });
  },

  handleRouteCardPress: (course: CourseSearchItem) => {},
}));

export default useRouteStore;
