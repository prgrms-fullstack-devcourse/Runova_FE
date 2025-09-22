import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, Check, RotateCcw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from '@emotion/native';
import * as MediaLibrary from 'expo-media-library';

import Header from '@/components/Header';
import type { RunTabStackParamList } from '@/types/navigation.types';

type Props = NativeStackScreenProps<RunTabStackParamList, 'PhotoEdit'>;

export default function PhotoEdit({ route, navigation }: Props) {
  const { photoUri, recordId, path, stats } = route.params;
  const insets = useSafeAreaInsets();
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const saveToGallery = async () => {
    try {
      // 미디어 라이브러리 권한 요청
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '갤러리에 저장하려면 권한이 필요합니다.');
        return false;
      }

      // 갤러리에 저장
      const asset = await MediaLibrary.createAssetAsync(photoUri);

      return true;
    } catch (error) {
      return false;
    }
  };

  const handleEditPress = () => {
    navigation.navigate('PhotoDecoration', {
      photoUri,
      recordId,
      path,
      stats,
    });
  };

  const handleRetakePress = () => {
    navigation.goBack();
  };

  return (
    <Container>
      <Header
        leftIcon={ArrowLeft}
        onLeftPress={handleBackPress}
        title="사진 편집"
      />

      <ImageContainer>
        {!imageError ? (
          <PhotoImage
            source={{ uri: photoUri }}
            resizeMode="contain"
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
            onLoad={() => {
              setImageLoading(false);
            }}
          />
        ) : (
          <ErrorContainer>
            <ErrorText>사진을 불러올 수 없습니다</ErrorText>
            <ErrorText>URI: {photoUri}</ErrorText>
          </ErrorContainer>
        )}

        {imageLoading && !imageError && (
          <LoadingOverlay>
            <ActivityIndicator size="large" color="#ffffff" />
            <LoadingText>사진을 불러오는 중...</LoadingText>
          </LoadingOverlay>
        )}
      </ImageContainer>

      <BottomContainer safeAreaBottom={insets.bottom}>
        <RetakeButton onPress={handleRetakePress}>
          <RotateCcw size={24} color="#666666" />
          <RetakeText>다시 촬영</RetakeText>
        </RetakeButton>

        <EditButton onPress={handleEditPress} disabled={isProcessing}>
          <Check size={24} color="#ffffff" />
          <EditText>편집하기</EditText>
        </EditButton>
      </BottomContainer>
    </Container>
  );
}

const Container = styled.View({
  flex: 1,
  backgroundColor: '#000000',
});

const ImageContainer = styled.View({
  flex: 1,
  backgroundColor: '#000000',
});

const PhotoImage = styled(Image)({
  width: '100%',
  height: '100%',
});

const BottomContainer = styled.View<{ safeAreaBottom: number }>(
  ({ safeAreaBottom }) => ({
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: safeAreaBottom + 16,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#333333',
  }),
);

const RetakeButton = styled(TouchableOpacity)({
  flex: 1,
  height: 48,
  borderRadius: 8,
  backgroundColor: '#f8f9fa',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 12,
});

const RetakeText = styled.Text({
  fontSize: 16,
  color: '#666666',
  marginLeft: 8,
  fontWeight: '500',
});

const EditButton = styled(TouchableOpacity)({
  flex: 1,
  height: 48,
  borderRadius: 8,
  backgroundColor: '#2d2d2d',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
});

const EditText = styled.Text({
  fontSize: 16,
  color: '#ffffff',
  marginLeft: 8,
  fontWeight: '600',
});

const ErrorContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
});

const ErrorText = styled.Text({
  fontSize: 16,
  color: '#ffffff',
  textAlign: 'center',
  marginBottom: 8,
});

const LoadingOverlay = styled.View({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
});

const LoadingText = styled.Text({
  fontSize: 16,
  color: '#ffffff',
  marginTop: 16,
});
