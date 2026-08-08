import { useState } from 'react';
import type { Exercise } from '@/lib/types';
import { doneToday, getState, recordExercise, todayStr, uid } from '@/lib/storage';
import { mockReview } from '@/lib/mockAI';
import { StreakStrip } from '@/components/practice/StreakStrip';
import { Editor, type FinishPayload } from '@/components/practice/Editor';
import { ReviewResult, type ResultData } from '@/components/practice/ReviewResult';

/**
 * E2 + E4 + E5 — the writing loop.
 * Writing surface (Editor) → on finish, run the (mock) AI review, persist the
 * exercise + vocab + streak, then show the ReviewResult. "New exercise" resets.
 */
export function PracticePage() {
  const [result, setResult] = useState<ResultData | null>(null);

  const handleFinish = ({ text, title, lang, auto }: FinishPayload) => {
    const wasDone = doneToday(lang);
    const review = mockReview(text, lang);
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
    setResult({ lang, title, review, auto, wasDone, streakAfter });
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
