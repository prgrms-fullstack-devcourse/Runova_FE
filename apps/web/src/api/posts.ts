import axios from 'axios';
import api from '@/lib/api';
import type { Category, Post } from '@/types/community';

/** 서버 enum (클라 Category에서 'ALL' 제외) */
export type ServerPostType = Exclude<Category, 'ALL'>; // 'FREE' | 'PROOF' | 'SHARE' | 'MATE'

/** --- 요청/응답 타입: 서버 스펙 기준 --- */
export type CreatePostReq = {
  type: ServerPostType;
  title: string;
  content: string;
  imageUrls?: string[];
  routeId?: number;
};

export type UpdatePostReq = Partial<{
  type: ServerPostType;
  title: string;
  content: string;
  imageUrls: string[] | null;
  routeId: number | null;
}>;

type AuthorObj = { id: number; nickname: string; avatarUrl?: string | null };

type PostResBase = {
  id: number;
  type: ServerPostType;
  title: string;
  imageUrls: string[];
  routeId?: number | null;
  likeCount: number;
  commentCount: number;
  createdAt: string; // ISO date string
  updatedAt: string;
  isDeleted?: boolean;
};

type PostResCreate = PostResBase & {
  authorId: number; // 생성 응답
  content: string;
};

type PostResDetail = PostResBase & {
  author: AuthorObj; // 상세 응답
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
    imageUrls: string[];
    routeId?: number;
    updatedAt: string;
  };
};

export type GetPostsQuery = {
  type?: ServerPostType;
  authorId?: number;
  routeId?: number;
  sort?: 'recent' | 'popular'; // default recent
};

/** 목록 아이템 (author 객체 버전) */
type PostResListItem = PostResBase & {
  author: AuthorObj;
  content?: string; // 서버가 줄 수도 있어 optional
};

/** 목록 아이템 (authorId만 있는 버전) */
type PostResListItemAlt = PostResBase & {
  authorId: number;
  content?: string;
};

/** 커서 목록 응답 */
type PostListCursorRes = {
  items: Array<PostResListItem | PostResListItemAlt>;
  nextCursor: number | null;
};

export type GetPostsCursorQuery = {
  type?: ServerPostType;
  authorId?: number;
  routeId?: number;
  sort?: 'recent' | 'popular';
  cursor?: number | null;
  limit?: number;
};

/** 목록 아이템 매퍼 (author/authorId 모두 대응) */
function mapListItemToEntity(res: PostResListItem | PostResListItemAlt): Post {
  const author =
    'author' in res
      ? (res.author?.nickname ?? String(res.author?.id ?? ''))
      : String(res.authorId);

  return {
    id: String(res.id),
    category: res.type,
    title: res.title,
    author,
    commentsCount: res.commentCount,
    content: res.content, // 없으면 undefined
    likeCount: res.likeCount,
    imageUrls: res.imageUrls ?? [],
    createdAt: res.createdAt,
    updatedAt: res.updatedAt,
  };
}

/** --- 서버 → 클라이언트 엔티티 매퍼 --- */
function mapPostResToEntity(res: PostRes): Post {
  // author 문자열: author.nickname(목록/상세) 또는 authorId(생성)로 대체
  const author =
    'author' in res
      ? (res.author?.nickname ?? String(res.author?.id ?? ''))
      : String((res as PostResCreate).authorId);

  // content: 목록 응답에는 없음 → undefined
  const content = 'content' in res ? res.content : undefined;

  return {
    id: String(res.id),
    category: res.type, // 'FREE' | 'PROOF' | 'SHARE' | 'MATE'
    title: res.title,
    author,
    commentsCount: res.commentCount,
    content,
    likeCount: res.likeCount,
    imageUrls: res.imageUrls ?? [],
    createdAt: res.createdAt,
    updatedAt: res.updatedAt,
    // liked: 서버 명세에 없음 → 필요 시 별도 me-상태 API로 보강
  };
}

/** --- 게시글 생성 --- */
export async function createPost(body: CreatePostReq): Promise<Post> {
  const { data } = await api.post<PostRes>('/community/posts', {
    ...body,
    imageUrls: body.imageUrls ?? [],
  });
  return mapPostResToEntity(data);
}

/** --- 게시글 목록 --- */
export async function getPosts(query: GetPostsQuery = {}): Promise<Post[]> {
  const params = new URLSearchParams();
  if (query.type) params.set('type', query.type);
  if (typeof query.authorId === 'number')
    params.set('authorId', String(query.authorId));
  if (typeof query.routeId === 'number')
    params.set('routeId', String(query.routeId));
  if (query.sort) params.set('sort', query.sort);

  const { data } = await api.get<{ items: PostResListItem[] }>(
    `/community/posts${params.toString() ? `?${params.toString()}` : ''}`,
  );

  return (data.items ?? []).map(mapPostResToEntity);
}

/** --- 게시글 상세 --- */
export async function getPost(id: number | string): Promise<Post> {
  const { data } = await api.get<PostResDetail>(`/community/posts/${id}`);
  return mapPostResToEntity(data);
}

/** 커서 기반 목록 */
export async function getPostsCursor(
  query: GetPostsCursorQuery = {},
): Promise<{ items: Post[]; nextCursor: number | null }> {
  const params = new URLSearchParams();
  if (query.type) params.set('type', query.type);
  if (typeof query.authorId === 'number')
    params.set('authorId', String(query.authorId));
  if (typeof query.routeId === 'number')
    params.set('routeId', String(query.routeId));
  if (query.sort) params.set('sort', query.sort);
  if (typeof query.limit === 'number') params.set('limit', String(query.limit));
  if (typeof query.cursor === 'number')
    params.set('cursor', String(query.cursor));

  const { data } = await api.get<PostListCursorRes>(
    `/community/posts${params.toString() ? `?${params.toString()}` : ''}`,
  );

  return {
    items: (data.items ?? []).map(mapListItemToEntity),
    nextCursor: data.nextCursor ?? null,
  };
}

/** 게시글 수정 */
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

/** 좋아요 토글 */
export async function togglePostLike(id: number | string): Promise<LikeRes> {
  const { data } = await api.post<LikeRes>(`/community/posts/${id}/like`);
  return data;
}

/** 게시글 삭제 (soft) */
export async function deletePostById(id: number | string): Promise<boolean> {
  const { data } = await api.delete<DeleteRes>(`/community/posts/${id}`);
  return !!data?.ok;
}

/** --- (선택) 에러 코드 헬퍼: 필요시 사용 --- */
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
  return '알 수 없는 오류가 발생했습니다.';
}
