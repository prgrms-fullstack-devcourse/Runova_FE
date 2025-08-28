export type CategoryKey = 'all' | 'free' | 'auth' | 'share' | 'mate';

export interface Post {
  id: string;
  title: string;
  author: string;
  category: Exclude<CategoryKey, 'all'>;
  commentsCount: number;
  content?: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
}