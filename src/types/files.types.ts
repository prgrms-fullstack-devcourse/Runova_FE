export type FileUploadType = 'avatar' | 'verify' | 'course';

export interface PresignRequest {
  type: FileUploadType;
  contentType: string;
  size: number;
}

export interface PresignResponse {
  bucket: string;
  key: string;
  url: string;
}

export interface S3UploadError extends Error {
  status?: number;
  responseText?: string;
}
