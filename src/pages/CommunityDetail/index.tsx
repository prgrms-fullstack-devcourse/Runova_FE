import styled from '@emotion/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { sampleComments, samplePosts } from '@/store/community.mock';
import type { RootStackParamList } from '@/types/navigation.types';

import CommentList from './_components/CommentList';

type Props = NativeStackScreenProps<RootStackParamList, 'CommunityDetail'>;

export default function CommunityDetail({ route, navigation }: Props) {
  const { postId } = route.params;
  const post = useMemo(
    () => samplePosts.find((p) => p.id === postId),
    [postId],
  );

  if (!post) {
    return (
      <Safe>
        <Body>
          <H1>게시글을 찾을 수 없습니다.</H1>
        </Body>
      </Safe>
    );
  }

  return (
    <Safe>
      <Header>
        <BackButton onPress={() => navigation.goBack()}>
          <Back>‹</Back>
        </BackButton>
        <H1>게시글</H1>
        <View style={{ width: 20 }} />
      </Header>

      <Body>
        <Title>{post.title}</Title>
        <Author>{post.author}</Author>
        <Content>{post.content || '내용이 없습니다.'}</Content>
      </Body>

      <CommentList comments={sampleComments} />
    </Safe>
  );
}

const Safe = styled(SafeAreaView)(({ theme }) => ({
  flex: 1,
  backgroundColor: theme.colors.gray[50] ?? '#fff',
}));

const Header = styled.View(({ theme }) => ({
  paddingHorizontal: theme.spacing[4],
  paddingVertical: theme.spacing[3],
  borderBottomWidth: 1,
  borderColor: '#f3f4f6',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: theme.colors.gray[50] ?? '#fff',
}));

const BackButton = styled.Pressable({
  padding: 4,
});

const Back = styled.Text(({ theme }) => ({
  fontSize: 24,
  color: theme.colors.gray[600],
}));

const H1 = styled.Text(({ theme }) => ({
  fontSize: 18,
  fontWeight: '700',
  color: theme.colors.gray[900],
}));

const Body = styled.View(({ theme }) => ({
  padding: theme.spacing[4],
  gap: 8,
}));

const Title = styled.Text(({ theme }) => ({
  fontSize: 20,
  fontWeight: '700',
  color: theme.colors.gray[900],
}));

const Author = styled.Text(({ theme }) => ({
  fontSize: 13,
  color: theme.colors.gray[600],
}));

const Content = styled.Text`
  marginTop: 8,
  fontSize: 14,
  color: '#1f2937',
  lineHeight: 20,
`;
