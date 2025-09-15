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
  uploadProofWithFile,
} from '@/api/posts';
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
  length?: number;
};

export default function CommunityEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const goBack = useBack();
  const editing = !!id;

  const [category, setCategory] = useState<Exclude<Category, 'ALL'>>('FREE');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string>(''); // 단일 이미지 URL
  const [routeId, setRouteId] = useState<number | undefined>(undefined);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [items, setItems] = useState<ItemShape[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [listDone, setListDone] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>('');
  const [proofUploading, setProofUploading] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const inFlightRef = useRef(false);

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
        setImageUrl(typeof data.imageUrl === 'string' ? data.imageUrl : '');
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
      if (proofPreview) URL.revokeObjectURL(proofPreview);
    };
  }, [editing, id, navigate, proofPreview]);

  const handleFormChange = useCallback((patch: EditPatch) => {
    if (patch.category && patch.category !== 'ALL') setCategory(patch.category);
    if (typeof patch.title === 'string') setTitle(patch.title);
    if (typeof patch.content === 'string') setContent(patch.content);
    if (typeof patch.imageUrl === 'string') setImageUrl(patch.imageUrl);
  }, []);

  // 카테고리 바뀌면 목록 초기화 + PROOF 미리보기 정리
  useEffect(() => {
    setItems([]);
    setCursor(null);
    setListDone(false);
    setListError(null);

    if (!isProofCategory(category)) {
      if (proofPreview) URL.revokeObjectURL(proofPreview);
      setProofFile(null);
      setProofPreview('');
    }
  }, [category, proofPreview]);

  const loadMore = useCallback(async () => {
    if (inFlightRef.current) return;
    if (listLoading || listDone) return;
    if (!isShareCategory(category)) return;
    if (cursor === null && items.length > 0) return;

    inFlightRef.current = true;
    setListLoading(true);
    setListError(null);
    try {
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
          length: c.length,
        })),
      ]);
      setCursor(nextCursor);
      if (!nextCursor || results.length === 0) setListDone(true);
    } catch (e) {
      console.error(e);
      const msg =
        e instanceof Error
          ? e.message
          : '알 수 없는 오류가 발생했어요. 잠시 후 다시 시도해 주세요.';
      setListError(msg);
    } finally {
      setListLoading(false);
      inFlightRef.current = false;
    }
  }, [category, cursor, listDone, listLoading, items.length]);

  useEffect(() => {
    if (
      isShareCategory(category) &&
      !listDone &&
      !listLoading &&
      !listError &&
      items.length === 0
    ) {
      void loadMore();
    }
  }, [category, listDone, listError, listLoading, items.length, loadMore]);

  // 무한 스크롤 — 🔸 SHARE에서만
  useEffect(() => {
    if (!sentinelRef.current) return;
    if (listDone || listError || !isShareCategory(category)) return;

    const el = sentinelRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((e) => e.isIntersecting);
        if (isVisible && !listLoading && !inFlightRef.current) {
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
  }, [loadMore, listDone, listError, listLoading, category]);

  // 파일 선택 핸들러 (미리보기, 단일 파일)
  const handlePickProofFile = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >(
    (e) => {
      const f = (e.target.files && e.target.files[0]) || null;
      if (!f) return;
      if (proofPreview) URL.revokeObjectURL(proofPreview);
      setProofFile(f);
      setProofPreview(URL.createObjectURL(f));
    },
    [proofPreview],
  );

  const handleSelectCourse = useCallback(
    (clickedId: string) => {
      const found = items.find((it) => it.id === clickedId);
      const raw = found?.id ?? clickedId;
      const n = Number(raw);
      if (!Number.isFinite(n)) return;

      setRouteId(n);

      const nextImg = found?.imageUrl?.trim();
      if (nextImg) setImageUrl(nextImg);
    },
    [items],
  );

  const submit = async () => {
    if (!title.trim()) return alert('제목을 입력하세요.');
    if (!content.trim()) return alert('내용을 입력하세요.');
    if (isShareCategory(category) && typeof routeId !== 'number') {
      return alert('공유할 코스를 선택해주세요.');
    }

    try {
      setSubmitting(true);

      let finalImageUrl = imageUrl;
      if (isProofCategory(category) && proofFile) {
        setProofUploading(true);
        try {
          finalImageUrl = await uploadProofWithFile(proofFile);
        } finally {
          setProofUploading(false);
        }
      }

      if (editing && id) {
        await updatePostById(id, {
          type: category,
          title,
          content,
          imageUrl: finalImageUrl || null,
          ...(typeof routeId === 'number' ? { routeId } : {}),
        });
        navigate(`/community/${id}`, { replace: true });
        return;
      }

      const created = await createPost({
        type: category,
        title,
        content,
        imageUrl: finalImageUrl,
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
        imageUrl: it.imageUrl ?? '',
        title: it.title ?? '',
        date: it.date ?? '',
      })),
    [items],
  );

  const uploadInputId = 'proof-file-input';

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
            items={isShareCategory(category) ? formItems : []}
            submitting={submitting}
            submitLabel={editing ? '수정하기' : '작성하기'}
            onChange={handleFormChange}
            onSubmit={submit}
            selectedItemId={routeId != null ? String(routeId) : null}
            onSelectItem={
              isShareCategory(category) ? handleSelectCourse : undefined
            }
            footerSlot={
              <FooterArea>
                {isProofCategory(category) && (
                  <UploadArea>
                    <HiddenInput
                      id={uploadInputId}
                      type="file"
                      accept="image/*"
                      onChange={handlePickProofFile}
                      style={{ display: 'none' }}
                    />
                    <PreviewCard htmlFor={uploadInputId}>
                      {proofPreview || imageUrl ? (
                        <>
                          <PostImage
                            src={proofPreview || imageUrl}
                            alt="proof"
                          />
                          {proofUploading && (
                            <OverlayHint>이미지 업로드 중…</OverlayHint>
                          )}
                        </>
                      ) : (
                        <EmptyState>이미지 업로드</EmptyState>
                      )}
                    </PreviewCard>
                  </UploadArea>
                )}

                {isShareCategory(category) && (
                  <>
                    {!listDone && !listLoading && (
                      <Sentinel ref={sentinelRef} />
                    )}
                    {listLoading && <SmallHint>불러오는 중…</SmallHint>}
                    {listDone && items.length > 0 && (
                      <SmallHint>마지막 항목입니다.</SmallHint>
                    )}
                    {listDone && items.length === 0 && (
                      <SmallHint>표시할 항목이 없습니다</SmallHint>
                    )}
                  </>
                )}
              </FooterArea>
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

const UploadArea = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 8px;
`;

const PreviewCard = styled.label`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
  cursor: pointer;
  position: relative;

  &:hover {
    outline: 2px dashed ${({ theme }) => theme.colors.border};
    outline-offset: -2px;
  }
`;

const PostImage = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  display: block;
`;

const EmptyState = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.subtext};
  ${({ theme }) => theme.typography.body};
  text-align: center;

  strong {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 700;
  }
`;

const OverlayHint = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.35);
  color: ${({ theme }) => theme.colors.surface};
  font-size: 12px;
  font-weight: 600;
`;

const HiddenInput = styled.input`
  display: none;
`;
