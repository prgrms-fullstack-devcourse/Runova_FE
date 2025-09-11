import api from '@/lib/api';

export type CourseItem = {
  id: string;
  imageUrl?: string;
  title?: string;
  date?: string;
};

export async function searchUserCourses(cursor?: string) {
  const { data } = await api.get<{
    results: CourseItem[];
    nextCursor: string | null;
  }>('/api/courses/search/users', { params: cursor ? { cursor } : undefined });
  return data;
}
