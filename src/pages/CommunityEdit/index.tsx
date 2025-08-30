import styled from '@emotion/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { samplePosts } from '@/store/community.mock';
import type { CategoryKey } from '@/types/community.type';
import type { RootStackParamList } from '@/types/navigation.types';

type Props = NativeStackScreenProps<RootStackParamList, 'CommunityEdit'>;

export default function CommunityEdit({ route, navigation }: Props) {
  const postId = route.params?.postId;
  const existing = useMemo(
    () => samplePosts.find((p) => p.id === postId),
    [postId],
  );

  const [title, setTitle] = useState(existing?.title ?? '');
  const [content, setContent] = useState(existing?.content ?? '');
  const [category, setCategory] = useState<Exclude<CategoryKey, 'all'>>(
    existing?.category ?? 'free',
  );

  const isEdit = !!existing;

  return (
    <Safe>
      <Header>
        <BackButton onPress={() => navigation.goBack()}>
          <Back>‹</Back>
        </BackButton>
        <H1>{isEdit ? '게시글 수정' : '글 작성'}</H1>
        <View style={{ width: 20 }} />
      </Header>

      <Body>
        <Label>카테고리</Label>
        <Row>
          {(['free', 'auth', 'share', 'mate'] as const).map((c) => (
            <CatPill
              key={c}
              active={category === c}
              onPress={() => setCategory(c)}
            >
              <CatText active={category === c}>
                {c === 'free'
                  ? '자유'
                  : c === 'auth'
                    ? '인증'
                    : c === 'share'
                      ? '공유'
                      : '메이트'}
              </CatText>
            </CatPill>
          ))}
        </Row>

        {/* ▼▼ 카테고리별 보조 리스트 ▼▼ */}
        {category === 'auth' && (
          <>
            <Label>달리기 기록</Label>
            <ListBox>
              <ListScroll>
                {sampleRecords.map((rec) => (
                  <ListItem key={rec.id}>
                    <ListItemHeader>
                      <ItemTitle>{rec.title}</ItemTitle>
                      <ItemSub>{rec.date}</ItemSub>
                    </ListItemHeader>
                    <ItemMetaRow>
                      <ItemMeta>{rec.distance}</ItemMeta>
                      <ItemMeta>{rec.duration}</ItemMeta>
                      <ItemMeta>{rec.pace}</ItemMeta>
                    </ItemMetaRow>
                  </ListItem>
                ))}
              </ListScroll>
            </ListBox>
          </>
        )}

        {category === 'share' && (
          <>
            <Label>저장된 경로</Label>
            <ListBox>
              <ListScroll>
                {sampleRoutes.map((rt) => (
                  <ListItem key={rt.id}>
                    <ListItemHeader>
                      <ItemTitle>{rt.name}</ItemTitle>
                      <ItemSub>{rt.distance}</ItemSub>
                    </ListItemHeader>
                    <ItemDesc>{rt.desc}</ItemDesc>
                  </ListItem>
                ))}
              </ListScroll>
            </ListBox>
          </>
        )}
        {/* ▲▲ 카테고리별 보조 리스트 ▲▲ */}

        <Label>제목</Label>
        <Input
          value={title}
          onChangeText={setTitle}
          placeholder="제목을 입력하세요"
        />

        <Label>내용</Label>
        <Input
          value={content}
          onChangeText={setContent}
          placeholder="내용을 입력하세요"
          multiline
          style={{ height: 140, textAlignVertical: 'top' }}
        />

        <Submit
          disabled={!title.trim()}
          onPress={() => {
            // TODO: 저장 API 연동
            navigation.goBack();
          }}
        >
          <SubmitText>{isEdit ? '수정하기' : '작성하기'}</SubmitText>
        </Submit>
      </Body>
    </Safe>
  );
}

