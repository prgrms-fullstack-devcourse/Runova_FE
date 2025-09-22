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
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

    const config = {
      webClientId,
      iosClientId,
      profileImageSize: 120,
    };

    GoogleSignin.configure(config);
  } catch (error) {
    throw error;
  }
}

export async function signInWithGoogle(): Promise<GoogleSignInResponse> {
  try {
    await GoogleSignin.hasPlayServices();

    const signInResult = await GoogleSignin.signIn();

    const tokens = await GoogleSignin.getTokens();

    const { idToken, accessToken } = tokens;

    let data: GoogleSignInResponse;
    try {
      const response = await api.post<GoogleSignInResponse>('/auth/google', {
        idToken,
      });
      data = response.data;
    } catch (serverError: any) {
      if (serverError.response?.status === 400) {
        console.error('400 Error - Possible causes:');
      } else if (serverError.response?.status === 401) {
        console.error('401 Error - Possible causes:');
      } else if (serverError.response?.status === 500) {
        console.error('500 Error - Server internal error');
      }

      throw serverError;
    }

    return data;
  } catch (error) {
    throw new Error('Error occurred during login. Please try again.');
  }
}

export async function refreshToken(): Promise<RefreshTokenResponse> {
  try {
    const { data } = await api.post<RefreshTokenResponse>('/auth/refresh');

    if (!data.accessToken) {
      throw new Error('Token refresh failed.');
    }

    return data;
  } catch (error) {
    throw new Error('Error occurred during token refresh.');
  }
}

export async function signOut(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Google logout error:', error);
  }
}

export async function isSignedIn(): Promise<boolean> {
  try {
    const userInfo = await GoogleSignin.getCurrentUser();

    return userInfo !== null;
  } catch (error) {
    return false;
  }
}
