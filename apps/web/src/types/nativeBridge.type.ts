export type NormalizedUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
} | null;

export type NativeInitPayload = {
  user: NormalizedUser;
  accessToken: string | null;
  app: { platform: 'native'; version?: string };
};

export type RNToWebMessage =
  | { type: 'NATIVE_INIT'; payload: NativeInitPayload }
  | { type: 'NATIVE_TOKEN'; payload: string }
  | { type: 'NATIVE_TOKEN_ERROR' }
  | { type: 'PONG' };

export type WebToRNMessage =
  | { type: 'PING' }
  | { type: 'REFRESH_TOKEN' }
  | { type: 'LOG'; payload?: unknown }
  | {
      type: 'NAVIGATE';
      payload: {
        screen: 'ROUTE_LIST' | 'ROUTE_DETAIL' | 'PROFILE';
        params?: Record<string, unknown>;
      };
    }
  | { type: string; payload?: unknown };
