type ProgressionInput = {
  workoutsCount: number;
  totalVolume: number;
  prCount: number;
  last30Workouts: number;
};

export type ProgressionResult = {
  level: number;
  tier: 'rookie' | 'builder' | 'advanced' | 'elite';
  score: number;
  progressPercent: number;
};

const LEVEL_STEP = 25;
const MAX_LEVEL = 99;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getTier(level: number): ProgressionResult['tier'] {
  if (level >= 45) return 'elite';
  if (level >= 30) return 'advanced';
  if (level >= 15) return 'builder';
  return 'rookie';
}

export const ProgressionService = {
  computeUserLevel(input: ProgressionInput): ProgressionResult {
    const safeWorkouts = Math.max(0, input.workoutsCount);
    const safeVolume = Math.max(0, input.totalVolume);
    const safeLast30 = Math.max(0, input.last30Workouts);
    const safePr = Math.max(0, input.prCount);

    // Crescita controllata: i valori alti non esplodono il livello con pochi workout.
    const workoutScore = safeWorkouts * 3;
    const volumeScore = Math.log10(safeVolume + 1) * 8;
    const durationScore = 0;
    const consistencyScore = safeLast30 * 2;
    const prScore = safePr * 4;

    const rawScore = workoutScore + volumeScore + durationScore + consistencyScore + prScore;
    const score = Math.round(rawScore);

    // Cap esperienza: impedisce livelli troppo alti con storico ridotto.
    const experienceCap = clamp(Math.floor(safeWorkouts * 1.5) + 5, 1, MAX_LEVEL);
    const uncappedLevel = Math.floor(score / LEVEL_STEP) + 1;
    const level = clamp(Math.min(uncappedLevel, experienceCap), 1, MAX_LEVEL);
    const nextLevelScore = level * LEVEL_STEP;
    const currentLevelStart = (level - 1) * LEVEL_STEP;
    const denominator = Math.max(1, nextLevelScore - currentLevelStart);
    const progressPercent = clamp(
      Math.round(((score - currentLevelStart) / denominator) * 100),
      0,
      100,
    );

    return {
      level,
      tier: getTier(level),
      score,
      progressPercent,
    };
  },
};
