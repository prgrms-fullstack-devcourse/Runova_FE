import api from '@/lib/api';

export type CourseItem = {
  id: string;
  imageUrl?: string;
  title?: string;
  date?: string; // createdAt을 여기로 매핑해 줄 거야
  length: number;
};

type SearchUserCoursesRes = {
  results: Array<{
    id: number;
    title: string;
    imageUrl: string | null;
    createdAt: string;
    length: number;
    time: number;
    distance: number;
    // departure, length, time, author, bookmarked, distance 등은 필요 시 추가
  }>;
  nextCursor: string | null;
};

export async function searchUserCourses(cursor?: string) {
  const { data } = await api.get<SearchUserCoursesRes>(
    '/api/courses/search/users',
    {
      params: cursor ? { cursor } : undefined,
    },
  );

  return {
    results: data.results.map((r) => ({
      id: String(r.id),
      imageUrl: r.imageUrl ?? undefined,
      title: r.title ?? undefined,
      date: r.createdAt ?? undefined,
      length: r.length ?? undefined,
    })) as CourseItem[],
    nextCursor: data.nextCursor ?? null,
  };
}

export type ToggleBookmarkRes = {
  bookmarked: boolean;
};

export async function toggleCourseBookmark(courseId: number | string) {
  const { data } = await api.put<ToggleBookmarkRes>(
    `/api/courses/${courseId}/bookmarks`,
  );
  return data;
}
