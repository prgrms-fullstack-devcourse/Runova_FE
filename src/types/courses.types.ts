import { ImageProcessResult } from './image.types';

export interface RouteCoordinate {
  lon: number;
  lat: number;
}

export interface CourseCreateRequest {
  title: string;
  imageUrl: string;
  path: [number, number][];
}

export interface CourseClientData {
  title: string;
  imageUrl: string;
  path: RouteCoordinate[];
}

export type CourseSaveData = {
  title: string;
  imageURL: string;
  path: RouteCoordinate[];
};

export type CourseSaveResult = {
  success: boolean;
  data?: CourseSaveData;
  error?: string;
  imageProcessResult?: ImageProcessResult;
};

export interface CourseSearchRequest {
  cursor?: { id: number } | null;
  limit?: number;
}

export interface CourseSearchItem {
  id: number;
  title: string;
  imageUrl: string;
  departure: [number, number];
  length: number;
  time: number;
  createdAt: string;
  author: {
    nickname: string;
    imageUrl: string;
  };
  bookmarked: boolean;
  completed: boolean;
}

export interface CourseSearchResponse {
  results: CourseSearchItem[];
}

// 북마크한 경로 API 타입
export interface BookmarkedCourseItem {
  id: number;
  title: string;
  imageUrl: string;
  departure: [number, number];
  length: number;
  time: number;
  createdAt: string;
  author: {
    nickname: string;
    imageUrl: string;
  };
  bookmarked: boolean;
  distance: number;
}

export interface BookmarkedCourseResponse {
  results: BookmarkedCourseItem[];
  nextCursor: string;
}

// 완주한 경로 API 타입
export interface CompletedCourseItem {
  id: number;
  title: string;
  imageUrl: string;
  departure: [number, number];
  length: number;
  time: number;
  createdAt: string;
  author: {
    nickname: string;
    imageUrl: string;
  };
  bookmarked: boolean;
  distance: number;
}

export interface CompletedCourseResponse {
  results: CompletedCourseItem[];
  nextCursor: string;
}

export interface CourseTopologyNode {
  location: [number, number];
  progress: number;
  bearing: number;
}

export interface CourseTopologyResponse {
  nodes: CourseTopologyNode[];
  shape: [number, number][][];
}

// 네비게이션 관련 타입들
export type NavigationDirection = '왼쪽' | '오른쪽';
export type NavigationScale = '회전' | '유턴';

export interface NavigationInstruction {
  direction: NavigationDirection;
  scale: NavigationScale;
  distance?: number;
  type: 'turn' | 'warning';
}

export interface NavigationState {
  currentNodeIndex: number;
  nextNode: CourseTopologyNode | null;
  distanceToNextNode: number;
  isApproachingTurn: boolean;
  instruction: NavigationInstruction | null;
}
