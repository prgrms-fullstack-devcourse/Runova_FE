import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Auth from '@/pages/Auth';
import RunDetail from '@/pages/RunDetail';
import useAuthStore from '@/store/auth';

import type { RootStackParamList } from '../types/navigation.types';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const isAuthed = !!accessToken && !!user;

  return (
    <Stack.Navigator
      key={isAuthed ? 'app' : 'auth'}
      screenOptions={{ headerShown: false }}
    >
      {isAuthed ? (
        <>
          <Stack.Screen name="TabNavigator" component={TabNavigator} />
          <Stack.Screen name="RunDetail" component={RunDetail} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={Auth} />
      )}
    </Stack.Navigator>
  );
}
