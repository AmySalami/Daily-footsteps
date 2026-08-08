import { Paw } from './Paw';
import { dayLabel } from '@/lib/storage';

interface PawTrailProps {
  streak: number;
  compact?: boolean;
  minSlots?: number;
}

/** A trail of cat-paw prints; the first `streak` paws are filled. */
export function PawTrail({ streak, compact = false, minSlots }: PawTrailProps) {
  const slots = minSlots ?? (compact ? 5 : 7);
  const total = Math.max(slots, streak + (compact ? 0 : 1));
  const steps = Array.from({ length: total }, (_, i) => ({
    filled: i < streak,
    today: i === streak - 1,
  }));
  return (
    <div className={`trail${compact ? ' compact' : ''}`} aria-label={`${dayLabel(streak)} streak`}>
      {steps.map((s, i) => (
        <span key={i} className={`step ${s.filled ? 'filled' : 'empty'}${s.today ? ' today' : ''}`}>
          <Paw />
        </span>
      ))}
    </div>
  );
}
