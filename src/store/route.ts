import { create } from 'zustand';
import type { CourseSearchItem } from '@/types/courses.types';
import type { RouteTabId } from '@/types/navigation.types';
import { searchUserCourses } from '@/services/courses.service';
import useAuthStore from './auth';

interface RouteState {
  activeTab: RouteTabId;
  courses: CourseSearchItem[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  error: string | null;
  cursor: number | null;
  setActiveTab: (tab: RouteTabId) => void;
  initializeRoute: () => void;
  loadCourses: (reset?: boolean) => Promise<void>;
  handleLoadMore: () => void;
  handleRetry: () => void;
  handleRefresh: () => Promise<void>;
  handleRouteCardPress: (course: CourseSearchItem) => void;
}

const useRouteStore = create<RouteState>((set, get) => ({
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
    if (tab === 'created') {
      get().loadCourses(true);
    }
  },

  initializeRoute: () => {
    const { activeTab } = get();
    if (activeTab === 'created' && get().courses.length === 0) {
      get().loadCourses(true);
    }
  },

  loadCourses: async (reset = false) => {
    const { cursor, loading } = get();
    const { accessToken } = useAuthStore.getState();

    if (!accessToken || loading) return;

    set({ loading: true, error: null });

    try {
      const currentCursor = reset ? null : cursor;
      const response = await searchUserCourses(
        { cursor: currentCursor, limit: 10 },
        accessToken,
      );

      if (reset) {
        set({ courses: response.results });
      } else {
        set((state) => ({
          courses: [...state.courses, ...response.results],
        }));
      }
      let nextCursor = null;
      if (response.results.length > 0) {
        const minId = Math.min(...response.results.map((course) => course.id));
        nextCursor = minId;
      }

      set({
        cursor: nextCursor,
        hasMore: response.results.length === 10,
      });
    } catch (error: any) {
      let errorMessage = '경로를 불러오는데 실패했습니다.';
      if (error?.response?.status === 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      } else if (error?.response?.status === 401) {
        errorMessage = '로그인이 필요합니다.';
      } else if (error?.response?.status === 403) {
        errorMessage = '접근 권한이 없습니다.';
      }

      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  },

  handleLoadMore: () => {
    const { hasMore, loading, error } = get();
    if (hasMore && !loading && !error) {
      get().loadCourses(false);
    }
  },

  handleRetry: () => {
    set({ error: null });
    get().loadCourses(true);
  },

  handleRefresh: async () => {
    set({ refreshing: true, error: null, cursor: null });
    await get().loadCourses(true);
    set({ refreshing: false });
  },

  handleRouteCardPress: (course: CourseSearchItem) => {},
}));

export default useRouteStore;
