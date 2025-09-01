import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

import type { Post } from '@/types/community';
import PostCard from '../_components/Postcard';
import Fab from '../_components/Fab';
import CommunityAppLayout from '../_components/CommunityAppLayout';

type FeedType = 'run' | 'photo' | 'route' | 'latest';

const TITLE_MAP: Record<FeedType, string> = {
  run: '러닝메이트 구해요!',
  photo: '인증샷',
  route: '경로 공유',
  latest: '최신 포스트',
};

async function fetchPosts(
  cursor: number | null,
  limit = 10,
  feedType?: FeedType,
): Promise<{
  data: Post[];
  nextCursor: number | null;
}> {
  await new Promise((r) => setTimeout(r, 400));
  const start = cursor ?? 0;
  const end = start + limit;

  const data: Post[] = Array.from({ length: limit }).map((_, idx) => {
    const n = start + idx + 1;
    return {
      id: String(n),
      // 필요하면 feedType을 Category로 매핑해서 채워도 됨
      // category: 'mate' | 'auth' | 'share' | 'free' 중 선택
      category:
        feedType === 'run'
          ? 'mate'
          : feedType === 'photo'
            ? 'auth'
            : feedType === 'route'
              ? 'share'
              : 'free',
      title: `샘플 제목 ${n}`,
      author: '홍길동',
      commentsCount: (n * 3) % 17,
      content:
        n % 3 === 0
          ? '오늘은 날씨가 좋아서 산책을 다녀왔습니다. '.repeat(8)
          : '오늘은 날씨가 좋아서 산책을 다녀왔습니다.',
      liked: n % 2 === 0,
      likeCount: (n * 7) % 53,
      postImageUrl:
        n % 2 === 0 ? `https://picsum.photos/600/300?random=${n}` : undefined,
    };
  });

  const nextCursor = end >= 50 ? null : end;
  return { data, nextCursor };
}

export default function CommunityFeed() {
  const navigate = useNavigate();
  const { type = 'latest' } = useParams<{ type: FeedType }>();
  const title = TITLE_MAP[type as FeedType] ?? TITLE_MAP.latest;
  const [items, setItems] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);

  const canLoadMore = useMemo(() => cursor !== null, [cursor]);

  const loadMore = useCallback(async () => {
    if (loading || !canLoadMore) return;
    setLoading(true);
    try {
      const res = await fetchPosts(cursor, 10);
      setItems((prev) => [...prev, ...res.data]);
      setCursor(res.nextCursor);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, canLoadMore]);

  useEffect(() => {
    if (items.length === 0) loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) loadMore();
      },
      { root: null, rootMargin: '200px 0px', threshold: 0 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  return (
    <CommunityAppLayout title={title} onBack={() => window.history.back()}>
      <Page>
        <List>
          {items.map((p) => (
            <CardWrap key={p.id}>
              <PostCard post={p} />
            </CardWrap>
          ))}

          {loading && <Loading>불러오는 중…</Loading>}

          {canLoadMore && <Sentinel ref={sentinelRef} />}
        </List>
        <Fab
          icon={<i className="ri-edit-2-fill" />}
          onClick={() => navigate('/community/edit')}
        />
      </Page>
    </CommunityAppLayout>
  );
}

const PAGE_TOP_OFFSET = 72;

const Page = styled.main`
  padding-top: ${PAGE_TOP_OFFSET}px;
  width: 100%;
  min-height: 100dvh;
  background: ${({ theme }) => theme.colors.surface};
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 12px 24px;
`;

const CardWrap = styled.article`
  overflow: hidden;
`;

const Loading = styled.div`
  ${({ theme }) => theme.typography.small};
  color: ${({ theme }) => theme.colors.subtext};
  text-align: center;
  padding: 12px 0;
`;

const Sentinel = styled.div`
  width: 100%;
  height: 1px;
`;
