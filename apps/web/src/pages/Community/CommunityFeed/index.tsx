import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import CommunityAppLayout from '../_components/CommunityAppLayout';
import PostCard from '../_components/Postcard';
import Fab from '../_components/Fab';
import type { Post, Category } from '@/types/community';
import { getPostsCursor } from '@/api/posts';
import { useNativeBridgeStore } from '@/stores/nativeBridgeStore';
import type { ServerPostType } from '@/api/posts';

type RouteType = 'all' | 'free' | 'proof' | 'share' | 'mate' | 'my';

const TITLE_MAP: Record<RouteType, string> = {
  all: '전체',
  free: '자유',
  proof: '인증샷',
  share: '경로 공유',
  mate: '러닝메이트 구해요!',
  my: '내가 쓴 글',
};

const ROUTE_TO_CATEGORY: Record<RouteType, Category> = {
  all: 'ALL',
  free: 'FREE',
  proof: 'PROOF',
  share: 'SHARE',
  mate: 'MATE',
  my: 'ALL', // my는 카테고리 필터 대신 authorId 사용
};

function toNum(v: string | null): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

// 서버가 허용하는 type만 필터로 사용
const POST_TYPES = ['FREE', 'PROOF', 'SHARE', 'MATE'] as const;
type PostType = (typeof POST_TYPES)[number];

export default function CommunityFeed() {
  const navigate = useNavigate();
  const { type: rawType } = useParams<{ type?: string }>();
  const [searchParams] = useSearchParams();

  const routeType: RouteType =
    rawType === 'free' ||
    rawType === 'proof' ||
    rawType === 'share' ||
    rawType === 'mate' ||
    rawType === 'my'
      ? rawType
      : 'all';

  const category = ROUTE_TO_CATEGORY[routeType];

  // 쿼리 파라미터 해석
  const qsAuthorId = toNum(searchParams.get('authorId'));
  const qsLimit = toNum(searchParams.get('limit')) ?? 10;
  const qsSort = searchParams.get('sort') === 'popular' ? 'popular' : 'recent';

  // 쿼리 type (FREE/PROOF/SHARE/MATE) 안전 파싱
  const rawQsType = (searchParams.get('type') || '').toUpperCase();
  const qsType: PostType | undefined = POST_TYPES.includes(
    rawQsType as PostType,
  )
    ? (rawQsType as PostType)
    : undefined;

  // 네이티브에 실린 유저 ID (백업)
  const nativeUserId = useNativeBridgeStore((s) => s.init?.user?.id);
  const nativeAuthorId = useMemo(() => {
    const n = Number(nativeUserId);
    return Number.isFinite(n) ? n : undefined;
  }, [nativeUserId]);

  // 최종 authorId (my일 때만 사용)
  const effectiveAuthorId =
    routeType === 'my' ? (qsAuthorId ?? nativeAuthorId) : undefined;

  // 실제 API에 넘길 type
  const effectiveType: ServerPostType | undefined =
    routeType !== 'my'
      ? category !== 'ALL'
        ? category // 'ALL'을 제외했으니 'FREE'|'PROOF'|'SHARE'|'MATE' 로 좁혀짐
        : undefined
      : qsType; // 쿼리에서 온 것도 동일 유니온 타입

  const title = useMemo(() => {
    if (routeType !== 'my') return TITLE_MAP[routeType];
    switch (qsType) {
      case 'PROOF':
        return '내 인증샷';
      case 'SHARE':
        return '내 경로 공유';
      case 'MATE':
        return '내 메이트 글';
      case 'FREE':
        return '내 자유글';
      default:
        return TITLE_MAP.my;
    }
  }, [routeType, qsType]);

  const [items, setItems] = useState<Post[]>([]);
  // undefined: 아직 첫 로드 전 / string|number: 다음 커서 / null: 더 없음
  const [cursor, setCursor] = useState<string | number | null | undefined>(
    undefined,
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 동시 호출/중복 첫 로드 방지
  const inFlightRef = useRef(false);
  const initialLoadRef = useRef(false);

  const canLoadMore = useMemo(
    () => cursor !== null && cursor !== undefined,
    [cursor],
  );

  const loadMore = useCallback(async () => {
    if (cursor === null && items.length > 0) return;
    if (inFlightRef.current) return;

    if (routeType === 'my' && typeof effectiveAuthorId !== 'number') {
      setError('로그인이 필요합니다.');
      return;
    }

    inFlightRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const { items: page, nextCursor } = await getPostsCursor({
        type: effectiveType,
        authorId: effectiveAuthorId,
        sort: qsSort,
        limit: qsLimit,
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
  }, [
    routeType,
    effectiveAuthorId,
    effectiveType,
    qsSort,
    qsLimit,
    cursor,
    items.length,
  ]);

  // 필터(타입/작성자) 변경 시 초기화
  useEffect(() => {
    setItems([]);
    setCursor(undefined);
    initialLoadRef.current = false;
    setError(null);
  }, [routeType, effectiveAuthorId, effectiveType, qsSort, qsLimit]);

  // 첫 로드 1회
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
