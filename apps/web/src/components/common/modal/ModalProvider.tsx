import React, { useCallback, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import styled from '@emotion/styled';
import {
  ModalContext,
  type ModalContextValue,
  type ConfirmOptions,
  type AlertOptions,
  type PromptOptions,
} from './modalContext';

/** ===== 모달 요청 타입(유니온) - any 없음 ===== */

type ModalRequest =
  | {
      id: number;
      kind: 'confirm';
      opts: ConfirmOptions;
      resolve: (v: boolean) => void;
    }
  | { id: number; kind: 'alert'; opts: AlertOptions; resolve: () => void }
  | {
      id: number;
      kind: 'prompt';
      opts: PromptOptions;
      resolve: (v: string | null) => void;
    };

/** ===== Provider 컴포넌트 (이 파일은 컴포넌트만 export) ===== */

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [modals, setModals] = useState<ModalRequest[]>([]);
  const [seq, setSeq] = useState(1);

  // 요청 추가: 종류별로 오버로드로 제공 (any 없이 명확)
  const confirm = useCallback<ModalContextValue['confirm']>(
    (opts = {}) => {
      return new Promise<boolean>((resolve) => {
        setSeq((n) => n + 1);
        const id = seq;
        setModals((prev) => [...prev, { id, kind: 'confirm', opts, resolve }]);
      });
    },
    [seq],
  );

  const alert = useCallback<ModalContextValue['alert']>(
    (opts) => {
      return new Promise<void>((resolve) => {
        setSeq((n) => n + 1);
        const id = seq;
        setModals((prev) => [...prev, { id, kind: 'alert', opts, resolve }]);
      });
    },
    [seq],
  );

  const prompt = useCallback<ModalContextValue['prompt']>(
    (opts) => {
      return new Promise<string | null>((resolve) => {
        setSeq((n) => n + 1);
        const id = seq;
        setModals((prev) => [...prev, { id, kind: 'prompt', opts, resolve }]);
      });
    },
    [seq],
  );

  const close = useCallback((id: number) => {
    setModals((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const value = useMemo<ModalContextValue>(
    () => ({ confirm, alert, prompt }),
    [confirm, alert, prompt],
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
      {ReactDOM.createPortal(
        <Stack>
          {modals.map((m) => (
            <Shell
              key={m.id}
              onDismiss={() => {
                if (m.kind === 'confirm') m.resolve(false);
                else if (m.kind === 'prompt') m.resolve(null);
                else m.resolve();
                close(m.id);
              }}
            >
              {m.kind === 'confirm' && (
                <ConfirmView
                  {...m.opts}
                  onCancel={() => {
                    m.resolve(false);
                    close(m.id);
                  }}
                  onConfirm={() => {
                    m.resolve(true);
                    close(m.id);
                  }}
                />
              )}
              {m.kind === 'alert' && (
                <AlertView
                  {...m.opts}
                  onConfirm={() => {
                    m.resolve();
                    close(m.id);
                  }}
                />
              )}
              {m.kind === 'prompt' && (
                <PromptView
                  {...m.opts}
                  onCancel={() => {
                    m.resolve(null);
                    close(m.id);
                  }}
                  onConfirm={(v) => {
                    m.resolve(v);
                    close(m.id);
                  }}
                />
              )}
            </Shell>
          ))}
        </Stack>,
        document.body,
      )}
    </ModalContext.Provider>
  );
};

const Shell: React.FC<{ children: React.ReactNode; onDismiss: () => void }> = ({
  children,
  onDismiss,
}) => (
  <Stack>
    <Backdrop onClick={onDismiss} />
    <Sheet role="dialog" aria-modal="true">
      {children}
    </Sheet>
  </Stack>
);

const ConfirmView: React.FC<
  ConfirmOptions & { onConfirm: () => void; onCancel: () => void }
> = ({
  title = '확인',
  description,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
}) => (
  <>
    <Title>{title}</Title>
    {description && <Desc>{description}</Desc>}
    <Row>
      <Button variant="ghost" onClick={onCancel}>
        {cancelText}
      </Button>
      <Button variant="danger" onClick={onConfirm}>
        {confirmText}
      </Button>
    </Row>
  </>
);

const AlertView: React.FC<AlertOptions & { onConfirm: () => void }> = ({
  title = '알림',
  description,
  confirmText = '확인',
  onConfirm,
}) => (
  <>
    <Title>{title}</Title>
    {description && <Desc>{description}</Desc>}
    <Row>
      <Button variant="primary" onClick={onConfirm}>
        {confirmText}
      </Button>
    </Row>
  </>
);

const PromptView: React.FC<
  PromptOptions & { onConfirm: (v: string) => void; onCancel: () => void }
> = ({
  title = '입력',
  description,
  defaultValue = '',
  placeholder,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
}) => {
  const [v, setV] = React.useState(defaultValue);
  return (
    <>
      <Title>{title}</Title>
      {description && <Desc>{description}</Desc>}
      <Input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder={placeholder}
        autoFocus
      />
      <Row>
        <Button variant="ghost" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button variant="primary" onClick={() => onConfirm(v)}>
          {confirmText}
        </Button>
      </Row>
    </>
  );
};

const Stack = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
`;
const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
`;
const Sheet = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: min(520px, calc(100% - 24px));
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.18);
  padding: 18px;
  pointer-events: auto;
`;
const Title = styled.h3`
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`;
const Desc = styled.p`
  margin: 0 0 16px;
  color: ${({ theme }) => theme.colors.subtext};
  line-height: 1.45;
`;
const Row = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
`;
const Button = styled.button<{ variant?: 'primary' | 'ghost' | 'danger' }>`
  appearance: none;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.primary};
  ${(p) => p.variant === 'primary' && `background:#111;color:#fff;`}
  ${(p) => p.variant === 'danger' && `background:#e5484d;color:#fff;`}
  ${(p) => p.variant === 'ghost' && `background:#f3f3f3;color:#111;`}
`;
const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #ddd;
  font-size: 14px;
`;
