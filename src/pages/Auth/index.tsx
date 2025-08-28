import styled from '@emotion/native';
import {
  GoogleSignin,
  GoogleSigninButton,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import api from '@/lib/api';
import FloatingImageContainer from '@/pages/Home/_components/FloatingImageContainer';
import useAuthStore, { type AuthState } from '@/store/auth';
import type { RootStackParamList } from '@/types/navigation.types';

export default function Auth() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setAuth = useAuthStore((s: AuthState) => s.setAuth);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      profileImageSize: 120,
    });
  }, []);

  const handleGoogleSignIn = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();

      if (!idToken) {
        throw new Error('구글 로그인 중 ID 토큰을 받지 못했습니다.');
      }

      const { data } = await api.post('/auth/google', { idToken });
      setAuth(data.accessToken, data.user);
      navigation.reset({ index: 0, routes: [{ name: 'TabNavigator' }] });
    } catch (error) {
      let errorMessage = '로그인 중 오류가 발생했습니다. 다시 시도해주세요.';

      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log('사용자가 로그인을 취소했습니다.');
            return;
          case statusCodes.IN_PROGRESS:
            return;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            errorMessage =
              '구글 플레이 서비스를 사용할 수 없거나 버전이 오래되었습니다.';
            console.error(errorMessage);
            break;
          default:
            console.error('구글 로그인 오류:', error);
        }
      } else {
        console.error('인증 오류:', error);
      }

      Toast.show({
        type: 'error',
        text1: '로그인 실패',
        text2: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
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
