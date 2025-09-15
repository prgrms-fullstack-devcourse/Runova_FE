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
    console.log('🔧 Google Sign-In initialization started');

    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

    // CRITICAL: Always log the Web Client ID
    console.error('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID:', webClientId);
    console.error('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID:', iosClientId);

    console.log('Web Client ID status:', webClientId ? 'SET' : '❌ NOT SET');
    console.log('iOS Client ID status:', iosClientId ? 'SET' : '❌ NOT SET');

    if (webClientId) {
      console.log('Web Client ID length:', webClientId.length);
      console.log(
        'Web Client ID first 20 chars:',
        webClientId.substring(0, 20) + '...',
      );
    }

    if (iosClientId) {
      console.log('iOS Client ID length:', iosClientId.length);
      console.log(
        'iOS Client ID first 20 chars:',
        iosClientId.substring(0, 20) + '...',
      );
    }

    if (!webClientId) {
      console.error('❌ Web Client ID is NOT SET!');
      console.error(
        'Check EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID environment variable',
      );
    }

    if (!iosClientId) {
      console.error('❌ iOS Client ID is NOT SET!');
      console.error(
        'Check EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID environment variable',
      );
    }

    const config = {
      webClientId,
      iosClientId,
      profileImageSize: 120,
    };

    console.log('Google Sign-In config:', config);
    GoogleSignin.configure(config);

    console.log('✅ Google Sign-In initialization completed');
  } catch (error) {
    console.error('❌ Google Sign-In initialization error:', error);
    throw error;
  }
}

export async function signInWithGoogle(): Promise<GoogleSignInResponse> {
  try {
    console.log('Google login started');

    console.log('Checking Play Services...');
    await GoogleSignin.hasPlayServices();
    console.log('Play Services check completed');

    console.log('Attempting Google login...');
    const signInResult = await GoogleSignin.signIn();
    console.log('Google login successful:', signInResult);

    console.log('Getting tokens...');
    const tokens = await GoogleSignin.getTokens();
    console.log('Full token response:', tokens);

    const { idToken, accessToken } = tokens;
    console.log('ID Token status:', idToken ? 'ISSUED' : 'NOT ISSUED');
    console.log('Access Token status:', accessToken ? 'ISSUED' : 'NOT ISSUED');

    if (idToken) {
      console.log('ID Token length:', idToken.length);
      console.log('ID Token first 20 chars:', idToken.substring(0, 20) + '...');
    }

    if (!idToken) {
      console.error('❌ ID Token was NOT issued');
      console.error('Possible causes:');
      console.error('1. Google Console OAuth client ID configuration error');
      console.error('2. Production bundle ID not registered in Google Console');
      console.error('3. Redirect URI configuration error');
      console.error('4. Wrong client ID in .env file');
      console.error('5. OAuth consent screen not published to production');
      throw new Error('Failed to receive ID token during Google login.');
    }

    console.log('Sending login request to server...');
    console.log('Request URL:', '/auth/google');
    console.log('Request payload:', {
      idToken: idToken.substring(0, 20) + '...',
    });

    let data: GoogleSignInResponse;
    try {
      const response = await api.post<GoogleSignInResponse>('/auth/google', {
        idToken,
      });
      data = response.data;
      console.log('✅ Server login successful:', data);
    } catch (serverError: any) {
      console.error('❌ Server login failed:', serverError);
      console.error('Server response status:', serverError.response?.status);
      console.error('Server response data:', serverError.response?.data);
      console.error('Server response headers:', serverError.response?.headers);

      if (serverError.response?.status === 400) {
        console.error('400 Error - Possible causes:');
        console.error('1. Invalid ID token format');
        console.error('2. Google Console OAuth configuration error');
        console.error('3. Client ID mismatch between server and app');
        console.error('4. Wrong OAuth consent screen configuration');
      } else if (serverError.response?.status === 401) {
        console.error('401 Error - Possible causes:');
        console.error('1. ID token expired');
        console.error('2. Google token verification failed on server');
        console.error('3. Server Google OAuth configuration error');
        console.error('4. Invalid client ID or secret on server');
      } else if (serverError.response?.status === 500) {
        console.error('500 Error - Server internal error');
        console.error('Check server logs for details');
      }

      throw serverError;
    }

    return data;
  } catch (error) {
    console.error('Google login overall error:', error);

    if (isErrorWithCode(error)) {
      console.error('Google login code error:', error.code);
      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          console.error('User cancelled login');
          throw new Error('User cancelled login.');
        case statusCodes.IN_PROGRESS:
          console.error('Login in progress');
          throw new Error('Login in progress.');
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          console.error('Play Services not available');
          throw new Error(
            'Google Play Services is not available or version is outdated.',
          );
        default:
          console.error('Unknown Google login error:', error.code);
          throw new Error('Error occurred during Google login.');
      }
    }

    console.error('General login error:', error);
    throw new Error('Error occurred during login. Please try again.');
  }
}

export async function refreshToken(): Promise<RefreshTokenResponse> {
  try {
    console.log('Token refresh started');
    const { data } = await api.post<RefreshTokenResponse>('/auth/refresh');
    console.log('Token refresh response:', data);

    if (!data.accessToken) {
      console.error('Token refresh failed: accessToken is missing');
      throw new Error('Token refresh failed.');
    }

    console.log('Token refresh successful');
    return data;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw new Error('Error occurred during token refresh.');
  }
}

export async function signOut(): Promise<void> {
  try {
    console.log('Google logout started');
    await GoogleSignin.signOut();
    console.log('Google logout successful');
  } catch (error) {
    console.error('Google logout error:', error);
  }
}

export async function isSignedIn(): Promise<boolean> {
  try {
    console.log('Checking login status...');
    const userInfo = await GoogleSignin.getCurrentUser();
    console.log('Current user info:', userInfo ? 'LOGGED IN' : 'NOT LOGGED IN');
    return userInfo !== null;
  } catch (error) {
    console.error('Login status check error:', error);
    return false;
  }
}
