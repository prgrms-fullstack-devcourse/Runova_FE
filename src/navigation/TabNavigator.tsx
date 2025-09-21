import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  getFocusedRouteNameFromRoute,
  useFocusEffect,
} from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { Star, FileText, Play, Laugh, Settings } from 'lucide-react-native';
import { useCallback } from 'react';

import WebCommunity from '@/pages/WebCommunity';
import Home from '@/pages/Home';
import RecordsStackNavigator from '@/navigation/RecordsStackNavigator';
import RunTabNavigator from '@/navigation/RunTabNavigator';
import Run from '@/pages/Run';

import type { TabParamList } from '@/types/navigation.types';
import WebMyPage from '@/pages/WebMyPage';

function RunTabWithReset() {
  return <RunTabNavigator />;
}

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_BAR_HEIGHT = 68;

export default function TabNavigator() {
  const insets = useSafeAreaInsets();

  const baseTabBarStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT + insets.bottom,
    paddingBottom: insets.bottom,
    paddingTop: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
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
        component={RecordsStackNavigator}
        options={({ route }) => {
          const routeName =
            getFocusedRouteNameFromRoute(route) ?? 'RecordsMain';
          return {
            tabBarIcon: ({ color, size }) => (
              <FileText color={color} size={size} />
            ),
            tabBarStyle: {
              ...baseTabBarStyle,
              display: routeName === 'RecordDetail' ? 'none' : 'flex',
            },
          };
        }}
      />
      <Tab.Screen
        name="Run"
        component={RunTabWithReset}
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
                routeName === 'Detail' ||
                routeName === 'RunDetail' ||
                routeName === 'PhotoEdit' ||
                routeName === 'PhotoDecoration'
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
