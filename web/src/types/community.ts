export type Category = 'all' | 'free' | 'auth' | 'share' | 'mate';

export interface Post {
  id: string;
  category: Exclude<Category, 'all'>;
  title: string;
  author: string;
  commentsCount: number;
  content?: string;
  liked?: boolean;
  likeCount?: number;
}

export interface Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
}
