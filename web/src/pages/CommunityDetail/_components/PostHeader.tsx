import styled from '@emotion/styled';
import type { Post } from '@/types/community';

const Wrap = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const Pill = styled.span<{ color: string }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: ${({ color }) => color};
  background: ${({ color }) => color}20;
`;

const Title = styled.h1`
  margin: 8px 0;
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const Author = styled.div`
  color: ${({ theme }) => theme.colors.subtext};
  font-size: 14px;
`;

function tone(cat: Post['category']) {
  switch (cat) {
    case 'free':
      return '#2563eb';
    case 'auth':
      return '#dc2626';
    case 'share':
      return '#16a34a';
    case 'mate':
      return '#7c3aed';
  }
}

export default function PostHeader({
  post,
  onEdit,
  onDelete,
}: {
  post: Post;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Wrap>
      <Row>
        <div>
          <Pill color={tone(post.category)!}>
            {post.category === 'free'
              ? '자유'
              : post.category === 'auth'
                ? '인증'
                : post.category === 'share'
                  ? '공유'
                  : '메이트'}
          </Pill>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onEdit}
            style={{
              padding: '6px 10px',
              borderRadius: 999,
              border: `1px solid rgba(0,0,0,0.08)`,
              color: '#475569',
            }}
          >
            수정
          </button>
          <button
            onClick={onDelete}
            style={{
              padding: '6px 10px',
              borderRadius: 999,
              border: `1px solid rgba(0,0,0,0.08)`,
              color: '#dc2626',
            }}
          >
            삭제
          </button>
        </div>
      </Row>
      <Title>{post.title}</Title>
      <Author>{post.author}</Author>
    </Wrap>
  );
}
