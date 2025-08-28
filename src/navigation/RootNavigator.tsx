import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Auth from '@/pages/Auth';
import CommunityDetail from '@/pages/CommunityDetail';
import CommunityEdit from '@/pages/CommunityEdit';
import Details from '@/pages/Details/Details';
import TabNavigator from './TabNavigator';

import type { RootStackParamList } from '../types/navigation.types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShadowVisible: false, headerShown: false }}
      initialRouteName="Auth"
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
        name="Details"
        component={Details}
        options={{ title: 'Details' }}
      />
      <Stack.Screen
        name="CommunityDetail"
        component={CommunityDetail}
        options={{ title: '게시글' }}
      />
      <Stack.Screen
        name="CommunityEdit"
        component={CommunityEdit}
        options={({ route }) => ({
          title: route.params?.postId ? '게시글 수정' : '글 작성',
        })}
      />
    </Stack.Navigator>
  );
}
