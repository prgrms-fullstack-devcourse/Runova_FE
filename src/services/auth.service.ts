import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import api from '@/lib/api';
import type { User } from '@/types/user.types';

export interface GoogleSignInResponse {
  accessToken: string;
  user: User;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export function initializeGoogleSignIn(): void {
  try {
    console.log('🔧 Google Sign-In 초기화 시작');

    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

    console.log('Web Client ID 상태:', webClientId ? '설정됨' : '❌ 미설정');
    console.log('iOS Client ID 상태:', iosClientId ? '설정됨' : '❌ 미설정');

    if (webClientId) {
      console.log('Web Client ID 길이:', webClientId.length);
      console.log(
        'Web Client ID 앞 20자:',
        webClientId.substring(0, 20) + '...',
      );
    }

    if (iosClientId) {
      console.log('iOS Client ID 길이:', iosClientId.length);
      console.log(
        'iOS Client ID 앞 20자:',
        iosClientId.substring(0, 20) + '...',
      );
    }

    if (!webClientId) {
      console.error('❌ Web Client ID가 설정되지 않았습니다!');
      console.error('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID 환경변수를 확인하세요');
    }

    if (!iosClientId) {
      console.error('❌ iOS Client ID가 설정되지 않았습니다!');
      console.error('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID 환경변수를 확인하세요');
    }

    const config = {
      webClientId,
      iosClientId,
      profileImageSize: 120,
    };

    console.log('Google Sign-In 설정:', config);
    GoogleSignin.configure(config);

    console.log('✅ Google Sign-In 초기화 완료');
  } catch (error) {
    console.error('❌ Google Sign-In 초기화 오류:', error);
    throw error;
  }
}

export async function signInWithGoogle(): Promise<GoogleSignInResponse> {
  try {
    console.log('Google 로그인 시작');

    console.log('Play Services 확인 중...');
    await GoogleSignin.hasPlayServices();
    console.log('Play Services 확인 완료');

    console.log('Google 로그인 시도 중...');
    const signInResult = await GoogleSignin.signIn();
    console.log('Google 로그인 성공:', signInResult);

    console.log('토큰 가져오는 중...');
    const tokens = await GoogleSignin.getTokens();
    console.log('전체 토큰 응답:', tokens);

    const { idToken, accessToken } = tokens;
    console.log('ID Token 상태:', idToken ? '발급됨' : '미발급');
    console.log('Access Token 상태:', accessToken ? '발급됨' : '미발급');

    if (idToken) {
      console.log('ID Token 길이:', idToken.length);
      console.log('ID Token 앞 20자:', idToken.substring(0, 20) + '...');
    }

    if (!idToken) {
      console.error('❌ ID 토큰이 발급되지 않았습니다');
      console.error('가능한 원인:');
      console.error('1. Google Console에서 OAuth 클라이언트 ID 설정 오류');
      console.error('2. 프로덕션 bundle ID가 Google Console에 등록되지 않음');
      console.error('3. Redirect URI 설정 오류');
      console.error('4. .env 파일의 클라이언트 ID가 잘못됨');
      throw new Error('구글 로그인 중 ID 토큰을 받지 못했습니다.');
    }

    console.log('서버에 로그인 요청 중...');
    console.log('요청 URL:', '/auth/google');
    console.log('요청 페이로드:', {
      idToken: idToken.substring(0, 20) + '...',
    });

    let data: GoogleSignInResponse;
    try {
      const response = await api.post<GoogleSignInResponse>('/auth/google', {
        idToken,
      });
      data = response.data;
      console.log('✅ 서버 로그인 성공:', data);
    } catch (serverError: any) {
      console.error('❌ 서버 로그인 실패:', serverError);
      console.error('서버 응답 상태:', serverError.response?.status);
      console.error('서버 응답 데이터:', serverError.response?.data);
      console.error('서버 응답 헤더:', serverError.response?.headers);

      if (serverError.response?.status === 400) {
        console.error('400 오류 - 가능한 원인:');
        console.error('1. 잘못된 ID 토큰 형식');
        console.error('2. Google Console OAuth 설정 오류');
        console.error(
          '3. 서버에서 사용하는 클라이언트 ID와 앱의 클라이언트 ID 불일치',
        );
      } else if (serverError.response?.status === 401) {
        console.error('401 오류 - 가능한 원인:');
        console.error('1. ID 토큰이 만료됨');
        console.error('2. Google에서 발급한 토큰이 서버에서 검증 실패');
        console.error('3. 서버의 Google OAuth 설정 오류');
      } else if (serverError.response?.status === 500) {
        console.error('500 오류 - 서버 내부 오류');
        console.error('서버 로그를 확인해야 합니다');
      }

      throw serverError;
    }

    return data;
  } catch (error) {
    console.error('Google 로그인 전체 오류:', error);

    if (isErrorWithCode(error)) {
      console.error('Google 로그인 코드 오류:', error.code);
      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          console.error('사용자가 로그인을 취소했습니다');
          throw new Error('사용자가 로그인을 취소했습니다.');
        case statusCodes.IN_PROGRESS:
          console.error('로그인이 진행 중입니다');
          throw new Error('로그인이 진행 중입니다.');
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          console.error('Play Services를 사용할 수 없습니다');
          throw new Error(
            '구글 플레이 서비스를 사용할 수 없거나 버전이 오래되었습니다.',
          );
        default:
          console.error('알 수 없는 Google 로그인 오류:', error.code);
          throw new Error('구글 로그인 중 오류가 발생했습니다.');
      }
    }

    console.error('일반 로그인 오류:', error);
    throw new Error('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
  }
}

export async function refreshToken(): Promise<RefreshTokenResponse> {
  try {
    console.log('토큰 갱신 시작');
    const { data } = await api.post<RefreshTokenResponse>('/auth/refresh');
    console.log('토큰 갱신 응답:', data);

    if (!data.accessToken) {
      console.error('토큰 갱신 실패: accessToken이 없습니다');
      throw new Error('토큰 갱신에 실패했습니다.');
    }

    console.log('토큰 갱신 성공');
    return data;
  } catch (error) {
    console.error('토큰 갱신 오류:', error);
    throw new Error('토큰 갱신 중 오류가 발생했습니다.');
  }
}

export async function signOut(): Promise<void> {
  try {
    console.log('Google 로그아웃 시작');
    await GoogleSignin.signOut();
    console.log('Google 로그아웃 성공');
  } catch (error) {
    console.error('Google 로그아웃 오류:', error);
  }
}

export async function isSignedIn(): Promise<boolean> {
  try {
    console.log('로그인 상태 확인 중...');
    const userInfo = await GoogleSignin.getCurrentUser();
    console.log('현재 사용자 정보:', userInfo ? '로그인됨' : '로그인 안됨');
    return userInfo !== null;
  } catch (error) {
    console.error('로그인 상태 확인 오류:', error);
    return false;
  }
}
