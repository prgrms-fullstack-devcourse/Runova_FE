import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import styled from '@emotion/styled';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import EditForm from './_components/EditForm';
import type { Category } from '@/types/community';
import type { EditPatch } from './_components/EditForm';
import { useBack } from '@/hooks/useBack';
import {
  createPost,
  getReadablePostError,
  getPost,
  updatePostById,
} from '@/api/posts';
import { fetchRunningRecords } from '@/api/running';
import { searchUserCourses } from '@/api/courses';

const PROOF_KEYS: Exclude<Category, 'ALL'>[] = ['PROOF'];
const SHARE_KEYS: Exclude<Category, 'ALL'>[] = ['SHARE'];

function isProofCategory(cat: Exclude<Category, 'ALL'>) {
  return PROOF_KEYS.includes(cat);
}
function isShareCategory(cat: Exclude<Category, 'ALL'>) {
  return SHARE_KEYS.includes(cat);
}

type ItemShape = {
  id: string;
  imageUrl?: string;
  title?: string;
  date?: string;
};

export default function CommunityEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const goBack = useBack();
  const editing = !!id;

  const [category, setCategory] = useState<Exclude<Category, 'ALL'>>('FREE');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [routeId, setRouteId] = useState<number | undefined>(undefined);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [items, setItems] = useState<ItemShape[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [listDone, setListDone] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!editing || !id) return;
      try {
        setLoading(true);
        const data = await getPost(id);
        if (!mounted) return;
        setCategory(data.category);
        setTitle(data.title ?? '');
        setContent(data.content ?? '');
        setImageUrls(Array.isArray(data.imageUrls) ? data.imageUrls : []);
        if (typeof data.routeId === 'number') setRouteId(data.routeId);
      } catch (e) {
        alert(getReadablePostError(e));
        navigate('/community', { replace: true });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [editing, id, navigate]);

  const handleFormChange = useCallback((patch: EditPatch) => {
    if (patch.category && patch.category !== 'ALL') setCategory(patch.category);
    if (typeof patch.title === 'string') setTitle(patch.title);
    if (typeof patch.content === 'string') setContent(patch.content);
    if (Array.isArray(patch.imageUrls)) setImageUrls(patch.imageUrls);
    if (
      typeof patch.routeId === 'number' ||
      typeof patch.routeId === 'undefined'
    ) {
      setRouteId(patch.routeId);
    }
  }, []);

  // 카테고리 바뀌면 목록 초기화
  useEffect(() => {
    setItems([]);
    setCursor(null);
    setListDone(true);
  }, [category]);

  // 페이지 로드 함수
  const loadMore = useCallback(async () => {
    if (listLoading || listDone) return;
    if (!isProofCategory(category) && !isShareCategory(category)) return;

    setListLoading(true);
    try {
      if (isProofCategory(category)) {
        const { results, nextCursor } = await fetchRunningRecords(
          cursor ?? undefined,
        );
        setItems((prev) => [
          ...prev,
          ...results.map((r) => ({
            id: r.id,
            imageUrl: r.imageUrl,
            title: r.title ?? '러닝 인증',
            date: r.date,
          })),
        ]);
        setCursor(nextCursor);
        if (!nextCursor || results.length === 0) setListDone(true);
      } else if (isShareCategory(category)) {
        const { results, nextCursor } = await searchUserCourses(
          cursor ?? undefined,
        );
        setItems((prev) => [
          ...prev,
          ...results.map((c) => ({
            id: c.id,
            imageUrl: c.imageUrl,
            title: c.title ?? '코스 공유',
            date: c.date,
          })),
        ]);
        setCursor(nextCursor);
        if (!nextCursor || results.length === 0) setListDone(true);
      }
    } catch (e) {
      console.error(e);
      // 필요시 토스트/알럿
    } finally {
      setListLoading(false);
    }
  }, [category, cursor, listDone, listLoading]);

  useEffect(() => {
    if (
      (isProofCategory(category) || isShareCategory(category)) &&
      !listDone &&
      !listLoading &&
      items.length === 0
    ) {
      void loadMore();
    }
  }, [category, listDone, listLoading, items.length, loadMore]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    if (listDone) return;

    const el = sentinelRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((e) => e.isIntersecting);
        if (isVisible && !listLoading) {
          void loadMore();
        }
      },
      {
        root: null,
        rootMargin: '200px 0px',
        threshold: 0.01,
      },
    );
    io.observe(el);
    return () => io.unobserve(el);
  }, [loadMore, listDone, listLoading]);

  const submit = async () => {
    if (!title.trim()) return alert('제목을 입력하세요.');
    if (!content.trim()) return alert('내용을 입력하세요.');

    try {
      setSubmitting(true);

      if (editing && id) {
        await updatePostById(id, {
          type: category,
          title,
          content,
          imageUrls,
          ...(typeof routeId === 'number' ? { routeId } : {}),
        });
        navigate(`/community/${id}`, { replace: true });
        return;
      }

      const created = await createPost({
        type: category,
        title,
        content,
        imageUrls,
        routeId,
      });
      navigate(`/community/${created.id}`, { replace: true });
    } catch (e) {
      alert(getReadablePostError(e));
    } finally {
      setSubmitting(false);
    }
  };

  const formItems = useMemo(
    () =>
      items.map((it) => ({
        id: it.id,
        imageUrl: it.imageUrl ?? 'https://picsum.photos/200?blur',
        title: it.title ?? '',
        date: it.date ?? '',
      })),
    [items],
  );

  return (
    <AppLayout
      title={editing ? '글 수정' : '글 작성'}
      topOffset={48}
      onBack={goBack}
    >
      {loading ? (
        <Loading>불러오는 중…</Loading>
      ) : (
        <>
          <EditForm
            category={category}
            title={title}
            content={content}
            items={formItems}
            submitting={submitting}
            submitLabel={editing ? '수정하기' : '작성하기'}
            onChange={handleFormChange}
            onSubmit={submit}
            footerSlot={
              (isProofCategory(category) || isShareCategory(category)) && (
                <FooterArea>
                  {!listDone && <Sentinel ref={sentinelRef} />}
                  {listLoading && <SmallHint>불러오는 중…</SmallHint>}
                  {listDone && items.length > 0 && (
                    <SmallHint>마지막 항목입니다.</SmallHint>
                  )}
                  {listDone && items.length === 0 && (
                    <SmallHint>표시할 항목이 없습니다</SmallHint>
                  )}
                </FooterArea>
              )
            }
          />
        </>
      )}
    </AppLayout>
  );
}

const Loading = styled.div`
  padding: 16px;
  color: ${({ theme }) => theme.colors.subtext};
  font-size: 14px;
`;

const FooterArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0 24px;
  gap: 8px;
`;

const Sentinel = styled.div`
  width: 100%;
  height: 1px;
`;

const SmallHint = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.subtext};
`;
