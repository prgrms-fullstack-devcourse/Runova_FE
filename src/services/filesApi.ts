import api from './api';
import type {
  PresignRequest,
  PresignResponse,
  S3UploadError,
} from '@/types/files.types';

export async function requestPresignedUrl(
  data: PresignRequest,
  accessToken: string,
): Promise<PresignResponse> {
  const response = await api.post<PresignResponse>('/files/presign', data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

export async function uploadImageToS3(
  presignedUrl: string,
  imageUri: string,
  fileSize: number,
): Promise<void> {
  const response = await fetch(imageUri);
  const arrayBuffer = await response.arrayBuffer();

  const uploadResponse = await fetch(presignedUrl, {
    method: 'PUT',
    body: arrayBuffer,
    headers: {
      'Content-Type': 'image/png',
      'Content-Length': fileSize.toString(),
    },
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    const error = new Error(
      `이미지 업로드에 실패했습니다. (${uploadResponse.status}): ${errorText}`,
    ) as S3UploadError;
    error.status = uploadResponse.status;
    error.responseText = errorText;
    throw error;
  }
}

export function generatePublicImageUrl(bucket: string, key: string): string {
  const region = 'ap-northeast-2';
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
