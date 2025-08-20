export type RootStackParamList = {
  Home: undefined;
  Details: { id: string };

  CommunityList: undefined;
  CommunityDetail: { postId: string };
  CommunityEdit: { postId: string } | undefined;
};
