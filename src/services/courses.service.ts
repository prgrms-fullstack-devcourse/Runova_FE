import { convertPathToApiFormat } from '@/utils/courseFormatter';
import api from '../lib/api';
import type {
  BookmarkedCourseResponse,
  CompletedCourseResponse,
  CourseClientData,
  CourseCreateRequest,
  CourseSearchRequest,
  CourseSearchResponse,
  CourseTopologyResponse,
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

export async function getCourseTopology(
  courseId: number,
  accessToken: string,
): Promise<CourseTopologyResponse> {
  const response = await api.get(`/api/courses/${courseId}/topology`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}

export async function searchBookmarkedCourses(
  params: CourseSearchRequest,
  accessToken: string,
): Promise<BookmarkedCourseResponse> {
  const response = await api.get('/api/courses/search/bookmarked', {
    params,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}

export async function searchCompletedCourses(
  params: {
    since?: string;
    until?: string;
    cursor?: { id: number } | null;
    limit?: number;
  },
  accessToken: string,
): Promise<CompletedCourseResponse> {
  const response = await api.get('/api/running/records', {
    params,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}
