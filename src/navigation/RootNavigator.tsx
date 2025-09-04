import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation.types';
import TabNavigator from './TabNavigator';
import Auth from '@/pages/Auth';
import Draw from '@/pages/Draw';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShadowVisible: false, headerShown: false }}
      initialRouteName="TabNavigator"
    >
      <Stack.Screen
        name="Auth"
        component={Auth}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TabNavigator"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Draw"
        component={Draw}
        options={{ headerShown: true, title: '경로 그리기' }}
      />
    </Stack.Navigator>
  );
}
