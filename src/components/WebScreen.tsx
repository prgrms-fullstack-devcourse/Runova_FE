import styled from '@emotion/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

import { useWebViewMessenger } from '@/hooks/useWebViewMessenger';

export default function WebScreen({
  origin,
  path,
}: {
  origin: string;
  path: string;
}) {
  const insets = useSafeAreaInsets();

  // 메시징 훅 사용
  const { webRef, onLoadEnd, onMessage } = useWebViewMessenger();

  return (
    <Container safeAreaTop={insets.top}>
      <StyledWebView
        ref={webRef}
        source={{ uri: `${origin}${path}` }}
        onLoadEnd={onLoadEnd} // RN → Web : 로그인정보/토큰 보내기
        onMessage={onMessage} // Web → RN : 메시지 받기
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        sharedCookiesEnabled
      />
    </Container>
  );
}

const Container = styled.View<{ safeAreaTop: number }>(({ safeAreaTop }) => ({
  flex: 1,
  paddingTop: safeAreaTop,
}));

const StyledWebView = styled(WebView)`
  flex: 1;
`;
