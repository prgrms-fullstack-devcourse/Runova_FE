import styled from '@emotion/styled';
import Header from '@/components/layout/Header';
import { useBack } from '@/hooks/useBack';
import PostCard from '@/components/common/PostCard';
import type { PostPreview } from '@/types/mypage';

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

const mock: PostPreview[] = [
  {
    id: 'p1',
    title: '첫 10km 완주 후기!',
    excerpt: '드디어 목표했던 10km를 완주했습니다. 처음엔 힘들었지만...',
    date: '2024.01.14',
    like: 24,
    comments: 8,
  },
  {
    id: 'p2',
    title: '겨울 러닝 준비물 추천',
    excerpt: '추운 날씨에도 꾸준히 달리기 위한 필수 아이템들을 정리해봤어요...',
    date: '2024.01.10',
    like: 18,
    comments: 12,
  },
];

export default function PostsPage() {
  const goBack = useBack('/mypage');
  return (
    <>
      <Header title="내가 쓴 글" onBack={goBack} />
      <Main>
        <List>
          {mock.map((p) => (
            <PostCard key={p.id} data={p} />
          ))}
        </List>
      </Main>
    </>
  );
}
