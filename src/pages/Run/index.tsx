import { useRef, useCallback } from 'react';
import { Text, BackHandler } from 'react-native';
import styled from '@emotion/native';
import {
  ArrowLeft,
  LocateFixed,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LoadingOverlay, ErrorOverlay } from '@/components/Overlay';
import type { TabParamList } from '@/types/navigation.types';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useLocationManager } from '@/hooks/useLocationManager';
import { useRunStats } from '@/hooks/useRunStats';
import { useRunModals } from '@/hooks/useRunModals';
import { useCourseTopologyApi } from '@/hooks/api/useCourseTopologyApi';
import { useCourseValidation } from '@/hooks/useCourseValidation';
import useRunStore from '@/store/run';
import RunMap from './_components/RunMap';
import StatsContainer from './_components/StatsContainer';
import ControlContainer from './_components/ControlContainer';
import Modal from '@/components/Modal';
import Mapbox from '@rnmapbox/maps';
import FloatingButton from '@/components/FloatingButton';

type Props = NativeStackScreenProps<TabParamList, 'Run'>;

export default function Run({ route, navigation }: Props) {
  const courseId = route.params?.courseId;

  const { routeCoordinates, isTracking, resetLocationTracking } =
    useLocationTracking();
  const { location, errorMsg, flyToCurrentUserLocation } = useLocationManager();
  const cameraRef = useRef<Mapbox.Camera>(null!);
  const mapRef = useRef<Mapbox.MapView>(null);

  const {
    loading,
    savingRecord,
    topologyError,
    saveError,
    resetRunState,
    startTime,
  } = useRunStore();

  useRunStats(routeCoordinates, isTracking);
  const { loadCourseTopology } = useCourseTopologyApi(courseId);

  // 코스 검증 훅
  const {
    isOnCourse,
    courseDeviation,
    isDeviating,
    deviationSeverity,
    distanceFromCourse,
  } = useCourseValidation({
    validationOptions: {
      tolerance: 5, // 5미터 허용 오차 (매우 엄격하게)
      enableDistanceCalculation: true,
    },
    enableRealTimeValidation: true, // 실시간 검증 활성화
    validationInterval: 1000, // 1초마다 검증 (매우 자주)
  });

  const {
    showExitModal,
    showBackModal,
    handleBackPress,
    handleConfirmBack,
    handleCancelBack,
    handleCancelExit,
    handleRetryExit,
    handleConfirmExit,
  } = useRunModals({ navigation, mapRef, cameraRef, courseId });

  useFocusEffect(
    useCallback(() => {
      resetLocationTracking();
      resetRunState();
      // 같은 courseId로 다시 진입할 때도 경로 데이터를 다시 로드
      if (courseId) {
        loadCourseTopology();
      }
    }, [resetLocationTracking, resetRunState, courseId, loadCourseTopology]),
  );

  // 하드웨어 뒤로가기 버튼 제어
  useFocusEffect(
    useCallback(() => {
      const handleHardwareBackPress = () => {
        handleBackPress();
        return true; // 기본 뒤로가기 동작을 막음
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        handleHardwareBackPress,
      );

      return () => subscription.remove();
    }, [handleBackPress]),
  );

  const handleCurrentLocationPress = () => {
    flyToCurrentUserLocation(cameraRef);
  };

  // 코스 이탈 상태에 따른 메시지 생성
  const getDeviationMessage = () => {
    if (!isDeviating) return null;

    const distance = distanceFromCourse ? Math.round(distanceFromCourse) : 0;

    switch (deviationSeverity) {
      case 'high':
        return `경로에서 ${distance}m 이탈했습니다. 경로로 돌아가세요.`;
      case 'medium':
        return `경로에서 ${distance}m 벗어났습니다.`;
      case 'low':
        return `경로 근처에서 ${distance}m 떨어져 있습니다.`;
      default:
        return '경로를 벗어났습니다.';
    }
  };

  return (
    <StyledPage>
      <StyledContainer>
        {errorMsg ? (
          <Text>{errorMsg}</Text>
        ) : location ? (
          <>
            <RunMap mapRef={mapRef} cameraRef={cameraRef} />
            {loading && <LoadingOverlay message="경로 정보를 불러오는 중..." />}
            {topologyError && (
              <ErrorOverlay
                message={topologyError}
                onRetry={loadCourseTopology}
              />
            )}
            {/* 코스 이탈 알림 */}
            {isDeviating && (
              <DeviationOverlay severity={deviationSeverity}>
                <DeviationAlert severity={deviationSeverity}>
                  <AlertTriangle size={24} color="#ffffff" />
                  <DeviationText>{getDeviationMessage()}</DeviationText>
                </DeviationAlert>
              </DeviationOverlay>
            )}
            {/* 코스 내부 상태 표시 */}
            {isOnCourse && !isDeviating && (
              <OnCourseIndicator>
                <CheckCircle size={16} color="#10b981" />
                <OnCourseText>경로 내부</OnCourseText>
              </OnCourseIndicator>
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
          zIndex: 999,
        }}
      />
      <FloatingButton
        icon={LocateFixed}
        onPress={handleCurrentLocationPress}
        style={{
          position: 'absolute',
          top: 60,
          right: 20,
          zIndex: 999,
        }}
      />
      <Modal
        visible={showExitModal}
        title={saveError ? '저장 실패' : '종료하시겠습니까?'}
        message={
          saveError
            ? saveError
            : !startTime || routeCoordinates.length === 0
              ? '저장할 데이터가 없습니다. 종료하시겠습니까?'
              : '현재 트래킹을 종료하면 기록된 경로가 삭제됩니다.'
        }
        onCancel={handleCancelExit}
        onConfirm={saveError ? handleRetryExit : handleConfirmExit}
        cancelText="취소"
        confirmText={saveError ? '재시도' : '종료'}
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

const DeviationOverlay = styled.View<{ severity: 'low' | 'medium' | 'high' }>(
  ({ severity }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor:
      severity === 'high'
        ? 'rgba(239, 68, 68, 0.15)' // 빨간색 오버레이
        : severity === 'medium'
          ? 'rgba(245, 158, 11, 0.1)' // 주황색 오버레이
          : 'rgba(59, 130, 246, 0.05)', // 파란색 오버레이
    zIndex: 999,
    pointerEvents: 'none', // 터치 이벤트 통과
  }),
);

const DeviationAlert = styled.View<{ severity: 'low' | 'medium' | 'high' }>(
  ({ severity }) => ({
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor:
      severity === 'high'
        ? '#ef4444'
        : severity === 'medium'
          ? '#f59e0b'
          : '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  }),
);

const DeviationText = styled.Text({
  color: '#ffffff',
  fontSize: 16,
  fontWeight: '700',
  marginLeft: 12,
  flex: 1,
  textAlign: 'center',
});

const OnCourseIndicator = styled.View({
  position: 'absolute',
  top: 100,
  right: 20,
  backgroundColor: '#ffffff',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 20,
  flexDirection: 'row',
  alignItems: 'center',
  zIndex: 1000,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.2,
  shadowRadius: 2,
  elevation: 3,
});

const OnCourseText = styled.Text({
  color: '#10b981',
  fontSize: 12,
  fontWeight: '600',
  marginLeft: 4,
});
