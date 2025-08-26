import styled from '@emotion/native';
import { LucideIcon } from 'lucide-react-native';

interface FloatingButtonProps {
  icon: LucideIcon;
  onPress: () => void;
}

export default function FloatingButton({
  icon: Icon,
  onPress,
}: FloatingButtonProps) {
  return (
    <ButtonContainer onPress={onPress} activeOpacity={0.8}>
      <Icon color="#ffffff" size={24} />
    </ButtonContainer>
  );
}

const ButtonContainer = styled.TouchableOpacity({
  position: 'absolute',
  bottom: 80,
  right: 20,
  width: 56,
  height: 56,
  backgroundColor: '#ff6b35',
  borderRadius: 28,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 8,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
});
