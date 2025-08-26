import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import EditForm from './_components/EditForm';
import type { Category } from '@/types/community';
import { useCommunityStore } from '@/stores/communityStore';
import { useBack } from '@/hooks/useBack';

export default function CommunityEdit() {
  const nav = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { posts, addPost, updatePost } = useCommunityStore();
  const goBack = useBack();

  const editing = !!id;
  const target = editing ? posts.find((p) => p.id === id) : undefined;

  const [category, setCategory] = useState<Exclude<Category, 'all'>>(
    target?.category ?? 'free',
  );
  const [title, setTitle] = useState(target?.title ?? '');
  const [content, setContent] = useState(target?.content ?? '');

  useEffect(() => {
    if (editing && !target) {
      alert('존재하지 않는 게시글입니다.');
      nav('/community', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, target]);

  const submit = () => {
    if (!title.trim()) return alert('제목을 입력하세요.');
    if (editing && id) {
      updatePost(id, { title, category, content });
      nav(`/community/${id}`, { replace: true });
    } else {
      const newId = addPost({ title, category, content });
      nav(`/community/${newId}`, { replace: true });
    }
  };

  return (
    <AppLayout
      title={editing ? '글 수정' : '글 작성'}
      topOffset={48}
      onBack={goBack}
    >
      <EditForm
        category={category}
        title={title}
        content={content}
        onChange={(patch) => {
          if (patch.category) setCategory(patch.category);
          if (typeof patch.title === 'string') setTitle(patch.title);
          if (typeof patch.content === 'string') setContent(patch.content);
        }}
        onSubmit={submit}
      />
    </AppLayout>
  );
}
