import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import FloatingImage from './FloatingImage';
import type { FloatingImageData } from '@/types/home.types';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const isColliding = (
  rect1: { x: number; y: number; size: number },
  rect2: { x: number; y: number; size: number },
) => {
  const margin = 10;
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

  useEffect(() => {
    const images = [
      require('@/assets/bear.png'),
      require('@/assets/chick.png'),
      require('@/assets/dog.png'),
      require('@/assets/woman.png'),
    ];

    const generateRandomImages = () => {
      const newImages: FloatingImageData[] = [];
      const maxAttempts = 500;

      images.forEach((image, index) => {
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
    };

    generateRandomImages();
  }, []);

  return (
    <>
      {floatingImages.map((image) => (
        <FloatingImage key={image.id} data={image} />
      ))}
    </>
  );
}
