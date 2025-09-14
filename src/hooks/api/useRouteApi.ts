import { useCallback } from 'react';
import {
  searchUserCourses,
  searchBookmarkedCourses,
  searchCompletedCourses,
  searchAdjacentCourses,
} from '@/services/courses.service';
import useAuthStore from '@/store/auth';
import useRouteStore from '@/store/route';
import type { AxiosErrorResponse } from '@/types/api.types';
import type { Position } from 'geojson';

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
      // loading 상태를 함수 내부에서 직접 확인
      const currentLoading = useRouteStore.getState().loading;
      if (!accessToken || currentLoading) return;

      setLoading(true);
      setError(null);

      try {
        // cursor를 함수 내부에서 직접 가져오기
        const currentCursor = reset ? null : useRouteStore.getState().cursor;
        const requestParams = {
          cursor: currentCursor ? { id: currentCursor } : null,
          limit: 10,
        };

        console.log('🔍 [RouteAPI] 생성한 경로 요청:', {
          endpoint: '/api/courses/user',
          params: requestParams,
          accessToken: accessToken ? '있음' : '없음',
        });

        const response = await searchUserCourses(requestParams, accessToken);

        console.log('✅ [RouteAPI] 생성한 경로 응답:', {
          resultsCount: response.results.length,
          results: response.results.map((course) => ({
            id: course.id,
            title: course.title,
            createdAt: course.createdAt,
          })),
        });

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
        setHasMore(response.results.length >= 10);
      } catch (error: unknown) {
        console.error('❌ [RouteAPI] 생성한 경로 요청 실패:', error);

        let errorMessage = '경로를 불러오는데 실패했습니다.';

        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as AxiosErrorResponse;
          const status = axiosError.status;

          console.error('❌ [RouteAPI] HTTP 오류:', {
            status,
            statusText: axiosError.statusText,
            data: axiosError.data,
          });

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
      // loading을 의존성에서 제거하여 무한 루프 방지
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

export function useBookmarkedCourses() {
  const { accessToken } = useAuthStore();
  const {
    cursor,
    loading,
    hasMore,
    error,
    setBookmarkedCourses,
    setLoading,
    setRefreshing,
    setError,
    setCursor,
    setHasMore,
    appendBookmarkedCourses,
  } = useRouteStore();

  const loadBookmarkedCourses = useCallback(
    async (reset = false) => {
      // loading 상태를 함수 내부에서 직접 확인
      const currentLoading = useRouteStore.getState().loading;
      if (!accessToken || currentLoading) return;

      setLoading(true);
      setError(null);

      try {
        const currentCursor = reset ? null : cursor;
        const params = {
          cursor: currentCursor ? { id: currentCursor } : null,
          limit: 10,
        };

        console.log('🔍 [RouteAPI] 북마크한 경로 요청:', {
          endpoint: '/api/courses/search/bookmarked',
          params,
          accessToken: accessToken ? '있음' : '없음',
        });

        const response = await searchBookmarkedCourses(params, accessToken);

        console.log('✅ [RouteAPI] 북마크한 경로 응답:', {
          resultsCount: response.results.length,
          results: response.results.map((course) => ({
            id: course.id,
            title: course.title,
            createdAt: course.createdAt,
          })),
        });

        if (reset) {
          setBookmarkedCourses(response.results);
        } else {
          appendBookmarkedCourses(response.results);
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
        console.error('❌ [RouteAPI] 북마크한 경로 요청 실패:', error);

        let errorMessage = '북마크한 경로를 불러오는데 실패했습니다.';

        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as AxiosErrorResponse;
          const status = axiosError.status;

          console.error('❌ [RouteAPI] HTTP 오류:', {
            status,
            statusText: axiosError.statusText,
            data: axiosError.data,
          });

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
      // loading을 의존성에서 제거하여 무한 루프 방지
      setBookmarkedCourses,
      setLoading,
      setError,
      setCursor,
      setHasMore,
      appendBookmarkedCourses,
    ],
  );

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading && !error) {
      loadBookmarkedCourses(false);
    }
  }, [hasMore, loading, error, loadBookmarkedCourses]);

  const handleRetry = useCallback(() => {
    setError(null);
    loadBookmarkedCourses(true);
  }, [setError, loadBookmarkedCourses]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    setCursor(null);
    await loadBookmarkedCourses(true);
    setRefreshing(false);
  }, [setRefreshing, setError, setCursor, loadBookmarkedCourses]);

  return {
    loadBookmarkedCourses,
    handleLoadMore,
    handleRetry,
    handleRefresh,
  };
}

