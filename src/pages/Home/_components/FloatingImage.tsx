import styled from '@emotion/native';
import { Image } from 'react-native';
import type { FloatingImageData } from '@/types/home.types';

interface FloatingImageProps {
  data: FloatingImageData;
}

const StyledImage = styled(Image)({
  position: 'absolute',
});

export default function FloatingImage({ data }: FloatingImageProps) {
  return (
    <StyledImage
      source={data.source}
      style={{
        left: data.x,
        top: data.y,
        width: data.size,
        height: data.size,
        transform: [{ rotate: `${data.rotation}deg` }],
        opacity: 1,
      }}
      resizeMode="contain"
    />
  );
}
