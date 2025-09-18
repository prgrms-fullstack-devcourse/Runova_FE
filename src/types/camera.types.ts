export interface CameraPhoto {
  uri: string;
  width: number;
  height: number;
  fileSize?: number;
}

export interface PhotoEditParams {
  photoUri: string;
  recordId: number;
}
