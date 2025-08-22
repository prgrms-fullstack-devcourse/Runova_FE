import styled from '@emotion/native';
import React from 'react';

import type { CategoryKey } from '@/types/community';

export default function CategoryTabs({ value, onChange }: Props) {
  return (
    <Row>
      {TABS.map((t) => {
        const active = value === t.key;
        return (
          <Tab key={t.key} active={active} onPress={() => onChange(t.key)}>
            <TabText active={active}>{t.label}</TabText>
          </Tab>
        );
      })}
    </Row>
  );
}

const TABS: { key: CategoryKey; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'free', label: '자유' },
  { key: 'auth', label: '인증' },
  { key: 'share', label: '공유' },
  { key: 'mate', label: '메이트' },
];

interface Props {
  value: CategoryKey;
  onChange: (next: CategoryKey) => void;
}

const Row = styled.View(({ theme }) => ({
  flexDirection: 'row',
  borderBottomWidth: 1,
  borderColor: theme.colors.gray[100],
  backgroundColor: theme.colors.gray[50],
}));

const Tab = styled.Pressable<{ active?: boolean }>(({ theme, active }) => ({
  flex: 1,
  paddingVertical: 12,
  alignItems: 'center',
  borderBottomWidth: active ? 2 : 0,
  borderColor: active ? theme.colors.primary[500] : 'transparent',
}));

const TabText = styled.Text<{ active?: boolean }>(({ theme, active }) => ({
  fontSize: 13,
  fontWeight: '600',
  color: active ? theme.colors.primary[600] : theme.colors.gray[600],
}));
