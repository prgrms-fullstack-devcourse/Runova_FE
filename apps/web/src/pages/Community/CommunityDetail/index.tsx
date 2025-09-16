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
import { useModal } from '@/components/common/modal/modalContext';
import { useNativeBridgeStore } from '@/stores/nativeBridgeStore';
import { toggleCourseBookmark } from '@/api/courses';

export default function CommunityDetail() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const inputRef = useRef<HTMLInputElement>(null);
  const goBack = useBack('/community');
  const { prompt, confirm } = useModal();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [cLimit] = useState(20);
  const [cCursor, setCCursor] = useState<string | null>(null); // ✅ 커서
  const [cLoading, setCLoading] = useState(false);

  const [liking, setLiking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null,
  );

  const [bookmarking, setBookmarking] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const toId = useCallback(
    (v: unknown): string | null => (v == null ? null : String(v)),
    [],
  );
  const sameId = useCallback(
    (a: unknown, b: unknown) => {
      const as = toId(a);
      const bs = toId(b);
      return as !== null && bs !== null && as === bs;
    },
    [toId],
  );

  const myIdRaw = useNativeBridgeStore((s) => s.init?.user?.id ?? null);
  const myId = toId(myIdRaw);
  const authorId = toId(post?.authorInfo?.id ?? post?.author ?? null);

  const canEdit = sameId(myId, authorId);

  const canEditComment = useCallback(
    (c: Comment) => {
      const commentId = toId(c?.authorInfo?.id ?? c?.authorId ?? null);
      return sameId(myId, commentId);
    },
    [myId, sameId, toId],
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
        const { items, nextCursor } = await getPostComments(id, cLimit);
        if (mounted) {
          setComments(items);
          setCCursor(nextCursor ?? null);
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
      setComments((prev) => [...prev, created]); // ASC 가정 → 뒤에 추가
      inputRef.current!.value = '';
      setPost((p) =>
        p ? { ...p, commentsCount: (p.commentsCount ?? 0) + 1 } : p,
      );
    } catch (e) {
      alert(getReadablePostError(e));
    } finally {
      setSubmittingComment(false);
    }
  };

  const getPromptText = (v: unknown): string => {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'object') {
      const any = v as Record<string, unknown>;
      const cand =
        (any.value as string | undefined) ??
        (any.text as string | undefined) ??
        (any.content as string | undefined);
      if (typeof cand === 'string') return cand;
    }
    return String(v);
  };

  const handleEditComment = async (commentId: string) => {
    const target = comments.find((c) => c.id === commentId);
    if (!target) return;

    const raw = await prompt({
      title: '댓글을 수정하세요',
      defaultValue: target.content ?? '',
      placeholder: '댓글 내용을 입력',
      confirmText: '수정',
      cancelText: '취소',
    });
    if (raw == null) return; // 취소

    const content = getPromptText(raw).trim();

    if (!content) {
      sendToast('내용을 입력하세요.', 'error');
      return;
    }
    if (content === target.content) {
      sendToast('변경된 내용이 없습니다.', 'error');
      return;
    }

    try {
      setEditingId(commentId);
      const res = await updateComment(commentId, content);
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, content: res.content, updatedAt: res.updatedAt }
            : c,
        ),
      );
      sendToast('댓글을 수정했어요 ✅', 'success');
    } catch (e) {
      sendToast(getReadablePostError(e), 'error');
    } finally {
      setEditingId(null);
    }
  };

  const handleDeletePost = useCallback(async () => {
    if (!post || deleting) return;

    const ok = await confirm({
      title: '게시글을 삭제하시겠습니까?',
      description: '이 작업은 되돌릴 수 없습니다.',
      confirmText: '삭제',
      cancelText: '취소',
    });
    if (!ok) return;

    try {
      setDeleting(true);
      const done = await deletePostById(post.id);
      if (done) {
        nav('/community', { replace: true });
      } else {
        await alert({ title: '실패', description: '삭제에 실패했습니다.' });
      }
    } catch (e) {
      await alert({ title: '오류', description: getReadablePostError(e) });
    } finally {
      setDeleting(false);
    }
  }, [post, deleting, nav, confirm]);

  const handleDeleteComment = async (commentId: string) => {
    const ok = await confirm({
      title: '댓글을 삭제하시겠습니까?',
      description: '삭제 후 복구할 수 없습니다.',
      confirmText: '삭제',
      cancelText: '취소',
    });
    if (!ok) return;

    try {
      setDeletingCommentId(commentId);
      const done = await deleteComment(commentId);
      if (done) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setPost((p) =>
          p
            ? { ...p, commentsCount: Math.max(0, (p.commentsCount ?? 0) - 1) }
            : p,
        );
      } else {
        await alert({ title: '실패', description: '삭제에 실패했습니다.' });
      }
    } catch (e) {
      await alert({ title: '오류', description: getReadablePostError(e) });
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleLoadMore = async () => {
    if (!post || !cCursor) return;
    const { items, nextCursor } = await getPostComments(
      post.id,
      cLimit,
      cCursor,
    );
    setComments((prev) => [...prev, ...items]);
    setCCursor(nextCursor ?? null);
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

  const imageUrl = post.imageUrl;
  const hasMore = cCursor !== null;

  const postToNative = (evt: unknown) => {
    window.ReactNativeWebView?.postMessage(JSON.stringify(evt));
  };

  const sendToast = (
    message: string,
    variant: 'success' | 'error' = 'success',
  ) => {
    postToNative({ type: 'toast', payload: { message, variant } });
  };
  const handleToggleBookmark = async () => {
    if (!post || bookmarking) return;
    if (post.category !== 'SHARE' || !post.routeId) return;

    setBookmarking(true);
    try {
      const res = await toggleCourseBookmark(post.routeId);

      if (res.bookmarked) {
        setBookmarked(true);
        sendToast('북마크했어요 ✅', 'success');
      } else {
        setBookmarked(false);
        sendToast('북마크 해제했어요', 'success');
      }
    } catch (e) {
      sendToast(getReadablePostError(e), 'error');
    } finally {
      setBookmarking(false);
    }
  };

  return (
    <AppLayout title="게시글" topOffset={48} onBack={goBack}>
      <PostHeader
        post={post}
        onEdit={() => nav(`/community/edit/${post.id}`)}
        onDelete={handleDeletePost}
        canEdit={canEdit}
      />

      <Content>
        {imageUrl && imageUrl !== '{}' && (
          <PostImageContainer>
            <PostImage src={imageUrl} alt="post image" />
          </PostImageContainer>
        )}
        <Article>{post.content || '내용이 없습니다.'}</Article>

        <LikeBar>
          {post.routeId && (
            <BookmarkBtn onClick={handleToggleBookmark} disabled={bookmarking}>
              <i
                className={bookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line'}
              />
            </BookmarkBtn>
          )}
          <LikeBtn onClick={handleToggleLike} disabled={liking}>
            <i className="ri-thumb-up-fill" />
            <span>{post.likeCount ?? 0}</span>
          </LikeBtn>
        </LikeBar>
      </Content>

      <CommentList
        comments={comments}
        onEdit={handleEditComment}
        onDelete={handleDeleteComment}
        workingId={editingId ?? deletingCommentId ?? null}
        canManage={canEditComment}
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

const PostImageContainer = styled.div`
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
`;

const PostImage = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  display: block;
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

const BookmarkBtn = styled.button`
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
