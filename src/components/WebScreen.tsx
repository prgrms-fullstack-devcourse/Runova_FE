// WebScreen.tsx
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
  PROFILE: 'Settings', // 필요에 맞게 바꾸세요 ('Profile' 탭이 따로 있으면 그 이름)
} as const;

export default function WebScreen({
  origin,
  path,
  bottomInsetExtra = DEFAULT_TAB_BAR_HEIGHT,
  webViewProps,
}: Props) {
  const insets = useSafeAreaInsets();

  // ✅ 네비게이션을 루트 스택 기준으로 타입 지정
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // ✅ Web → Native 브릿지에서 온 네비게이션 요청 처리
  const handleNavigate = useCallback(
    (screen: NativeScreen, params?: Record<string, unknown>) => {
      switch (screen) {
        // 탭 내 특정 화면으로 이동 (중첩 네비게이션)
        case 'ROUTE_LIST': {
          const nested: NavigatorScreenParams<TabParamList> = {
            screen: TAB_TARGET.ROUTE_LIST,
            // TabParamList 각 스크린 파라미터가 Record<string, never>라면 반드시 빈 객체 필요
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

        // 루트 스택 화면으로 이동
        case 'ROUTE_DETAIL': {
          // 예: RootStackParamList['Details']가 { id: string }
          const id =
            typeof params?.id === 'string'
              ? params.id
              : String(params?.id ?? '');
          navigation.navigate('Details', { id });
          break;
        }

        default:
          // 정의되지 않은 스크린은 무시
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
