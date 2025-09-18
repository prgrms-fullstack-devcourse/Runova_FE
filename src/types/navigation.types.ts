import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  TabNavigator:
    | Record<string, never>
    | NavigatorScreenParams<TabParamList>
    | undefined;
  Details: {
    id: string;
  };
  CommunityDetail: { postId: string };
  CommunityEdit: { postId: string } | undefined;
  WebCommunity: undefined;
  RunDetail: {
    recordId: number;
    imageUrl?: string;
    stats: {
      distance: number;
      calories: number;
      pace: number;
      runningTime: string;
    };
  };
};

export type TabParamList = {
  Home: Record<string, never>;
  Records: Record<string, never>;
  RunTab: Record<string, never>;
  Community: Record<string, never>;
  Settings: Record<string, never>;
};

export type RouteTabId = 'created' | 'completed' | 'liked';
