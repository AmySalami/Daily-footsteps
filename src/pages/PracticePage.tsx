import { useState } from 'react';
import type { Exercise } from '@/lib/types';
import { doneToday, getState, recordExercise, todayStr, uid } from '@/lib/storage';
import { reviewExercise } from '@/lib/aiClient';
import { HAS_AI_PROXY } from '@/lib/config';
import { toast } from '@/lib/toast';
import { StreakStrip } from '@/components/practice/StreakStrip';
import { Editor, type FinishPayload } from '@/components/practice/Editor';
import { ReviewResult, type ResultData } from '@/components/practice/ReviewResult';

/**
 * E2 + E4 + E5 + E6 — the writing loop.
 * Writing surface (Editor) → on finish, run the AI review (real proxy when
 * configured, else mock), persist exercise + vocab + streak, show ReviewResult.
 */
export function PracticePage() {
  const [result, setResult] = useState<ResultData | null>(null);

  const handleFinish = async ({ text, title, lang, auto }: FinishPayload) => {
    const wasDone = doneToday(lang);
    const { review, isMock } = await reviewExercise(text, title, lang);
    // If a proxy is configured but we still got the mock, it failed — tell the user.
    if (HAS_AI_PROXY && isMock) toast('Coach offline — showing offline feedback');

    const exercise: Exercise = {
      id: uid(),
      lang,
      date: todayStr(),
      title,
      input: text,
      score: review.score,
      review,
    };
    recordExercise(exercise, review.vocab);
    const streakAfter = getState().langs[lang].streak;
    setResult({ lang, title, review, auto, wasDone, streakAfter, isMock });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (result) {
    return <ReviewResult data={result} onNew={() => setResult(null)} />;
  }

  return (
    <div>
      <StreakStrip />
      <Editor onFinish={handleFinish} />
    </div>
  );
}
