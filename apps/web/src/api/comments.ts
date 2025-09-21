import api from '@/lib/api';
import type { Comment } from '@/types/community';

// ----- 서버 응답 타입 -----
type AuthorInfoRes = {
  id: number;
  nickname: string;
  imageUrl: string | null;
};

type CommentListItemRes = {
  id: number;
  postId: number;
  authorId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorInfo: AuthorInfoRes;
};

type CommentListRes = {
  items: CommentListItemRes[];
  nextCursor: string | null;
};

type CommentCreateRes = {
  id: number;
  postId: number;
  authorId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorInfo: AuthorInfoRes;
};

type CommentUpdateRes = {
  id: number;
  postId: number;
  authorId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorInfo: { id: number; nickname: string; imageUrl: string | null };
};

type OkRes = { ok: boolean };

// ----- 매퍼 (서버 → 클라 엔티티) -----
const mapListItemToEntity = (r: CommentListItemRes): Comment => ({
  id: String(r.id),
  postId: String(r.postId),
  authorId: r.authorId,
  content: r.content,
  updatedAt: r.updatedAt,
  authorInfo: r.authorInfo,
});

const mapCreateItemToEntity = (r: CommentCreateRes): Comment => ({
  id: String(r.id),
  postId: String(r.postId),
  authorId: r.authorId,
  content: r.content,
  updatedAt: r.updatedAt,
  authorInfo: r.authorInfo,
});

// ----- API -----
// 커서 기반 목록
export async function getPostComments(
  postId: number | string,
  limit = 20,
  cursor?: string | null,
): Promise<{ items: Comment[]; nextCursor: string | null }> {
  const { data } = await api.get<CommentListRes>(
    `/community/posts/${postId}/comments`,
    { params: { limit, cursor: cursor ?? undefined } },
  );
  return {
    items: data.items.map(mapListItemToEntity),
    nextCursor: data.nextCursor ?? null,
  };
}

export async function createPostComment(
  postId: number | string,
  content: string,
): Promise<Comment> {
  const { data } = await api.post<CommentCreateRes>(
    `/community/posts/${postId}/comments`,
    { content },
  );
  return mapCreateItemToEntity(data);
}

export async function updateComment(
  id: number | string,
  content: string,
): Promise<{ id: string; content: string; updatedAt: string }> {
  const { data } = await api.patch<CommentUpdateRes>(
    `/community/comments/${id}`,
    { content },
  );

  return {
    id: String(data.id),
    content: data.content,
    updatedAt: data.updatedAt,
  };
}

export async function deleteComment(id: number | string): Promise<boolean> {
  const { data } = await api.delete<OkRes>(`/community/comments/${id}`);
  return !!data?.ok;
}
