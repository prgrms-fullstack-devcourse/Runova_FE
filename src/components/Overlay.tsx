import { ActivityIndicator } from 'react-native';
import styled from '@emotion/native';
import { theme } from '@/styles/theme';

interface LoadingOverlayProps {
  message?: string;
}

interface ErrorOverlayProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

interface LockOverlayProps {
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
}

export function LoadingOverlay({
  message = '로딩 중...',
}: LoadingOverlayProps) {
  return (
    <OverlayContainer>
      <OverlayContent>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <OverlayText>{message}</OverlayText>
      </OverlayContent>
    </OverlayContainer>
  );
}

export function ErrorOverlay({
  message,
  onRetry,
  retryText = '다시 시도',
}: ErrorOverlayProps) {
  return (
    <OverlayContainer>
      <OverlayContent>
        <OverlayText>{message}</OverlayText>
        {onRetry && (
          <RetryButton onPress={onRetry}>
            <RetryButtonText>{retryText}</RetryButtonText>
          </RetryButton>
        )}
      </OverlayContent>
    </OverlayContainer>
  );
}

export function LockOverlay({ pointerEvents = 'auto' }: LockOverlayProps) {
  return <LockOverlayContainer pointerEvents={pointerEvents} />;
}

const OverlayContainer = styled.View({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1500,
});

const OverlayContent = styled.View({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  padding: 24,
  borderRadius: 12,
  alignItems: 'center',
  gap: 16,
  margin: 20,
  maxWidth: 300,
});

const OverlayText = styled.Text(({ theme }) => ({
  fontSize: 16,
  color: theme.colors.gray[700],
  textAlign: 'center',
  lineHeight: 22,
}));

const RetryButton = styled.TouchableOpacity(({ theme }) => ({
  backgroundColor: theme.colors.primary[500],
  paddingHorizontal: 20,
  paddingVertical: 12,
  borderRadius: 8,
}));

const RetryButtonText = styled.Text({
  color: '#ffffff',
  fontSize: 16,
  fontWeight: '600',
});

const LockOverlayContainer = styled.View<{
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
}>({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'transparent',
  zIndex: 1000,
});
