import styled from '@emotion/styled';
import type { Post } from '@/types/community';

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
    <Container>
      <Row>
        <div>
          <Pill>
            {post.category === 'free'
              ? '자유'
              : post.category === 'auth'
                ? '인증'
                : post.category === 'share'
                  ? '공유'
                  : '메이트'}
          </Pill>
        </div>
        <ButtonContainer>
          <EditButton onClick={onEdit}>수정</EditButton>
          <DeleteButton onClick={onDelete}>삭제</DeleteButton>
        </ButtonContainer>
      </Row>
      <Title>{post.title}</Title>
      <Author>{post.author}</Author>
    </Container>
  );
}

const Container = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const Pill = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  background: ${({ theme }) => theme.colors.subtext}20;
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

const ButtonContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const baseBtn = `
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: transparent;
  font-weight: 600;
`;

const EditButton = styled.button`
  ${baseBtn}
  color: #475569;
`;

const DeleteButton = styled.button`
  ${baseBtn}
  color: #dc2626;
`;
