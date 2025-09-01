import styled from '@emotion/styled';
import ProfileHeader from './ProfileHeader';

type PostCardProps = {
  userName: string;
  postDate: string;
  profileImageUrl: string; // 프로필 이미지
  postImageUrl?: string; // 본문 이미지 (옵션)
  contents: string;
  likes: number;
  isLiked: boolean;
  comments: number;
};

export default function PostCard({
  userName,
  postDate,
  profileImageUrl,
  postImageUrl,
  contents,
  likes,
  isLiked,
  comments,
}: PostCardProps) {
  return (
    <Container>
      <ProfileHeader
        userName={userName}
        postDate={postDate}
        imageUrl={profileImageUrl}
      />
      {postImageUrl && (
        <PostImageContainer>
          <PostImage src={postImageUrl} alt="post image" />
        </PostImageContainer>
      )}
      <Contents>{contents}</Contents>
      <BottomContainer>
        <IconAndNumber isActive={isLiked}>
          <i className="ri-thumb-up-fill" />
          <span>{likes}</span>
        </IconAndNumber>
        <IconAndNumber isActive={true}>
          <i className="ri-chat-1-fill" />
          <span>{comments}</span>
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
