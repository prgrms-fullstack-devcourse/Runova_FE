import { View, TouchableOpacity } from 'react-native';
import styled from '@emotion/native';
import { theme } from '@/styles/theme';
import { Lock, Unlock, Play, Pause, Square } from 'lucide-react-native';

interface ControlContainerProps {
  isLocked: boolean;
  isTracking: boolean;
  onLockPress: () => void;
  onToggleTracking: () => void;
  onExitPress: () => void;
}

export default function ControlContainer({
  isLocked,
  isTracking,
  onLockPress,
  onToggleTracking,
  onExitPress,
}: ControlContainerProps) {
  return (
    <ControlContainerWrapper>
      <ControlButtonGroup>
        <ControlButton onPress={onLockPress}>
          {isLocked ? (
            <Unlock size={20} color={theme.colors.gray[600]} />
          ) : (
            <Lock size={20} color={theme.colors.gray[600]} />
          )}
        </ControlButton>

        <ControlButton
          onPress={onToggleTracking}
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
          onPress={onExitPress}
          disabled={isLocked}
          style={{ opacity: isLocked ? 0.5 : 1 }}
        >
          <Square size={20} color={theme.colors.gray[600]} />
        </ControlButton>
      </ControlButtonGroup>
    </ControlContainerWrapper>
  );
}

const ControlContainerWrapper = styled(View)`
  position: absolute;
  bottom: 132px;
  left: 20px;
  right: 20px;
  align-items: center;
`;

const ControlButtonGroup = styled(View)`
  flex-direction: row;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 999px;
  padding: 8px;
  shadow-color: ${theme.colors.gray[900]};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.15;
  shadow-radius: 8px;
  elevation: 8;
  z-index: 1001;
`;

const ControlButton = styled(TouchableOpacity)<{
  isPrimary?: boolean;
  disabled?: boolean;
}>`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${({ isPrimary }) =>
    isPrimary ? theme.colors.primary[500] : 'transparent'};
  justify-content: center;
  align-items: center;
  margin-horizontal: 4px;
`;
