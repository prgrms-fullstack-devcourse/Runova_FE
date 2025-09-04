import styled from '@emotion/styled';
import Header from '@/components/layout/Header';
import { useBack } from '@/hooks/useBack';
import CertItem from '@/components/common/CertItem';
import type { CertPreview } from '@/types/mypage';

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

const mock: CertPreview[] = [
  {
    id: 'c1',
    title: '오늘의 아침 러닝 완료!',
    place: '한강공원 • 5.2km',
    datetime: '2024.01.15 오전 7:30',
    thumbnail: 'https://picsum.photos/160/160',
  },
  {
    id: 'c2',
    title: '저녁 러닝 목표 달성!',
    place: '올림픽공원 • 3.8km',
    datetime: '2024.01.12 오후 6:45',
    thumbnail: 'https://picsum.photos/160/160',
  },
];

export default function CertsPage() {
  const goBack = useBack('/mypage');
  return (
    <>
      <Header title="나의 인증 사진" onBack={goBack} />
      <Main>
        <List>
          {mock.map((c) => (
            <CertItem key={c.id} data={c} />
          ))}
        </List>
      </Main>
    </>
  );
}
