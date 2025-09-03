import { create } from 'zustand';
import type { NativeInitPayload, RNToWebMessage } from '@/types/nativeBridge.type';

type BridgeState = {
  init: NativeInitPayload | null; // RN이 준 초기 페이로드
  token: string | null; // 최신 액세스 토큰
  lastMessage: RNToWebMessage | null;
  setFromNative: (msg: RNToWebMessage) => void;
  clear: () => void;
};

export const useNativeBridgeStore = create<BridgeState>((set) => ({
  init: null,
  token: null,
  lastMessage: null,

  setFromNative: (msg) =>
    set((prev) => {
      let init = prev.init;
      let token = prev.token;

      switch (msg.type) {
        case 'NATIVE_INIT':
          init = msg.payload;
          token = msg.payload.accessToken;
          break;
        case 'NATIVE_TOKEN':
          token = msg.payload;
          break;
        case 'NATIVE_TOKEN_ERROR':
          token = null;
          break;
        default:
          // 다른 타입들은 lastMessage로만 보관
          break;
      }
      return { init, token, lastMessage: msg };
    }),

  clear: () => ({ init: null, token: null, lastMessage: null }),
}));
