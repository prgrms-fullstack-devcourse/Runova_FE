import { create } from 'zustand';
import type {
  BookmarkedCourseItem,
  CompletedCourseItem,
  CourseSearchItem,
} from '@/types/courses.types';
import type { RouteTabId } from '@/types/navigation.types';

interface RouteState {
  activeTab: RouteTabId;
  courses: CourseSearchItem[];
  bookmarkedCourses: BookmarkedCourseItem[];
  completedCourses: CompletedCourseItem[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  error: string | null;
  cursor: number | null;
  setActiveTab: (tab: RouteTabId) => void;
  setCourses: (courses: CourseSearchItem[]) => void;
  appendCourses: (courses: CourseSearchItem[]) => void;
  setBookmarkedCourses: (courses: BookmarkedCourseItem[]) => void;
  appendBookmarkedCourses: (courses: BookmarkedCourseItem[]) => void;
  setCompletedCourses: (courses: CompletedCourseItem[]) => void;
  appendCompletedCourses: (courses: CompletedCourseItem[]) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  setError: (error: string | null) => void;
  setCursor: (cursor: number | null) => void;
}

const useRouteStore = create<RouteState>((set) => ({
  activeTab: 'created',
  courses: [],
  bookmarkedCourses: [],
  completedCourses: [],
  loading: false,
  refreshing: false,
  hasMore: true,
  error: null,
  cursor: null,

  setActiveTab: (tab: RouteTabId) => {
    set({
      activeTab: tab,
      courses: [],
      bookmarkedCourses: [],
      completedCourses: [],
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

  setBookmarkedCourses: (courses: BookmarkedCourseItem[]) => {
    set({ bookmarkedCourses: courses });
  },

  appendBookmarkedCourses: (courses: BookmarkedCourseItem[]) => {
    set((state) => ({
      bookmarkedCourses: [...state.bookmarkedCourses, ...courses],
    }));
  },

  setCompletedCourses: (courses: CompletedCourseItem[]) => {
    set({ completedCourses: courses });
  },

  appendCompletedCourses: (courses: CompletedCourseItem[]) => {
    set((state) => ({
      completedCourses: [...state.completedCourses, ...courses],
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
}));

export default useRouteStore;
