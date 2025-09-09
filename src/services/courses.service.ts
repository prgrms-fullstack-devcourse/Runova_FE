import api from '../lib/api';
import type {
  CourseCreateRequest,
  RouteCoordinate,
} from '@/types/courses.types';

// courses api 요청 형식 변경
// RouteCoordinate[]를 number[][]로 변환하는 헬퍼 함수
function convertPathToApiFormat(path: RouteCoordinate[]): number[][] {
  return path.map((coord) => [coord.lon, coord.lat]);
}

export async function createCourse(
  data: Omit<CourseCreateRequest, 'path'> & { path: RouteCoordinate[] },
  accessToken: string,
): Promise<void> {
  const apiData: CourseCreateRequest = {
    ...data,
    path: convertPathToApiFormat(data.path),
  };

  await api.post('/api/courses', apiData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
