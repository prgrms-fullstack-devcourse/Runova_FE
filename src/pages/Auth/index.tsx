import styled from '@emotion/native';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import FloatingImageContainer from '@/pages/Home/_components/FloatingImageContainer';
import useAuthStore from '@/store/auth';
import {
  initializeGoogleSignIn,
  signInWithGoogle,
} from '@/services/auth.service';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import type { RootStackParamList } from '@/types/navigation.types';

export default function Auth() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 로그인 시 위치 미리 받아오기
  const { refreshLocation } = useLocationTracking();

  useEffect(() => {
    initializeGoogleSignIn();
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const { accessToken, user } = await signInWithGoogle();

      setAuth(accessToken, user);

      // 로그인 성공 후 위치 미리 받아오기
      console.log('📍 로그인 성공! 위치 미리 받아오기 시작...');
      refreshLocation();

      // navigation.reset({ index: 0, routes: [{ name: 'TabNavigator' }] });
    } catch (error: unknown) {
      console.error('로그인 오류:', error);

      if (
        error instanceof Error &&
        error.message === '사용자가 로그인을 취소했습니다.'
      ) {
        return;
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : '로그인 중 오류가 발생했습니다.';

      Toast.show({
        type: 'error',
        text1: '로그인 실패',
        text2: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, setAuth, navigation, refreshLocation]);

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
          <LoginButtonContainer>
            <GoogleSigninButton
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Light}
              onPress={handleGoogleSignIn}
              disabled={isSubmitting}
            />
          </LoginButtonContainer>
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

const LoginButtonContainer = styled.View({
  paddingVertical: 12,
  paddingHorizontal: 24,
  position: 'absolute',
  bottom: 120,
});
