import styled from '@emotion/styled';
import type { Comment } from '@/types/community';

type Props = {
  comments: Comment[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  workingId?: string | null;
  canManage?: (c: Comment) => boolean;
};

export default function CommentList({
  comments,
  onEdit,
  onDelete,
  workingId = null,
  canManage,
}: Props) {
  return (
    <Wrap>
      {comments.map((c) => {
        const manageable = canManage ? canManage(c) : true;
        const busy = workingId === c.id;

        return (
          <Row key={c.id}>
            <HeaderRow>
              <Meta>
                <Author>{c.author}</Author>
              </Meta>

              {manageable && (onEdit || onDelete) && (
                <Actions>
                  {onEdit && (
                    <IconButton
                      aria-label="수정"
                      title="수정"
                      disabled={busy}
                      onClick={() => onEdit(c.id)}
                      $variant="edit"
                    >
                      <i className="ri-pencil-line" />
                    </IconButton>
                  )}
                  {onDelete && (
                    <IconButton
                      aria-label="삭제"
                      title="삭제"
                      disabled={busy}
                      onClick={() => onDelete(c.id)}
                      $variant="delete"
                    >
                      <i className="ri-delete-bin-6-line" />
                    </IconButton>
                  )}
                </Actions>
              )}
            </HeaderRow>

            <Body>{c.content}</Body>
          </Row>
        );
      })}
    </Wrap>
  );
}

const Wrap = styled.div`
  padding: 8px 16px;
  display: grid;
  gap: 12px;
`;

const Row = styled.div`
  display: grid;
  gap: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.surface};
  padding-bottom: 12px;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between; /* 좌: 작성자 / 우: 버튼들 */
  gap: 12px;
`;

const Meta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primary};
`;

const Author = styled.span`
  font-weight: 600;
`;

const Body = styled.div`
  font-size: 14px;
  white-space: pre-wrap;
`;

const Actions = styled.div`
  display: flex;
  align-items: end;
  gap: 6px;
`;

const IconButton = styled.button<{ $variant: 'edit' | 'delete' }>`
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  font-size: 20px;

  /* 색상은 기존과 동일한 토큰 사용 */
  color: ${({ theme, $variant }) =>
    $variant === 'edit' ? theme.colors.primary : theme.colors.danger};

  &[disabled] {
    opacity: 0.6;
    pointer-events: none;
  }
`;