export function useCompletedCourses() {
  const { accessToken } = useAuthStore();
  const {
    cursor,
    loading,
    hasMore,
    error,
    setCompletedCourses,
    setLoading,
    setRefreshing,
    setError,
    setCursor,
    setHasMore,
    appendCompletedCourses,
  } = useRouteStore();

  const loadCompletedCourses = useCallback(
    async (reset = false) => {
      // loading 상태를 함수 내부에서 직접 확인
      const currentLoading = useRouteStore.getState().loading;
      if (!accessToken || currentLoading) return;

      setLoading(true);
      setError(null);

      try {
        const currentCursor = reset ? null : cursor;
        const params = {
          cursor: currentCursor ? { id: currentCursor } : null,
          limit: 10,
        };

        console.log('🔍 [RouteAPI] 완주한 경로 요청:', {
          endpoint: '/api/courses/search/completed',
          params,
          accessToken: accessToken ? '있음' : '없음',
        });

        const response = await searchCompletedCourses(params, accessToken);

        console.log('✅ [RouteAPI] 완주한 경로 응답:', {
          resultsCount: response.results.length,
          results: response.results.map((course) => ({
            id: course.id,
            title: course.title,
            createdAt: course.createdAt,
          })),
        });

        if (reset) {
          setCompletedCourses(response.results);
        } else {
          appendCompletedCourses(response.results);
        }

        let nextCursor = null;
        if (response.nextCursor) {
          // 새로운 API는 nextCursor를 문자열로 반환하므로,
          // 마지막 아이템의 ID를 숫자로 변환하여 저장
          if (response.results.length > 0) {
            const minId = Math.min(
              ...response.results.map((course) => course.id),
            );
            nextCursor = minId;
          }
        }

        setCursor(nextCursor);
        setHasMore(!!response.nextCursor);
      } catch (error: unknown) {
        console.error('❌ [RouteAPI] 완주한 경로 요청 실패:', error);

        let errorMessage = '완주한 경로를 불러오는데 실패했습니다.';

        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as AxiosErrorResponse;
          const status = axiosError.status;

          console.error('❌ [RouteAPI] HTTP 오류:', {
            status,
            statusText: axiosError.statusText,
            data: axiosError.data,
          });

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
      // loading을 의존성에서 제거하여 무한 루프 방지
      setCompletedCourses,
      setLoading,
      setError,
      setCursor,
      setHasMore,
      appendCompletedCourses,
    ],
  );

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading && !error) {
      loadCompletedCourses(false);
    }
  }, [hasMore, loading, error, loadCompletedCourses]);

  const handleRetry = useCallback(() => {
    setError(null);
    loadCompletedCourses(true);
  }, [setError, loadCompletedCourses]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    setCursor(null);
    await loadCompletedCourses(true);
    setRefreshing(false);
  }, [setRefreshing, setError, setCursor, loadCompletedCourses]);

  return {
    loadCompletedCourses,
    handleLoadMore,
    handleRetry,
    handleRefresh,
  };
}

export function useAdjacentCourses() {
  const { accessToken } = useAuthStore();

  const searchAdjacent = useCallback(
    async (location: Position, radius: number = 1000) => {
      if (!accessToken) return [];

      try {
        const locationString = `${location[0]},${location[1]}`;
        const response = await searchAdjacentCourses(
          {
            location: locationString,
            radius,
            limit: 3,
          },
          accessToken,
        );
        return response.results;
      } catch (error) {
        console.error('주변 경로 검색 실패:', error);
        return [];
      }
    },
    [accessToken],
  );

  return { searchAdjacent };
}
