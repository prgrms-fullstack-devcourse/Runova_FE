import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import FloatingImage from './FloatingImage';
import type { FloatingImageData } from '@/types/home.types';
import useAuthStore from '@/store/auth';
import api from '@/lib/api';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const isColliding = (
  rect1: { x: number; y: number; size: number },
  rect2: { x: number; y: number; size: number },
) => {
  const margin = 5; // 충돌 영역 5px
  return !(
    rect1.x + rect1.size + margin < rect2.x ||
    rect2.x + rect2.size + margin < rect1.x ||
    rect1.y + rect1.size + margin < rect2.y ||
    rect2.y + rect2.size + margin < rect1.y
  );
};

const isValidPosition = (
  newImage: { x: number; y: number; size: number } | null,
  existingImages: FloatingImageData[],
) => {
  if (!newImage) return false;
  return !existingImages.some((existing) =>
    isColliding(newImage, {
      x: existing.x,
      y: existing.y,
      size: existing.size,
    }),
  );
};

export default function FloatingImageContainer() {
  const [floatingImages, setFloatingImages] = useState<FloatingImageData[]>([]);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    const generateRandomImages = async () => {
      try {
        if (!accessToken) {
          throw new Error('No authentication token');
        }

        const response = await api.get('/api/running/art', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const artUrls = response.data?.results ?? [];

        // null 값 필터링하고 유효한 URL만 사용
        const validArtUrls = artUrls.filter(
          (url: string | null) => url !== null,
        );

        // API에서 이미지를 가져오지 못했을 때 fallback 이미지 사용
        const images =
          validArtUrls.length > 0
            ? validArtUrls.map((url: string) => ({ uri: url }))
            : [
                require('@/assets/bear.png'),
                require('@/assets/chick.png'),
                require('@/assets/dog.png'),
                require('@/assets/woman.png'),
              ];

        const newImages: FloatingImageData[] = [];

        // 5px 충돌 영역으로 이미지 배치
        images.forEach((image: any, index: number) => {
          let attempts = 0;
          let validPosition = false;
          let newImage: FloatingImageData | null = null;
          const maxAttempts = 100; // 시도 횟수 줄임

          while (attempts < maxAttempts && !validPosition) {
            // 랜덤 사이즈 (80px ~ 140px)
            const imageSize = Math.random() * 100 + 80;

            // 화면 안전 영역 계산
            const safeMargin = 20;
            const minX = safeMargin;
            const maxX = screenWidth - imageSize - safeMargin;
            const minY = 120;
            const maxY = screenHeight - imageSize - 180;

            newImage = {
              id: index,
              source: image,
              x: Math.random() * Math.max(0, maxX - minX) + minX,
              y: Math.random() * Math.max(0, maxY - minY) + minY,
              size: imageSize,
              rotation: Math.random() * 360,
            };

            // 충돌 검사 (첫 50번만 시도, 이후 강제 배치)
            if (attempts < 50) {
              if (isValidPosition(newImage, newImages)) {
                validPosition = true;
                newImages.push(newImage);
              }
            } else {
              // 50번 시도 후에는 강제 배치
              validPosition = true;
              newImages.push(newImage);
            }
            attempts++;
          }
        });

        setFloatingImages(newImages);
      } catch (error) {
        console.error('러닝 아트를 가져오는데 실패했습니다:', error);

        // 인증 에러나 네트워크 에러 시 기본 이미지 사용
        const fallbackImages = [
          require('@/assets/bear.png'),
          require('@/assets/chick.png'),
          require('@/assets/dog.png'),
          require('@/assets/woman.png'),
        ];

        const newImages: FloatingImageData[] = [];
        const maxAttempts = 500;

        fallbackImages.forEach((image: any, index: number) => {
          const count = 1;

          for (let i = 0; i < count; i++) {
            let attempts = 0;
            let validPosition = false;
            let newImage: FloatingImageData | null = null;

            while (attempts < maxAttempts && !validPosition) {
              newImage = {
                id: index * 10 + i,
                source: image,
                x: Math.random() * (screenWidth - 100),
                y: Math.random() * (screenHeight / 2 - 250) + 150,
                size: Math.random() * 60 + 100,
                rotation: Math.random() * 360,
              };

              if (isValidPosition(newImage, newImages)) {
                validPosition = true;
                newImages.push(newImage);
              }
              attempts++;
            }
          }
        });

        setFloatingImages(newImages);
      }
    };

    generateRandomImages();
  }, [accessToken]);

  return (
    <>
      {floatingImages.map((image) => (
        <FloatingImage key={image.id} data={image} />
      ))}
    </>
  );
}
