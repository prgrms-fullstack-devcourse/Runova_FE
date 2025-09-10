import { useRef, useCallback } from 'react';
import { Text } from 'react-native';
import styled from '@emotion/native';
import { ArrowLeft, LocateFixed } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TabParamList } from '@/types/navigation.types';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useLocationManager } from '@/hooks/useLocationManager';
import { useRunStats } from '@/hooks/useRunStats';
import { useRunModals } from '@/hooks/useRunModals';
import { useCourseTopologyApi } from '@/hooks/api/useCourseTopologyApi';
import useRunStore from '@/store/run';
import RunMap from './_components/RunMap';
import StatsContainer from './_components/StatsContainer';
import ControlContainer from './_components/ControlContainer';
import Modal from '@/components/Modal';
import FloatingButton from '@/components/FloatingButton';
import { LoadingOverlay, ErrorOverlay } from '@/components/Overlay';

type Props = NativeStackScreenProps<TabParamList, 'Run'>;

export default function Run({ route, navigation }: Props) {
  const courseId = route.params?.courseId;

  const { routeCoordinates, isTracking, resetLocationTracking } =
    useLocationTracking();
  const { location, errorMsg, flyToCurrentUserLocation } = useLocationManager();
  const cameraRef = useRef<any>(null);

  const { loading, savingRecord, topologyError, saveError, resetRunState } =
    useRunStore();

  useFocusEffect(
    useCallback(() => {
      console.log('🔄 [DEBUG] Run 화면 포커스 - 상태 초기화 시작');
      resetLocationTracking();
      resetRunState();
      console.log('✅ [DEBUG] Run 화면 포커스 - 상태 초기화 완료');
    }, [resetLocationTracking, resetRunState]),
  );

  useRunStats(routeCoordinates, isTracking);
  const { loadCourseTopology } = useCourseTopologyApi(courseId);

  const {
    showExitModal,
    showBackModal,
    handleBackPress,
    handleConfirmBack,
    handleCancelBack,
    handleCancelExit,
    handleConfirmExit,
  } = useRunModals({ navigation });

  const handleCurrentLocationPress = () => {
    flyToCurrentUserLocation(cameraRef);
  };

  return (
    <StyledPage>
      <StyledContainer>
        {errorMsg ? (
          <Text>{errorMsg}</Text>
        ) : location ? (
          <>
            <RunMap cameraRef={cameraRef} />
            {loading && <LoadingOverlay message="경로 정보를 불러오는 중..." />}
            {topologyError && (
              <ErrorOverlay
                message={topologyError}
                onRetry={loadCourseTopology}
              />
            )}
          </>
        ) : (
          <Text>Getting location...</Text>
        )}
      </StyledContainer>
      <StatsContainer />
      <ControlContainer />
      <FloatingButton
        icon={ArrowLeft}
        onPress={handleBackPress}
        style={{
          position: 'absolute',
          top: 60,
          left: 20,
          zIndex: 1000,
        }}
      />
      <FloatingButton
        icon={LocateFixed}
        onPress={handleCurrentLocationPress}
        style={{
          position: 'absolute',
          top: 60,
          right: 20,
          zIndex: 1000,
        }}
      />
      <Modal
        visible={showExitModal}
        title="종료하시겠습니까?"
        message={
          saveError
            ? saveError
            : '현재 트래킹을 종료하면 기록된 경로가 삭제됩니다.'
        }
        onCancel={handleCancelExit}
        onConfirm={handleConfirmExit}
        cancelText="취소"
        confirmText="종료"
        loading={savingRecord}
        disabled={savingRecord}
      />
      <Modal
        visible={showBackModal}
        title="뒤로가기"
        message="현재 트래킹을 중단하고 이전 화면으로 돌아가시겠습니까? 기록된 데이터는 모두 삭제됩니다."
        onCancel={handleCancelBack}
        onConfirm={handleConfirmBack}
        cancelText="취소"
        confirmText="돌아가기"
      />
    </StyledPage>
  );
}

const StyledPage = styled.View(({ theme }) => ({
  flex: 1,
  backgroundColor: theme.colors.gray[100],
}));

const StyledContainer = styled.View({
  flex: 1,
  width: '100%',
});
