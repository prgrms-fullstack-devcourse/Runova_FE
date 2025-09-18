import { useRef, useCallback, useMemo, useEffect } from 'react';
import { Text, View, BackHandler } from 'react-native';
import styled from '@emotion/native';
import { ArrowLeft, AlertTriangle } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LoadingOverlay, ErrorOverlay } from '@/components/Overlay';
import Header from '@/components/Header';
import type { TabParamList } from '@/types/navigation.types';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useRunModals } from '@/hooks/useRunModals';
import { useCourseTopologyApi } from '@/hooks/api/useCourseTopologyApi';
import { useCourseValidation } from '@/hooks/useCourseValidation';
import useRunStore from '@/store/run';
import RunMap from './_components/RunMap';
import StatsContainer from './_components/StatsContainer';
import ControlContainer from './_components/ControlContainer';
import Modal from '@/components/Modal';
import Mapbox from '@rnmapbox/maps';

type Props = NativeStackScreenProps<any, 'Run'>;

export default function Run({ route, navigation }: Props) {
  // 전역 Store에서 현재 코스 데이터 가져오기
  const { currentCourseId, currentCourseData } = useRunStore();
  const courseId = currentCourseId || route.params?.courseId;

  const {
    routeCoordinates,
    isTracking,
    resetLocationTracking,
    location,
    errorMsg,
    locationLoading,
    refreshLocation,
    toggleTracking,
  } = useLocationTracking();

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

  // useRunStats는 StatsContainer에서 처리

  const { loadCourseTopology } = useCourseTopologyApi(courseId);

  // 코스 검증 훅
  const {
    isOnCourse,
    courseDeviation,
    isDeviating,
    deviationSeverity,
    distanceFromCourse,
    validateCurrentLocation,
  } = useCourseValidation({
    courseId,
    validationOptions: {
      tolerance: 5, // 5미터 허용 오차 (매우 엄격하게)
      enableDistanceCalculation: true,
    },
    enableRealTimeValidation: true, // 실시간 검증 활성화
    validationInterval: 1000, // 1초마다 검증
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
  } = useRunModals({
    navigation: navigation as any,
    mapRef,
    cameraRef,
    courseId,
  });

  useFocusEffect(
    useCallback(() => {
      // 스크린 진입 시 항상 완전 초기화 (이전 상태 완전 제거)
      console.log('🔄 [Run] 스크린 진입 - 모든 상태 강제 초기화');
      resetLocationTracking();
      resetRunState(); // isTracking이 false이므로 완전 초기화

      // courseId가 있을 때만 경로 데이터를 로드
      if (courseId) {
        loadCourseTopology();
      }
    }, [resetLocationTracking, resetRunState, courseId, loadCourseTopology]),
  );

  // 위치가 로드되지 않았을 때 자동으로 새로고침
  useEffect(() => {
    if (!location && !errorMsg && !locationLoading) {
      const timer = setTimeout(() => {
        refreshLocation();
      }, 2000); // 2초 후에 새로고침 시도

      return () => clearTimeout(timer);
    }
  }, [location, errorMsg, locationLoading, refreshLocation]);

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
    // 트래킹 중일 때는 routeCoordinates의 마지막 위치로, 그렇지 않으면 현재 위치로 이동
    if (routeCoordinates.length > 0) {
      const lastCoordinate = routeCoordinates[routeCoordinates.length - 1];
      cameraRef.current?.flyTo(lastCoordinate, 1000);
    } else if (location && location.coords) {
      const currentPosition = [
        location.coords.longitude,
        location.coords.latitude,
      ] as [number, number];
      cameraRef.current?.flyTo(currentPosition, 1000);
    }
  };

  // 코스 이탈 상태에 따른 메시지 생성 (실시간 업데이트)
  const deviationMessage = useMemo(() => {
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
  }, [isDeviating, distanceFromCourse, deviationSeverity]);

  return (
    <StyledPage>
      <Header leftIcon={ArrowLeft} onLeftPress={handleBackPress} title="러닝" />
      <StyledContainer>
        {errorMsg ? (
          <Text>{errorMsg}</Text>
        ) : locationLoading ? (
          <LocationLoadingContainer>
            <Text>Getting location...</Text>
          </LocationLoadingContainer>
        ) : location && location.coords ? (
          <>
            <RunMap
              mapRef={mapRef}
              cameraRef={cameraRef}
              routeCoordinates={routeCoordinates}
              locationObject={location}
              courseId={courseId}
            />
            {loading && <LoadingOverlay message="경로 정보를 불러오는 중..." />}
            {topologyError && (
              <ErrorOverlay
                message={topologyError}
                onRetry={loadCourseTopology}
              />
            )}
            {/* 코스 이탈 알림 - courseId가 있을 때만 */}
            {courseId && isDeviating && (
              <DeviationOverlay severity={deviationSeverity}>
                <DeviationAlert severity={deviationSeverity}>
                  <AlertTriangle size={24} color="#ffffff" />
                  <DeviationText>{deviationMessage}</DeviationText>
                </DeviationAlert>
              </DeviationOverlay>
            )}
          </>
        ) : (
          <LocationLoadingContainer>
            <Text>위치를 가져올 수 없습니다</Text>
            <RefreshButton onPress={refreshLocation}>
              <Text style={{ color: '#2d2d2d', marginTop: 8 }}>새로고침</Text>
            </RefreshButton>
          </LocationLoadingContainer>
        )}
      </StyledContainer>
      <StatsContainer />
      <ControlContainer
        onCurrentLocationPress={handleCurrentLocationPress}
        isTracking={isTracking}
        toggleTracking={toggleTracking}
        routeCoordinates={routeCoordinates}
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
    top: 10,
    left: 20,
    right: 20,
    backgroundColor:
      severity === 'high'
        ? '#ef4444'
        : severity === 'medium'
          ? '#f87171'
          : '#fca5a5',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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

const LocationLoadingContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
});

const RefreshButton = styled.TouchableOpacity({
  padding: 12,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#2d2d2d',
});
