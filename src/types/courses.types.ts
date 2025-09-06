export interface RouteCoordinate {
  lon: number;
  lat: number;
}

export interface CourseCreateRequest {
  title: string;
  imageURL: string;
  path: RouteCoordinate[];
}
