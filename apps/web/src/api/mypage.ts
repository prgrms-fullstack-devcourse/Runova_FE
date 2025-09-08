// src/api/mypage.ts
import axios from 'axios';
import api from '@/lib/api';
import type { RoutePreview, PostPreview, CertPreview } from '@/types/mypage';

/** ---------- 서버 응답 타입 ---------- */
export type ProfileRes = {
  id: number;
  nickname: string;
  email: string;
  avatarUrl?: string | null;
  createdAt: string;
};

export type PostItemRes = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
};

/** 백엔드 확정 전이라 임시 unknown 처리 */
export type CourseItemRes = unknown;
export type PhotoItemRes = unknown;

export type MyPageOverviewRes = {
  profile: ProfileRes;
  myCourses: CourseItemRes[];
  myPosts: PostItemRes[];
  myPhotos: PhotoItemRes[];
};

/** ---------- 클라에 반환할 최종 타입 ---------- */
export type MyPageOverview = {
  profile: ProfileRes;
  routes: RoutePreview[];
  posts: PostPreview[];
  certs: CertPreview[];
};

/** ---------- 유틸: 날짜 포맷 ---------- */
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

/** ---------- 유틸: unknown 안전 접근 ---------- */
function pickStr(o: unknown, key: string): string | undefined {
  if (o && typeof o === 'object' && key in (o as Record<string, unknown>)) {
    const v = (o as Record<string, unknown>)[key];
    return typeof v === 'string' ? v : undefined;
  }
  return undefined;
}
function pickNum(o: unknown, key: string): number | undefined {
  if (o && typeof o === 'object' && key in (o as Record<string, unknown>)) {
    const v = (o as Record<string, unknown>)[key];
    return typeof v === 'number' ? v : undefined;
  }
  return undefined;
}

/** ---------- 매퍼: 서버 → 클라 프리뷰 ---------- */
function mapPostPreview(p: PostItemRes): PostPreview {
  return {
    id: String(p.id),
    title: p.title,
    excerpt: p.content.length > 120 ? `${p.content.slice(0, 120)}…` : p.content,
    date: fmtDate(p.createdAt),
    like: p.likeCount,
    comments: p.commentCount,
  };
}

function mapCoursePreview(c: CourseItemRes, idx: number): RoutePreview {
  const id = pickNum(c, 'id') ?? idx + 1;
  const title = pickStr(c, 'title') ?? pickStr(c, 'name') ?? `코스 #${id}`;
  const distance = pickNum(c, 'distanceKm');
  const pace = pickNum(c, 'paceSecPerKm');
  const createdAt = pickStr(c, 'createdAt') ?? pickStr(c, 'savedAt');
  const thumb =
    pickStr(c, 'thumbnailUrl') ??
    pickStr(c, 'imageUrl') ??
    `https://picsum.photos/160/160?course=${id}`;

  const meta =
    typeof distance === 'number' && typeof pace === 'number'
      ? `${distance.toFixed(1)}km • 평균 페이스 ${Math.floor(pace / 60)}'${String(
          Math.floor(pace % 60),
        ).padStart(2, '0')}"`
      : (pickStr(c, 'meta') ?? '');

  return {
    id: String(id),
    title,
    meta,
    savedAt: createdAt ? `${fmtDate(createdAt)} 저장` : '',
    thumbnail: thumb,
  };
}

function mapCertPreview(p: PhotoItemRes, idx: number): CertPreview {
  const id = pickNum(p, 'id') ?? idx + 1;
  const title = pickStr(p, 'title') ?? '인증';
  const place =
    pickStr(p, 'place') ??
    [pickStr(p, 'location'), pickStr(p, 'distanceKm')?.concat('km')]
      .filter(Boolean)
      .join(' • ');
  const dt = pickStr(p, 'createdAt') ?? pickStr(p, 'datetime') ?? '';
  const thumb =
    pickStr(p, 'thumbnailUrl') ??
    pickStr(p, 'imageUrl') ??
    `https://picsum.photos/160/160?photo=${id}`;

  return {
    id: String(id),
    title,
    place: place || '',
    datetime: dt ? fmtDateTime(dt) : '',
    thumbnail: thumb,
  };
}

/** ---------- API ---------- */

export async function getMyOverviewRaw(): Promise<MyPageOverviewRes> {
  const { data } = await api.get<MyPageOverviewRes>('/mypage/overview');
  return data;
}

export async function getMyOverview(): Promise<MyPageOverview> {
  const data = await getMyOverviewRaw();
  return {
    profile: data.profile,
    routes: (data.myCourses ?? []).map(mapCoursePreview),
    posts: (data.myPosts ?? []).map(mapPostPreview),
    certs: (data.myPhotos ?? []).map(mapCertPreview),
  };
}

export function getReadableMyPageError(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const code = (e.response?.data as { code?: string } | undefined)?.code;
    switch (code) {
      case 'AUTH.UNAUTHORIZED':
        return '로그인이 필요합니다.';
      default:
        return '정보를 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.';
    }
  }
  return '알 수 없는 오류가 발생했습니다.';
}
