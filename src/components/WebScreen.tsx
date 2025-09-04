import styled from '@emotion/native';
import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

import { useWebViewMessenger } from '@/hooks/useWebViewMessenger';

type Props = {
  origin: string | undefined;
  path: string;
  /** 탭바 높이 등 추가로 더할 하단 인셋 (기본 60) */
  bottomInsetExtra?: number;
  /** WebView에 그대로 전달할 추가 props (원하면 확장) */
  webViewProps?: Partial<React.ComponentProps<typeof WebView>>;
};

const DEFAULT_TAB_BAR_HEIGHT = 60;

export default function WebScreen({
  origin,
  path,
  bottomInsetExtra = DEFAULT_TAB_BAR_HEIGHT,
  webViewProps,
}: Props) {
  const insets = useSafeAreaInsets();
  const { webRef, onLoadEnd, onMessage } = useWebViewMessenger();

  const uri = useMemo(() => {
    const o = origin ?? '';
    return `${o}${path}`;
  }, [origin, path]);

  // 안전: originWhitelist는 허용 오리진만 (origin이 설정돼 있지 않으면 * 로)
  const originWhitelist = useMemo(() => (origin ? [origin] : ['*']), [origin]);

  return (
    <Container
      safeAreaTop={insets.top}
      safeAreaBottom={insets.bottom + bottomInsetExtra}
    >
      <StyledWebView
        ref={webRef}
        source={{ uri }}
        onLoadEnd={onLoadEnd} // RN → Web : 로그인정보/토큰 보내기
        onMessage={onMessage} // Web → RN : 메시지 받기
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        originWhitelist={originWhitelist}
        // 안드로이드에서 WebView가 탭바를 덮는 현상 방지
        {...webViewProps}
      />
    </Container>
  );
}

const Container = styled.View<{
  safeAreaTop: number;
  safeAreaBottom: number;
}>(({ safeAreaTop, safeAreaBottom }) => ({
  flex: 1,
  paddingTop: safeAreaTop,
  paddingBottom: safeAreaBottom,
}));

const StyledWebView = styled(WebView)`
  flex: 1;
`;