/* ====== mock data for lists ====== */
const sampleRecords = [
  {
    id: 'rec1',
    title: '오늘 아침 러닝',
    date: '2025.08.18',
    distance: '5.2km',
    duration: '32:15',
    pace: `6'12"/km`,
  },
  {
    id: 'rec2',
    title: '주말 장거리',
    date: '2025.08.17',
    distance: '12.4km',
    duration: '1:15:30',
    pace: `6'05"/km`,
  },
  {
    id: 'rec3',
    title: '퇴근 러닝',
    date: '2025.08.16',
    distance: '4.8km',
    duration: '28:45',
    pace: `5'59"/km`,
  },
];

const sampleRoutes = [
  {
    id: 'rt1',
    name: '한강 하트 코스',
    distance: '6.5km',
    desc: '여의도공원 - 한강공원 - 여의도공원',
  },
  {
    id: 'rt2',
    name: '남산 순환코스',
    distance: '4.2km',
    desc: '남산타워 - 남산둘레길 - 남산타워',
  },
  {
    id: 'rt3',
    name: '올림픽공원 나비',
    distance: '8.1km',
    desc: '평화의문 - 몽촌토성 - 평화의문',
  },
];

/* ========== styled ========== */

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
  gap: 10,
}));

const Label = styled.Text(({ theme }) => ({
  fontSize: 13,
  color: theme.colors.gray[700],
  fontWeight: '600',
  marginTop: 4,
}));

const Row = styled.View(() => ({
  flexDirection: 'row',
  gap: 8,
  marginBottom: 2,
}));

const CatPill = styled.Pressable<{ active?: boolean }>(({ theme, active }) => ({
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: active ? theme.colors.primary[500] : '#e5e7eb',
  backgroundColor: active
    ? (theme.colors.primary[50] ?? '#eff6ff')
    : 'transparent',
}));

const CatText = styled.Text<{ active?: boolean }>(({ theme, active }) => ({
  fontSize: 12,
  fontWeight: '600',
  color: active ? theme.colors.primary[600] : theme.colors.gray[600],
}));

const Input = styled.TextInput(({ theme }) => ({
  borderWidth: 1,
  borderColor: theme.colors.gray[200],
  borderRadius: theme.radius.md ?? 10,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 14,
  backgroundColor: theme.colors.gray[50],
}));

const Submit = styled.TouchableOpacity<{ disabled?: boolean }>(
  ({ theme, disabled }) => ({
    marginTop: 8,
    backgroundColor: disabled
      ? theme.colors.primary[300]
      : theme.colors.primary[600],
    borderRadius: theme.radius.md ?? 10,
    paddingVertical: 14,
    alignItems: 'center',
  }),
);

const SubmitText = styled.Text(({ theme }) => ({
  color: theme.colors.gray[50],
  fontWeight: '700',
}));

/* 리스트 UI */
const ListBox = styled.View(({ theme }) => ({
  maxHeight: 160, // overflow-y 대체
  borderWidth: 1,
  borderColor: theme.colors.gray[200],
  borderRadius: theme.radius.md ?? 10,
  backgroundColor: theme.colors.gray[50],
  overflow: 'hidden',
}));

// RN에서는 ScrollView로 수직 스크롤 처리
const ListScroll = styled.ScrollView({
  // 별도 스타일 필요 없으면 비워둬도 됩니다
});

const ListItem = styled.View(({ theme }) => ({
  paddingHorizontal: 12,
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderColor: theme.colors.gray[200],
}));

const ListItemHeader = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 4,
});

const ItemTitle = styled.Text(({ theme }) => ({
  fontSize: 13,
  fontWeight: '600',
  color: theme.colors.gray[900],
}));

const ItemSub = styled.Text(({ theme }) => ({
  fontSize: 11,
  color: theme.colors.gray[500],
}));

const ItemMetaRow = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
});

const ItemMeta = styled.Text(({ theme }) => ({
  fontSize: 11,
  color: theme.colors.gray[600],
}));

const ItemDesc = styled.Text(({ theme }) => ({
  fontSize: 12,
  color: theme.colors.gray[600],
}));
