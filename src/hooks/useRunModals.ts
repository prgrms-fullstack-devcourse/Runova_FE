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
  navigation: any; // RootStackParamList와 TabParamList 모두 지원
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

    // 코스 선택 시 최소 이동 거리 체크
    if (courseId && routeCoordinates.length < 2) {
      Toast.show({
        type: 'error',
        text1: '저장 불가',
        text2:
          '선택한 코스와 실제 러닝 경로가 많이 다릅니다. 코스를 따라 달려보세요.',
      });
      cleanupAndGoBack();
      return;
    }

    try {
      setUI({ savingRecord: true });
      setError('save', null);

      const endTime = new Date();

      // const path: [number, number][] = routeCoordinates.map((coord) => [
      //   coord[0],
      //   coord[1],
      // ]);
      const path: [number, number][] = [
        [127.079519, 37.669466],
        [127.079447, 37.66938],
        [127.079413, 37.669341],
        [127.079349, 37.669272],
        [127.079273, 37.669183],
        [127.079161, 37.669053],
        [127.078931, 37.668786],
        [127.079118, 37.668625],
        [127.079293, 37.668632],
        [127.07938, 37.668546],
        [127.079303, 37.668445],
        [127.079125, 37.668211],
        [127.078955, 37.667987],
        [127.078802, 37.667786],
        [127.078643, 37.667577],
        [127.078554, 37.667459],
        [127.078455, 37.667508],
        [127.078381, 37.667402],
        [127.07824, 37.667203],
        [127.07813, 37.667047],
        [127.078024, 37.666895],
        [127.077835, 37.666627],
        [127.077993, 37.666548],
        [127.078168, 37.66646],
        [127.078094, 37.666366],
        [127.077958, 37.666193],
        [127.077842, 37.666046],
        [127.07775, 37.665929],
        [127.077647, 37.665787],
        [127.077549, 37.665649],
        [127.077441, 37.665499],
        [127.07731, 37.665323],
        [127.077174, 37.665143],
        [127.076922, 37.664806],
        [127.076709, 37.66451],
        [127.07603, 37.66484],
        [127.075637, 37.66489],
        [127.075587, 37.664215],
        [127.075582, 37.664136],
        [127.07558, 37.664103],
        [127.075578, 37.664073],
        [127.075576, 37.66403],
        [127.075573, 37.663979],
        [127.075569, 37.663902],
        [127.075567, 37.663843],
        [127.075551, 37.663483],
        [127.07597, 37.663237],
        [127.07614, 37.66369],
        [127.07775, 37.665929],
        [127.078744, 37.665828],
        [127.078558, 37.665984],
        [127.078243, 37.666214],
        [127.078542, 37.666673],
        [127.078382, 37.666738],
        [127.078845, 37.667359],
        [127.079439, 37.667491],
        [127.079524, 37.667511],
        [127.079584, 37.667525],
        [127.079613, 37.66753],
      ];

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

      console.log('📤 [useRunModals] 런닝 기록 저장 요청 페이로드:', {
        runningRecord,
        courseId,
        pathLength: path.length,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        pace: paceValue,
        calories: stats.calories,
        imageUrl,
      });

      const response = await saveRunningRecord(runningRecord, courseId);

      console.log('📥 [useRunModals] 런닝 기록 저장 응답:', response);

      Toast.show({
        type: 'success',
        text1: '저장 완료',
        text2: '런닝 기록이 성공적으로 저장되었습니다.',
      });

      // RunDetail 페이지로 이동
      navigation.navigate('RunDetail', {
        recordId: response.id,
        imageUrl,
        stats: {
          distance: stats.distance,
          calories: stats.calories,
          pace: stats.pace,
          runningTime: stats.runningTime,
        },
      });

      // 상태 정리
      resetLocationTracking();
      resetRunState();
      clearCurrentCourse();
    } catch (error: unknown) {
      let errorMessage = '런닝 기록 저장에 실패했습니다.';

      // API 응답 로그 추가
      console.error('🚨 [useRunModals] 런닝 기록 저장 실패:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosErrorResponse;
        const status = axiosError.status;

        console.error('🚨 [useRunModals] API 응답 상태코드:', status);
        console.error('🚨 [useRunModals] API 응답 데이터:', axiosError.data);
        console.error(
          '🚨 [useRunModals] API 응답 상태텍스트:',
          axiosError.statusText,
        );

        if (status === 400) {
          const errorData = axiosError.data;
          if (errorData?.message) {
            errorMessage = `요청 데이터 오류: ${errorData.message}`;
          } else {
            errorMessage = '요청 데이터 형식이 올바르지 않습니다.';
          }
        } else if (status === 401) {
          errorMessage = '로그인이 필요합니다.';
        } else if (status === 409) {
          errorMessage =
            '선택한 코스와 실제 러닝 경로가 많이 다릅니다. 코스를 따라 달려보세요.';
        } else if (status === 500) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        }
      } else if (error instanceof Error) {
        console.error('🚨 [useRunModals] 일반 에러:', error.message);
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
