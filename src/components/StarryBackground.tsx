import React, { useEffect, useState } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import styled from '@emotion/native';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  animatedValue: Animated.Value;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Container = styled(View)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: screenWidth,
  height: screenHeight,
  zIndex: 1,
});

const StarDot = styled(Animated.View)<{ size: number; x: number; y: number }>(
  ({ size, x, y }) => ({
    position: 'absolute',
    left: x,
    top: y,
    width: size,
    height: size,
    backgroundColor: 'white',
    borderRadius: size / 2,
  }),
);

export default function StarryBackground() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const starCount = Math.floor(Math.random() * 100) + 200;
    const newStars: Star[] = [];

    for (let i = 0; i < starCount; i++) {
      let x, y;

      if (Math.random() < 0.3) {
        const lineProgress = Math.random();
        const lineWidth = 150;
        const centerX = lineProgress * screenWidth;
        const centerY = lineProgress * screenHeight * 0.7 + screenHeight * 0.15;

        x = centerX + (Math.random() - 0.5) * lineWidth;
        y = centerY + (Math.random() - 0.5) * lineWidth * 0.3;
      } else {
        x = Math.random() * screenWidth;
        y = Math.random() * screenHeight;
      }

      newStars.push({
        id: i,
        x: Math.max(0, Math.min(screenWidth, x)),
        y: Math.max(0, Math.min(screenHeight, y)),
        size: Math.random() * 1.7 + 0.3,
        animatedValue: new Animated.Value(Math.random() * 0.6 + 0.3),
      });
    }

    setStars(newStars);

    newStars.forEach((star) => {
      const createTwinkleAnimation = () => {
        const minOpacity = Math.random() * 0.2 + 0.1;
        const maxOpacity = Math.random() * 0.4 + 0.6;

        return Animated.sequence([
          Animated.timing(star.animatedValue, {
            toValue: maxOpacity,
            duration: Math.random() * 3000 + 2000,
            useNativeDriver: true,
          }),
          Animated.timing(star.animatedValue, {
            toValue: minOpacity,
            duration: Math.random() * 3000 + 2000,
            useNativeDriver: true,
          }),
        ]);
      };

      const startAnimation = () => {
        createTwinkleAnimation().start(() => {
          setTimeout(() => {
            startAnimation();
          }, Math.random() * 2000);
        });
      };

      setTimeout(() => {
        startAnimation();
      }, Math.random() * 5000);
    });

    return () => {
      newStars.forEach((star) => {
        star.animatedValue.stopAnimation();
      });
    };
  }, []);

  return (
    <Container>
      {stars.map((star) => (
        <StarDot
          key={star.id}
          size={star.size}
          x={star.x}
          y={star.y}
          style={{
            opacity: star.animatedValue,
          }}
        />
      ))}
    </Container>
  );
}
