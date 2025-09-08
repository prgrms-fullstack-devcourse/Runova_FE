import styled from '@emotion/styled';

export type ProfileSectionProps = {
  profile?: {
    nickname: string;
    avatarUrl?: string | null;
    createdAt?: string;
  };
  onEdit?: () => void;
};

export default function ProfileSection({
  profile,
  onEdit,
}: ProfileSectionProps) {
  const name = profile?.nickname ?? '러너';
  const avatar =
    profile?.avatarUrl ??
    'https://picsum.photos/160/160?blur=2&random=profile-fallback';

  const since = profile?.createdAt
    ? (() => {
        const d = new Date(profile.createdAt);
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        return `${y}년 ${m}월부터 시작`;
      })()
    : undefined;

  return (
    <Section>
      <Row>
        <AvatarWrap>
          <Avatar alt="프로필 이미지" src={avatar} />
          <EditBtn aria-label="프로필 수정" onClick={onEdit}>
            <i className="ri-edit-line" />
          </EditBtn>
        </AvatarWrap>
        <div style={{ flex: 1 }}>
          <Name>{name}</Name>
          {since && (
            <Since>
              <i className="ri-calendar-line" />
              <span>{since}</span>
            </Since>
          )}
        </div>
      </Row>
    </Section>
  );
}

const Section = styled.section`
  padding: 24px 16px;
  background: ${({ theme }) => theme.colors.surface};
`;
const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;
const AvatarWrap = styled.div`
  position: relative;
`;
const Avatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${({ theme }) => theme.colors.border};
`;
const EditBtn = styled.button`
  position: absolute;
  right: -4px;
  bottom: -4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  font-size: 12px;
`;
const Name = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const Since = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.subtext};
  i {
    margin-right: 4px;
  }
`;
