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
};

export type TabParamList = {
  Home: Record<string, never>;
  Records: Record<string, never>;
  RunTab: Record<string, never>;
  Community: Record<string, never>;
  Settings: Record<string, never>;
};

export type RouteTabId = 'created' | 'completed' | 'liked';

export type RunTabStackParamList = {
  QuickStartMain: undefined;
  Draw: undefined;
  RouteSave: undefined;
  Detail: { id: string };
  Run: { courseId?: number } | undefined;
  RunDetail: {
    recordId: number;
    imageUrl?: string;
    path?: [number, number][];
    stats: {
      distance: number;
      calories: number;
      pace: number;
      runningTime: string;
    };
    startAt?: string;
    endAt?: string;
  };
  PhotoEdit: {
    photoUri: string;
    recordId: number;
    path?: [number, number][];
    stats: {
      distance: number;
      calories: number;
      pace: number;
      runningTime: string;
    };
  };
  PhotoDecoration: {
    photoUri: string;
    recordId: number;
    path?: [number, number][];
    stats: {
      distance: number;
      calories: number;
      pace: number;
      runningTime: string;
    };
  };
};
