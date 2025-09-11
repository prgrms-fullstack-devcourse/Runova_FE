import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import type { Post } from '@/types/community';
import ProfileHeader from './ProfileHeader';

type PostCardProps = {
  post: Post;
};

export default function PostCard({ post }: PostCardProps) {
  const navigate = useNavigate();

  const {
    id,
    author,
    content,
    liked,
    likeCount,
    commentsCount,
    imageUrl,
    createdAt,
  } = post;

  return (
    <Container
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/community/${id}`)}
    >
      <ProfileHeader
        userName={author}
        postDate={createdAt.slice(0, 10)}
        imageUrl={`https://picsum.photos/48?random=${id}`}
      />

      {imageUrl && imageUrl !== '{}' && (
        <PostImageContainer>
          <PostImage src={imageUrl} alt="post image" />
        </PostImageContainer>
      )}

      <Contents>{content ?? ''}</Contents>

      <BottomContainer>
        <IconAndNumber isActive={!!liked}>
          <i className="ri-thumb-up-fill" />
          <span>{likeCount ?? 0}</span>
        </IconAndNumber>
        <IconAndNumber isActive>
          <i className="ri-chat-1-fill" />
          <span>{commentsCount}</span>
        </IconAndNumber>
      </BottomContainer>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  user-select: none;

  &:hover {
    background: ${({ theme }) => theme.colors.surface ?? 'transparent'};
  }
`;

const PostImageContainer = styled.div`
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
`;

const PostImage = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  display: block;
`;

const Contents = styled.span`
  ${({ theme }) => theme.typography.small};
  display: -webkit-box;
  -webkit-line-clamp: 3; /* 최대 3줄 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal; /* 줄바꿈 허용 */
`;

const BottomContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
`;

const IconAndNumber = styled.div<{ isActive?: boolean }>`
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: center;
  color: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary : theme.colors.subtext};

  i {
    font-size: 16px;
    line-height: 1;
  }
`;
