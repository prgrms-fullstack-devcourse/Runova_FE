import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import styled from '@emotion/native';
import { theme } from '@/styles/theme';
import type { Feature, LineString } from 'geojson';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TabParamList } from '@/types/navigation.types';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { calculateRunStats } from '@/utils/runStats';
import RunMap from './_components/RunMap';
import StatsContainer from './_components/StatsContainer';
import ControlContainer from './_components/ControlContainer';
import Modal from '@/components/Modal';

type Props = NativeStackScreenProps<TabParamList, 'Run'>;

export default function Run() {
  const {
    routeCoordinates,
    location,
    errorMsg,
    isTracking,
    toggleTracking,
    stopTracking,
  } = useLocationTracking();

  const [isLocked, setIsLocked] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [stats, setStats] = useState({
    distance: 0,
    calories: 0,
    pace: '0\'00"',
  });

  const routeGeoJSON: Feature<LineString> = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: routeCoordinates,
    },
  };

  // 실시간 통계 업데이트
  useEffect(() => {
    const newStats = calculateRunStats(routeCoordinates, startTime);
    setStats(newStats);
  }, [routeCoordinates, startTime]);

  // 1초마다 통계 업데이트 (시간 기반 계산을 위해)
  useEffect(() => {
    if (!isTracking || !startTime) return;

    const interval = setInterval(() => {
      const newStats = calculateRunStats(routeCoordinates, startTime);
      setStats(newStats);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTracking, startTime, routeCoordinates]);

  const handleLockPress = () => {
    setIsLocked(!isLocked);
  };

  const handleToggleTracking = () => {
    if (!isTracking && !startTime) {
      setStartTime(new Date());
    }
    toggleTracking();
  };

  const handleExitPress = () => {
    setShowExitModal(true);
  };

  const handleConfirmExit = () => {
    stopTracking();
    setStartTime(null);
    setShowExitModal(false);
    setIsLocked(false);
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  return (
    <StyledPage>
      <StyledContainer>
        {errorMsg ? (
          <Text>{errorMsg}</Text>
        ) : location ? (
          <RunMap
            location={location}
            routeGeoJSON={routeGeoJSON}
            isLocked={isLocked}
          />
        ) : (
          <Text>Getting location...</Text>
        )}
      </StyledContainer>
      <StatsContainer stats={stats} />
      <ControlContainer
        isLocked={isLocked}
        isTracking={isTracking}
        onLockPress={handleLockPress}
        onToggleTracking={handleToggleTracking}
        onExitPress={handleExitPress}
      />
      <Modal
        visible={showExitModal}
        title="종료하시겠습니까?"
        message="현재 트래킹을 종료하면 기록된 경로가 삭제됩니다."
        onCancel={handleCancelExit}
        onConfirm={handleConfirmExit}
        cancelText="취소"
        confirmText="종료"
      />
    </StyledPage>
  );
}

const StyledPage = styled(View)`
  flex: 1;
  background-color: ${theme.colors.gray[100]};
`;

const StyledContainer = styled(View)`
  flex: 1;
  width: 100%;
`;
