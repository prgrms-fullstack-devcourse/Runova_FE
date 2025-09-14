import React, { useState } from 'react';
import styled from '@emotion/native';
import { TouchableOpacity, Image, ViewStyle, Dimensions } from 'react-native';
import { Star } from 'lucide-react-native';

interface CardContent {
  title?: string;
  subtitle?: string;
  stats?: Array<{ label: string; value: string }>;
  hasStar?: boolean;
  cardTitle?: string;
}

type CardMode = 'image-with-text' | 'only-text' | 'only-image';

interface CardProps {
  children?: React.ReactNode;
  imageSource?: any;
  content?: CardContent;
  mode?: CardMode;
  onPress?: () => void;
  style?: ViewStyle;
  fullWidth?: boolean;
  variant?: 'default' | 'light';
}

export default function Card({
  children,
  imageSource,
  content,
  mode,
  onPress,
  style,
  fullWidth = false,
  variant = 'default',
}: CardProps) {
  const { width: screenWidth } = Dimensions.get('window');
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const finalMode = mode || (imageSource ? 'image-with-text' : 'only-text');

  if (finalMode === 'only-image') {
    const handleImageError = () => {
      setImageError(true);
      setImageLoading(false);
    };

    const handleImageLoad = () => {
      setImageLoading(false);
    };

    return (
      <CardContainer
        fullWidth={fullWidth}
        mode={finalMode}
        variant={variant}
        onPress={onPress}
        style={style}
        activeOpacity={0.8}
      >
        <ImageContainer>
          {imageSource && !imageError && (
            <CardImage
              source={imageSource}
              mode={finalMode}
              resizeMode="cover"
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          )}
          {(imageError || !imageSource) && (
            <FallbackContainer>
              <FallbackText>이미지가 없습니다.</FallbackText>
            </FallbackContainer>
          )}
          {imageLoading && imageSource && !imageError && (
            <LoadingContainer>
              <LoadingText>로딩중...</LoadingText>
            </LoadingContainer>
          )}
          {content?.hasStar && (
            <StarIcon size={20} color="#2d2d2d" fill="#2d2d2d" />
          )}
        </ImageContainer>
      </CardContainer>
    );
  }

  if (finalMode === 'image-with-text') {
    const contentWidth = screenWidth - 64;
    const imageSize = contentWidth * 0.36; // 0.45에서 0.36으로 변경 (약 20% 감소)
    return (
      <CardContainer
        fullWidth={fullWidth}
        mode={finalMode}
        variant={variant}
        onPress={onPress}
        style={style}
        activeOpacity={0.8}
      >
        {content?.cardTitle && (
          <CardTitle variant={variant}>{content.cardTitle}</CardTitle>
        )}
        <ContentRow>
          {imageSource && (
            <CardImage
              source={imageSource}
              mode={finalMode}
              resizeMode="cover"
              style={{ width: imageSize, height: imageSize }}
            />
          )}
          {content && (
            <CardContentContainer>
              {content.title && (
                <Title variant={variant}>{content.title}</Title>
              )}
              {content.subtitle && (
                <Subtitle variant={variant}>{content.subtitle}</Subtitle>
              )}
              {content.stats && (
                <StatsContainer>
                  {content.stats.map((stat, index) => (
                    <StatItem key={index}>
                      <StatLabel variant={variant}>{stat.label}</StatLabel>
                      <StatValue variant={variant}>{stat.value}</StatValue>
                    </StatItem>
                  ))}
                </StatsContainer>
              )}
            </CardContentContainer>
          )}
        </ContentRow>
      </CardContainer>
    );
  }

  return (
    <CardContainer
      fullWidth={fullWidth}
      mode={finalMode}
      variant={variant}
      onPress={onPress}
      style={style}
      activeOpacity={0.8}
    >
      {children}
    </CardContainer>
  );
}

const CardContainer = styled(TouchableOpacity)<{
  fullWidth: boolean;
  mode: CardMode;
  variant: 'default' | 'light';
}>(({ fullWidth, mode, variant }) => ({
  backgroundColor: variant === 'light' ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
  borderColor:
    variant === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)',
  borderWidth: 1,
  borderRadius: 12,
  padding: mode === 'only-image' ? 0 : 16,
  flex: fullWidth ? undefined : mode === 'only-image' ? 1 : 1,
  width: fullWidth ? '100%' : undefined,
  aspectRatio: fullWidth ? undefined : 1,
}));

const CardTitle = styled.Text<{ variant?: 'default' | 'light' }>(
  ({ variant }) => ({
    color: variant === 'light' ? '#000000' : '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  }),
);

const ContentRow = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
});

const ImageContainer = styled.View({
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
});

const CardImage = styled(Image)<{
  mode: CardMode;
}>(({ mode }) => ({
  width: mode === 'only-image' ? '100%' : 100,
  height: mode === 'only-image' ? '100%' : 100,
  borderRadius: mode === 'only-image' ? 12 : 8,
  marginRight: mode === 'image-with-text' ? 12 : 0,
}));

const CardContentContainer = styled.View({
  flex: 1,
});

const Title = styled.Text<{ variant?: 'default' | 'light' }>(({ variant }) => ({
  color: variant === 'light' ? '#000000' : '#ffffff',
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 4,
}));

const Subtitle = styled.Text<{ variant?: 'default' | 'light' }>(
  ({ variant }) => ({
    color:
      variant === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 8,
  }),
);

const StatsContainer = styled.View({
  flexDirection: 'row',
  gap: 16,
});

const StatItem = styled.View({
  alignItems: 'center',
});

const StatLabel = styled.Text<{ variant?: 'default' | 'light' }>(
  ({ variant }) => ({
    color:
      variant === 'light' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: 2,
  }),
);

const StatValue = styled.Text<{ variant?: 'default' | 'light' }>(
  ({ variant }) => ({
    color:
      variant === 'light' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
  }),
);

const StarIcon = styled(Star)({
  position: 'absolute',
  top: 8,
  right: 8,
  zIndex: 1,
});

const FallbackContainer = styled.View({
  width: '100%',
  height: '100%',
  backgroundColor: '#f0f0f0',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 12,
});

const FallbackText = styled.Text({
  color: '#666666',
  fontSize: 14,
  fontWeight: '500',
});

const LoadingContainer = styled.View({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 12,
});

const LoadingText = styled.Text({
  color: '#2d2d2d',
  fontSize: 12,
  fontWeight: '500',
});
