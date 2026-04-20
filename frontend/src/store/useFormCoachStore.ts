import { create } from 'zustand';

export type FormCoachMode = 'intro' | 'calibration' | 'tracking' | 'summary' | 'error';

interface FormCoachSummary {
  repCount: number;
  tips: string[];
  mistakes: string[];
}

interface FormCoachState {
  isOpen: boolean;
  mode: FormCoachMode;
  exerciseId: string | null;
  exerciseName: string;
  mediaUrl: string | null;
  mediaUrls: string[];
  repCount: number;
  liveHint: string;
  summary: FormCoachSummary | null;
  openCoach: (payload: {
    exerciseId: string;
    exerciseName: string;
    mediaUrl?: string | null;
    mediaUrls?: string[];
  }) => void;
  closeCoach: () => void;
  startCalibration: () => void;
  startTracking: () => void;
  incrementRep: () => void;
  setLiveHint: (hint: string) => void;
  completeTracking: (payload?: Partial<FormCoachSummary>) => void;
  backToIntro: () => void;
}

export const useFormCoachStore = create<FormCoachState>((set, get) => ({
  isOpen: false,
  mode: 'intro',
  exerciseId: null,
  exerciseName: '',
  mediaUrl: null,
  mediaUrls: [],
  repCount: 0,
  liveHint: 'coach.hints.keep_back_neutral',
  summary: null,

  openCoach: ({ exerciseId, exerciseName, mediaUrl, mediaUrls }) =>
    set({
      isOpen: true,
      mode: 'intro',
      exerciseId,
      exerciseName,
      mediaUrl: mediaUrl || null,
      mediaUrls: mediaUrls || (mediaUrl ? [mediaUrl] : []),
      repCount: 0,
      liveHint: 'coach.hints.keep_back_neutral',
      summary: null,
    }),

  closeCoach: () =>
    set({
      isOpen: false,
      mode: 'intro',
      exerciseId: null,
      exerciseName: '',
      mediaUrl: null,
      mediaUrls: [],
      repCount: 0,
      liveHint: 'coach.hints.keep_back_neutral',
      summary: null,
    }),

  startCalibration: () => set({ mode: 'calibration' }),

  startTracking: () => set({ mode: 'tracking', repCount: 0 }),

  incrementRep: () => {
    const nextRep = get().repCount + 1;
    const hints = [
      'coach.hints.go_deeper',
      'coach.hints.stabilize_elbows',
      'coach.hints.control_up_phase',
      'coach.hints.good_rep',
    ];

    set({
      repCount: nextRep,
      liveHint: hints[nextRep % hints.length],
    });
  },

  setLiveHint: (hint: string) => set({ liveHint: hint }),

  completeTracking: (payload) => {
    const reps = get().repCount;
    const mistakes =
      reps >= 6 ? ['coach.mistakes.inconsistent_depth'] : ['coach.mistakes.too_fast_eccentric'];

    set({
      mode: 'summary',
      summary: {
        repCount: payload?.repCount ?? reps,
        mistakes: payload?.mistakes ?? mistakes,
        tips: payload?.tips ?? [
          'coach.tips.pause_bottom',
          'coach.tips.stable_torso',
          'coach.tips.breath_before_descent',
        ],
      },
    });
  },

  backToIntro: () => set({ mode: 'intro', repCount: 0, summary: null }),
}));
