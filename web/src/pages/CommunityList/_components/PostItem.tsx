import styled from '@emotion/styled';
import type { Post } from '@/types/community';

const Item = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: 16px 0;
  cursor: pointer;
`;

const Title = styled.h3`
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: stretch;
`;

const Pill = styled.span`
  display: inline-block;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.subtext};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  margin: 0 0 8px;
`;

const RightMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: justify-between;
  align-self: stretch;
`;

const Author = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.subtext};
`;

const Chat = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.subtext};
`;

export default function PostItem({
  post,
  onClick,
}: {
  post: Post;
  onClick: (p: Post) => void;
}) {
  return (
    <Item onClick={() => onClick(post)}>
      <MetaRow>
        <div>
          <Title>{post.title}</Title>
          <Author>{post.author}</Author>
        </div>
        <RightMeta>
          <Pill>
            {post.category === 'free'
              ? '자유'
              : post.category === 'auth'
                ? '인증'
                : post.category === 'share'
                  ? '공유'
                  : '메이트'}
          </Pill>
          <Chat>
            <i className="ri-chat-3-line" />
            <span>{post.commentsCount}</span>
          </Chat>
        </RightMeta>
      </MetaRow>
    </Item>
  );
}
