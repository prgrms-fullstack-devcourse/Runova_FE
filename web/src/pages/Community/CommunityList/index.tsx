// pages/community/CommunityList.tsx
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import SectionCarousel from './_components/SectionCarousel';
import PostCard from '../_components/Postcard';
import CommunityAppLayout from '../_components/CommunityAppLayout';
import Fab from '../_components/Fab';
import type { Post } from '@/types/community';

export default function CommunityList() {
  const navigate = useNavigate();

  const mkPost = (
    seed: number,
    category: Post['category'],
    withImage = false,
  ): Post => ({
    id: String(seed),
    category,
    title: `샘플 제목 ${seed}`,
    author: '홍길동',
    commentsCount: (seed * 3) % 10,
    content:
      seed % 3 === 0
        ? '오늘은 날씨가 좋아서 산책을 다녀왔습니다. '.repeat(4)
        : '오늘은 날씨가 좋아서 산책을 다녀왔습니다.',
    liked: seed % 2 === 0,
    likeCount: seed % 20,
    postImageUrl: withImage
      ? `https://picsum.photos/600/300?random=${seed}`
      : undefined,
  });

  const postsMate: Post[] = [1, 2, 3, 4, 5].map((n) =>
    mkPost(n, 'mate', false),
  );
  const postsPhoto: Post[] = [6, 7, 8, 9, 10].map((n) =>
    mkPost(n, 'auth', true),
  );
  const postsRoute: Post[] = [11, 12, 13, 14, 15].map((n) =>
    mkPost(n, 'share', false),
  );
  const postsLatest: Post[] = [16, 17, 18, 19, 20].map((n) =>
    mkPost(n, 'free', true),
  );

  const toPostCard = (p: Post) => <PostCard key={p.id} post={p} />;

  const itemsRun = postsMate.slice(0, 5).map(toPostCard);
  const itemsPhoto = postsPhoto.slice(0, 5).map(toPostCard);
  const itemsRoute = postsRoute.slice(0, 5).map(toPostCard);
  const itemsLatest = postsLatest.slice(0, 5).map(toPostCard);

  return (
    <CommunityAppLayout title="Runova">
      <Container>
        <SectionCarousel
          icon={<i className="ri-run-fill" />}
          title="러닝메이트 구해요!"
          items={itemsRun}
          onMoreClick={() => navigate('/community/feed/run')}
        />
        <SectionCarousel
          icon={<i className="ri-camera-2-fill" />}
          title="인증샷"
          items={itemsPhoto}
          onMoreClick={() => navigate('/community/feed/photo')}
        />
        <SectionCarousel
          icon={<i className="ri-route-line" />}
          title="경로 공유"
          items={itemsRoute}
          onMoreClick={() => navigate('/community/feed/route')}
        />
        <SectionCarousel
          icon={<i className="ri-article-fill" />}
          title="최신 포스트"
          items={itemsLatest}
          onMoreClick={() => navigate('/community/feed/latest')}
        />
      </Container>
      <Fab
        icon={<i className="ri-edit-2-fill" />}
        onClick={() => navigate('/community/edit')}
      />
    </CommunityAppLayout>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
