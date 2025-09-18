import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Share, ArrowLeft, Home, Upload } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from '@emotion/native';

import Header from '@/components/Header';
import { formatDistance, formatTime, formatPace } from '@/utils/formatters';
import type { RootStackParamList } from '@/types/navigation.types';

type Props = NativeStackScreenProps<RootStackParamList, 'RunDetail'>;

export default function RunDetail({ route, navigation }: Props) {
  const { recordId, imageUrl, stats } = route.params;
  const insets = useSafeAreaInsets();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleHomePress = () => {
    // RunDetail에서 홈으로 이동할 때는 스택을 리셋하고 홈으로 이동
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'TabNavigator',
          params: {
            screen: 'Home',
          },
        },
      ],
    });
  };

  const handleSharePress = () => {
    Alert.alert('공유', '런닝 기록을 공유합니다.');
  };

  const handleCameraPress = () => {
    Alert.alert('인증사진', '인증사진을 찍습니다.');
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <Container>
      <Header
        leftIcon={ArrowLeft}
        onLeftPress={handleBackPress}
        title="런닝 기록"
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageContainer>
          {imageUrl && !imageError && (
            <RouteImage
              source={{ uri: imageUrl }}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          )}
          {(imageError || !imageUrl) && (
            <FallbackContainer>
              <FallbackText>런닝 기록 #{recordId}</FallbackText>
            </FallbackContainer>
          )}
          {imageLoading && imageUrl && !imageError && (
            <LoadingImageContainer>
              <ActivityIndicator size="large" color="#2d2d2d" />
            </LoadingImageContainer>
          )}
        </ImageContainer>

        <InfoContainer>
          <Title>런닝 기록 #{recordId}</Title>

          <InfoRow>
            <InfoLabel>거리</InfoLabel>
            <InfoValue>{formatDistance(stats.distance)}</InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel>시간</InfoLabel>
            <InfoValue>{stats.runningTime}</InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel>페이스</InfoLabel>
            <InfoValue>{formatPace(stats.pace)}</InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel>칼로리</InfoLabel>
            <InfoValue>{stats.calories} kcal</InfoValue>
          </InfoRow>
        </InfoContainer>

        <UploadContainer>
          <UploadButton onPress={handleCameraPress}>
            <Upload size={24} color="#2d2d2d" />
            <UploadText>인증사진 찍기</UploadText>
          </UploadButton>
        </UploadContainer>
      </ScrollView>

      <BottomContainer paddingBottom={insets.bottom + 16}>
        <ShareButton onPress={handleSharePress}>
          <Share size={24} color="#2d2d2d" />
        </ShareButton>

        <HomeButton onPress={handleHomePress}>
          <Home size={24} color="#ffffff" />
          <HomeButtonText>홈으로 이동</HomeButtonText>
        </HomeButton>
      </BottomContainer>
    </Container>
  );
}

const Container = styled.View({
  flex: 1,
  backgroundColor: '#ffffff',
});

const ImageContainer = styled.View({
  aspectRatio: 1,
  backgroundColor: '#f5f5f5',
});

const RouteImage = styled(Image)({
  width: '100%',
  height: '100%',
  resizeMode: 'cover',
});

const FallbackContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f5f5f5',
});

const FallbackText = styled.Text({
  fontSize: 16,
  color: '#666666',
  textAlign: 'center',
});

const LoadingImageContainer = styled.View({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f5f5f5',
});

const InfoContainer = styled.View({
  padding: 20,
});

const Title = styled.Text({
  fontSize: 24,
  fontWeight: 'bold',
  color: '#000000',
  marginBottom: 24,
});

const InfoRow = styled.View<{ isLast?: boolean }>(({ isLast }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 12,
  borderBottomWidth: isLast ? 0 : 1,
  borderBottomColor: '#f0f0f0',
}));

const InfoLabel = styled.Text({
  fontSize: 16,
  color: '#666666',
  fontWeight: '500',
});

const InfoValue = styled.Text({
  fontSize: 16,
  color: '#000000',
  flex: 1,
  textAlign: 'right',
});

const BottomContainer = styled.View<{ paddingBottom: number }>(
  ({ paddingBottom }) => ({
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  }),
);

const ShareButton = styled(TouchableOpacity)({
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: '#f8f9fa',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 12,
});

const HomeButton = styled(TouchableOpacity)({
  flex: 1,
  height: 48,
  borderRadius: 8,
  backgroundColor: '#2d2d2d',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
});

const HomeButtonText = styled.Text({
  color: '#ffffff',
  fontSize: 16,
  fontWeight: '600',
  marginLeft: 8,
});

const UploadContainer = styled.View({
  paddingHorizontal: 20,
  paddingVertical: 16,
});

const UploadButton = styled(TouchableOpacity)({
  backgroundColor: '#f8f9fa',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 16,
  paddingHorizontal: 20,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: '#e9ecef',
  borderStyle: 'dashed',
});

const UploadText = styled.Text({
  fontSize: 16,
  color: '#666666',
  marginLeft: 8,
  fontWeight: '500',
});
