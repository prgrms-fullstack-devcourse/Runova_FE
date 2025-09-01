import styled from '@emotion/native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { samplePosts } from '@/store/community.mock';
import type { CategoryKey } from '@/types/community.type';
import type {
  RootStackParamList,
  TabParamList,
} from '@/types/navigation.types';

import CategoryTabs from './_components/CategoryTabs';
import FloatingActionButton from './_components/FloatingActionButton';
import PostItem from './_components/PostItem';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Community'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function CommunityList({ navigation }: Props) {
  const [category, setCategory] = useState<CategoryKey>('all');

  const posts = useMemo(() => samplePosts, []);

  const filtered = useMemo(
    () =>
      posts.filter((p) =>
        category === 'all' ? true : p.category === category,
      ),
    [category, posts],
  );

  return (
    <Safe>
      <Header>
        <Title>커뮤니티</Title>
      </Header>

      <CategoryTabs value={category} onChange={setCategory} />

      <FlatList
        contentContainerStyle={{ paddingHorizontal: 16 }}
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostItem
            post={item}
            onPress={(p) =>
              navigation.navigate('CommunityDetail', { postId: p.id })
            }
          />
        )}
        ListFooterComponent={<View style={{ height: 24 }} />}
      />

      <FloatingActionButton
        onPress={() => navigation.navigate('CommunityEdit')}
      />
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
}));

const Title = styled.Text(({ theme }) => ({
  fontSize: 18,
  fontWeight: '700',
  color: theme.colors.gray[900],
}));
