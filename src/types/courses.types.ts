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
  cursor?: number | null;
  limit?: number;
}

export interface CourseSearchItem {
  id: number;
  title: string;
  imageUrl: string;
  departure: RouteCoordinate;
  length: number;
  time: number;
  createdAt: string;
  author: string;
  bookmarked: boolean;
  completed: boolean;
}

export interface CourseSearchResponse {
  results: CourseSearchItem[];
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
