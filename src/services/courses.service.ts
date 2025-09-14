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
  console.log('🌐 [CoursesService] searchUserCourses 요청:', {
    url: '/api/courses/search/users',
    params,
    headers: {
      Authorization: `Bearer ${accessToken.substring(0, 20)}...`,
    },
  });

  const response = await api.get('/api/courses/search/users', {
    params,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  console.log('🌐 [CoursesService] searchUserCourses 응답:', {
    status: response.status,
    data: response.data,
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
  console.log('🌐 [CoursesService] searchBookmarkedCourses 요청:', {
    url: '/api/courses/search/bookmarked',
    params,
    headers: {
      Authorization: `Bearer ${accessToken.substring(0, 20)}...`,
    },
  });

  const response = await api.get('/api/courses/search/bookmarked', {
    params,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  console.log('🌐 [CoursesService] searchBookmarkedCourses 응답:', {
    status: response.status,
    data: response.data,
  });

  return response.data;
}

export async function searchCompletedCourses(
  params: {
    cursor?: { id: number } | null;
    limit?: number;
  },
  accessToken: string,
): Promise<CompletedCourseResponse> {
  console.log('🌐 [CoursesService] searchCompletedCourses 요청:', {
    url: '/api/courses/search/completed',
    params,
    headers: {
      Authorization: `Bearer ${accessToken.substring(0, 20)}...`,
    },
  });

  const response = await api.get('/api/courses/search/completed', {
    params,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  console.log('🌐 [CoursesService] searchCompletedCourses 응답:', {
    status: response.status,
    data: response.data,
  });

  return response.data;
}

export async function searchAdjacentCourses(
  params: {
    location: string; // "127.0,37.5" 형식
    radius: number;
    limit?: number;
    cursor?: { id: number; distance: number } | null;
  },
  accessToken: string,
): Promise<CourseSearchResponse> {
  const response = await api.get('/api/courses/search/adjacent', {
    params,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}
