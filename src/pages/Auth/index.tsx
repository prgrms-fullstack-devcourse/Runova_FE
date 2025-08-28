import styled from '@emotion/native';
import { LinearGradient } from 'expo-linear-gradient';
import FloatingImageContainer from '@/pages/Home/_components/FloatingImageContainer';

export default function Auth() {
  const handleLoginPress = () => {
    console.log('Login button pressed');
  };

  return (
    <Screen>
      <GradientBackground
        colors={['#181820', '#242431', '#38384A', '#555571', '#646486']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <FloatingImageContainer />
        <Container>
          <Title>Runova</Title>
          <LoginButton onPress={handleLoginPress}>
            <LoginButtonText>Google로 로그인하기</LoginButtonText>
          </LoginButton>
        </Container>
      </GradientBackground>
    </Screen>
  );
}

const Screen = styled.View({
  flex: 1,
});

const GradientBackground = styled(LinearGradient)({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

const Container = styled.View({
  position: 'absolute',
  width: '100%',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 16,
});

const Title = styled.Text({
  fontSize: 48,
  fontWeight: 'bold',
  color: '#ffffff',
  marginBottom: 120,
  textShadowColor: 'rgba(0, 0, 0, 0.3)',
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 4,
});

const LoginButton = styled.TouchableOpacity({
  backgroundColor: '#ffffff',
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 28,
  alignItems: 'center',
  justifyContent: 'center',
  elevation: 8,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  position: 'absolute',
  bottom: 120,
});

const LoginButtonText = styled.Text({
  fontSize: 16,
  fontWeight: '600',
  color: '#333333',
});
