import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import AppLayout from '@/components/layout/AppLayout';
import PostHeader from './_components/PostHeader';
import CommentList from './_components/CommentList';
import { useBack } from '@/hooks/useBack';
import type { Post, Comment } from '@/types/community';
import {
  getPost,
  togglePostLike,
  deletePostById,
  getReadablePostError,
} from '@/api/posts';
import {
  getPostComments,
  createPostComment,
  updateComment,
  deleteComment,
} from '@/api/comments';

export default function CommunityDetail() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const inputRef = useRef<HTMLInputElement>(null);
  const goBack = useBack('/community');

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [cPage, setCPage] = useState(1);
  const [cLimit] = useState(20);
  const [cTotal, setCTotal] = useState(0);
  const [cLoading, setCLoading] = useState(false);

  const [liking, setLiking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // 개별 댓글 작업 상태
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getPost(id);
        if (mounted) {
          setPost(data);
          setError(null);
        }
      } catch (e) {
        if (mounted) {
          setError(getReadablePostError(e));
          setPost(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;
      try {
        setCLoading(true);
        const res = await getPostComments(id, 1, cLimit);
        if (mounted) {
          setComments(res.items);
          setCPage(res.page);
          setCTotal(res.total);
        }
      } catch (e) {
        console.error('[comments] load error:', getReadablePostError(e));
      } finally {
        if (mounted) setCLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, cLimit]);

  const handleToggleLike = async () => {
    if (!post || liking) return;
    setLiking(true);
    const prev = post;
    setPost({
      ...post,
      liked: !post.liked,
      likeCount: (post.likeCount ?? 0) + (post.liked ? -1 : 1),
    });
    try {
      const res = await togglePostLike(post.id);
      setPost((p) =>
        p ? { ...p, liked: res.liked, likeCount: res.likeCount } : p,
      );
    } catch (e) {
      setPost(prev);
      alert(getReadablePostError(e));
    } finally {
      setLiking(false);
    }
  };

  const handleSubmitComment = async () => {
    const v = inputRef.current?.value?.trim();
    if (!v || !id) return;
    try {
      setSubmittingComment(true);
      const created = await createPostComment(id, v);
      setComments((prev) => [...prev, created]); // ASC 정렬 가정 → 뒤에 붙임
      inputRef.current!.value = '';
      setPost((p) => (p ? { ...p, commentsCount: p.commentsCount + 1 } : p));
      setCTotal((t) => t + 1);
    } catch (e) {
      alert(getReadablePostError(e));
    } finally {
      setSubmittingComment(false);
    }
  };

  // ✅ 댓글 수정
  const handleEditComment = async (commentId: string) => {
    const target = comments.find((c) => c.id === commentId);
    if (!target) return;

    const next = prompt('댓글을 수정하세요', target.content);
    if (next == null) return; // 취소
    const content = next.trim();
    if (!content) return alert('내용을 입력하세요.');

    try {
      setEditingId(commentId);
      const res = await updateComment(commentId, content);
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, content: res.content } : c,
        ),
      );
    } catch (e) {
      alert(getReadablePostError(e));
    } finally {
      setEditingId(null);
    }
  };

  const handleDeletePost = useCallback(async () => {
    if (!post || deleting) return;
    if (!confirm('삭제하시겠습니까?')) return;

    try {
      setDeleting(true);
      const ok = await deletePostById(post.id);
      if (ok) {
        nav('/community', { replace: true });
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (e) {
      alert(getReadablePostError(e));
    } finally {
      setDeleting(false);
    }
  }, [post, deleting, nav]);

  // ✅ 댓글 삭제
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      setDeletingCommentId(commentId);
      const ok = await deleteComment(commentId);
      if (ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setPost((p) =>
          p ? { ...p, commentsCount: Math.max(0, p.commentsCount - 1) } : p,
        );
        setCTotal((t) => Math.max(0, t - 1));
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (e) {
      alert(getReadablePostError(e));
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleLoadMore = async () => {
    if (!post) return;
    const next = cPage + 1;
    const res = await getPostComments(post.id, next, cLimit);
    setComments((prev) => [...prev, ...res.items]);
    setCPage(res.page);
    setCTotal(res.total);
  };

  if (loading) {
    return (
      <AppLayout title="게시글" onBack={goBack}>
        <div style={{ padding: 16 }}>불러오는 중…</div>
      </AppLayout>
    );
  }
  if (error) {
    return (
      <AppLayout title="게시글" onBack={goBack}>
        <div style={{ padding: 16, color: '#ef4444' }}>{error}</div>
      </AppLayout>
    );
  }
  if (!post) {
    return (
      <AppLayout title="게시글" onBack={goBack}>
        <div style={{ padding: 16 }}>게시글이 없습니다.</div>
      </AppLayout>
    );
  }

  const images = (post.imageUrls ?? []).filter(Boolean);
  const hasMore = comments.length < cTotal;

  return (
    <AppLayout title="게시글" topOffset={48} onBack={goBack}>
      <PostHeader
        post={post}
        onEdit={() => nav(`/community/edit/${post.id}`)}
        onDelete={handleDeletePost}
      />

      <Content>
        {images.length > 0 && (
          <ImageList>
            {images.map((src, idx) => (
              <li key={`${src}-${idx}`}>
                <img src={src} alt={`${post.title || 'post'}-${idx + 1}`} />
              </li>
            ))}
          </ImageList>
        )}

        <Article>{post.content || '내용이 없습니다.'}</Article>

        <LikeBar>
          <LikeBtn onClick={handleToggleLike} disabled={liking}>
            <i className="ri-thumb-up-fill" />{' '}
            <span>{post.likeCount ?? 0}</span>
          </LikeBtn>
        </LikeBar>
      </Content>

      {/* ✅ 댓글 목록 + 수정/삭제 핸들러 전달 */}
      <CommentList
        comments={comments}
        onEdit={handleEditComment}
        onDelete={handleDeleteComment}
        workingId={editingId ?? deletingCommentId ?? null}
      />

      {cLoading && <Hint>댓글 불러오는 중…</Hint>}
      {hasMore && (
        <MoreWrap>
          <MoreBtn onClick={handleLoadMore}>더 보기</MoreBtn>
        </MoreWrap>
      )}

      <CommentBar>
        <Input
          ref={inputRef}
          placeholder="댓글을 입력하세요"
          disabled={submittingComment}
        />
        <Submit onClick={handleSubmitComment} disabled={submittingComment}>
          {submittingComment ? '작성 중…' : '작성'}
        </Submit>
      </CommentBar>
    </AppLayout>
  );
}

const Content = styled.section`
  padding: 16px;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.6;
`;

const ImageList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 12px 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    display: block;
  }
`;

const Article = styled.div`
  white-space: pre-wrap;
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
  &[disabled] {
    opacity: 0.6;
    pointer-events: none;
  }
`;

const Hint = styled.div`
  padding: 8px 16px;
  color: #6b7280;
  font-size: 14px;
`;

const MoreWrap = styled.div`
  display: flex;
  justify-content: center;
  padding: 8px 0 12px;
`;

const MoreBtn = styled.button`
  padding: 6px 12px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
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
