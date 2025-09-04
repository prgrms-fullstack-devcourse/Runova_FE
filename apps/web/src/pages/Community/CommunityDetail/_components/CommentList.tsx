import styled from '@emotion/styled';
import type { Comment } from '@/types/community';

type Props = {
  comments: Comment[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  /** 현재 수정/삭제 처리 중인 댓글 id (버튼 비활성화 용) */
  workingId?: string | null;
  /** (선택) 내가 쓴 댓글만 버튼 노출하고 싶으면 전달: 기본은 모두 노출 */
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
              <Btns>
                {onEdit && (
                  <button disabled={busy} onClick={() => onEdit(c.id)}>
                    수정
                  </button>
                )}
                {onDelete && (
                  <button disabled={busy} onClick={() => onDelete(c.id)}>
                    삭제
                  </button>
                )}
              </Btns>
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
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
`;
const Meta = styled.div`
  font-size: 12px;
  color: #6b7280;
`;
const Author = styled.span`
  font-weight: 600;
`;
const Body = styled.div`
  font-size: 14px;
  white-space: pre-wrap;
`;
const Btns = styled.div`
  display: flex;
  gap: 8px;
`;
