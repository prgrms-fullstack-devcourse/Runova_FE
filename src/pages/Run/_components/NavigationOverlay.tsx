import React from 'react';
import styled from '@emotion/native';
import {
  NavigationIcon,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
} from 'lucide-react-native';
import type { NavigationInstruction } from '@/types/courses.types';

interface NavigationOverlayProps {
  visible: boolean;
  message: string;
  instruction: NavigationInstruction | null;
}

const NavigationOverlay: React.FC<NavigationOverlayProps> = ({
  visible,
  message,
  instruction,
}) => {
  if (!visible || !instruction) {
    return null;
  }

  const getNavigationIcon = () => {
    const { direction, scale } = instruction;
    const iconColor = '#ffffff';
    const iconSize = 28;

    if (scale === '유턴') {
      return <RotateCcw size={iconSize} color={iconColor} />;
    }

    return direction === '왼쪽' ? (
      <ArrowLeft size={iconSize} color={iconColor} />
    ) : (
      <ArrowRight size={iconSize} color={iconColor} />
    );
  };

  const getBackgroundColor = () => {
    // 유턴은 더 강한 색상으로 표시
    if (instruction.scale === '유턴') {
      return ['#f59e0b', '#d97706', '#b45309']; // 주황색 그라데이션
    }

    return ['#3b82f6', '#2563eb', '#1d4ed8']; // 파란색 그라데이션
  };

  return (
    <NavigationContainer>
      <NavigationAlert colors={getBackgroundColor()}>
        <IconContainer>
          <NavigationIcon size={20} color="#ffffff" />
        </IconContainer>
        <ContentContainer>
          <DirectionIconContainer>{getNavigationIcon()}</DirectionIconContainer>
          <MessageContainer>
            <NavigationMessage>{message}</NavigationMessage>
          </MessageContainer>
        </ContentContainer>
      </NavigationAlert>
    </NavigationContainer>
  );
};

export default React.memo(NavigationOverlay);

const NavigationContainer = styled.View({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1002,
  pointerEvents: 'none',
});

const NavigationAlert = styled.View<{ colors: string[] }>(({ colors }) => ({
  position: 'absolute',
  top: 10,
  left: 20,
  right: 20,
  backgroundColor: colors[0],
  paddingHorizontal: 20,
  paddingVertical: 16,
  borderRadius: 12,
  flexDirection: 'row',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
}));

const IconContainer = styled.View({
  marginRight: 12,
  padding: 8,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: 20,
  alignItems: 'center',
  justifyContent: 'center',
});

const ContentContainer = styled.View({
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
});

const DirectionIconContainer = styled.View({
  marginRight: 16,
  alignItems: 'center',
  justifyContent: 'center',
});

const MessageContainer = styled.View({
  flex: 1,
});

const NavigationMessage = styled.Text({
  color: '#ffffff',
  fontSize: 16,
  fontWeight: '700',
  lineHeight: 20,
  textAlign: 'left',
});
