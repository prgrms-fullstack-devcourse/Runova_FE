import styled from '@emotion/native';
import React from 'react';

import type { Comment } from '@/types/community.type';

interface Props {
  comments: Comment[];
}

export default function CommentList({ comments }: Props) {
  if (!comments.length) {
    return (
      <Empty>
        <EmptyText>아직 댓글이 없습니다.</EmptyText>
      </Empty>
    );
  }

  return (
    <Wrap>
      <H3>댓글</H3>
      {comments.map((c) => (
        <Item key={c.id}>
          <Author>{c.author}</Author>
          <Content>{c.content}</Content>
        </Item>
      ))}
    </Wrap>
  );
}

const Wrap = styled.View(({ theme }) => ({
  paddingHorizontal: theme.spacing[4], // 16
  paddingBottom: theme.spacing[4],
  gap: 12,
}));

const H3 = styled.Text(({ theme }) => ({
  fontSize: 13,
  color: theme.colors.gray[900],
  fontWeight: '700',
}));

const Item = styled.View`
  borderBottomWidth: 1,
  borderColor: '#f9fafb',
  paddingBottom: 12,
`;

const Author = styled.Text(({ theme }) => ({
  fontSize: 13,
  fontWeight: '600',
  color: theme.colors.gray[900],
  marginBottom: 4,
}));

const Content = styled.Text(({ theme }) => ({
  fontSize: 13,
  color: theme.colors.gray[700],
  lineHeight: 18,
}));

const Empty = styled.View(({ theme }) => ({
  padding: theme.spacing[4],
}));

const EmptyText = styled.Text(({ theme }) => ({
  fontSize: 13,
  color: theme.colors.gray[500],
  textAlign: 'center',
}));
