import { useCallback } from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TabParamList } from '@/types/navigation.types';
import useRunStore from '@/store/run';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useRunApi } from '@/hooks/api/useRunApi';
import type { RunningRecordRequest } from '@/types/run.types';
import type { AxiosErrorResponse } from '@/types/api.types';

type Props = {
  navigation: NativeStackNavigationProp<TabParamList, 'Run'>;
};

export function useRunModals({ navigation }: Props) {
  const {
    showExitModal,
    showBackModal,
    setModal,
    setError,
    setUI,
    resetRunState,
    startTime,
    stats,
  } = useRunStore();

  const { routeCoordinates, resetLocationTracking } = useLocationTracking();
  const { saveRunningRecord } = useRunApi();

  const handleBackPress = useCallback(() => {
    setModal('back');
  }, [setModal]);

  const handleConfirmBack = useCallback(() => {
    resetLocationTracking();
    resetRunState();
    navigation.goBack();
  }, [resetLocationTracking, resetRunState, navigation]);

  const handleCancelBack = useCallback(() => {
    setModal(null);
  }, [setModal]);

  const handleCancelExit = useCallback(() => {
    setModal(null);
    setError('save', null);
  }, [setModal, setError]);

  const handleConfirmExit = useCallback(async () => {
    if (!startTime) {
      resetLocationTracking();
      resetRunState();
      return;
    }

    try {
      setUI({ savingRecord: true });
      setError('save', null);

      const endTime = new Date();

      if (routeCoordinates.length === 0) {
        throw new Error('저장할 경로 데이터가 없습니다.');
      }

      const path: [number, number][] = routeCoordinates.map(
        (coord) => [coord[0], coord[1]] as [number, number],
      );

      const paceValue = parseFloat(stats.pace.replace(/[^\d.]/g, '')) || 0;

      if (!startTime || !endTime) {
        throw new Error('시작 시간 또는 종료 시간이 없습니다.');
      }

      if (endTime <= startTime) {
        throw new Error('종료 시간이 시작 시간보다 이전입니다.');
      }

      const runningRecord: RunningRecordRequest = {
        path,
        startAt: startTime,
        endAt: endTime,
        pace: Math.max(0, paceValue),
        calories: Math.max(0, stats.calories),
      };

      await saveRunningRecord(runningRecord);

      resetLocationTracking();
      resetRunState();
      navigation.goBack();
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
    resetLocationTracking,
    resetRunState,
    saveRunningRecord,
    navigation,
  ]);

  return {
    showExitModal,
    showBackModal,
    handleBackPress,
    handleConfirmBack,
    handleCancelBack,
    handleCancelExit,
    handleConfirmExit,
  };
}
