import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Route from '@/pages/Route';
import Draw from '@/pages/Draw';

export type RouteStackParamList = {
  RouteMain: Record<string, never>;
  Draw: Record<string, never>;
};

const Stack = createNativeStackNavigator<RouteStackParamList>();

export default function RouteStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RouteMain" component={Route} />
      <Stack.Screen name="Draw" component={Draw} />
    </Stack.Navigator>
  );
}
