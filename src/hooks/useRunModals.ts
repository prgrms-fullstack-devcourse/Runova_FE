import { useCallback, useRef } from 'react';
import Toast from 'react-native-toast-message';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RefObject } from 'react';
import type Mapbox from '@rnmapbox/maps';
import type { TabParamList } from '@/types/navigation.types';
import useRunStore from '@/store/run';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useRunApi } from '@/hooks/api/useRunApi';
import { useMapCapture } from '@/hooks/useMapCapture';
import { useImageUpload } from '@/hooks/useImageUpload';
import useAuthStore from '@/store/auth';
import type { RunningRecordRequest } from '@/types/run.types';
import type { AxiosErrorResponse } from '@/types/api.types';

type Props = {
  navigation: NativeStackNavigationProp<TabParamList, 'Run'>;
  mapRef?: RefObject<Mapbox.MapView | null>;
  cameraRef?: RefObject<Mapbox.Camera | null>;
  courseId?: number;
};

export function useRunModals({
  navigation,
  mapRef,
  cameraRef,
  courseId,
}: Props) {
  const {
    showExitModal,
    showBackModal,
    setModal,
    setError,
    setUI,
    resetRunState,
    clearCurrentCourse,
    startTime,
    stats,
  } = useRunStore();

  const { routeCoordinates, resetLocationTracking } = useLocationTracking();
  const { saveRunningRecord } = useRunApi();
  const { accessToken } = useAuthStore();

  const internalMapRef = useRef<Mapbox.MapView | null>(null);
  const internalCameraRef = useRef<Mapbox.Camera | null>(null);

  const finalMapRef = mapRef || internalMapRef;
  const finalCameraRef = cameraRef || internalCameraRef;

  const { captureMap } = useMapCapture(finalMapRef, finalCameraRef);
  const { uploadImage } = useImageUpload();

  const handleBackPress = useCallback(() => {
    setModal('back');
  }, [setModal]);

  // 공통 정리 및 뒤로가기 로직
  const cleanupAndGoBack = useCallback(() => {
    resetLocationTracking();
    resetRunState();
    clearCurrentCourse(); // currentCourseId를 undefined로 초기화
    // courseId 파라미터 초기화
    navigation.setParams({ courseId: undefined });
    navigation.goBack();
  }, [resetLocationTracking, resetRunState, clearCurrentCourse, navigation]);

  const handleConfirmBack = cleanupAndGoBack;

  const handleCancelBack = useCallback(() => {
    setModal(null);
  }, [setModal]);

  const handleCancelExit = useCallback(() => {
    setModal(null);
    setError('save', null);
  }, [setModal, setError]);

  const handleConfirmExit = useCallback(async () => {
    if (!startTime || routeCoordinates.length === 0) {
      cleanupAndGoBack();
      return;
    }

    try {
      setUI({ savingRecord: true });
      setError('save', null);

      const endTime = new Date();

      const path: [number, number][] = routeCoordinates.map((coord) => [
        coord[0],
        coord[1],
      ]);

      const paceValue = stats.pace;

      if (!startTime || !endTime) {
        throw new Error('시작 시간 또는 종료 시간이 없습니다.');
      }

      if (endTime <= startTime) {
        throw new Error('종료 시간이 시작 시간보다 이전입니다.');
      }

      let imageUrl: string | undefined;
      try {
        if (accessToken && routeCoordinates.length > 0) {
          const capturedImageUri = await captureMap(routeCoordinates);

          const publicImageUrl = await uploadImage(
            capturedImageUri,
            accessToken,
          );
          imageUrl = publicImageUrl;
        }
      } catch (imageError) {
        Toast.show({
          type: 'info',
          text1: '이미지 저장 실패',
          text2: '경로 이미지를 저장하지 못했지만, 런닝 기록은 저장되었습니다.',
        });
      }

      const runningRecord: RunningRecordRequest = {
        path,
        startAt: startTime,
        endAt: endTime,
        pace: Math.max(0, paceValue),
        calories: Math.max(0, stats.calories),
        imageUrl,
      };

      await saveRunningRecord(runningRecord, courseId);

      Toast.show({
        type: 'success',
        text1: '저장 완료',
        text2: '런닝 기록이 성공적으로 저장되었습니다.',
      });

      cleanupAndGoBack();
    } catch (error: unknown) {
      let errorMessage = '런닝 기록 저장에 실패했습니다.';

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosErrorResponse;
        const status = axiosError.status;

        if (status === 400) {
          const errorData = axiosError.data;
          if (errorData?.message) {
            errorMessage = `요청 데이터 오류: ${errorData.message}`;
          } else {
            errorMessage = '요청 데이터 형식이 올바르지 않습니다.';
          }
        } else if (status === 401) {
          errorMessage = '로그인이 필요합니다.';
        } else if (status === 500) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError('save', errorMessage);
    } finally {
      setUI({ savingRecord: false });
    }
  }, [
    startTime,
    routeCoordinates,
    stats,
    setUI,
    setError,
    saveRunningRecord,
    accessToken,
    captureMap,
    uploadImage,
    courseId,
    cleanupAndGoBack,
  ]);

  const handleRetryExit = useCallback(() => {
    setError('save', null);
    handleConfirmExit();
  }, [setError, handleConfirmExit]);

  return {
    showExitModal,
    showBackModal,
    handleBackPress,
    handleConfirmBack,
    handleCancelBack,
    handleCancelExit,
    handleRetryExit,
    handleConfirmExit,
  };
}
