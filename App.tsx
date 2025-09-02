import { ThemeProvider } from '@emotion/react';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Mapbox from '@rnmapbox/maps';
import Constants from 'expo-constants';

import RootNavigator from '@/navigation/RootNavigator';
import { theme } from '@/styles/theme';

Mapbox.setAccessToken(
  Constants.expoConfig?.plugins?.find(
    (plugin) => Array.isArray(plugin) && plugin[0] === '@rnmapbox/maps',
  )?.[1]?.RNMapboxMapsAccessToken || '',
);

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      <Toast />
    </ThemeProvider>
  );
}
