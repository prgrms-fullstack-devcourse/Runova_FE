import { useCallback } from 'react';
import { getCourseTopology } from '@/services/courses.service';
import { createRunningRecord } from '@/services/running.service';
import useAuthStore from '@/store/auth';
import type { CourseTopologyResponse } from '@/types/courses.types';
import type {
  RunningRecordRequest,
  RunningRecordResponse,
} from '@/types/run.types';

export function useRunApi() {
  const { accessToken } = useAuthStore();

  const fetchCourseTopology = useCallback(
    async (courseId: number): Promise<CourseTopologyResponse> => {
      if (!accessToken) {
        throw new Error('로그인이 필요합니다.');
      }
      return await getCourseTopology(courseId, accessToken);
    },
    [accessToken],
  );

  const saveRunningRecord = useCallback(
    async (data: RunningRecordRequest): Promise<RunningRecordResponse> => {
      if (!accessToken) {
        throw new Error('로그인이 필요합니다.');
      }
      return await createRunningRecord(data, accessToken);
    },
    [accessToken],
  );

  return {
    fetchCourseTopology,
    saveRunningRecord,
  };
}
