import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Star,
  AudioWaveform,
  Play,
  Laugh,
  Settings,
} from 'lucide-react-native';

import CommunityList from '@/pages/CommunityList';
import Home from '@/pages/Home/Home';
import Route from '@/pages/Route/Route';
import Run from '@/pages/Run/Run';
import SettingsPage from '@/pages/Settings/Settings';

import type { TabParamList } from '@/types/navigation.types';

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarBackground: () => null,
        tabBarActiveTintColor: route.name === 'Home' ? '#ffffff' : '#000000',
        tabBarInactiveTintColor:
          route.name === 'Home'
            ? 'rgba(255, 255, 255, 0.45)'
            : 'rgba(29, 29, 29, 0.45)',
      })}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ color, size }) => <Star color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Route"
        component={Route}
        options={{
          tabBarIcon: ({ color, size }) => (
            <AudioWaveform color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Run"
        component={Run}
        options={{
          tabBarIcon: ({ color, size }) => <Play color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityList}
        options={{
          tabBarIcon: ({ color, size }) => <Laugh color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsPage}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
