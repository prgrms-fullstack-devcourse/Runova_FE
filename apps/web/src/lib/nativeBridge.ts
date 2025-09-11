import { useNativeBridgeStore } from '@/stores/nativeBridgeStore';
import type { RNToWebMessage, WebToRNMessage } from '@/types/nativeBridge.type';

// JSON 또는 객체 수신을 안전히 파싱
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

// iOS/Android 호환 위해 둘 다 리스닝
window.addEventListener('message', onMessage as EventListener);
document.addEventListener('message', onMessage as unknown as EventListener);

/** Web → RN 송신 */
export function postToNative(message: WebToRNMessage) {
  const str = JSON.stringify(message);
  window.ReactNativeWebView?.postMessage(str);
}

export const isNativeWebView = () =>
  typeof window !== 'undefined' &&
  !!window.ReactNativeWebView &&
  typeof window.ReactNativeWebView.postMessage === 'function';

// 네이티브 Route 목록 열기 (초기 탭 전달 가능)
export function openNativeRouteList(params?: {
  initialTab?: 'ALL' | 'FREE' | 'PROOF' | 'SHARE' | 'MATE';
}) {
  postToNative({
    type: 'NAVIGATE',
    payload: { screen: 'ROUTE_LIST', params },
  });
}

/** 간단 테스트용 */
export const sendPing = () => postToNative({ type: 'PING' });
export const requestRefreshToken = () =>
  postToNative({ type: 'REFRESH_TOKEN' });
