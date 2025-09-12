import { useCallback } from 'react';
import { Share as RNShare } from 'react-native';

interface UseShareOptions {
  courseId: number;
  courseData: any;
}

export function useShare({ courseId, courseData }: UseShareOptions) {
  const shareCourse = useCallback(async () => {
    if (!courseData) return;

    try {
      const title =
        'title' in courseData
          ? courseData.title
          : `완주 기록 #${courseData.id}`;
      await RNShare.share({
        message: `${title} 경로를 공유합니다!`,
        url: `runova://course/${courseId}`,
      });
    } catch (err) {
      // 공유 실패 시 무시
    }
  }, [courseId, courseData]);

  return { shareCourse };
}
