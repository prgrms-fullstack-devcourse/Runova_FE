import api from '@/lib/api';
import type {
  RunningRecordRequest,
  RunningRecordResponse,
} from '@/types/run.types';
import type {
  RunningRecordsRequest,
  RunningRecordsResponse,
  RunningRecordDetail,
  RunningDashboard,
  RunningDashboardRequest,
} from '@/types/records.types';

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
    const endpoint = '/api/running/records';

    const response = await api.post(endpoint, requestData, {
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

export async function searchRunningRecords(
  params: RunningRecordsRequest,
  accessToken: string,
): Promise<RunningRecordsResponse> {
  const response = await api.get('/api/running/records', {
    params,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}

export async function getRunningRecordDetail(
  recordId: number,
  accessToken: string,
): Promise<RunningRecordDetail> {
  const response = await api.get(`/api/running/records/${recordId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}

export async function getRunningDashboard(
  params: RunningDashboardRequest,
  accessToken: string,
): Promise<RunningDashboard> {
  const response = await api.get('/api/running/dashboards', {
    params,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}
