import styled from '@emotion/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

export default function WebScreen({
  origin,
  path,
}: {
  origin: string;
  path: string;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Container safeAreaTop={insets.top}>
      <StyledWebView source={{ uri: `${origin}${path}` }} />
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
