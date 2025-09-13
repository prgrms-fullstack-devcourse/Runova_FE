export type Category = 'ALL' | 'FREE' | 'PROOF' | 'SHARE' | 'MATE';

type AuthorObj = { id: number; nickname: string; imageUrl?: string | null };

export interface Post {
  id: string;
  category: Exclude<Category, 'ALL'>;
  title: string;
  author: string;
  commentsCount: number;
  content?: string;
  liked?: boolean;
  likeCount?: number;
  imageUrls?: string[];
  imageUrl?: string;
  routeId?: number;
  createdAt: string;
  updatedAt: string;
  authorInfo: AuthorObj;
}

export interface Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
  updatedAt: string;
}

export type NavKey = 'home' | 'photo' | 'route' | 'run';
