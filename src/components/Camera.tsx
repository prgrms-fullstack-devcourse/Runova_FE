import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Linking,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCameraPermission,
  useMicrophonePermission,
} from 'react-native-vision-camera';
import { X, Camera as CameraIcon, RotateCcw } from 'lucide-react-native';
import styled from '@emotion/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CameraComponentProps {
  onPhotoTaken: (photoUri: string) => void;
  onClose: () => void;
}

export default function CameraComponent({
  onPhotoTaken,
  onClose,
}: CameraComponentProps) {
  const devices = useCameraDevices();
  const camera = useRef<Camera>(null);
  const insets = useSafeAreaInsets();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentCameraPosition, setCurrentCameraPosition] = useState<
    'back' | 'front'
  >('back');

  // 현재 선택된 카메라 위치에 따라 디바이스 선택
  const device =
    devices.find((d) => d.position === currentCameraPosition) || devices[0];

  const { hasPermission: hasCameraPermission } = useCameraPermission();
  const { hasPermission: hasMicrophonePermission } = useMicrophonePermission();

  // 네이티브 카메라 권한 요청 함수
  const requestNativeCameraPermission = async () => {
    console.log('📷 [Camera] 네이티브 카메라 권한 요청 시작');

    if (Platform.OS === 'android') {
      try {
        console.log('📷 [Camera] Android 권한 요청 중...');
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
        console.log('📷 [Camera] Android 권한 요청 결과:', granted);

        if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          console.log('📷 [Camera] 권한이 영구적으로 거부됨');
          Alert.alert(
            '카메라 권한 필요',
            '카메라 권한이 거부되었습니다. 설정 > 앱 > Runova > 권한에서 카메라 권한을 허용해주세요.',
            [
              { text: '취소', style: 'cancel' },
              {
                text: '설정으로 이동',
                onPress: () => {
                  // 설정 앱으로 이동 (Android)
                  console.log('📷 [Camera] 설정 앱으로 이동');
                  Linking.openSettings();
                },
              },
            ],
          );
          return false;
        }

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (error) {
        console.error('📷 [Camera] Android 카메라 권한 요청 실패:', error);
        return false;
      }
    } else {
      // iOS는 react-native-vision-camera 사용
      try {
        console.log('📷 [Camera] iOS 권한 요청 중...');
        const permission = await Camera.requestCameraPermission();
        console.log('📷 [Camera] iOS 권한 요청 결과:', permission);

        if (permission === 'denied') {
          Alert.alert(
            '카메라 권한 필요',
            '카메라 권한이 거부되었습니다. 설정 > 개인정보 보호 및 보안 > 카메라에서 Runova 앱의 카메라 권한을 허용해주세요.',
            [
              { text: '취소', style: 'cancel' },
              {
                text: '설정으로 이동',
                onPress: () => {
                  // 설정 앱으로 이동 (iOS)
                  console.log('📷 [Camera] 설정 앱으로 이동');
                  Linking.openSettings();
                },
              },
            ],
          );
        }

        return permission === 'granted';
      } catch (error) {
        console.error('📷 [Camera] iOS 카메라 권한 요청 실패:', error);
        return false;
      }
    }
  };

  useEffect(() => {
    const initializeCamera = async () => {
      console.log(
        '📷 [Camera] 카메라 초기화 시작, hasCameraPermission:',
        hasCameraPermission,
      );
      console.log('📷 [Camera] 현재 카메라 위치:', currentCameraPosition);
      console.log('📷 [Camera] 사용 가능한 카메라 디바이스:', devices);
      console.log('📷 [Camera] 선택된 카메라:', device);

      if (!hasCameraPermission) {
        console.log('📷 [Camera] 카메라 권한 없음, 권한 요청 시작');
        const granted = await requestNativeCameraPermission();
        console.log('📷 [Camera] 권한 요청 결과:', granted);

        if (!granted) {
          console.log('📷 [Camera] 권한 거부됨, 카메라 닫기');
          Alert.alert('권한 필요', '카메라 권한이 필요합니다.', [
            { text: '확인', onPress: onClose },
          ]);
          return;
        }
      }

      if (!hasMicrophonePermission) {
        console.log('📷 [Camera] 마이크 권한 요청 중...');
        await Camera.requestMicrophonePermission();
      }

      // 카메라 디바이스가 있는지 확인 (약간의 지연 후)
      setTimeout(() => {
        const currentDevice =
          devices.find((d) => d.position === currentCameraPosition) ||
          devices[0];
        console.log('📷 [Camera] 지연 후 카메라 디바이스 확인:', currentDevice);
        console.log('📷 [Camera] 현재 카메라 위치:', currentCameraPosition);
        console.log('📷 [Camera] 선택된 디바이스 ID:', currentDevice?.id);
        console.log('📷 [Camera] 선택된 디바이스 이름:', currentDevice?.name);

        if (!currentDevice) {
          console.log('📷 [Camera] 카메라 디바이스를 찾을 수 없음');
          Alert.alert(
            '카메라 오류',
            '카메라를 찾을 수 없습니다. 앱을 재시작해주세요.',
            [{ text: '확인', onPress: onClose }],
          );
          return;
        }

        console.log(
          '📷 [Camera] 카메라 준비 완료 - 위치:',
          currentCameraPosition,
        );
        setIsReady(true);
      }, 500); // 0.5초로 단축
    };

    initializeCamera();
  }, [
    hasCameraPermission,
    hasMicrophonePermission,
    onClose,
    devices,
    currentCameraPosition,
  ]);

  const toggleCamera = () => {
    const newPosition = currentCameraPosition === 'back' ? 'front' : 'back';
    console.log(
      '📷 [Camera] 카메라 전환 버튼 클릭:',
      currentCameraPosition,
      '->',
      newPosition,
    );

    // 카메라 전환 시 isReady를 false로 설정하여 재초기화
    setIsReady(false);
    setCurrentCameraPosition(newPosition);

    console.log('📷 [Camera] 카메라 위치 상태 업데이트 완료:', newPosition);
  };

  const takePhoto = async () => {
    if (!camera.current || isCapturing) return;

    try {
      setIsCapturing(true);
      console.log('📷 [Camera] 사진 촬영 시작');

      const photo = await camera.current.takePhoto({
        flash: 'off',
      });

      console.log('📷 [Camera] 사진 촬영 완료:', photo);
      console.log('📷 [Camera] 사진 경로:', photo.path);

      // file:// 프로토콜 추가
      const photoUri = `file://${photo.path}`;
      console.log('📷 [Camera] 최종 사진 URI:', photoUri);

      onPhotoTaken(photoUri);
    } catch (error) {
      console.error('📷 [Camera] 사진 촬영 실패:', error);
      Alert.alert('오류', '사진 촬영에 실패했습니다.');
    } finally {
      setIsCapturing(false);
    }
  };

  if (!isReady) {
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
        isActive={isReady}
        photo={true}
        enableZoomGesture={true}
        enableFpsGraph={false}
      />

      <TopControls safeAreaTop={insets.top}>
        <CloseButton onPress={onClose}>
          <X size={24} color="#ffffff" />
        </CloseButton>
      </TopControls>

      <BottomControls safeAreaBottom={insets.bottom}>
        <ToggleButton onPress={toggleCamera}>
          <RotateCcw size={24} color="#ffffff" />
        </ToggleButton>

        <CaptureButton onPress={takePhoto} disabled={isCapturing}>
          {isCapturing ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <CameraIcon size={32} color="#ffffff" />
          )}
        </CaptureButton>

        <PlaceholderView />
      </BottomControls>
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

const TopControls = styled.View<{ safeAreaTop: number }>(({ safeAreaTop }) => ({
  position: 'absolute',
  top: safeAreaTop + 16,
  left: 16,
  right: 16,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const CloseButton = styled(TouchableOpacity)({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
});

const BottomControls = styled.View<{ safeAreaBottom: number }>(
  ({ safeAreaBottom }) => ({
    position: 'absolute',
    bottom: safeAreaBottom + 32,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
  }),
);

const ToggleButton = styled(TouchableOpacity)({
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
});

const CaptureButton = styled(TouchableOpacity)({
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: '#ffffff',
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 4,
  borderColor: '#ffffff',
});

const PlaceholderView = styled.View({
  width: 50,
  height: 50,
});
