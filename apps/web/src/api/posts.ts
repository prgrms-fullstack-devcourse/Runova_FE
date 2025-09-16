import axios from 'axios';
import api from '@/lib/api';
import type { Category, Post } from '@/types/community';

export type ServerPostType = Exclude<Category, 'ALL'>;

export type CreatePostReq = {
  type: ServerPostType;
  title: string;
  content: string;
  imageUrl: string;
  routeId?: number;
};

export type UpdatePostReq = Partial<{
  type: ServerPostType;
  title: string;
  content: string;
  imageUrl: string | null;
  routeId: number | null;
}>;

type AuthorObj = { id: number; nickname: string; imageUrl?: string | null };

type PostResBase = {
  id: number;
  type: ServerPostType;
  title: string;
  imageUrls?: string[];
  imageUrl?: string;
  routeId?: number | null;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  authorInfo: AuthorObj;
};

type PostResCreate = PostResBase & {
  authorId: number;
  content: string;
};

type PostResDetail = PostResBase & {
  author: AuthorObj;
  content: string;
};

type PostRes = PostResCreate | PostResListItem | PostResDetail;

type LikeRes = { liked: boolean; likeCount: number };

type DeleteRes = { ok: boolean };

type UpdatePostRes = {
  ok: true;
  post: {
    id: number;
    type: ServerPostType;
    title: string;
    content: string;
    imageUrl: string;
    routeId?: number;
    updatedAt: string;
  };
};

export type GetPostsQuery = {
  type?: ServerPostType;
  category?: Category;
  authorId?: number;
  routeId?: number;
  sort?: 'recent' | 'popular';
  limit?: number;
};

type PostResListItem = PostResBase & {
  content?: string; // 서버가 줄 수도 있어 optional
};

type PostResListItemAlt = PostResBase & {
  authorId: number;
  content?: string;
};

type PostListCursorRes = {
  items: Array<PostResListItem | PostResListItemAlt>;
  nextCursor: number | string | null;
};

export type GetPostsCursorQuery = {
  type?: ServerPostType;
  authorId?: number;
  routeId?: number;
  sort?: 'recent' | 'popular';
  cursor?: string | number | null;
  limit?: number;
};

function pickImageUrl(res: {
  imageUrl?: string;
  imageUrls?: string[];
}): string {
  if (typeof res.imageUrl === 'string' && res.imageUrl.length > 0)
    return res.imageUrl;
  if (Array.isArray(res.imageUrls) && res.imageUrls.length > 0)
    return res.imageUrls[0]!;
  return '';
}

function mapListItemToEntity(res: PostResListItem | PostResListItemAlt): Post {
  return {
    id: String(res.id),
    category: res.type,
    title: res.title,
    author: res.authorInfo?.nickname ?? '',
    commentsCount: res.commentCount,
    content: res.content,
    likeCount: res.likeCount,
    imageUrl: pickImageUrl(res),
    createdAt: res.createdAt,
    updatedAt: res.updatedAt,
    authorInfo: res.authorInfo,
    routeId: res.routeId ?? undefined,
  };
}

function mapPostResToEntity(res: PostRes): Post {
  const author = res.authorInfo?.nickname ?? '';
  const content = 'content' in res ? res.content : undefined;

  return {
    id: String(res.id),
    category: res.type,
    title: res.title,
    author,
    commentsCount: res.commentCount,
    content,
    likeCount: res.likeCount,
    imageUrl: pickImageUrl(res),
    createdAt: res.createdAt,
    updatedAt: res.updatedAt,
    authorInfo: res.authorInfo,
    routeId: res.routeId ?? undefined,
  };
}

export async function createPost(body: CreatePostReq): Promise<Post> {
  const { data } = await api.post<PostRes>('/community/posts', body);
  return mapPostResToEntity(data);
}

export async function getPosts(query: GetPostsQuery = {}): Promise<Post[]> {
  const q: string[] = [];

  if (query.type) {
    q.push(`type=${encodeURIComponent(query.type)}`);
  } else if (query.category && query.category !== 'ALL') {
    q.push(`type=${encodeURIComponent(query.category as ServerPostType)}`);
  }

  if (typeof query.authorId === 'number') q.push(`authorId=${query.authorId}`);
  if (typeof query.routeId === 'number') q.push(`routeId=${query.routeId}`);
  if (query.sort) q.push(`sort=${encodeURIComponent(query.sort)}`);
  if (typeof query.limit === 'number') q.push(`limit=${query.limit}`);

  const qs = q.length > 0 ? `?${q.join('&')}` : '';

  const { data } = await api.get<{
    items: (PostResListItem | PostResListItemAlt)[];
  }>(`/community/posts${qs}`);

  return (data.items ?? []).map(mapListItemToEntity);
}

