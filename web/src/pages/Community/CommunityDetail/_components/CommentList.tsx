import styled from '@emotion/styled';
import type { Comment } from '@/types/community';

export default function CommentList({ comments }: { comments: Comment[] }) {
  return (
    <Section>
      <h3
        style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: 12,
        }}
      >
        댓글
      </h3>
      <div style={{ display: 'grid', gap: 12 }}>
        {comments.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: 14,
              padding: '16px 0',
            }}
          >
            아직 댓글이 없습니다.
          </div>
        )}
        {comments.map((c) => (
          <div
            key={c.id}
            style={{ borderBottom: '1px solid #f8fafc', paddingBottom: 12 }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 4,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>
                {c.author}
              </div>
            </div>
            <Comment>{c.content}</Comment>
          </div>
        ))}
      </div>
    </Section>
  );
}

const Comment = styled.div`
  fontsize: 14;
  color: '#334155';
`;

const Section = styled.div`
  padding: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;
