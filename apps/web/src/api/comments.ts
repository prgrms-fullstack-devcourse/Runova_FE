import api from '@/lib/api';
import type { Comment } from '@/types/community';

// ----- 서버 응답 타입 -----
type AuthorObj = { id: number; nickname: string; avatarUrl?: string | null };

type CommentListItemRes = {
  id: number;
  postId: number;
  author: AuthorObj;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type CommentCreateRes = {
  id: number;
  postId: number;
  authorId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type CommentListRes = {
  items: CommentListItemRes[];
  page: number;
  limit: number;
  total: number;
};

type CommentUpdateRes = {
  ok: boolean;
  comment: { id: number; content: string; updatedAt: string };
};

type OkRes = { ok: boolean };

// ----- 매퍼 (서버 → 클라 엔티티) -----
// 프로젝트의 Comment 타입이 { id, postId, author, content } 기준이라면,
// createdAt/updatedAt은 필요 시 확장하세요.
const mapListItemToEntity = (r: CommentListItemRes): Comment => ({
  id: String(r.id),
  postId: String(r.postId),
  author: r.author?.nickname,
  content: r.content,
  updatedAt: r.updatedAt,
});

const mapCreateItemToEntity = (r: CommentCreateRes): Comment => ({
  id: String(r.id),
  postId: String(r.postId),
  author: String(r.authorId),
  content: r.content,
  updatedAt: r.updatedAt,
});

// ----- API -----
export async function getPostComments(
  postId: number | string,
  page = 1,
  limit = 20,
): Promise<{ items: Comment[]; page: number; limit: number; total: number }> {
  const { data } = await api.get<CommentListRes>(
    `/community/posts/${postId}/comments`,
    { params: { page, limit } },
  );
  return {
    items: data.items.map(mapListItemToEntity),
    page: data.page,
    limit: data.limit,
    total: data.total,
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
  console.log(data);
  return {
    id: String(data.comment.id),
    content: data.comment.content,
    updatedAt: data.comment.updatedAt,
  };
}

export async function deleteComment(id: number | string): Promise<boolean> {
  const { data } = await api.delete<OkRes>(`/community/comments/${id}`);
  return !!data?.ok;
}
