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
import { Share, Home, Upload } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from '@emotion/native';
import { useCameraPermission, Camera } from 'react-native-vision-camera';
import { PermissionsAndroid, Platform, Linking } from 'react-native';

import Header from '@/components/Header';
import CameraComponent from '@/components/Camera';
import {
  formatDistance,
  formatTime,
  formatPace,
  formatNumber,
} from '@/utils/formatters';
import { COLOR_TOKENS } from '@/constants/colors';
import type { RunTabStackParamList } from '@/types/navigation.types';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<RunTabStackParamList, 'RunDetail'>;

export default function RunDetail({ route, navigation }: Props) {
  const { recordId, imageUrl, path, stats, startAt, endAt } = route.params;
  const insets = useSafeAreaInsets();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraPermissionChecked, setCameraPermissionChecked] = useState(false);

  const { hasPermission: hasCameraPermission } = useCameraPermission();

  const requestNativeCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
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

        if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            '카메라 권한 필요',
            '카메라 권한이 거부되었습니다. 설정 > 앱 > Runova > 권한에서 카메라 권한을 허용해주세요.',
            [
              { text: '취소', style: 'cancel' },
              {
                text: '설정으로 이동',
                onPress: () => {
                  Linking.openSettings();
                },
              },
            ],
          );
          return false;
        }

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (error) {
        return false;
      }
    } else {
      try {
        const permission = await Camera.requestCameraPermission();

        if (permission === 'denied') {
          Alert.alert(
            '카메라 권한 필요',
            '카메라 권한이 거부되었습니다. 설정 > 개인정보 보호 및 보안 > 카메라에서 Runova 앱의 카메라 권한을 허용해주세요.',
            [
              { text: '취소', style: 'cancel' },
              {
                text: '설정으로 이동',
                onPress: () => {
                  Linking.openSettings();
                },
              },
            ],
          );
        }

        return permission === 'granted';
      } catch (error) {
        return false;
      }
    }
  };

  useEffect(() => {
    const checkCameraPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const currentPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.CAMERA,
          );
        } catch (error) {
          console.error('📷 [RunDetail] 권한 상태 확인 실패:', error);
        }
      }
      setCameraPermissionChecked(true);
    };

    checkCameraPermission();
  }, [hasCameraPermission]);

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
    if (!cameraPermissionChecked) {
      Alert.alert('카메라 권한 확인 중', '잠시만 기다려주세요.');
      return;
    }

    if (!hasCameraPermission) {
      const granted = await requestNativeCameraPermission();

      if (!granted) {
        Alert.alert(
          '카메라 권한 필요',
          '인증사진 촬영을 위해 카메라 권한이 필요합니다.',
        );
        return;
      }
    }

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

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
  };

  return (
    <Container>
      <Header leftIcon={Home} onLeftPress={handleHomePress} title="런닝 기록" />

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
              <ActivityIndicator
                size="large"
                color={COLOR_TOKENS.primary[500]}
              />
            </LoadingImageContainer>
          )}
        </ImageContainer>

        <StatsContainer>
          <StatsTitle>런닝 통계</StatsTitle>

          <StatsGrid>
            <StatItem>
              <StatLabel>거리</StatLabel>
              <StatValue>{formatDistance(stats.distance)}</StatValue>
            </StatItem>

            <StatItem>
              <StatLabel>시간</StatLabel>
              <StatValue>{stats.runningTime}</StatValue>
            </StatItem>

            <StatItem>
              <StatLabel>평균 페이스</StatLabel>
              <StatValue>{formatPace(stats.pace)}</StatValue>
            </StatItem>

            <StatItem>
              <StatLabel>칼로리</StatLabel>
              <StatValue>{formatNumber(stats.calories)}kcal</StatValue>
            </StatItem>
          </StatsGrid>
        </StatsContainer>

        {/* 런닝 정보 */}
        <RunInfoContainer>
          <RunInfoTitle>런닝 정보</RunInfoTitle>

          <RunInfoItem>
            <RunInfoLabel>시작 시간</RunInfoLabel>
            <RunInfoValue>
              {startAt ? formatDateTime(startAt) : '정보 없음'}
            </RunInfoValue>
          </RunInfoItem>

          <RunInfoItem>
            <RunInfoLabel>종료 시간</RunInfoLabel>
            <RunInfoValue>
              {endAt ? formatDateTime(endAt) : '정보 없음'}
            </RunInfoValue>
          </RunInfoItem>
        </RunInfoContainer>
      </ScrollView>

      <BottomContainer>
        <UploadButton onPress={handleCameraPress} activeOpacity={0.8}>
          <UploadButtonGradient
            colors={['#1a1a1a', '#2d2d2d', '#404040']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <UploadButtonContent>
            <Upload size={24} color="#ffffff" />
            <UploadText>인증사진 찍기</UploadText>
          </UploadButtonContent>
        </UploadButton>
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
  height: 400,
  backgroundColor: COLOR_TOKENS.gray[100],
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
  backgroundColor: COLOR_TOKENS.gray[100],
});

const FallbackText = styled.Text({
  fontSize: 16,
  color: COLOR_TOKENS.gray[500],
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
  backgroundColor: COLOR_TOKENS.gray[100],
});

const StatsContainer = styled.View({
  padding: 20,
  backgroundColor: '#ffffff',
});

const StatsTitle = styled.Text({
  fontSize: 20,
  fontWeight: '700',
  color: COLOR_TOKENS.gray[900],
  marginBottom: 16,
});

const StatsGrid = styled.View({
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 16,
});

const StatItem = styled.View({
  flex: 1,
  minWidth: '45%',
  backgroundColor: COLOR_TOKENS.gray[50],
  padding: 16,
  borderRadius: 12,
  alignItems: 'center',
});

const StatLabel = styled.Text({
  fontSize: 14,
  color: COLOR_TOKENS.gray[600],
  marginBottom: 4,
});

const StatValue = styled.Text({
  fontSize: 18,
  fontWeight: '700',
  color: COLOR_TOKENS.gray[900],
});

const BottomContainer = styled.View({
  padding: 20,
  backgroundColor: '#ffffff',
});

const UploadButton = styled.TouchableOpacity({
  height: 56,
  borderRadius: 8,
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
});

const UploadButtonGradient = styled(LinearGradient)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: 8,
});

const UploadButtonContent = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  zIndex: 1,
});

const UploadText = styled.Text({
  color: '#ffffff',
  fontSize: 16,
  fontWeight: '600',
});

const RunInfoContainer = styled.View({
  padding: 20,
  backgroundColor: '#ffffff',
});

const RunInfoTitle = styled.Text({
  fontSize: 18,
  fontWeight: '700',
  color: COLOR_TOKENS.gray[900],
  marginBottom: 16,
});

const RunInfoItem = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: COLOR_TOKENS.gray[100],
});

const RunInfoLabel = styled.Text({
  fontSize: 16,
  color: COLOR_TOKENS.gray[600],
});

const RunInfoValue = styled.Text({
  fontSize: 16,
  fontWeight: '600',
  color: COLOR_TOKENS.gray[900],
});
