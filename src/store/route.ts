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
    set((state) => {
      // 중복 제거를 위해 ID 기준으로 유니크한 아이템만 유지
      const uniqueCourses = courses.filter(
        (course, index, self) =>
          index === self.findIndex((c) => c.id === course.id),
      );
      return { courses: uniqueCourses };
    });
  },

  appendCourses: (courses: CourseSearchItem[]) => {
    set((state) => {
      const existingIds = new Set(state.courses.map((course) => course.id));
      const newCourses = courses.filter(
        (course) => !existingIds.has(course.id),
      );
      return {
        courses: [...state.courses, ...newCourses],
      };
    });
  },

  setBookmarkedCourses: (courses: BookmarkedCourseItem[]) => {
    set((state) => {
      // 중복 제거를 위해 ID 기준으로 유니크한 아이템만 유지
      const uniqueCourses = courses.filter(
        (course, index, self) =>
          index === self.findIndex((c) => c.id === course.id),
      );
      return { bookmarkedCourses: uniqueCourses };
    });
  },

  appendBookmarkedCourses: (courses: BookmarkedCourseItem[]) => {
    set((state) => {
      const existingIds = new Set(
        state.bookmarkedCourses.map((course) => course.id),
      );
      const newCourses = courses.filter(
        (course) => !existingIds.has(course.id),
      );
      return {
        bookmarkedCourses: [...state.bookmarkedCourses, ...newCourses],
      };
    });
  },

  setCompletedCourses: (courses: CompletedCourseItem[]) => {
    set((state) => {
      // 중복 제거를 위해 ID 기준으로 유니크한 아이템만 유지
      const uniqueCourses = courses.filter(
        (course, index, self) =>
          index === self.findIndex((c) => c.id === course.id),
      );
      return { completedCourses: uniqueCourses };
    });
  },

  appendCompletedCourses: (courses: CompletedCourseItem[]) => {
    set((state) => {
      const existingIds = new Set(
        state.completedCourses.map((course) => course.id),
      );
      const newCourses = courses.filter(
        (course) => !existingIds.has(course.id),
      );
      return {
        completedCourses: [...state.completedCourses, ...newCourses],
      };
    });
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
