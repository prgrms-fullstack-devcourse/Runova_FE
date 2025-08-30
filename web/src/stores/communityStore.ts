import { create } from 'zustand';
import type { Category, Post, Comment } from '@/types/community';

// TODO: API 연결(현재는 AI생성 더미 컨텐츠)
const initialPosts: Post[] = [
  {
    id: 'p1',
    category: 'auth',
    title: '한강에서 하트 완성!',
    author: '러닝마니아',
    commentsCount: 24,
  },
  {
    id: 'p2',
    category: 'share',
    title: '여의도 벚꽃길 경로 공유',
    author: '벚꽃러너',
    commentsCount: 18,
  },
  {
    id: 'p3',
    category: 'mate',
    title: '올림픽공원 러닝 메이트 구해요',
    author: '주말러너',
    commentsCount: 12,
  },
  {
    id: 'p4',
    category: 'free',
    title: '초보자 추천 코스 문의',
    author: '초보러너',
    commentsCount: 31,
  },
];

const initialComments: Comment[] = [
  {
    id: 'c1',
    postId: 'p1',
    author: '댓글러너1',
    content: '정말 멋진 경로네요! 저도 따라해보고 싶어요.',
  },
  {
    id: 'c2',
    postId: 'p1',
    author: 'GPS마스터',
    content: 'GPS 정확도를 높이려면 건물이 적은 곳에서 뛰는게 좋아요.',
  },
  {
    id: 'c3',
    postId: 'p2',
    author: '러닝초보',
    content: '초보자도 쉽게 따라할 수 있을까요?',
  },
];

type State = {
  posts: Post[];
  comments: Comment[];
  filter: Category;
};

type Actions = {
  setFilter: (c: Category) => void;
  addPost: (data: {
    category: Exclude<Category, 'all'>;
    title: string;
    content?: string;
  }) => string;
  updatePost: (id: string, patch: Partial<Post>) => void;
  deletePost: (id: string) => void;
  toggleLike: (id: string) => void;
  addComment: (postId: string, content: string) => void;
};

export const useCommunityStore = create<State & Actions>()((set) => ({
  posts: initialPosts.map((p) => ({ ...p, liked: false, likeCount: 0 })),
  comments: initialComments,
  filter: 'all',

  setFilter: (c) => set({ filter: c }),

  addPost: (data) => {
    const id = `p${Date.now()}`;
    set((state) => ({
      posts: [
        {
          id,
          category: data.category,
          title: data.title,
          author: '새로운러너',
          commentsCount: 0,
          content: data.content ?? '',
          liked: false,
          likeCount: 0,
        },
        ...state.posts,
      ],
    }));
    return id;
  },

  updatePost: (id, patch) =>
    set((state) => ({
      posts: state.posts.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),

  deletePost: (id) =>
    set((state) => ({
      posts: state.posts.filter((p) => p.id !== id),
      comments: state.comments.filter((c) => c.postId !== id),
    })),

  toggleLike: (id) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === id
          ? {
              ...p,
              liked: !p.liked,
              likeCount: (p.likeCount ?? 0) + (p.liked ? -1 : 1),
            }
          : p,
      ),
    })),

  addComment: (postId, content) =>
    set((state) => ({
      comments: [
        ...state.comments,
        { id: `c${Date.now()}`, postId, author: '나', content },
      ],
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p,
      ),
    })),
}));
