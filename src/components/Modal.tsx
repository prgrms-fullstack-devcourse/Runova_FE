import { Modal as RNModal, Text, TouchableOpacity, View } from 'react-native';
import styled from '@emotion/native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/styles/theme';

interface ModalProps {
  visible: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  cancelText?: string;
  confirmText?: string;
  loading?: boolean;
  disabled?: boolean;
}

export default function Modal({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  cancelText = '취소',
  confirmText = '확인',
  loading = false,
  disabled = false,
}: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <ModalOverlay>
        <ModalContainer>
          <ModalTitle>{title}</ModalTitle>
          <ModalMessage>{message}</ModalMessage>
          <ButtonContainer>
            <ModalButton onPress={onCancel} disabled={disabled || loading}>
              <ModalButtonGradient
                colors={['#1a1a1a', '#2d2d2d', '#404040']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <ModalButtonText>{cancelText}</ModalButtonText>
            </ModalButton>
            <ModalButton
              onPress={onConfirm}
              isPrimary
              disabled={disabled || loading}
            >
              <ModalButtonGradient
                colors={['#1a1a1a', '#2d2d2d', '#404040']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <ModalButtonText isPrimary>
                {loading ? '저장 중...' : confirmText}
              </ModalButtonText>
            </ModalButton>
          </ButtonContainer>
        </ModalContainer>
      </ModalOverlay>
    </RNModal>
  );
}

const ModalOverlay = styled(View)`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const ModalContainer = styled(View)`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  margin: 20px;
  min-width: 280px;
`;

const ModalTitle = styled(Text)`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.gray[900]};
  text-align: center;
  margin-bottom: 8px;
`;

const ModalMessage = styled(Text)`
  font-size: 14px;
  color: ${theme.colors.gray[600]};
  text-align: center;
  margin-bottom: 24px;
  line-height: 20px;
`;

const ButtonContainer = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  gap: 12px;
`;

const ModalButton = styled(TouchableOpacity)<{
  isPrimary?: boolean;
  disabled?: boolean;
}>`
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  align-items: center;
  position: relative;
  overflow: hidden;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

const ModalButtonGradient = styled(LinearGradient)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 8px;
`;

const ModalButtonText = styled(Text)<{ isPrimary?: boolean }>`
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
  z-index: 1;
`;
