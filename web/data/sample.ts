import type { Post, Comment } from '@/types/community';

export const samplePosts: Post[] = [
  {
    id: 'p1',
    category: 'auth',
    title: '한강에서 하트 완성!',
    author: '러닝마니아',
    commentsCount: 24,
  },
  {
    id: 'p2',
    category: 'share',
    title: '여의도 벚꽃길 경로 공유',
    author: '벚꽃러너',
    commentsCount: 18,
  },
  {
    id: 'p3',
    category: 'mate',
    title: '올림픽공원 러닝 메이트 구해요',
    author: '주말러너',
    commentsCount: 12,
  },
  {
    id: 'p4',
    category: 'free',
    title: '초보자 추천 코스 문의',
    author: '초보러너',
    commentsCount: 31,
  },
  {
    id: 'p5',
    category: 'auth',
    title: '반포대교 별 완성!',
    author: '스타러너',
    commentsCount: 45,
  },
  {
    id: 'p6',
    category: 'share',
    title: '남산타워 원형 코스 추천',
    author: '남산러버',
    commentsCount: 22,
  },
  {
    id: 'p7',
    category: 'free',
    title: 'GPS 정확한 러닝 앱 추천',
    author: '정확러너',
    commentsCount: 38,
  },
  {
    id: 'p8',
    category: 'mate',
    title: '강남 저녁 러닝 메이트 구함',
    author: '강남러너',
    commentsCount: 15,
  },
  {
    id: 'p9',
    category: 'auth',
    title: '10km 하트 완성!',
    author: '하트러너',
    commentsCount: 67,
  },
  {
    id: 'p10',
    category: 'free',
    title: '실내 GPS 아트 문의',
    author: '실내러너',
    commentsCount: 19,
  },
];

export const sampleComments: Comment[] = [
  {
    id: 'c1',
    author: '댓글러너1',
    content: '정말 멋진 경로네요! 저도 따라해보고 싶어요.',
  },
  {
    id: 'c2',
    author: 'GPS마스터',
    content: 'GPS 정확도를 높이려면 건물이 적은 곳에서 뛰는게 좋아요.',
  },
  {
    id: 'c3',
    author: '러닝초보',
    content: '초보자도 쉽게 따라할 수 있을까요?',
  },
];
