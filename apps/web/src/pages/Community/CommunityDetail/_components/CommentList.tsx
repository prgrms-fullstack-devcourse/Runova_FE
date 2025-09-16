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

        const nickname = c.authorInfo?.nickname ?? c.authorId ?? '알 수 없음';
        const avatar = c.authorInfo?.imageUrl ?? '';

        return (
          <Row key={c.id}>
            <HeaderRow>
              <Meta>
                <Avatar src={avatar} alt="avatar" $placeholder={!avatar} />
                <Author>{nickname}</Author>
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
  justify-content: space-between;
  gap: 12px;
`;

const Meta = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primary};
`;

const Avatar = styled.img<{ $placeholder?: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 999px;
  object-fit: cover;
  background: ${({ theme, $placeholder }) =>
    $placeholder ? theme.colors.surfaceAlt : 'transparent'};
  border: 1px solid ${({ theme }) => theme.colors.border};
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

  color: ${({ theme, $variant }) =>
    $variant === 'edit' ? theme.colors.primary : theme.colors.danger};

  &[disabled] {
    opacity: 0.6;
    pointer-events: none;
  }
`;
