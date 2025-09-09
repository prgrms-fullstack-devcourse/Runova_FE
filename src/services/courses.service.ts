import { convertPathToApiFormat } from '@/utils/courseFormatter';
import api from '../lib/api';
import type {
  CourseClientData,
  CourseCreateRequest,
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
