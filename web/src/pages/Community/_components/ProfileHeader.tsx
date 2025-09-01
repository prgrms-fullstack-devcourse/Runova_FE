import styled from '@emotion/styled';

type ProfileHeaderProps = {
  userName: string;
  postDate: string;
  imageUrl: string;
};

export default function ProfileHeader({
  userName,
  postDate,
  imageUrl,
}: ProfileHeaderProps) {
  return (
    <Container>
      <ImageContainer>
        <ProfileImage src={imageUrl} alt={`${userName} profile`} />
      </ImageContainer>
      <ProfileTextContainer>
        <UserName>{userName}</UserName>
        <PostDate>{postDate}</PostDate>
      </ProfileTextContainer>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 10px;
`;

const ImageContainer = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ProfileTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const UserName = styled.span`
  ${({ theme }) => theme.typography.title};
`;

const PostDate = styled.span`
  ${({ theme }) => theme.typography.small};
  color: ${({ theme }) => theme.colors.subtext};
`;
