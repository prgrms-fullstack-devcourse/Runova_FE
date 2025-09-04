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

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // 최신순으로 전체 가져오고 클라이언트에서 섹션 분리
        const items = await getPosts({ sort: 'recent' });
        if (mounted) {
          setPosts(items);
          setError(null);
        }
      } catch (e) {
        if (mounted) setError(getReadablePostError(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const toPostCard = (p: Post) => <PostCard key={p.id} post={p} />;

  // 섹션별 분기
  const itemsRun = useMemo(
    () =>
      posts
        .filter((p) => p.category === 'MATE')
        .slice(0, 5)
        .map(toPostCard),
    [posts],
  );
  const itemsPhoto = useMemo(
    () =>
      posts
        .filter((p) => p.category === 'PROOF')
        .slice(0, 5)
        .map(toPostCard),
    [posts],
  );
  const itemsRoute = useMemo(
    () =>
      posts
        .filter((p) => p.category === 'SHARE')
        .slice(0, 5)
        .map(toPostCard),
    [posts],
  );
  // 최신 포스트: 카테고리 구분 없이 상단 5개
  const itemsLatest = useMemo(() => posts.slice(0, 5).map(toPostCard), [posts]);

  return (
    <CommunityAppLayout title="Runova">
      <Container>
        {loading && <Hint>불러오는 중…</Hint>}
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
  color: #6b7280;
  font-size: 14px;
`;

const ErrorMsg = styled.div`
  padding: 8px 12px;
  color: #ef4444;
  font-size: 14px;
`;
