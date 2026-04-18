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
  repCount: number;
  liveHint: string;
  summary: FormCoachSummary | null;
  openCoach: (payload: {
    exerciseId: string;
    exerciseName: string;
    mediaUrl?: string | null;
  }) => void;
  closeCoach: () => void;
  startCalibration: () => void;
  startTracking: () => void;
  incrementRep: () => void;
  setLiveHint: (hint: string) => void;
  completeTracking: () => void;
  backToIntro: () => void;
}

export const useFormCoachStore = create<FormCoachState>((set, get) => ({
  isOpen: false,
  mode: 'intro',
  exerciseId: null,
  exerciseName: '',
  mediaUrl: null,
  repCount: 0,
  liveHint: 'Mantieni la schiena neutra',
  summary: null,

  openCoach: ({ exerciseId, exerciseName, mediaUrl }) =>
    set({
      isOpen: true,
      mode: 'intro',
      exerciseId,
      exerciseName,
      mediaUrl: mediaUrl || null,
      repCount: 0,
      liveHint: 'Mantieni la schiena neutra',
      summary: null,
    }),

  closeCoach: () =>
    set({
      isOpen: false,
      mode: 'intro',
      exerciseId: null,
      exerciseName: '',
      mediaUrl: null,
      repCount: 0,
      liveHint: 'Mantieni la schiena neutra',
      summary: null,
    }),

  startCalibration: () => set({ mode: 'calibration' }),

  startTracking: () => set({ mode: 'tracking', repCount: 0 }),

  incrementRep: () => {
    const nextRep = get().repCount + 1;
    const hints = [
      'Scendi ancora leggermente',
      'Gomiti piu fermi',
      'Controlla la velocita in risalita',
      'Buona rep, continua cosi',
    ];

    set({
      repCount: nextRep,
      liveHint: hints[nextRep % hints.length],
    });
  },

  setLiveHint: (hint: string) => set({ liveHint: hint }),

  completeTracking: () => {
    const reps = get().repCount;
    const mistakes =
      reps >= 6 ? ['Profondita incostante su 2 reps'] : ['Troppo veloce in eccentrica'];

    set({
      mode: 'summary',
      summary: {
        repCount: reps,
        mistakes,
        tips: [
          'Mantieni 1 secondo di pausa in basso',
          'Tieni il tronco stabile durante tutta la rep',
          'Respira prima della discesa',
        ],
      },
    });
  },

  backToIntro: () => set({ mode: 'intro', repCount: 0, summary: null }),
}));
