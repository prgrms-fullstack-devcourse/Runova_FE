import api from '@/lib/api';
import type {
  RunningRecordRequest,
  RunningRecordResponse,
} from '@/types/run.types';

export async function createRunningRecord(
  data: RunningRecordRequest,
  accessToken: string,
): Promise<RunningRecordResponse> {
  try {
    const requestData = {
      ...data,
      startAt: data.startAt.getTime(),
      endAt: data.endAt.getTime(),
    };

    const response = await api.post('/api/running/records', requestData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
}
