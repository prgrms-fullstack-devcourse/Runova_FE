import { useCallback } from 'react';
import { searchUserCourses } from '@/services/courses.service';
import useAuthStore from '@/store/auth';
import useRouteStore from '@/store/route';
import type { AxiosErrorResponse } from '@/types/api.types';

export function useRouteData() {
  const { accessToken } = useAuthStore();
  const {
    cursor,
    loading,
    hasMore,
    error,
    setCourses,
    setLoading,
    setRefreshing,
    setError,
    setCursor,
    setHasMore,
    appendCourses,
  } = useRouteStore();

  const loadCourses = useCallback(
    async (reset = false) => {
      if (!accessToken || loading) return;

      setLoading(true);
      setError(null);

      try {
        const currentCursor = reset ? null : cursor;
        const response = await searchUserCourses(
          { cursor: currentCursor, limit: 10 },
          accessToken,
        );

        if (reset) {
          setCourses(response.results);
        } else {
          appendCourses(response.results);
        }

        let nextCursor = null;
        if (response.results.length > 0) {
          const minId = Math.min(
            ...response.results.map((course) => course.id),
          );
          nextCursor = minId;
        }

        setCursor(nextCursor);
        setHasMore(response.results.length === 10);
      } catch (error: unknown) {
        let errorMessage = '경로를 불러오는데 실패했습니다.';

        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as AxiosErrorResponse;
          const status = axiosError.status;

          if (status === 500) {
            errorMessage =
              '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
          } else if (status === 401) {
            errorMessage = '로그인이 필요합니다.';
          } else if (status === 403) {
            errorMessage = '접근 권한이 없습니다.';
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [
      accessToken,
      cursor,
      loading,
      setCourses,
      setLoading,
      setError,
      setCursor,
      setHasMore,
      appendCourses,
    ],
  );

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading && !error) {
      loadCourses(false);
    }
  }, [hasMore, loading, error, loadCourses]);

  const handleRetry = useCallback(() => {
    setError(null);
    loadCourses(true);
  }, [setError, loadCourses]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    setCursor(null);
    await loadCourses(true);
    setRefreshing(false);
  }, [setRefreshing, setError, setCursor, loadCourses]);

  return {
    loadCourses,
    handleLoadMore,
    handleRetry,
    handleRefresh,
  };
}
