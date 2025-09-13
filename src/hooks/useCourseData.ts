import { useState, useCallback } from 'react';
import {
  searchUserCourses,
  searchBookmarkedCourses,
} from '@/services/courses.service';
import { reverseGeocode } from '@/lib/geocoding';
import type {
  BookmarkedCourseItem,
  CourseSearchItem,
  CompletedCourseItem,
} from '@/types/courses.types';

interface UseCourseDataOptions {
  courseId: number;
  courseData?: BookmarkedCourseItem | CourseSearchItem | CompletedCourseItem;
  accessToken: string | null;
}

export function useCourseData({
  courseId,
  courseData,
  accessToken,
}: UseCourseDataOptions) {
  const [data, setData] = useState<
    BookmarkedCourseItem | CourseSearchItem | CompletedCourseItem | null
  >(null);
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAddress = useCallback(
    async (
      departure:
        | [number, number]
        | { lon: number; lat: number }
        | [number, number][],
    ) => {
      try {
        let coords: [number, number];

        if (Array.isArray(departure) && departure.length > 0) {
          if (Array.isArray(departure[0])) {
            coords = departure[0] as [number, number];
          } else {
            coords = departure as [number, number];
          }
        } else {
          const dep = departure as { lon: number; lat: number };
          coords = [dep.lon, dep.lat];
        }

        const result = await reverseGeocode(coords);
        setAddress(result.address);
      } catch (err) {
        setAddress('주소 정보 없음');
      }
    },
    [],
  );

  const loadCourseData = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (courseData) {
        setData(courseData);
        if ('departure' in courseData && courseData.departure) {
          await loadAddress(courseData.departure);
        } else if (
          'path' in courseData &&
          courseData.path &&
          Array.isArray(courseData.path) &&
          courseData.path.length > 0
        ) {
          await loadAddress(courseData.path);
        }
        return;
      }

      const userCoursesResponse = await searchUserCourses(
        { cursor: null, limit: 100 },
        accessToken,
      );

      const userCourse = userCoursesResponse.results.find(
        (course) => course.id === courseId,
      );

      if (userCourse) {
        setData(userCourse);
        await loadAddress(userCourse.departure);
        return;
      }

      const bookmarkedResponse = await searchBookmarkedCourses(
        { cursor: null, limit: 100 },
        accessToken,
      );

      const bookmarkedCourse = bookmarkedResponse.results.find(
        (course) => course.id === courseId,
      );

      if (bookmarkedCourse) {
        setData(bookmarkedCourse);
        await loadAddress(bookmarkedCourse.departure);
        return;
      }

      setError('경로를 찾을 수 없습니다.');
    } catch (err) {
      setError('경로 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, courseId, courseData, loadAddress]);

  return {
    courseData: data,
    address,
    loading,
    error,
    loadCourseData,
  };
}
