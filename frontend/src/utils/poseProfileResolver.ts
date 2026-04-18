import { PoseExerciseCode } from '../../../shared/types';

const KEYWORDS: Array<{ code: PoseExerciseCode; terms: string[] }> = [
  { code: 'squat', terms: ['squat', 'accosciata', 'hack squat', 'leg press'] },
  { code: 'bench_press', terms: ['bench', 'panca', 'chest press'] },
  { code: 'curl', terms: ['curl', 'biceps', 'bicipiti'] },
  { code: 'deadlift', terms: ['deadlift', 'stacco', 'romanian'] },
  { code: 'military_press', terms: ['military', 'overhead press', 'shoulder press'] },
  { code: 'barbell_row', terms: ['row', 'rematore', 'bent over'] },
  { code: 'seated_row', terms: ['vogatore', 'seated row', 'cable row'] },
  { code: 'running', terms: ['run', 'corsa', 'treadmill'] },
];

export function resolvePoseExerciseCode(exerciseName: string): PoseExerciseCode {
  const name = exerciseName.trim().toLowerCase();
  const found = KEYWORDS.find((entry) => entry.terms.some((term) => name.includes(term)));
  return found?.code || 'squat';
}
