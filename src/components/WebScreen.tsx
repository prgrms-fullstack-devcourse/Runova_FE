import styled from '@emotion/native';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

import type { NativeScreen } from '@/hooks/useWebViewMessenger';
import { useWebViewMessenger } from '@/hooks/useWebViewMessenger';
import type {
  RootStackParamList,
  TabParamList,
} from '@/types/navigation.types';

type Props = {
  origin: string | undefined;
  path: string;
  bottomInsetExtra?: number;
  webViewProps?: Partial<React.ComponentProps<typeof WebView>>;
};

const DEFAULT_TAB_BAR_HEIGHT = 60;

const TAB_TARGET = {
  ROUTE_LIST: 'Route',
  PROFILE: 'Settings',
} as const;

export default function WebScreen({
  origin,
  path,
  bottomInsetExtra = DEFAULT_TAB_BAR_HEIGHT,
  webViewProps,
}: Props) {
  const insets = useSafeAreaInsets();

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleNavigate = useCallback(
    (screen: NativeScreen, params?: Record<string, unknown>) => {
      switch (screen) {
        case 'ROUTE_LIST': {
          const nested: NavigatorScreenParams<TabParamList> = {
            screen: TAB_TARGET.ROUTE_LIST,
            params: {},
          };
          navigation.navigate('TabNavigator', nested);
          break;
        }
        case 'PROFILE': {
          const nested: NavigatorScreenParams<TabParamList> = {
            screen: TAB_TARGET.PROFILE,
            params: {},
          };
          navigation.navigate('TabNavigator', nested);
          break;
        }

        case 'ROUTE_DETAIL': {
          const id =
            typeof params?.id === 'string'
              ? params.id
              : String(params?.id ?? '');
          navigation.navigate('Details', { id });
          break;
        }

        default:
          break;
      }
    },
    [navigation],
  );

  const { webRef, onLoadEnd, onMessage } = useWebViewMessenger({
    onNavigate: handleNavigate,
  });

  const uri = useMemo(() => `${origin ?? ''}${path}`, [origin, path]);
  const originWhitelist = useMemo(() => (origin ? [origin] : ['*']), [origin]);

  return (
    <Container
      safeAreaTop={insets.top}
      safeAreaBottom={insets.bottom + bottomInsetExtra}
    >
      <StyledWebView
        ref={webRef}
        source={{ uri }}
        onLoadEnd={onLoadEnd}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        originWhitelist={originWhitelist}
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
