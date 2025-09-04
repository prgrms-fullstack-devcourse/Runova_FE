// src/components/ConsoleOverlay.tsx
import { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';

type Level = 'log' | 'info' | 'warn' | 'error';

type Entry = {
  id: number;
  ts: number;
  level: Level;
  text: string;
};

const MAX_LOGS_DEFAULT = 300;

function formatArgs(args: readonly unknown[]): string {
  return args
    .map((a) => {
      if (typeof a === 'string') return a;
      try {
        return JSON.stringify(a, replacer(), 2);
      } catch {
        return String(a);
      }
    })
    .join(' ');
}

// 순환 참조 방지
function replacer() {
  const seen = new WeakSet<object>();
  return (_k: string, v: unknown) => {
    if (typeof v === 'object' && v !== null) {
      if (seen.has(v as object)) return '[Circular]';
      seen.add(v as object);
    }
    return v;
  };
}

export default function ConsoleOverlay({
  initialOpen = false,
  maxLogs = MAX_LOGS_DEFAULT,
}: {
  initialOpen?: boolean;
  maxLogs?: number;
}) {
  const [open, setOpen] = useState(initialOpen);
  const [logs, setLogs] = useState<Entry[]>([]);
  const idRef = useRef(0);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const orig = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
    };

    const push = (level: Level, args: readonly unknown[]) => {
      const entry: Entry = {
        id: ++idRef.current,
        ts: Date.now(),
        level,
        text: formatArgs(args),
      };
      setLogs((prev) => {
        const next = [...prev, entry];
        if (next.length > maxLogs) next.splice(0, next.length - maxLogs);
        return next;
      });
      // 원래 콘솔도 유지
      try {
        orig[level](...args);
      } catch {
        // no-op
      }
    };

    console.log = (...args) => push('log', args);
    console.info = (...args) => push('info', args);
    console.warn = (...args) => push('warn', args);
    console.error = (...args) => push('error', args);

    const onError = (e: ErrorEvent) =>
      push('error', [e.message, e.filename, e.lineno, e.colno]);
    const onRejection = (e: PromiseRejectionEvent) =>
      push('error', ['UnhandledRejection:', e.reason]);

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);

    return () => {
      console.log = orig.log;
      console.info = orig.info;
      console.warn = orig.warn;
      console.error = orig.error;
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, [maxLogs]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, open]);

  return (
    <>
      <Toggle
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="toggle console"
      >
        {open ? '✕' : '🐛'}
      </Toggle>

      {open && (
        <Wrap>
          <Bar>
            <strong>Console</strong>
            <Btns>
              <button type="button" onClick={() => setLogs([])}>
                Clear
              </button>
              <span>{logs.length}</span>
            </Btns>
          </Bar>
          <List>
            {logs.map((l) => (
              <Row key={l.id} data-level={l.level}>
                <Time>{new Date(l.ts).toLocaleTimeString()}</Time>
                <Level>[{l.level}]</Level>
                <Msg>{l.text}</Msg>
              </Row>
            ))}
            <div ref={endRef} />
          </List>
        </Wrap>
      )}
    </>
  );
}

const Toggle = styled.button`
  position: fixed;
  right: 12px;
  bottom: 212px;
  z-index: 99999;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #fff;
  font-size: 18px;
`;

const Wrap = styled.div`
  position: fixed;
  right: 12px;
  bottom: 120px;
  z-index: 99999;
  width: min(92vw, 560px);
  height: 40vh;
  background: #111827;
  color: #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    monospace;
`;

const Bar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #1f2937;
  border-bottom: 1px solid #374151;
`;

const Btns = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  button {
    padding: 4px 8px;
    background: #374151;
    color: #e5e7eb;
    border-radius: 6px;
    border: none;
  }
  span {
    opacity: 0.8;
    font-size: 12px;
  }
`;

const List = styled.div`
  height: calc(40vh - 40px);
  overflow: auto;
  font-size: 12px;
`;

const Row = styled.div`
  display: flex;
  gap: 8px;
  padding: 6px 10px;
  border-bottom: 1px solid #374151;
  &[data-level='warn'] {
    color: #fde68a;
  }
  &[data-level='error'] {
    color: #fecaca;
  }
  &[data-level='info'] {
    color: #a5b4fc;
  }
`;

const Time = styled.span`
  opacity: 0.7;
  width: 72px;
  flex: 0 0 auto;
`;
const Level = styled.span`
  opacity: 0.9;
  width: 56px;
  flex: 0 0 auto;
`;
const Msg = styled.pre`
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
`;
