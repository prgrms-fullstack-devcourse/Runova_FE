import { useCallback, useMemo, useRef } from 'react';
import WebView, { WebViewMessageEvent } from 'react-native-webview';

import { refreshToken } from '@/services/auth.service';
import { signOut } from '@/services/auth.service';
import useAuthStore from '@/store/auth';
import type { User } from '@/types/user.types';

export type NativeScreen = 'ROUTE_LIST' | 'ROUTE_DETAIL' | 'PROFILE';

type NormalizedUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
} | null;

type NativeInitPayload = {
  user: NormalizedUser;
  accessToken: string | null;
  app: { platform: 'native'; version?: string };
};

type NativeMessage =
  | { type: 'NATIVE_INIT'; payload: NativeInitPayload }
  | { type: 'NATIVE_TOKEN'; payload: string }
  | { type: 'NATIVE_TOKEN_ERROR' }
  | { type: 'NATIVE_LOGOUT' }
  | { type: 'PONG' }
  | { type: string; payload?: unknown };

type WebToNativeMessage =
  | { type: 'PING' }
  | { type: 'REFRESH_TOKEN' }
  | { type: 'LOGOUT' }
  | { type: 'LOG'; payload?: unknown }
  | {
      type: 'NAVIGATE';
      payload: { screen: NativeScreen; params?: Record<string, unknown> };
    };

type UseWebViewMessengerOptions = {
  onNavigate?: (screen: NativeScreen, params?: Record<string, unknown>) => void;
};

export function useWebViewMessenger(opts?: UseWebViewMessengerOptions) {
  const webRef = useRef<WebView | null>(null);

  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const normalizeUser = (u: User | null): NormalizedUser => {
    if (!u) return null;
    const rawId =
      (u as { id?: number | string }).id ??
      (u as { userId?: number | string }).userId;
    return {
      id: rawId !== undefined ? String(rawId) : '',
      name:
        (u as { name?: string }).name ??
        (u as { displayName?: string }).displayName ??
        null,
      email: (u as { email?: string }).email ?? null,
      avatarUrl:
        (u as { avatarUrl?: string }).avatarUrl ??
        (u as { photoUrl?: string }).photoUrl ??
        null,
    };
  };

  const initPayload: NativeInitPayload = useMemo(
    () => ({
      user: normalizeUser(user),
      accessToken: accessToken ?? null,
      app: { platform: 'native' },
    }),
    [accessToken, user],
  );

  const postJson = useCallback((data: NativeMessage) => {
    console.log('[RN → Web] send:', data);
    webRef.current?.postMessage(JSON.stringify(data));
  }, []);

  const onLoadEnd = useCallback(() => {
    postJson({ type: 'NATIVE_INIT', payload: initPayload });
  }, [postJson, initPayload]);

  const onMessage = useCallback(
    async (e: WebViewMessageEvent) => {
      console.log('[Web → RN] raw:', e.nativeEvent.data);

      let msg: WebToNativeMessage | { type: 'LOG'; payload?: unknown };
      try {
        msg = JSON.parse(e.nativeEvent.data) as WebToNativeMessage;
      } catch {
        msg = { type: 'LOG', payload: e.nativeEvent.data };
      }

      switch (msg.type) {
        case 'PING':
          postJson({ type: 'PONG' });
          break;

        case 'REFRESH_TOKEN':
          try {
            const { accessToken } = await refreshToken();
            if (user) setAuth(accessToken, user);
            else clearAuth();
            postJson({ type: 'NATIVE_TOKEN', payload: accessToken });
          } catch (error) {
            console.error('토큰 갱신 실패:', error);
            postJson({ type: 'NATIVE_TOKEN_ERROR' });
            clearAuth();
          }
          break;

        case 'NAVIGATE':
          opts?.onNavigate?.(msg.payload.screen, msg.payload.params);
          break;

        case 'LOG':
          console.log('[Web LOG]', msg.payload);
          break;

        case 'LOGOUT': {
          try {
            await signOut();
          } catch (error) {
            console.log(
              'Google signOut failed, but proceeding with app logout:',
              error,
            );
          } finally {
            clearAuth();
            postJson({ type: 'NATIVE_LOGOUT' });
          }
          break;
        }

        default:
          break;
      }
    },
    [postJson, setAuth, clearAuth, user, opts],
  );

  const sendToWeb = useCallback(
    (type: string, payload?: unknown) => {
      postJson({ type, payload });
    },
    [postJson],
  );

  return { webRef, onLoadEnd, onMessage, sendToWeb };
}

export type UseWebViewMessengerReturn = ReturnType<typeof useWebViewMessenger>;
