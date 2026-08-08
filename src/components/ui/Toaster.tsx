import { useEffect, useRef, useState } from 'react';
import { subscribeToast } from '@/lib/toast';

/** Renders the most recent toast message, auto-hiding after a moment. */
export function Toaster() {
  const [message, setMessage] = useState('');
  const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return subscribeToast((msg) => {
      setMessage(msg);
      setShow(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setShow(false), 2200);
    });
  }, []);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <div className={`toast${show ? ' show' : ''}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
