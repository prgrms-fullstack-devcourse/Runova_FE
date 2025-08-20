import styled from '@emotion/native';
import React from 'react';

interface Props {
  onPress: () => void;
}

export default function FloatingActionButton({ onPress }: Props) {
  return (
    <Fab onPress={onPress}>
      <Plus>＋</Plus>
    </Fab>
  );
}

const Fab = styled.Pressable(({ theme }) => ({
  position: 'absolute',
  right: 24,
  bottom: 24,
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: theme.colors.primary[600],
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: theme.colors.gray[900],
  shadowOpacity: 0.2,
  shadowRadius: 6,
  elevation: 6,
}));

const Plus = styled.Text(({ theme }) => ({
  color: theme.colors.gray[50],
  fontSize: 28,
  marginTop: -2,
}));
