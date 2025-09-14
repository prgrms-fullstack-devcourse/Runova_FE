import api from '@/lib/api';
import type {
  RunningRecordRequest,
  RunningRecordResponse,
} from '@/types/run.types';
import type {
  RunningRecordsRequest,
  RunningRecordsResponse,
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

    console.log('📤 [RunningService] 런닝 기록 저장 API 요청');
    console.log('📤 [RunningService] 엔드포인트:', endpoint);
    console.log('📤 [RunningService] 쿼리 파라미터:', params);
    console.log('📤 [RunningService] 요청 페이로드:', {
      path: `${requestData.path.length}개 좌표`,
      startAt: new Date(requestData.startAt).toISOString(),
      endAt: new Date(requestData.endAt).toISOString(),
      pace: requestData.pace,
      calories: requestData.calories,
      imageUrl: requestData.imageUrl ? '있음' : '없음',
    });

    const response = await api.post(endpoint, requestData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      params,
    });

    console.log('📥 [RunningService] 런닝 기록 저장 API 응답');
    console.log('📥 [RunningService] 응답 상태:', response.status);
    console.log('📥 [RunningService] 응답 데이터:', response.data);

    return response.data;
  } catch (error: unknown) {
    console.error('❌ [RunningService] 런닝 기록 저장 API 오류:', error);
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
