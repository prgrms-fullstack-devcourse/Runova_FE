import api from '@/lib/api';
import type {
  RunningRecordRequest,
  RunningRecordResponse,
} from '@/types/run.types';

export async function createRunningRecord(
  data: RunningRecordRequest,
  accessToken: string,
  courseId?: number,
): Promise<RunningRecordResponse> {
  try {
    const requestData = {
      ...data,
      startAt: data.startAt.getTime(),
      endAt: data.endAt.getTime(),
    };

    const params = courseId ? { courseId } : undefined;

    const response = await api.post('/api/running/records', requestData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      params,
    });
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
}
