import styled from '@emotion/native';
import { LucideIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ViewStyle } from 'react-native';

interface FloatingButtonProps {
  icon: LucideIcon;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  iconColor?: string;
}

const FLOATING_BUTTON_BOTTOM_OFFSET = 80;

export default function FloatingButton({
  icon: Icon,
  onPress,
  style,
  iconColor = '#ffffff',
}: FloatingButtonProps) {
  const insets = useSafeAreaInsets();

  return (
    <ButtonContainer
      onPress={onPress}
      activeOpacity={0.8}
      style={[{ bottom: insets.bottom + FLOATING_BUTTON_BOTTOM_OFFSET }, style]}
    >
      <Icon color={iconColor} size={24} />
    </ButtonContainer>
  );
}

const ButtonContainer = styled.TouchableOpacity({
  position: 'absolute',
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
