import type { Comment, Post } from '@/types/community.type';

export const CATEGORY_LABEL: Record<
  Post['category'],
  { label: string; color: string }
> = {
  free: { label: '자유', color: '#2563eb' },
  auth: { label: '인증', color: '#dc2626' },
  share: { label: '공유', color: '#16a34a' },
  mate: { label: '메이트', color: '#7c3aed' },
};

export const samplePosts: Post[] = [
  {
    id: 'p1',
    title: '한강에서 하트 완성!',
    author: '러닝마니아',
    category: 'auth',
    commentsCount: 24,
    content: `안녕하세요! 오늘 정말 좋은 경험을 했어서 공유하고 싶어요.\n\nGPS 아트를 시작한지 얼마 안 되었는데, ...`,
  },
  {
    id: 'p2',
    title: '여의도 벚꽃길 경로 공유',
    author: '벚꽃러너',
    category: 'share',
    commentsCount: 18,
  },
  {
    id: 'p3',
    title: '올림픽공원 러닝 메이트 구해요',
    author: '주말러너',
    category: 'mate',
    commentsCount: 12,
  },
  {
    id: 'p4',
    title: '초보자 추천 코스 문의',
    author: '초보러너',
    category: 'free',
    commentsCount: 31,
  },
  {
    id: 'p5',
    title: '반포대교 별 완성!',
    author: '스타러너',
    category: 'auth',
    commentsCount: 45,
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
    content: '건물이 적은 곳에서 뛰는게 더 정확해요.',
  },
  {
    id: 'c3',
    author: '러닝초보',
    content: '초보자도 쉽게 따라할 수 있을까요?',
  },
];
