import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Details from '@/pages/Details/Details';
import TabNavigator from './TabNavigator';

import type { RootStackParamList } from '../types/navigation.types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShadowVisible: false }}
      initialRouteName="TabNavigator"
    >
      <Stack.Screen
        name="TabNavigator"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Details"
        component={Details}
        options={{ title: 'Details' }}
      />
    </Stack.Navigator>
  );
}
