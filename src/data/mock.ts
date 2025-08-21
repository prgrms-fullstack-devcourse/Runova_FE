import type { RecommendationData, RouteCardData } from '@/types/card.types';

export const routeData: RouteCardData[] = [
  { id: 1, hasStar: true },
  { id: 2, hasStar: true },
  { id: 3, hasStar: true },
  { id: 4, hasStar: true },
  { id: 5, hasStar: true },
  { id: 6, hasStar: true },
  { id: 7, hasStar: true },
  { id: 8, hasStar: true },
  { id: 9, hasStar: true },
  { id: 10, hasStar: true },
];

export const recommendationData: RecommendationData[] = [
  {
    id: 1,
    title: '한강공원 러닝',
    subtitle: '서울시 강남구',
    distance: '5.2km',
    time: '32분',
  },
  {
    id: 2,
    title: '북한산 트레킹',
    subtitle: '서울시 강북구',
    distance: '8.7km',
    time: '45분',
  },
  {
    id: 3,
    title: '올림픽공원 코스',
    subtitle: '서울시 송파구',
    distance: '6.1km',
    time: '38분',
  },
  {
    id: 4,
    title: '여의도 한강공원',
    subtitle: '서울시 영등포구',
    distance: '4.8km',
    time: '30분',
  },
];
