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

export class AuthService {
  /**
   * Google 로그인 설정 초기화
   */
  static initializeGoogleSignIn(): void {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      profileImageSize: 120,
    });
  }

  /**
   * Google 로그인 실행
   */
  static async signInWithGoogle(): Promise<GoogleSignInResponse> {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();

      if (!idToken) {
        throw new Error('구글 로그인 중 ID 토큰을 받지 못했습니다.');
      }

      const { data } = await api.post<GoogleSignInResponse>('/auth/google', {
        idToken,
      });
      return data;
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            throw new Error('사용자가 로그인을 취소했습니다.');
          case statusCodes.IN_PROGRESS:
            throw new Error('로그인이 진행 중입니다.');
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            throw new Error(
              '구글 플레이 서비스를 사용할 수 없거나 버전이 오래되었습니다.',
            );
          default:
            throw new Error('구글 로그인 중 오류가 발생했습니다.');
        }
      }
      throw new Error('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  }

  /**
   * 토큰 갱신
   */
  static async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const { data } = await api.post<RefreshTokenResponse>('/auth/refresh');

      if (!data.accessToken) {
        throw new Error('토큰 갱신에 실패했습니다.');
      }

      return data;
    } catch (error) {
      throw new Error('토큰 갱신 중 오류가 발생했습니다.');
    }
  }

  /**
   * Google 로그아웃
   */
  static async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('Google 로그아웃 오류:', error);
    }
  }

  /**
   * 현재 로그인 상태 확인
   */
  static async isSignedIn(): Promise<boolean> {
    try {
      // GoogleSignin의 현재 사용자 정보를 가져와서 로그인 상태 확인
      const userInfo = await GoogleSignin.getCurrentUser();
      return userInfo !== null;
    } catch (error) {
      console.error('로그인 상태 확인 오류:', error);
      return false;
    }
  }
}
