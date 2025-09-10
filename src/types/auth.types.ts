import type { User } from './user.types';

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

export interface GoogleSignInRequest {
  idToken: string;
}

export interface GoogleSignInResponse {
  accessToken: string;
  user: User;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface AuthError {
  code?: string;
  message: string;
}
