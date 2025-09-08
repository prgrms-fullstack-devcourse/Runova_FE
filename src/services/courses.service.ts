import api from '../lib/api';
import type { CourseCreateRequest } from '@/types/courses.types';

export async function createCourse(
  data: CourseCreateRequest,
  accessToken: string,
): Promise<void> {
  await api.post('/api/courses', data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
