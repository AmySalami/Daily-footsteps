import { PAW_PATHS } from '@/lib/constants';

/** A single cat-paw print. Fill is controlled by CSS (currentColor via .fill). */
export function Paw({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {PAW_PATHS.toes.map((t, i) => (
        <ellipse
          key={i}
          cx={t.cx}
          cy={t.cy}
          rx={t.rx}
          ry={t.ry}
          transform={`rotate(${t.rot} ${t.cx} ${t.cy})`}
        />
      ))}
      <path d={PAW_PATHS.pad} />
    </svg>
  );
}
