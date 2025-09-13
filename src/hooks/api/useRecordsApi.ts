import { useCallback, useState, useEffect } from 'react';
import {
  searchRunningRecords,
  getRunningDashboard,
} from '@/services/running.service';
import useAuthStore from '@/store/auth';
import type { AxiosErrorResponse } from '@/types/api.types';
import type {
  RunningRecord,
  RunningRecordsRequest,
  RunningDashboard,
  RunningDashboardRequest,
  TimeRange,
} from '@/types/records.types';

export function useRunningRecords() {
  const { accessToken } = useAuthStore();
  const [records, setRecords] = useState<RunningRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<{ id: number } | null>(null);

  const loadRecords = useCallback(
    async (params: RunningRecordsRequest, reset = false) => {
      if (!accessToken) return;

      console.log('📊 [useRunningRecords] loadRecords 호출:', {
        params,
        reset,
        loading,
      });

      if (loading) {
        console.log('📊 [useRunningRecords] 이미 로딩 중이므로 스킵');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const requestParams = {
          ...params,
          limit: 20,
        };

        // reset이 아닌 경우에만 cursor 추가
        if (!reset && params.cursor) {
          requestParams.cursor = params.cursor;
        }

        console.log('📊 [useRunningRecords] API 요청 파라미터:', requestParams);
        const response = await searchRunningRecords(requestParams, accessToken);

        console.log('📊 [useRunningRecords] API 응답:', response);

        if (reset) {
          setRecords(response.results);
        } else {
          setRecords((prev) => [...prev, ...response.results]);
        }

        // nextCursor가 현재 데이터의 마지막 ID와 같으면 더 이상 데이터가 없음
        const lastResultId = response.results[response.results.length - 1]?.id;
        const hasMoreData =
          response.nextCursor && response.nextCursor.id !== lastResultId;

        console.log('📊 [useRunningRecords] 데이터 종료 조건 확인:', {
          lastResultId,
          nextCursor: response.nextCursor,
          hasMoreData,
          resultsLength: response.results.length,
        });

        if (hasMoreData) {
          setCursor(response.nextCursor);
          setHasMore(true);
        } else {
          setCursor(null);
          setHasMore(false);
        }
      } catch (error: unknown) {
        console.error('📊 [useRunningRecords] API 오류:', error);
        let errorMessage = '런닝 기록을 불러오는데 실패했습니다.';

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
    [accessToken, cursor],
  );

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading && !error && cursor) {
      console.log('📊 [useRunningRecords] handleLoadMore 호출:', {
        hasMore,
        loading,
        error,
        cursor,
      });
      loadRecords({ cursor }, false);
    }
  }, [hasMore, loading, error, cursor, loadRecords]);

  const handleRefresh = useCallback(async () => {
    setError(null);
    setCursor(null);
    await loadRecords({}, true);
  }, [loadRecords]);

  return {
    records,
    loading,
    error,
    hasMore,
    loadRecords,
    handleLoadMore,
    handleRefresh,
  };
}

export function useRunningDashboard() {
  const { accessToken } = useAuthStore();
  const [dashboard, setDashboard] = useState<RunningDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(
    async (params: RunningDashboardRequest) => {
      if (!accessToken) return;

      console.log('📊 [useRunningDashboard] loadDashboard 호출:', {
        params,
        loading,
      });

      if (loading) {
        console.log('📊 [useRunningDashboard] 이미 로딩 중이므로 스킵');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getRunningDashboard(params, accessToken);
        console.log('📊 [useRunningDashboard] API 응답:', response);
        setDashboard(response);
      } catch (error: unknown) {
        console.error('📊 [useRunningDashboard] API 오류:', error);
        let errorMessage = '런닝 통계를 불러오는데 실패했습니다.';

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
    [accessToken],
  );

  return {
    dashboard,
    loading,
    error,
    loadDashboard,
  };
}

// 기간 범위 계산 유틸리티
export function getTimeRangeParams(
  timeRange: TimeRange,
  selectedWeek?: number,
  selectedMonth?: number,
  selectedYear?: number,
): RunningDashboardRequest {
  const now = new Date();

  switch (timeRange) {
    case 'week': {
      const weekNumber = selectedWeek || 1;
      const year = selectedYear || now.getFullYear();
      const month = selectedMonth || now.getMonth() + 1;

      // 해당 월의 첫 번째 날
      const firstDayOfMonth = new Date(year, month - 1, 1);
      const firstDayOfWeek = firstDayOfMonth.getDay();

      // 해당 주의 시작일 계산
      const startOfWeek = new Date(firstDayOfMonth);
      startOfWeek.setDate(
        firstDayOfMonth.getDate() - firstDayOfWeek + (weekNumber - 1) * 7,
      );
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      return {
        since: startOfWeek.toISOString(),
        until: endOfWeek.toISOString(),
      };
    }
    case 'month': {
      const month = selectedMonth || now.getMonth() + 1;
      const year = selectedYear || now.getFullYear();

      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

      return {
        since: startOfMonth.toISOString(),
        until: endOfMonth.toISOString(),
      };
    }
    case 'year': {
      const year = selectedYear || now.getFullYear();
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

      return {
        since: startOfYear.toISOString(),
        until: endOfYear.toISOString(),
      };
    }
    case 'all':
    default:
      return {};
  }
}

export function getTimeRangeDisplayText(
  timeRange: TimeRange,
  selectedWeek?: number,
  selectedMonth?: number,
  selectedYear?: number,
): string {
  const now = new Date();

  switch (timeRange) {
    case 'week': {
      const weekNumber = selectedWeek || 1;
      const year = selectedYear || now.getFullYear();
      const month = selectedMonth || now.getMonth() + 1;
      return `${year}년 ${month}월 ${weekNumber}째 주`;
    }
    case 'month': {
      const month = selectedMonth || now.getMonth() + 1;
      const year = selectedYear || now.getFullYear();
      return `${year}년 ${month}월`;
    }
    case 'year': {
      const year = selectedYear || now.getFullYear();
      return `${year}년`;
    }
    case 'all':
    default:
      return '전체';
  }
}
