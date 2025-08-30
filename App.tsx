import { ThemeProvider } from '@emotion/react';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import RootNavigator from '@/navigation/RootNavigator';
import { theme } from '@/styles/theme';

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
