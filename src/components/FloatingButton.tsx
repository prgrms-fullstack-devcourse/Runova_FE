import styled from '@emotion/native';
import { LucideIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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

  // style prop에서 backgroundColor가 있는지 확인
  const hasCustomBackground = Array.isArray(style)
    ? style.some((s) => s && typeof s === 'object' && 'backgroundColor' in s)
    : style && typeof style === 'object' && 'backgroundColor' in style;

  return (
    <ButtonContainer
      onPress={onPress}
      activeOpacity={0.8}
      style={[{ bottom: insets.bottom + FLOATING_BUTTON_BOTTOM_OFFSET }, style]}
    >
      {!hasCustomBackground && (
        <ButtonGradient
          colors={['#1a1a1a', '#2d2d2d', '#404040']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      <Icon color={iconColor} size={24} />
    </ButtonContainer>
  );
}

const ButtonContainer = styled.TouchableOpacity({
  position: 'absolute',
  right: 20,
  width: 56,
  height: 56,
  borderRadius: 28,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 8,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  zIndex: 1000,
  overflow: 'hidden',
});

const ButtonGradient = styled(LinearGradient)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: 28,
});
