import type { ReactNode } from 'react';

/** Design-system badge. `future` renders the outlined variant. */
export function Badge({ future = false, children }: { future?: boolean; children: ReactNode }) {
  return <span className={`badge${future ? ' future' : ''}`}>{children}</span>;
}

/** Design-system tag pill. */
export function Tag({ children }: { children: ReactNode }) {
  return <span className="tag">{children}</span>;
}
