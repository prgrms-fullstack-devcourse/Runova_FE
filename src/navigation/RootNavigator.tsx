import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CommunityDetail from '@/pages/CommunityDetail';
import CommunityEdit from '@/pages/CommunityEdit';
import Details from '@/pages/Details/Details';
import TabNavigator from './TabNavigator';
import WebCommunity from '@/pages/WebCommunity/WebCommunity';

import type { RootStackParamList } from '../types/navigation.types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShadowVisible: false, headerShown: false }}
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

      {/* Community */}
      <Stack.Screen
        name="WebCommunity"
        component={WebCommunity}
        options={{ title: '커뮤니티' }}
      />
    </Stack.Navigator>
  );
}
