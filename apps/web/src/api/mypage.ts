// src/api/mypage.ts
import axios from 'axios';
import api from '@/lib/api';
import type { RoutePreview, PostPreview, CertPreview } from '@/types/mypage';

/* ---------- 서버 응답 타입 ---------- */
export type UserProfileRes = {
  id: number;
  nickname: string;
  email: string;
  imageUrl?: string | null;
  createdAt: string;
};

export type UserCourseRes = {
  id: number;
  title: string;
  length: number; // meters
  createdAt: string;
  previewImageUrl?: string; // '' 일 수도 있음
};

export type UserPostRes = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
};

export type UserPhotoRes = {
  id: number;
  courseId: number;
  title: string;
  imageUrl: string;
  createdAt: string;
};

export type MeProfileRes = {
  profile: UserProfileRes;
  myCourses: UserCourseRes[];
  myPosts: UserPostRes[];
  myPhotos: UserPhotoRes[];
};

/* ---------- 업로드 관련 ---------- */
export type PresignReq = {
  type: 'avatar' | 'verify' | 'course';
  contentType: string;
  size: number;
};
export type PresignRes = {
  url: string;
  key: string;
  bucket: string;
};

export type UpdateAvatarReq = { imageUrl: string };
export type UpdateAvatarRes = { success: boolean };

/* ---------- 날짜 포맷 ---------- */
function fmtDate(iso: string): string {
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  } catch {
    return iso;
  }
}
function fmtDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return iso;
  }
}

/* ---------- 매퍼: 서버 → 클라 프리뷰 ---------- */
function mapCoursePreview(c: UserCourseRes): RoutePreview {
  const km = c.length / 1000;
  return {
    id: String(c.id),
    title: c.title,
    meta: `${km.toFixed(1)}km`,
    savedAt: `${fmtDate(c.createdAt)} 저장`,
    thumbnail:
      c.previewImageUrl && c.previewImageUrl.length > 0
        ? c.previewImageUrl
        : '',
  };
}

function mapPostPreview(p: UserPostRes): PostPreview {
  const excerpt =
    p.content.length > 120 ? `${p.content.slice(0, 120)}…` : p.content;
  return {
    id: String(p.id),
    title: p.title,
    excerpt,
    date: fmtDate(p.createdAt),
    like: p.likeCount,
    comments: p.commentCount,
  };
}

function mapCertPreview(ph: UserPhotoRes): CertPreview {
  return {
    id: String(ph.id),
    title: ph.title,
    place: `코스 #${ph.courseId}`,
    datetime: fmtDateTime(ph.createdAt),
    thumbnail: ph.imageUrl,
  };
}

/* URL 파싱 */
export function objectUrlFromPresign(presignUrl: string): string {
  try {
    const u = new URL(presignUrl);
    return `${u.origin}${u.pathname}`;
  } catch {
    return presignUrl.split('?')[0];
  }
}

/* ---------- API ---------- */

// 내 정보 + 개요(코스/글/사진)
export async function getMeOverview(): Promise<{
  profile: UserProfileRes;
  routes: RoutePreview[];
  posts: PostPreview[];
  certs: CertPreview[];
}> {
  const { data } = await api.get<MeProfileRes>('/users/me/profile');
  return {
    profile: data.profile,
    routes: (data.myCourses ?? []).map(mapCoursePreview),
    posts: (data.myPosts ?? []).map(mapPostPreview),
    certs: (data.myPhotos ?? []).map(mapCertPreview),
  };
}

// 아바타 업로드용 presign
export async function getAvatarPresign(req: PresignReq): Promise<PresignRes> {
  const { data } = await api.post<PresignRes>('/files/presign', req);
  return data;
}

// ✅ 아바타 확정: presign URL을 서버에 전달
export async function updateMyAvatar(
  body: UpdateAvatarReq,
): Promise<UpdateAvatarRes> {
  try {
    const { data } = await api.patch<UpdateAvatarRes>('/users/me/avatar', body);
    return data;
  } catch (e) {
    if (axios.isAxiosError(e)) {
      console.error('[avatar] confirm error', {
        status: e.response?.status,
        data: e.response?.data,
      });
    }
    throw e;
  }
}

// helper: 긴 URL 대신 host만 안전하게 표시
function hostOf(u: string) {
  try {
    return new URL(u).host;
  } catch {
    return '(invalid url)';
  }
}

// presign → S3 PUT → 확정(url)   (성공시 true)
export async function uploadAvatarWithFile(file: File): Promise<boolean> {
  const contentType = file.type || 'image/jpeg';
  const size = file.size;

  console.log('[avatar] start', {
    fileName: file.name,
    contentType,
    size,
  });

  // 1) presign
  let presign: PresignRes;
  try {
    presign = await getAvatarPresign({ type: 'avatar', contentType, size });
  } catch (err) {
    console.error('[avatar] presign ✗', err);
    throw err;
  }
  const pHost = hostOf(presign.url);

  // 2) PUT 업로드
  let putRes: Response;
  try {
    putRes = await fetch(presign.url, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: file,
    });
  } catch (err) {
    throw new Error(`Upload failed: ${err}`);
  }

  if (!putRes.ok) {
    throw new Error(`Upload failed: ${putRes.status}`);
  }

  // 3) 확정 (url 전달)
  console.log('[avatar] confirm PATCH →', { imageUrlHost: pHost });
  let confirm: UpdateAvatarRes;
  try {
    confirm = await updateMyAvatar({
      imageUrl: objectUrlFromPresign(presign.url),
    });
  } catch (e) {
    throw new Error(`Upload failed: ${e}`);
  }

  return !!confirm?.success;
}

/** (선택) 업로드 후 최신 프로필 다시 가져오는 헬퍼 */
export async function uploadAvatarAndRefresh(
  file: File,
): Promise<UserProfileRes> {
  await uploadAvatarWithFile(file);
  const { profile } = await getMeOverview();
  return profile;
}

/* ---------- 에러 메시지 ---------- */
export function getReadableUserError(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const status = e.response?.status;
    if (status === 400) return '잘못된 요청입니다. (URL/소유자 검증 실패 가능)';
    if (status === 401) return '로그인이 필요합니다.';
    if (status === 404) return '사용자 정보를 찾을 수 없습니다.';
    return '요청 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.';
  }
  return '알 수 없는 오류가 발생했습니다.';
}
