import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Share, ArrowLeft, Home, Upload } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from '@emotion/native';
import { useCameraPermission, Camera } from 'react-native-vision-camera';
import { PermissionsAndroid, Platform, Linking } from 'react-native';

import Header from '@/components/Header';
import CameraComponent from '@/components/Camera';
import { formatDistance, formatTime, formatPace } from '@/utils/formatters';
import type { RunTabStackParamList } from '@/types/navigation.types';

type Props = NativeStackScreenProps<RunTabStackParamList, 'RunDetail'>;

export default function RunDetail({ route, navigation }: Props) {
  const { recordId, imageUrl, path, stats } = route.params;
  const insets = useSafeAreaInsets();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraPermissionChecked, setCameraPermissionChecked] = useState(false);

  const { hasPermission: hasCameraPermission } = useCameraPermission();

  const requestNativeCameraPermission = async () => {
    console.log('📷 [RunDetail] 네이티브 카메라 권한 요청 시작');

    if (Platform.OS === 'android') {
      try {
        console.log('📷 [RunDetail] Android 권한 요청 중...');
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: '카메라 권한',
            message: '인증사진 촬영을 위해 카메라 권한이 필요합니다.',
            buttonNeutral: '나중에',
            buttonNegative: '취소',
            buttonPositive: '확인',
          },
        );
        console.log('📷 [RunDetail] Android 권한 요청 결과:', granted);

        if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          console.log('📷 [RunDetail] 권한이 영구적으로 거부됨');
          Alert.alert(
            '카메라 권한 필요',
            '카메라 권한이 거부되었습니다. 설정 > 앱 > Runova > 권한에서 카메라 권한을 허용해주세요.',
            [
              { text: '취소', style: 'cancel' },
              {
                text: '설정으로 이동',
                onPress: () => {
                  console.log('📷 [RunDetail] 설정 앱으로 이동');
                  Linking.openSettings();
                },
              },
            ],
          );
          return false;
        }

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (error) {
        console.error('📷 [RunDetail] Android 카메라 권한 요청 실패:', error);
        return false;
      }
    } else {
      try {
        console.log('📷 [RunDetail] iOS 권한 요청 중...');
        const permission = await Camera.requestCameraPermission();
        console.log('📷 [RunDetail] iOS 권한 요청 결과:', permission);

        if (permission === 'denied') {
          Alert.alert(
            '카메라 권한 필요',
            '카메라 권한이 거부되었습니다. 설정 > 개인정보 보호 및 보안 > 카메라에서 Runova 앱의 카메라 권한을 허용해주세요.',
            [
              { text: '취소', style: 'cancel' },
              {
                text: '설정으로 이동',
                onPress: () => {
                  console.log('📷 [RunDetail] 설정 앱으로 이동');
                  Linking.openSettings();
                },
              },
            ],
          );
        }

        return permission === 'granted';
      } catch (error) {
        console.error('📷 [RunDetail] iOS 카메라 권한 요청 실패:', error);
        return false;
      }
    }
  };

  useEffect(() => {
    const checkCameraPermission = async () => {
      console.log(
        '📷 [RunDetail] 카메라 권한 확인 시작, hasCameraPermission:',
        hasCameraPermission,
      );
      console.log('📷 [RunDetail] Platform.OS:', Platform.OS);

      if (Platform.OS === 'android') {
        try {
          const currentPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.CAMERA,
          );
          console.log(
            '📷 [RunDetail] Android 현재 카메라 권한 상태:',
            currentPermission,
          );
        } catch (error) {
          console.error('📷 [RunDetail] 권한 상태 확인 실패:', error);
        }
      }

      if (!hasCameraPermission) {
        console.log('📷 [RunDetail] 카메라 권한 없음, 권한 요청 시작');
        const granted = await requestNativeCameraPermission();
        console.log('📷 [RunDetail] 권한 요청 최종 결과:', granted);
      } else {
        console.log('📷 [RunDetail] 카메라 권한 이미 있음');
      }

      console.log('📷 [RunDetail] 카메라 권한 확인 완료');
      setCameraPermissionChecked(true);
    };

    checkCameraPermission();
  }, [hasCameraPermission]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleHomePress = () => {
    // RunTabNavigator 내에서 QuickStartMain으로 직접 이동
    navigation.reset({
      index: 0,
      routes: [{ name: 'QuickStartMain' }],
    });
  };

  const handleSharePress = () => {
    Alert.alert('공유', '런닝 기록을 공유합니다.');
  };

  const handleCameraPress = async () => {
    console.log('📷 [RunDetail] 인증사진 찍기 버튼 클릭');

    if (!cameraPermissionChecked) {
      console.log('📷 [RunDetail] 카메라 권한 확인 중...');
      Alert.alert('카메라 권한 확인 중', '잠시만 기다려주세요.');
      return;
    }

    if (!hasCameraPermission) {
      console.log('📷 [RunDetail] 카메라 권한 없음, 권한 요청 시작');
      const granted = await requestNativeCameraPermission();
      console.log('📷 [RunDetail] 권한 요청 결과:', granted);

      if (!granted) {
        console.log('📷 [RunDetail] 권한 거부됨');
        Alert.alert(
          '카메라 권한 필요',
          '인증사진 촬영을 위해 카메라 권한이 필요합니다.',
        );
        return;
      }
    }

    console.log('📷 [RunDetail] 카메라 모달 열기');
    setShowCamera(true);
  };

  const handlePhotoTaken = (photoUri: string) => {
    setShowCamera(false);
    navigation.navigate('PhotoEdit', {
      photoUri,
      recordId,
      path,
      stats,
    });
  };

  const handleCameraClose = () => {
    setShowCamera(false);
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

      <Modal
        visible={showCamera}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <CameraComponent
          onPhotoTaken={handlePhotoTaken}
          onClose={handleCameraClose}
        />
      </Modal>
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
