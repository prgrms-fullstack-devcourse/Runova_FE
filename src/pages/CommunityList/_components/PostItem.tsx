import styled from '@emotion/native';
import React from 'react';

import { CATEGORY_LABEL } from '@/store/community.mock';
import type { Post } from '@/types/community';

interface Props {
  post: Post;
  onPress: (post: Post) => void;
}

const hexToRgba = (hex: string, alpha = 0.1) => {
  const m = hex.replace('#', '');
  const bigint = parseInt(m, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const Wrap = styled.Pressable(({ theme }) => ({
  paddingVertical: 16,
  borderBottomWidth: 1,
  borderColor: theme.colors.gray[100],
}));

const Title = styled.Text(({ theme }) => ({
  fontSize: 16,
  fontWeight: '600',
  color: theme.colors.gray[900],
  marginBottom: 6,
}));

const MetaRow = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 6,
  gap: 8,
});

const Badge = styled.View<{ tint: string }>(({ tint }) => ({
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 999,
  backgroundColor: tint,
}));

const BadgeText = styled.Text<{ color: string }>(({ color }) => ({
  fontSize: 11,
  fontWeight: '700',
  color,
}));

const CommentRow = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
});

const CommentIcon = styled.Text(({ theme }) => ({
  fontSize: 12,
  color: theme.colors.gray[400],
}));

const CommentCount = styled.Text(({ theme }) => ({
  fontSize: 12,
  color: theme.colors.gray[400],
}));

const Author = styled.Text(({ theme }) => ({
  fontSize: 13,
  color: theme.colors.gray[600],
}));

export default function PostItem({ post, onPress }: Props) {
  const tag = CATEGORY_LABEL[post.category];
  return (
    <Wrap onPress={() => onPress(post)}>
      <Title numberOfLines={2}>{post.title}</Title>
      <MetaRow>
        <Badge tint={hexToRgba(tag.color, 0.1)}>
          <BadgeText color={tag.color}>{tag.label}</BadgeText>
        </Badge>
        <CommentRow>
          <CommentIcon>💬</CommentIcon>
          <CommentCount>{post.commentsCount}</CommentCount>
        </CommentRow>
      </MetaRow>
      <Author>{post.author}</Author>
    </Wrap>
  );
}
