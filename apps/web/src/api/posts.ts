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
  imageUrl: string; // 단일 이미지 URL
  routeId?: number;
};

export type UpdatePostReq = Partial<{
  type: ServerPostType;
  title: string;
  content: string;
  imageUrl: string | null; // 단일 이미지 URL 또는 null
  routeId: number | null;
}>;

type AuthorObj = { id: number; nickname: string; imageUrl?: string | null };

type PostResBase = {
  id: number;
  type: ServerPostType;
  title: string;
  imageUrls?: string[]; // 서버가 과거 호환 위해 줄 수 있음
  imageUrl?: string; // 표준: 단일
  routeId?: number | null;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  authorInfo: AuthorObj;
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
    imageUrl: string; // 서버 표준
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

/** 목록 아이템 (author 객체 버전) */
type PostResListItem = PostResBase & {
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

/** 서버 응답에서 단일 imageUrl 계산 (imageUrl 우선, 없으면 imageUrls[0]) */
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

/** 목록 아이템 매퍼 (author/authorId 모두 대응) */
function mapListItemToEntity(res: PostResListItem | PostResListItemAlt): Post {
  const author = res.authorInfo?.nickname;

  return {
    id: String(res.id),
    category: res.type,
    title: res.title,
    author,
    commentsCount: res.commentCount,
    content: res.content,
    likeCount: res.likeCount,
    imageUrl: pickImageUrl(res),
    createdAt: res.createdAt,
    updatedAt: res.updatedAt,
    authorInfo: res.authorInfo,
  };
}

/** --- 서버 → 클라이언트 엔티티 매퍼 --- */
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
  };
}

/** --- 게시글 생성 --- */
export async function createPost(body: CreatePostReq): Promise<Post> {
  const { data } = await api.post<PostRes>('/community/posts', body);
  return mapPostResToEntity(data);
}

/** --- 게시글 목록 --- */
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

/** 커서 기반 목록 */
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

/** --- 게시글 상세 --- */
export async function getPost(id: number | string): Promise<Post> {
  const { data } = await api.get<PostResDetail>(`/community/posts/${id}`);
  return mapPostResToEntity(data);
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
  return `알 수 없는 오류가 발생했습니다. ${e}`;
}

/* -------------------------------------------
 *   🔽 PROOF 이미지 presign & 업로드 유틸
 *   (아바타 presign 로직과 동일한 패턴)
 * ----------------------------------------- */

export type PresignReq = {
  /** 예: 'community-proof' */
  type: string;
  contentType: string;
  size: number;
};

export type PresignRes = {
  /** PUT 대상 URL (S3 presigned URL 등) */
  url: string;
};

export async function getProofPresign(req: PresignReq): Promise<PresignRes> {
  const { data } = await api.post<PresignRes>('/files/presign', req);
  return data;
}

export function objectUrlFromPresign(url: string): string {
  return url.split('?')[0];
}

/** 파일 업로드(put) 후 public URL(단일) 반환 */
export async function uploadProofWithFile(file: File): Promise<string> {
  const contentType = file.type || 'image/jpeg';
  const size = file.size;

  // 1) presign
  const presign = await getProofPresign({
    type: 'verify',
    contentType,
    size,
  });

  // 2) PUT 업로드
  const putRes = await fetch(presign.url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  });
  if (!putRes.ok) {
    throw new Error(`이미지 업로드 실패: ${putRes.status}`);
  }

  // 3) 업로드된 public URL 반환
  return objectUrlFromPresign(presign.url);
}
