import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import styled from '@emotion/native';
import { theme } from '@/styles/theme';
import {
  Lock,
  Unlock,
  Play,
  Pause,
  Square,
  LocateFixed,
} from 'lucide-react-native';
import useRunStore from '@/store/run';
import { calculateRunStats } from '@/utils/runStats';
import type { Position } from 'geojson';

interface ControlContainerProps {
  onCurrentLocationPress: () => void;
  isTracking: boolean;
  toggleTracking: () => void;
  routeCoordinates: Position[];
}

const ControlContainer: React.FC<ControlContainerProps> = ({
  onCurrentLocationPress,
  isTracking,
  toggleTracking,
  routeCoordinates,
}) => {
  const {
    isLocked,
    startTime,
    setModal,
    setRunning,
    startRun,
    pauseRun,
    resumeRun,
    toggleLock,
  } = useRunStore();

  const handleLockPress = () => {
    toggleLock();
  };

  const handleToggleTracking = () => {
    if (!isTracking && !startTime) {
      // 새로운 런닝 시작
      startRun();
      const initialStats = calculateRunStats([], new Date(), true, 0, null);
      setRunning({ stats: initialStats });
      toggleTracking();
    } else if (!isTracking && startTime) {
      // 일시정지된 런닝 재시작 - 기존 경로와 통계 유지

      resumeRun();
      toggleTracking();
    } else if (isTracking) {
      // 런닝 일시정지 - 경로와 통계 유지

      pauseRun();
      toggleTracking();
    }
  };

  const handleExitPress = () => {
    setModal('exit');
  };

  return (
    <ControlContainerWrapper>
      <ControlButtonGroup>
        <ControlButton onPress={handleLockPress}>
          {isLocked ? (
            <Unlock size={20} color={theme.colors.gray[600]} />
          ) : (
            <Lock size={20} color={theme.colors.gray[600]} />
          )}
        </ControlButton>

        <ControlButton
          onPress={handleToggleTracking}
          isPrimary
          disabled={isLocked}
          style={{ opacity: isLocked ? 0.5 : 1 }}
        >
          {isTracking ? (
            <Pause size={20} color="#ffffff" />
          ) : (
            <Play size={20} color="#ffffff" />
          )}
        </ControlButton>

        <ControlButton
          onPress={handleExitPress}
          disabled={isLocked}
          style={{ opacity: isLocked ? 0.5 : 1 }}
        >
          <Square size={20} color={theme.colors.gray[600]} />
        </ControlButton>
      </ControlButtonGroup>
      <LocationButton onPress={onCurrentLocationPress}>
        <LocateFixed size={20} color={theme.colors.gray[600]} />
      </LocationButton>
    </ControlContainerWrapper>
  );
};

export default React.memo(ControlContainer);

const ControlContainerWrapper = styled.View({
  position: 'absolute',
  bottom: 220,
  left: 0,
  right: 0,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 20,
});

const ControlButtonGroup = styled.View(({ theme }) => ({
  flexDirection: 'row',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: 999,
  padding: 8,
  shadowColor: theme.colors.gray[900],
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 8,
  zIndex: 1001,
}));

const ControlButton = styled.TouchableOpacity<{
  isPrimary?: boolean;
  disabled?: boolean;
}>(({ isPrimary, theme }) => ({
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: isPrimary ? '#2d2d2d' : 'transparent',
  justifyContent: 'center',
  alignItems: 'center',
  marginHorizontal: 4,
}));

const LocationButton = styled.TouchableOpacity(({ theme }) => ({
  position: 'absolute',
  right: 20,
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: theme.colors.gray[900],
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 8,
}));
