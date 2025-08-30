export type RootStackParamList = {
  Auth: undefined;
  TabNavigator: Record<string, never>;
  Details: {
    id: string;
  };
  CommunityDetail: { postId: string };
  CommunityEdit: { postId: string } | undefined;

  WebCommunity: undefined;
};

export type TabParamList = {
  Home: Record<string, never>;
  Route: Record<string, never>;
  Run: Record<string, never>;
  Community: Record<string, never>;
  Settings: Record<string, never>;
};

export type RouteTabId = 'created' | 'completed' | 'liked';
