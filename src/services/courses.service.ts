import { convertPathToApiFormat } from '@/utils/courseFormatter';
import api from '../lib/api';
import type {
  CourseClientData,
  CourseCreateRequest,
  CourseSearchRequest,
  CourseSearchResponse,
} from '@/types/courses.types';

export async function createCourse(
  data: CourseClientData,
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

export async function searchUserCourses(
  params: CourseSearchRequest,
  accessToken: string,
): Promise<CourseSearchResponse> {
  const response = await api.get('/api/courses/search/users', {
    params,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}
