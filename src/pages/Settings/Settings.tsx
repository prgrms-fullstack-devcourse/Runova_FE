import styled from '@emotion/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { TabParamList } from '@/types/navigation.types';

type Props = NativeStackScreenProps<TabParamList, 'Settings'>;

const Screen = styled.View(({ theme }) => ({
  flex: 1,
  padding: theme.spacing[4],
  backgroundColor: theme.colors.gray[50],
  justifyContent: 'center',
  alignItems: 'center',
}));

const Title = styled.Text(({ theme }) => ({
  color: theme.colors.primary[700],
  fontSize: theme.typography.heading.fontSize,
  fontWeight: theme.typography.heading.fontWeight,
}));

export default function Settings() {
  return (
    <Screen>
      <Title>Settings Page</Title>
    </Screen>
  );
}
