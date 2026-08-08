import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  fill?: boolean;
  children: ReactNode;
}

/** Design-system card. `fill` uses the raised .card-fill surface. */
export function Card({ fill = false, className, children, ...rest }: CardProps) {
  const cls = `${fill ? 'card-fill' : 'card'}${className ? ` ${className}` : ''}`;
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
}
