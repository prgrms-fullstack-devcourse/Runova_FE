import styled from '@emotion/styled';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionCarousel from './_components/SectionCarousel';
import PostCard from '../_components/Postcard';
import CommunityAppLayout from '../_components/CommunityAppLayout';
import Fab from '../_components/Fab';
import type { Post } from '@/types/community';
import { getPosts, getReadablePostError } from '@/api/posts';

export default function CommunityList() {
  const navigate = useNavigate();

  // 섹션별 상태
  const [runPosts, setRunPosts] = useState<Post[]>([]);
  const [photoPosts, setPhotoPosts] = useState<Post[]>([]);
  const [routePosts, setRoutePosts] = useState<Post[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [mate, proof, share, latest] = await Promise.all([
          // 러닝 메이트
          getPosts({ category: 'MATE', limit: 5 }),
          // 인증샷
          getPosts({ category: 'PROOF', limit: 5 }),
          // 경로 공유
          getPosts({ category: 'SHARE', limit: 5 }),
          // 최신 전체
          getPosts({ limit: 5 }),
        ]);

        if (!mounted) return;
        setRunPosts(mate);
        setPhotoPosts(proof);
        setRoutePosts(share);
        setLatestPosts(latest);
      } catch (e) {
        if (!mounted) return;
        setError(getReadablePostError(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const toPostCard = (p: Post) => <PostCard key={p.id} post={p} />;

  const itemsRun = useMemo(() => runPosts.map(toPostCard), [runPosts]);
  const itemsPhoto = useMemo(() => photoPosts.map(toPostCard), [photoPosts]);
  const itemsRoute = useMemo(() => routePosts.map(toPostCard), [routePosts]);
  const itemsLatest = useMemo(() => latestPosts.map(toPostCard), [latestPosts]);

  return (
    <CommunityAppLayout title="Runova">
      {loading && <Hint>불러오는 중…</Hint>}
      {!loading && (
        <Container>
          {error && <ErrorMsg>{error}</ErrorMsg>}

          <SectionCarousel
            icon={<i className="ri-run-fill" />}
            title="러닝메이트 구해요!"
            items={itemsRun}
            onMoreClick={() => navigate('/community/feed/mate')}
          />

          <SectionCarousel
            icon={<i className="ri-camera-2-fill" />}
            title="인증샷"
            items={itemsPhoto}
            onMoreClick={() => navigate('/community/feed/proof')}
          />

          <SectionCarousel
            icon={<i className="ri-route-line" />}
            title="경로 공유"
            items={itemsRoute}
            onMoreClick={() => navigate('/community/feed/share')}
          />

          <SectionCarousel
            icon={<i className="ri-article-fill" />}
            title="최신 포스트"
            items={itemsLatest}
            onMoreClick={() => navigate('/community/feed/all')}
          />
        </Container>
      )}

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

const Hint = styled.div`
  padding: 8px 12px;
  color: ${({ theme }) => theme.colors.subtext};
  font-size: 14px;
`;

const ErrorMsg = styled.div`
  padding: 8px 12px;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 14px;
`;
