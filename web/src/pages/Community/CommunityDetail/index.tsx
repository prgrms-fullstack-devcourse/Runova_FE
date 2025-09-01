// CommunityDetail.tsx
import { useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import AppLayout from '@/components/layout/AppLayout';
import PostHeader from './_components/PostHeader';
import CommentList from './_components/CommentList';
import { useCommunityStore } from '@/stores/communityStore';
import { useBack } from '@/hooks/useBack';
import type { Post } from '@/types/community';

const DUMMY_CATEGORIES = ['free', 'auth', 'share', 'mate'] as const;

const dummyPosts: Post[] = Array.from({ length: 20 }).map((_, i) => {
  const n = i + 1;
  return {
    id: `${n}`,
    category: DUMMY_CATEGORIES[n % DUMMY_CATEGORIES.length], // ✅ 필수
    title: `임시 게시글 ${n}`,
    author: `작성자${n}`,
    commentsCount: (i * 3) % 7,
    content: `이것은 ${n}번 임시 게시글 내용입니다.`,
    liked: false,
    likeCount: i * 2,
    postImageUrl:
      n % 3 === 0 ? `https://picsum.photos/600/300?random=${n}` : undefined, // 옵션
  };
});

export default function CommunityDetail() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const inputRef = useRef<HTMLInputElement>(null);

  const goBack = useBack('/community');

  const { posts, comments, toggleLike, addComment, deletePost } =
    useCommunityStore();

  const post = useMemo(
    () => posts.find((p) => p.id === id) ?? dummyPosts.find((p) => p.id === id),
    [id, posts],
  );

  const postComments = useMemo(
    () => comments.filter((c) => c.postId === id),
    [id, comments],
  );

  const handleToggleLike = () => {
    if (post) toggleLike(post.id);
  };

  const handleSubmitComment = () => {
    const v = inputRef.current?.value?.trim();
    if (!v || !id) return;
    addComment(id, v);
    inputRef.current!.value = '';
  };

  if (!post)
    return (
      <AppLayout title="게시글" onBack={goBack}>
        <div style={{ padding: 16 }}>게시글이 없습니다.</div>
      </AppLayout>
    );

  return (
    <AppLayout title="게시글" topOffset={48} onBack={goBack}>
      <PostHeader
        post={post}
        onEdit={() => nav(`/community/edit/${post.id}`)}
        onDelete={() => {
          if (confirm('삭제하시겠습니까?')) {
            deletePost(post.id);
            nav('/community');
          }
        }}
      />

      <Content>
        {post.content || '내용이 없습니다.'}
        <LikeBar>
          <LikeBtn onClick={handleToggleLike}>
            <i className="ri-thumb-up-fill" /> <span>{post.likeCount}</span>
          </LikeBtn>
        </LikeBar>
      </Content>

      <CommentList comments={postComments} />

      <CommentBar>
        <Input ref={inputRef} placeholder="댓글을 입력하세요" />
        <Submit onClick={handleSubmitComment}>작성</Submit>
      </CommentBar>
    </AppLayout>
  );
}

const Content = styled.section`
  padding: 16px;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.6;
`;

const LikeBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const LikeBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  color: ${({ theme }) => theme.colors.subtext};
`;

const CommentBar = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 16px;
  display: flex;
  gap: 8px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
`;

const Submit = styled.button`
  padding: 8px 12px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;
