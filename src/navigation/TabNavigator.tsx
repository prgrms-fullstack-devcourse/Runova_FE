import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Star, FileText, Play, Laugh, Settings } from 'lucide-react-native';

import WebCommunity from '@/pages/WebCommunity';
import Home from '@/pages/Home';
import Records from '@/pages/Records';
import RunTabNavigator from '@/navigation/RunTabNavigator';
import Run from '@/pages/Run';

import type { TabParamList } from '@/types/navigation.types';
import WebMyPage from '@/pages/WebMyPage';

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_BAR_HEIGHT = 60;

export default function TabNavigator() {
  const insets = useSafeAreaInsets();

  const baseTabBarStyle = {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT + insets.bottom,
    paddingBottom: insets.bottom,
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: baseTabBarStyle,
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
        name="Records"
        component={Records}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FileText color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="RunTab"
        component={RunTabNavigator}
        options={({ route }) => {
          const routeName =
            getFocusedRouteNameFromRoute(route) ?? 'QuickStartMain';
          return {
            tabBarIcon: ({ color, size }) => <Play color={color} size={size} />,
            tabBarStyle: {
              ...baseTabBarStyle,
              display:
                routeName === 'Run' ||
                routeName === 'Draw' ||
                routeName === 'RouteSave' ||
                routeName === 'Detail'
                  ? 'none'
                  : 'flex',
            },
          };
        }}
      />
      <Tab.Screen
        name="Community"
        component={WebCommunity}
        options={{
          tabBarIcon: ({ color, size }) => <Laugh color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={WebMyPage}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
