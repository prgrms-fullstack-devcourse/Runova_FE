import { ThemeProvider } from '@emotion/react';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Mapbox from '@rnmapbox/maps';

import RootNavigator from '@/navigation/RootNavigator';
import { theme } from '@/styles/theme';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '');

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
