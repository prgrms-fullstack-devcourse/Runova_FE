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
            <Meta>
              <Author>{c.author}</Author>
            </Meta>
            <Body>{c.content}</Body>
            {manageable && (onEdit || onDelete) && (
              <BtnRow>
                <Btns>
                  {onEdit && (
                    <EditButton disabled={busy} onClick={() => onEdit(c.id)}>
                      수정
                    </EditButton>
                  )}
                  {onDelete && (
                    <DeleteButton
                      disabled={busy}
                      onClick={() => onDelete(c.id)}
                    >
                      삭제
                    </DeleteButton>
                  )}
                </Btns>
              </BtnRow>
            )}
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
  gap: 6px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.surface};
  padding-bottom: 12px;
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

/* 버튼 줄을 오른쪽 끝으로 */
const BtnRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const Btns = styled.div`
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
  color: ${({ theme }) => theme.colors.subtext};
`;

const DeleteButton = styled.button`
  ${baseBtn}
  color: ${({ theme }) => theme.colors.danger};
`;
