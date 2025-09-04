import { useEffect } from 'react';
import { useNativeBridgeStore } from '@/stores/nativeBridgeStore';
import { postToNative } from '@/lib/nativeBridge';

export function useLogNativeToken(pageLabel: string) {
  const token = useNativeBridgeStore((s) => s.token);
  const init = useNativeBridgeStore((s) => s.init);

  // 최초 진입 시, 아직 토큰이 없다면 RN에 존재 확인용 신호(PING) 한번 보내기(선택)
  useEffect(() => {
    if (!token) {
      postToNative({ type: 'PING' }); // 선택: 로그 연결 확인용
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // init 수신되면 로그
  useEffect(() => {
    if (init) {
      console.log(`[${pageLabel}] NATIVE_INIT`, init);
    }
  }, [init, pageLabel]);

  // token 수신/갱신되면 로그
  useEffect(() => {
    if (token) {
      console.log(`[${pageLabel}] ACCESS_TOKEN`, token);
    }
  }, [token, pageLabel]);

  return { token, init };
}
