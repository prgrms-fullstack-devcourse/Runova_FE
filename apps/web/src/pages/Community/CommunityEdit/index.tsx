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
// 🔻 PROOF 목록 불러오기는 제거 (PROOF에선 목록을 안 씀)
// import { fetchRunningRecords } from '@/api/running';
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
  const [imageUrl, setImageUrl] = useState<string>(''); // 단일 이미지 URL
  const [routeId, setRouteId] = useState<number | undefined>(undefined);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [items, setItems] = useState<ItemShape[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [listDone, setListDone] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  // PROOF 업로드 미리보기/업로딩 상태
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>('');
  const [proofUploading, setProofUploading] = useState(false);

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
    if (
      typeof patch.routeId === 'number' ||
      typeof patch.routeId === 'undefined'
    ) {
      setRouteId(patch.routeId);
    }
  }, []);

  // 카테고리 바뀌면 목록 초기화 + PROOF 미리보기 정리
  useEffect(() => {
    setItems([]);
    setCursor(null);
    setListDone(true);
    setListError(null);

    if (!isProofCategory(category)) {
      if (proofPreview) URL.revokeObjectURL(proofPreview);
      setProofFile(null);
      setProofPreview('');
    }
  }, [category, proofPreview]);

  // 페이지 로드 함수 — 🔸 SHARE에서만 동작
  const loadMore = useCallback(async () => {
    if (listLoading || listDone) return;
    if (!isShareCategory(category)) return;

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
    }
  }, [category, cursor, listDone, listLoading]);

  // 초기 로드 — 🔸 SHARE에서만
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

  const submit = async () => {
    if (!title.trim()) return alert('제목을 입력하세요.');
    if (!content.trim()) return alert('내용을 입력하세요.');

    try {
      setSubmitting(true);

      // PROOF면, 아직 업로드 안 된 로컬 파일을 선 업로드 → imageUrl 대체
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
          imageUrl: finalImageUrl || null, // 비웠다면 null 전달 가능
          ...(typeof routeId === 'number' ? { routeId } : {}),
        });
        navigate(`/community/${id}`, { replace: true });
        return;
      }

      const created = await createPost({
        type: category,
        title,
        content,
        imageUrl: finalImageUrl, // 생성은 필수
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
            // 🔸 PROOF일 땐 EditForm에 빈 배열 전달(픽커 완전 비활성화)
            items={isShareCategory(category) ? formItems : []}
            submitting={submitting}
            submitLabel={editing ? '수정하기' : '작성하기'}
            onChange={handleFormChange}
            onSubmit={submit}
            footerSlot={
              <FooterArea>
                {/* 🔹 PROOF: 업로드 카드만 노출 */}
                {isProofCategory(category) && (
                  <UploadArea>
                    <input
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

                {/* 🔹 SHARE: 목록 관련 UI만 노출 */}
                {isShareCategory(category) && (
                  <>
                    {listError && (
                      <ErrorBox role="alert">
                        <ErrorText>{listError}</ErrorText>
                        <RetryButton
                          type="button"
                          onClick={() => {
                            void loadMore();
                          }}
                          disabled={listLoading}
                        >
                          다시 시도
                        </RetryButton>
                      </ErrorBox>
                    )}
                    {!listDone && <Sentinel ref={sentinelRef} />}
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

const ErrorBox = styled.div`
  width: 100%;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.danger}22;
  border: 1px solid ${({ theme }) => theme.colors.danger};
`;

const ErrorText = styled.div`
  flex: 1;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.danger};
`;

const RetryButton = styled.button`
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.danger};
  background: transparent;
  font-size: 12px;
  cursor: pointer;
`;

const UploadArea = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 8px;
`;

/** 업로드 미리보기 박스 (label) */
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

/** 정사각형으로 가득 채우는 이미지 */
const PostImage = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  display: block;
`;

/** 비어있을 때의 안내문 */
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
  color: ${({ theme }) => theme.colors.surface}
  font-size: 12px;
  font-weight: 600;
`;
