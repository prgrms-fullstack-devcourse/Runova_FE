// pages/community/CommunityEdit.tsx
import { useEffect, useState, useCallback } from 'react';
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

  return (
    <AppLayout
      title={editing ? '글 수정' : '글 작성'}
      topOffset={48}
      onBack={goBack}
    >
      {loading ? (
        <Loading>불러오는 중…</Loading>
      ) : (
        <EditForm
          category={category}
          title={title}
          content={content}
          items={[
            {
              id: '1',
              imageUrl: 'https://picsum.photos/200?1',
              title: '한강 러닝',
              date: '2025-09-01',
            },
            {
              id: '2',
              imageUrl: 'https://picsum.photos/200?2',
              title: '공원 인증',
              date: '2025-09-02',
            },
          ]}
          submitting={submitting}
          submitLabel={editing ? '수정하기' : '작성하기'}
          onChange={handleFormChange}
          onSubmit={submit}
        />
      )}
    </AppLayout>
  );
}

const Loading = styled.div`
  padding: 16px;
  color: ${({ theme }) => theme.colors.subtext};
  font-size: 14px;
`;
