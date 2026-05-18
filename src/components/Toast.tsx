import { useEffect } from 'react';

export function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [message, onDone]);
  return <div className="rung-toast" role="status">{message}</div>;
}
