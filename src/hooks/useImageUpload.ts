import * as FileSystem from 'expo-file-system';
import {
  requestPresignedUrl,
  uploadImageToS3,
  generatePublicImageUrl,
} from '@/lib/filesApi';
import type { FileUploadType } from '@/types/files.types';

const MAX_IMAGES_SIZE_BYTES = 10 * 1024 * 1024;

export function useImageUpload() {
  const uploadImage = async (
    imageUri: string,
    accessToken: string,
  ): Promise<string> => {
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    if (!fileInfo.exists) {
      throw new Error('이미지 파일을 찾을 수 없습니다.');
    }

    const fileSize = fileInfo.size || 0;

    if (fileSize > MAX_IMAGES_SIZE_BYTES) {
      throw new Error('이미지 파일이 너무 큽니다. (최대 10MB)');
    }

    const uploadType: FileUploadType = 'avatar';
    const presignData = await requestPresignedUrl(
      {
        type: uploadType,
        contentType: 'image/png',
        size: fileSize,
      },
      accessToken,
    );

    await uploadImageToS3(presignData.url, imageUri, fileSize);

    const publicImageUrl = generatePublicImageUrl(
      presignData.bucket,
      presignData.key,
    );

    return publicImageUrl;
  };

  return { uploadImage };
}
