import styled from '@emotion/native';
import { LucideIcon, MapPin, Bell } from 'lucide-react-native';

interface HeaderProps {
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  onLeftPress?: () => void;
  onRightPress?: () => void;

  // 홈 화면용 특수 props
  isHome?: boolean;
  locationText?: string;
  onLocationPress?: () => void;

  title?: string;
}

export default function Header({
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onLeftPress,
  onRightPress,
  isHome = false,
  locationText,
  onLocationPress,
  title,
}: HeaderProps) {
  if (isHome) {
    return (
      <HeaderContainer isHome={true}>
        <LeftSection>
          <LocationContainer onPress={onLocationPress}>
            <MapPin color="#ffffff" size={16} />
            <LocationText>{locationText}</LocationText>
          </LocationContainer>
        </LeftSection>
        <RightSection>
          <IconButton onPress={onRightPress}>
            <Bell color="#ffffff" size={20} />
          </IconButton>
        </RightSection>
      </HeaderContainer>
    );
  }

  return (
    <HeaderContainer isHome={false}>
      <LeftSection>
        {LeftIcon && (
          <IconButton onPress={onLeftPress}>
            <LeftIcon color="#000000" size={16} />
          </IconButton>
        )}
      </LeftSection>
      <CenterSection>
        <Title>{title}</Title>
      </CenterSection>
      <RightSection>
        {RightIcon && (
          <IconButton onPress={onRightPress}>
            <RightIcon color="#000000" size={16} />
          </IconButton>
        )}
      </RightSection>
    </HeaderContainer>
  );
}

const HeaderContainer = styled.View<{ isHome: boolean }>(({ isHome }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
  paddingVertical: 12,
  backgroundColor: 'transparent',
  borderBottomWidth: 1,
  borderBottomColor: isHome ? '#242431' : '#e0e0e0',
}));

const LeftSection = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
});

const CenterSection = styled.View({
  flex: 1,
  alignItems: 'center',
});

const RightSection = styled.View({
  flex: 1,
  alignItems: 'flex-end',
});

const LocationContainer = styled.TouchableOpacity({
  flexDirection: 'row',
  alignItems: 'center',
});

const LocationText = styled.Text({
  color: '#ffffff',
  fontSize: 14,
  marginLeft: 4,
});

const Title = styled.Text({
  color: '#000000',
  fontSize: 18,
  fontWeight: 'bold',
});

const IconButton = styled.TouchableOpacity({
  padding: 8,
});
