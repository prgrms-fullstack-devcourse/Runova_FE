import { ImageProcessResult } from './image.types';

export interface RouteCoordinate {
  lon: number;
  lat: number;
}

export interface CourseCreateRequest {
  title: string;
  imageUrl: string;
  path: number[][];
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
