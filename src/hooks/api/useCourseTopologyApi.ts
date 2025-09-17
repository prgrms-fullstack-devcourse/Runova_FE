import { useEffect, useCallback } from 'react';
import { useRunApi } from '@/hooks/api/useRunApi';
import useRunStore from '@/store/run';
import type { AxiosErrorResponse } from '@/types/api.types';

export function useCourseTopologyApi(courseId?: number) {
  const { fetchCourseTopology } = useRunApi();
  const { setUI, setError, setCourseTopology } = useRunStore();

  const loadCourseTopology = useCallback(async () => {
    if (!courseId) {
      return;
    }

    try {
      setUI({ loading: true });
      setError('topology', null);
      const topology = await fetchCourseTopology(courseId);
      setCourseTopology(topology);
    } catch (error: unknown) {
      let errorMessage = '경로 정보를 불러오는데 실패했습니다.';

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosErrorResponse;
        const status = axiosError.status;

        if (status === 404) {
          errorMessage = '경로를 찾을 수 없습니다.';
        } else if (status === 500) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else if (status === 401) {
          errorMessage = '로그인이 필요합니다.';
        } else if (status === 403) {
          errorMessage = '접근 권한이 없습니다.';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError('topology', errorMessage);
    } finally {
      setUI({ loading: false });
    }
  }, [courseId, fetchCourseTopology, setUI, setError, setCourseTopology]);

  useEffect(() => {
    if (courseId) {
      loadCourseTopology();
    }
  }, [courseId, loadCourseTopology]);

  return {
    loadCourseTopology,
  };
}
