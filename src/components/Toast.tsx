import { useEffect } from 'react';

export interface ToastMessage {
  id: number;
  text: string;
  tone: 'info' | 'warn' | 'success';
}

interface ToastProps {
  message: ToastMessage | null;
  onDone: () => void;
  durationMs?: number;
}

export function Toast({ message, onDone, durationMs = 2800 }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(onDone, durationMs);
    return () => window.clearTimeout(t);
  }, [message, onDone, durationMs]);

  if (!message) return null;
  return (
    <div key={message.id} className={`toast toast--${message.tone}`} role="status" aria-live="polite" onClick={onDone}>
      {message.text}
    </div>
  );
}
