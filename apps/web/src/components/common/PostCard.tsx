import styled from '@emotion/styled';
import BaseCard from './BaseCard';
import type { PostPreview } from '@/types/mypage';

export default function PostCard({
  data,
  onClick,
}: {
  data: PostPreview;
  onClick?: () => void;
}) {
  return (
    <BaseCard onClick={onClick} style={{ cursor: 'pointer' }}>
      <Title>{data.title}</Title>
      <Excerpt>{data.excerpt}</Excerpt>
      <Foot>
        <span>{data.date}</span>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <i className="ri-heart-line" /> {data.like}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <i className="ri-chat-3-line" /> {data.comments}
          </span>
        </div>
      </Foot>
    </BaseCard>
  );
}

const Title = styled.h4`
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const Excerpt = styled.p`
  margin: 0 0 12px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.subtext};
`;

const Foot = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.subtext};
`;
