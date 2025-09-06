import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation.types';
import TabNavigator from './TabNavigator';
import Auth from '@/pages/Auth';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShadowVisible: false, headerShown: false }}
      initialRouteName="Auth"
    >
      <Stack.Screen name="Auth" component={Auth} />
      <Stack.Screen name="TabNavigator" component={TabNavigator} />
    </Stack.Navigator>
  );
}
