import styled from '@emotion/styled';

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
const Bio = styled.p`
  margin: 4px 0 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.subtext};
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

export default function ProfileSection() {
  return (
    <Section>
      <Row>
        <AvatarWrap>
          <Avatar
            alt="프로필 이미지"
            src="https://picsum.photos/160/160"
          />
          <EditBtn aria-label="프로필 수정">
            <i className="ri-edit-line" />
          </EditBtn>
        </AvatarWrap>
        <div style={{ flex: 1 }}>
          <Name>김러너</Name>
          <Bio>매일 달리는 것이 목표입니다 🏃‍♂️</Bio>
          <Since>
            <i className="ri-calendar-line" />
            <span>2024년 3월부터 시작</span>
          </Since>
        </div>
      </Row>
    </Section>
  );
}
