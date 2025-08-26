import styled from '@emotion/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';

import type { RootStackParamList } from '@/types/navigation.types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const Screen = styled.View(({ theme }) => ({
  flex: 1,
  padding: theme.spacing[4],
  backgroundColor: theme.colors.gray[50],
}));

const Title = styled.Text(({ theme }) => ({
  color: theme.colors.primary[700],
  fontSize: theme.typography.heading.fontSize,
  fontWeight: theme.typography.heading.fontWeight,
}));

const Card = styled.View(({ theme }) => ({
  marginTop: theme.spacing[3],
  padding: theme.spacing[4],
  borderRadius: theme.radius.md,
  backgroundColor: theme.colors.primary[50],
  borderWidth: 1,
  borderColor: theme.colors.primary[300],
}));

const Body = styled.Text(({ theme }) => ({
  color: theme.colors.gray[900],
  fontSize: theme.typography.body.fontSize,
}));

const Button = styled.TouchableOpacity(({ theme }) => ({
  marginTop: theme.spacing[4],
  paddingVertical: theme.spacing[3],
  borderRadius: theme.radius.md,
  alignItems: 'center',
  backgroundColor: theme.colors.primary[600],
}));

const ButtonLabel = styled.Text(({ theme }) => ({
  color: theme.colors.gray[50],
  fontWeight: '700',
}));

export default function Home({ navigation }: Props) {
  const [count, setCount] = useState(0);

  return (
    <Screen>
      <Title>Emotion Theme Test</Title>

      <Card>
        <Body>Count: {count}</Body>
      </Card>

      <Button onPress={() => setCount((c) => c + 1)}>
        <ButtonLabel>+1</ButtonLabel>
      </Button>
      <Button onPress={() => navigation.navigate('Details', { id: '42' })}>
        <ButtonLabel>Go to Details</ButtonLabel>
      </Button>
      <Button onPress={() => navigation.navigate('CommunityList')}>
        <ButtonLabel>커뮤니티 목록 열기</ButtonLabel>
      </Button>
      <Button onPress={() => navigation.navigate('WebCommunity')}>
        <ButtonLabel>웹뷰 커뮤니티 열기</ButtonLabel>
      </Button>
    </Screen>
  );
}