export async function getPostsCursor(
  query: GetPostsCursorQuery = {},
): Promise<{ items: Post[]; nextCursor: number | string | null }> {
  const params = new URLSearchParams();

  if (query.type) params.set('type', query.type);
  if (typeof query.authorId === 'number')
    params.set('authorId', String(query.authorId));
  if (typeof query.routeId === 'number')
    params.set('routeId', String(query.routeId));
  if (query.sort) params.set('sort', query.sort);
  if (typeof query.limit === 'number') params.set('limit', String(query.limit));

  const cur = query.cursor;
  if (cur != null) {
    const s = typeof cur === 'string' ? cur : String(cur);
    if (s !== '') params.set('cursor', s);
  }

  const { data } = await api.get<PostListCursorRes>(
    `/community/posts${params.toString() ? `?${params.toString()}` : ''}`,
  );

  return {
    items: (data.items ?? []).map(mapListItemToEntity),
    nextCursor: data.nextCursor ?? null,
  };
}

export async function getPost(id: number | string): Promise<Post> {
  const { data } = await api.get<PostResDetail>(`/community/posts/${id}`);
  return mapPostResToEntity(data);
}

export async function updatePostById(
  id: number | string,
  body: UpdatePostReq,
): Promise<UpdatePostRes> {
  const { data } = await api.patch<UpdatePostRes>(
    `/community/posts/${id}`,
    body,
  );
  return data;
}

export async function togglePostLike(id: number | string): Promise<LikeRes> {
  const { data } = await api.post<LikeRes>(`/community/posts/${id}/like`);
  return data;
}

export async function deletePostById(id: number | string): Promise<boolean> {
  const { data } = await api.delete<DeleteRes>(`/community/posts/${id}`);
  return !!data?.ok;
}

export type PostErrorCode =
  | 'AUTH.UNAUTHORIZED'
  | 'COMMUNITY.POST_TYPE_INVALID'
  | 'COMMUNITY.POST_CONTENT_REQUIRED'
  | 'COMMUNITY.POST_NOT_FOUND'
  | 'COMMUNITY.POST_FORBIDDEN';

interface ErrorResponse {
  code: PostErrorCode;
  message?: string;
}

export function getReadablePostError(e: unknown): string {
  if (axios.isAxiosError<ErrorResponse>(e)) {
    const code = e.response?.data?.code;
    switch (code) {
      case 'AUTH.UNAUTHORIZED':
        return '로그인이 필요합니다.';
      case 'COMMUNITY.POST_TYPE_INVALID':
        return '잘못된 게시글 유형입니다.';
      case 'COMMUNITY.POST_CONTENT_REQUIRED':
        return '내용을 입력하세요.';
      case 'COMMUNITY.POST_NOT_FOUND':
        return '게시글을 찾을 수 없습니다.';
      case 'COMMUNITY.POST_FORBIDDEN':
        return '권한이 없습니다.';
      default:
        return '요청 처리에 실패했습니다. 잠시 후 다시 시도해주세요.';
    }
  }
  return `알 수 없는 오류가 발생했습니다.`;
}

export type PresignReq = {
  type: string;
  contentType: string;
  size: number;
};

export type PresignRes = {
  url: string;
};

export async function getProofPresign(req: PresignReq): Promise<PresignRes> {
  const { data } = await api.post<PresignRes>('/files/presign', req);
  return data;
}

export function objectUrlFromPresign(url: string): string {
  return url.split('?')[0];
}

export async function uploadProofWithFile(file: File): Promise<string> {
  const contentType = file.type || 'image/jpeg';
  const size = file.size;

  const presign = await getProofPresign({
    type: 'verify',
    contentType,
    size,
  });

  const putRes = await fetch(presign.url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  });
  if (!putRes.ok) {
    throw new Error(`이미지 업로드 실패: ${putRes.status}`);
  }

  return objectUrlFromPresign(presign.url);
}
