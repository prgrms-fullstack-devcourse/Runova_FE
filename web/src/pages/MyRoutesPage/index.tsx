import styled from '@emotion/styled';
import Header from '@/components/layout/Header';
import { useBack } from '@/hooks/useBack';
import RouteItem from '@/components/common/RouteItem';
import type { RoutePreview } from '@/types/mypage';

const Main = styled.main`
  padding-top: 48px;
  padding-bottom: 24px;
`;
const List = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const mock: RoutePreview[] = [
  {
    id: 'r1',
    title: '한강공원 코스',
    meta: `5.2km • 평균 페이스 5'30"`,
    savedAt: '2024.01.15 저장',
    thumbnail: 'https://picsum.photos/160/160',
  },
  {
    id: 'r2',
    title: '올림픽공원 둘레길',
    meta: `3.8km • 평균 페이스 6'10"`,
    savedAt: '2024.01.12 저장',
    thumbnail: 'https://picsum.photos/160/160',
  },
];

export default function RoutesPage() {
  const goBack = useBack('/mypage');
  return (
    <>
      <Header title="나의 경로" onBack={goBack} />
      <Main>
        <List>
          {mock.map((r) => (
            <RouteItem key={r.id} data={r} />
          ))}
        </List>
      </Main>
    </>
  );
}
