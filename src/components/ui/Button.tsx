import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';

type Variant = 'cta' | 'back' | 'ghost' | 'pill';

interface BaseProps {
  variant?: Variant;
  active?: boolean;
  className?: string;
  children: ReactNode;
}

type ButtonProps = BaseProps & { as?: 'button' } & ButtonHTMLAttributes<HTMLButtonElement>;
type LinkProps = BaseProps & { as: 'a' } & AnchorHTMLAttributes<HTMLAnchorElement>;

const classFor = (variant: Variant, active?: boolean, extra?: string) => {
  const base = variant === 'pill' ? `pill-btn${active ? ' is-active' : ''}` : variant;
  return extra ? `${base} ${extra}` : base;
};

/**
 * Design-system button. Renders a <button> by default, or an <a> when as="a".
 * Variants map directly to the DS classes (.cta / .back / .ghost / .pill-btn).
 */
export function Button(props: ButtonProps | LinkProps) {
  if (props.as === 'a') {
    const { variant = 'cta', active, className, children, as: _as, ...rest } = props;
    return (
      <a className={classFor(variant, active, className)} {...rest}>
        {children}
      </a>
    );
  }
  const { variant = 'cta', active, className, children, as: _as, ...rest } = props;
  return (
    <button className={classFor(variant, active, className)} {...rest}>
      {children}
    </button>
  );
}
