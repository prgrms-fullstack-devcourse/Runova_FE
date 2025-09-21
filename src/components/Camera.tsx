import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Linking,
  Dimensions,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useMicrophonePermission,
  useCameraFormat,
} from 'react-native-vision-camera';
import { X, Camera as CameraIcon, RotateCcw } from 'lucide-react-native';
import styled from '@emotion/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

interface CameraComponentProps {
  onPhotoTaken: (photoUri: string) => void;
  onClose: () => void;
}

export default function CameraComponent({
  onPhotoTaken,
  onClose,
}: CameraComponentProps) {
  const camera = useRef<Camera>(null);
  const insets = useSafeAreaInsets();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentCameraPosition, setCurrentCameraPosition] = useState<
    'back' | 'front'
  >('back');

  const device = useCameraDevice(currentCameraPosition);

  const format = useCameraFormat(device, [
    { photoAspectRatio: 1 },
    { photoResolution: 'max' },
  ]);

  const { hasPermission: hasCameraPermission } = useCameraPermission();
  const { hasPermission: hasMicrophonePermission } = useMicrophonePermission();

  const requestNativeCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: '카메라 권한',
            message: '사진 촬영을 위해 카메라 권한이 필요합니다.',
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
    const initializeCamera = async () => {
      if (!hasCameraPermission) {
        const granted = await requestNativeCameraPermission();

        if (!granted) {
          Alert.alert('권한 필요', '카메라 권한이 필요합니다.', [
            { text: '확인', onPress: onClose },
          ]);
          return;
        }
      }

      if (!hasMicrophonePermission) {
        await Camera.requestMicrophonePermission();
      }

      if (!device) {
        Alert.alert(
          '카메라 오류',
          '카메라를 찾을 수 없습니다. 앱을 재시작해주세요.',
          [{ text: '확인', onPress: onClose }],
        );
        return;
      }

      setIsReady(true);
    };

    initializeCamera();
  }, [
    hasCameraPermission,
    hasMicrophonePermission,
    onClose,
    device,
    currentCameraPosition,
  ]);

  const toggleCamera = () => {
    const newPosition = currentCameraPosition === 'back' ? 'front' : 'back';

    setCurrentCameraPosition(newPosition);
  };

  const takePhoto = async () => {
    if (!camera.current || isCapturing) return;

    try {
      setIsCapturing(true);

      const photo = await camera.current.takePhoto({
        flash: 'off',
      });

      const photoUri = `file://${photo.path}`;

      onPhotoTaken(photoUri);
    } catch (error) {
      Alert.alert('오류', '사진 촬영에 실패했습니다.');
    } finally {
      setIsCapturing(false);
    }
  };

  if (!isReady || !device) {
    return (
      <Container>
        <LoadingContainer>
          <ActivityIndicator size="large" color="#ffffff" />
          <LoadingText>카메라를 준비하는 중...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Camera
        ref={camera}
        style={{ flex: 1 }}
        device={device}
        format={format}
        isActive={isReady}
        photo={true}
        enableZoomGesture={true}
        enableFpsGraph={false}
        photoQualityBalance="quality"
        resizeMode="cover"
      />

      <CloseButtonContainer safeAreaTop={insets.top}>
        <CloseButton onPress={onClose}>
          <X size={24} color="#ffffff" />
        </CloseButton>
      </CloseButtonContainer>

      <BottomContainer safeAreaBottom={insets.bottom}>
        <ToggleButton onPress={toggleCamera}>
          <RotateCcw size={24} color="#ffffff" />
        </ToggleButton>

        <CaptureButton onPress={takePhoto} disabled={isCapturing}>
          {isCapturing ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <CameraIcon size={28} color="#000000" />
          )}
        </CaptureButton>

        <PlaceholderView />
      </BottomContainer>
    </Container>
  );
}

const Container = styled.View({
  flex: 1,
  backgroundColor: '#000000',
});

const LoadingContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

const LoadingText = styled.Text({
  color: '#ffffff',
  fontSize: 16,
  marginTop: 16,
});

const CloseButtonContainer = styled.View<{ safeAreaTop: number }>(
  ({ safeAreaTop }) => ({
    position: 'absolute',
    top: safeAreaTop + 20,
    left: 20,
    zIndex: 1,
  }),
);

const CloseButton = styled(TouchableOpacity)({
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  justifyContent: 'center',
  alignItems: 'center',
});

const BottomContainer = styled.View<{ safeAreaBottom: number }>(
  ({ safeAreaBottom }) => ({
    position: 'absolute',
    bottom: safeAreaBottom + 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 50,
  }),
);

const ToggleButton = styled(TouchableOpacity)({
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  justifyContent: 'center',
  alignItems: 'center',
});

const CaptureButton = styled(TouchableOpacity)({
  width: 70,
  height: 70,
  borderRadius: 35,
  backgroundColor: '#ffffff',
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 3,
  borderColor: '#ffffff',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 5,
});

const PlaceholderView = styled.View({
  width: 50,
  height: 50,
});
