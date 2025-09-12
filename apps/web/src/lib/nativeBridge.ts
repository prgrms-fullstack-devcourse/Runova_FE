import { useNativeBridgeStore } from '@/stores/nativeBridgeStore';
import type { RNToWebMessage, WebToRNMessage } from '@/types/nativeBridge.type';

function parseIncoming(data: unknown): RNToWebMessage | null {
  try {
    if (typeof data === 'string') return JSON.parse(data) as RNToWebMessage;
    if (typeof data === 'object' && data) return data as RNToWebMessage;
    return null;
  } catch {
    return null;
  }
}

function onMessage(e: MessageEvent) {
  const msg = parseIncoming(e.data);
  if (!msg || typeof msg !== 'object' || !('type' in msg)) return;
  useNativeBridgeStore.getState().setFromNative(msg);
}

window.addEventListener('message', onMessage as EventListener);
document.addEventListener('message', onMessage as unknown as EventListener);

export function postToNative(message: WebToRNMessage) {
  const str = JSON.stringify(message);
  window.ReactNativeWebView?.postMessage(str);
}

export const isNativeWebView = () =>
  typeof window !== 'undefined' &&
  !!window.ReactNativeWebView &&
  typeof window.ReactNativeWebView.postMessage === 'function';

export function openNativeRouteList(params?: {
  initialTab?: 'ALL' | 'FREE' | 'PROOF' | 'SHARE' | 'MATE';
}) {
  postToNative({
    type: 'NAVIGATE',
    payload: { screen: 'ROUTE_LIST', params },
  });
}

export const sendPing = () => postToNative({ type: 'PING' });

export const requestRefreshToken = () =>
  postToNative({ type: 'REFRESH_TOKEN' });

export const requestLogout = () => postToNative({ type: 'LOGOUT' });
