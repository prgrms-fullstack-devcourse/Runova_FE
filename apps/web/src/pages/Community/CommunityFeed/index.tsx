import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { useNavigate, useParams } from 'react-router-dom';
import CommunityAppLayout from '../_components/CommunityAppLayout';
import PostCard from '../_components/Postcard';
import Fab from '../_components/Fab';
import type { Post, Category } from '@/types/community';
import { getPostsCursor } from '@/api/posts';

type RouteType = 'all' | 'free' | 'proof' | 'share' | 'mate';

const TITLE_MAP: Record<RouteType, string> = {
  all: '전체',
  free: '자유',
  proof: '인증샷',
  share: '경로 공유',
  mate: '러닝메이트 구해요!',
};

const ROUTE_TO_CATEGORY: Record<RouteType, Category> = {
  all: 'ALL',
  free: 'FREE',
  proof: 'PROOF',
  share: 'SHARE',
  mate: 'MATE',
};

export default function CommunityFeed() {
  const navigate = useNavigate();
  const { type: rawType } = useParams<{ type?: string }>();

  const routeType: RouteType =
    rawType === 'free' ||
    rawType === 'proof' ||
    rawType === 'share' ||
    rawType === 'mate'
      ? rawType
      : 'all';

  const title = TITLE_MAP[routeType];
  const category = ROUTE_TO_CATEGORY[routeType];

  const [items, setItems] = useState<Post[]>([]);
  // undefined: 아직 로드 전 / number: 다음 커서 / null: 더 없음
  const [cursor, setCursor] = useState<number | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // StrictMode 중복호출/동시호출 방지
  const inFlightRef = useRef(false);
  const initialLoadRef = useRef(false);

  // 첫 로드 전에 옵저버 붙어서 중복 호출되는 것 방지
  const canLoadMore = useMemo(
    () => cursor !== null && cursor !== undefined,
    [cursor],
  );

  const loadMore = useCallback(async () => {
    // 더 없음 + 이미 아이템 있으면 차단
    if (cursor === null && items.length > 0) return;
    // 동시 호출 가드
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const { items: page, nextCursor } = await getPostsCursor({
        type: category !== 'ALL' ? category : undefined,
        sort: 'recent',
        limit: 10,
        cursor, // undefined면 첫 페이지
      });

      setItems((prev) => [...prev, ...page]);
      setCursor(nextCursor ?? null);
    } catch {
      setError('목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [category, cursor, items.length]);

  // 카테고리 변경 시 완전 초기화
  useEffect(() => {
    setItems([]);
    setCursor(undefined);
    initialLoadRef.current = false;
  }, [category]);

  // 첫 로드 1회만
  useEffect(() => {
    if (cursor === undefined && !initialLoadRef.current && !loading) {
      initialLoadRef.current = true;
      void loadMore();
    }
  }, [cursor, loading, loadMore]);

  // 무한스크롤
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !canLoadMore) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !loading) void loadMore();
      },
      { root: null, rootMargin: '200px 0px', threshold: 0 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [canLoadMore, loading, loadMore]);

  return (
    <CommunityAppLayout title={title} onBack={() => window.history.back()}>
      <Page>
        <List>
          {error && <ErrorText>{error}</ErrorText>}

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

const PAGE_TOP_OFFSET = 0;

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

const ErrorText = styled.div`
  ${({ theme }) => theme.typography.small};
  color: ${({ theme }) => theme.colors.danger};
  text-align: center;
  padding: 12px 0;
`;

const Sentinel = styled.div`
  width: 100%;
  height: 1px;
`;
