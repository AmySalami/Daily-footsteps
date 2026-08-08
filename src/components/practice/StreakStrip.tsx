import { useAppState } from '@/lib/useAppState';
import { doneToday, dayLabel } from '@/lib/storage';
import { LANGS, LANG_CODES } from '@/lib/constants';
import { PawTrail } from '@/components/ui';

/** Display-only per-language streak cards (top of the Practice page). */
export function StreakStrip() {
  const state = useAppState();
  return (
    <div className="streak-strip">
      {LANG_CODES.map((code) => {
        const st = state.langs[code];
        return (
          <div className="streak-card" key={code}>
            <span className="chip-top">
              <span className="chip-flag">{LANGS[code].flag}</span>
              <span className="chip-name">{LANGS[code].name}</span>
              {doneToday(code) && <span className="chip-check">done ✓</span>}
            </span>
            <span className="chip-bottom">
              <PawTrail streak={st.streak} compact />
              <span className="chip-num">{dayLabel(st.streak)}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
