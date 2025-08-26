import { useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import AppLayout from '@/components/layout/AppLayout';
import PostHeader from './_components/PostHeader';
import CommentList from './_components/CommentList';
import { useCommunityStore } from '@/stores/communityStore';
import { useBack } from '@/hooks/useBack';

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

export default function CommunityDetail() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const inputRef = useRef<HTMLInputElement>(null);

  const goBack = useBack('/community');

  const { posts, comments, toggleLike, addComment, deletePost } =
    useCommunityStore();
  const post = useMemo(() => posts.find((p) => p.id === id), [id, posts]);
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
            <span>❤︎</span>
            <span>{post.likeCount}</span>
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
