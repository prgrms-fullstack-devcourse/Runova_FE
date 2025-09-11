import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Route from '@/pages/Route';
import Draw from '@/pages/Draw';
import RouteSave from '@/pages/RouteSave';
import Detail from '@/pages/Detail';

export type RouteStackParamList = {
  RouteMain: Record<string, never>;
  Draw: Record<string, never>;
  RouteSave: Record<string, never>;
  Detail: { courseId: number };
};

const Stack = createNativeStackNavigator<RouteStackParamList>();

export default function RouteStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RouteMain" component={Route} />
      <Stack.Screen name="Draw" component={Draw} />
      <Stack.Screen name="RouteSave" component={RouteSave} />
      <Stack.Screen name="Detail" component={Detail} />
    </Stack.Navigator>
  );
}
