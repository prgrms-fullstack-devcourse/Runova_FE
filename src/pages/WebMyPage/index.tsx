import styled from '@emotion/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

const ORIGIN = process.env.EXPO_PUBLIC_WEB_ORIGIN ?? 'http://192.168.0.2:5173';

export default function WebMyPage() {
  const insets = useSafeAreaInsets();

  return (
    <Container safeAreaTop={insets.top}>
      <WebView source={{ uri: `${ORIGIN}/mypage` }} style={{ flex: 1 }} />
    </Container>
  );
}

const Container = styled.View<{ safeAreaTop: number }>(({ safeAreaTop }) => ({
  flex: 1,
  paddingTop: safeAreaTop,
}));
