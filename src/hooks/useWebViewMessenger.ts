import { useCallback, useMemo, useRef } from 'react';
import WebView, { WebViewMessageEvent } from 'react-native-webview';

import useAuthStore from '@/store/auth';
import { refreshToken } from '@/services/auth.service';
import type { User } from '@/types/user.types';

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
  | { type: 'PONG' }
  | { type: string; payload?: unknown }; // 확장성 위해 기본 구조 유지

type WebToNativeMessage =
  | { type: 'PING' }
  | { type: 'REFRESH_TOKEN' }
  | { type: 'LOG'; payload?: unknown }
  | { type: string; payload?: unknown };

export function useWebViewMessenger() {
  const webRef = useRef<WebView>(null);

  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const normalizeUser = (u: User | null): NormalizedUser => {
    if (!u) return null;

    const rawId: number | string | undefined =
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

  const initPayload: NativeInitPayload = useMemo(() => {
    return {
      user: normalizeUser(user),
      accessToken: accessToken ?? null,
      app: { platform: 'native' },
    };
  }, [accessToken, user]);

  const postJson = useCallback((data: NativeMessage) => {
    console.log('[RN → Web] 보내는 메시지:', data);
    webRef.current?.postMessage(JSON.stringify(data));
  }, []);

  const onLoadEnd = useCallback(() => {
    postJson({ type: 'NATIVE_INIT', payload: initPayload });
  }, [postJson, initPayload]);

  const onMessage = useCallback(
    async (e: WebViewMessageEvent) => {
      console.log('[Web → RN] 원본 데이터:', e.nativeEvent.data);

      let msg: WebToNativeMessage;
      try {
        msg = JSON.parse(e.nativeEvent.data) as WebToNativeMessage;
      } catch {
        msg = { type: 'LOG', payload: e.nativeEvent.data };
      }

      switch (msg.type) {
        case 'PING': {
          postJson({ type: 'PONG' });
          break;
        }
        case 'REFRESH_TOKEN': {
          try {
            const { accessToken } = await refreshToken();

            if (user) {
              setAuth(accessToken, user);
            } else {
              clearAuth();
            }

            postJson({ type: 'NATIVE_TOKEN', payload: accessToken });
          } catch (error) {
            console.error('토큰 갱신 실패:', error);
            postJson({ type: 'NATIVE_TOKEN_ERROR' });
            clearAuth();
          }
          break;
        }
        case 'LOG': {
          console.log('[Web LOG]', msg.payload);
          break;
        }
        default: {
          break;
        }
      }
    },
    [postJson, setAuth, clearAuth, user],
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
