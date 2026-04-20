import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Exercise, SetType, WorkoutTemplate } from '../../../shared/types';
import { parsePositiveFloat, parsePositiveInt } from '../utils/numberUtils';

const PREMIUM_SET_TYPES = [
  'warmup',
  'failure',
  'backoff',
  'dropset',
  'cluster',
  'myo_reps',
  'rest_pause',
];

// struttura dati che contiene un set in fase di creazione della scheda
export interface DraftSet {
  localId: string;
  setType: SetType;
  reps: string;
  intensity: string;
  restSeconds: string;
  clusterMiniSets?: string;
  clusterIntraRest?: string;
  dropsetDrops?: string;
  dropsetPercent?: string;
}

// struttura che contiene un esercizio
export interface DraftExercise {
  localId: string;
  exercise: Exercise;
  notes: string;
  sets: DraftSet[];
}

// genera un id univoco per i set e gli esercizi in fase di creazione della scheda
const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// crea un set vuoto con valori di default
const buildEmptySet = (): DraftSet => ({
  localId: uid(),
  setType: 'normal',
  reps: '',
  intensity: '',
  restSeconds: '90',
});

const mapTemplateToDraftExercises = (template: WorkoutTemplate): DraftExercise[] => {
  if (!template.workout_template_exercises) return [];

  return template.workout_template_exercises
    .sort((a, b) => a.exercise_order - b.exercise_order)
    .map((te) => {
      const loadedSets: DraftSet[] = (te.workout_template_sets || [])
        .sort((a, b) => a.set_number - b.set_number)
        .map((ts) => {
          const payload = ts.intensity_payload as Record<string, number> | null;
          return {
            localId: uid(),
            setType: ts.set_type,
            reps: ts.target_reps_max ? ts.target_reps_max.toString() : '',
            intensity: ts.target_weight ? ts.target_weight.toString() : '',
            restSeconds: ts.rest_seconds ? ts.rest_seconds.toString() : '90',
            clusterMiniSets: payload?.cluster_mini_sets?.toString() || '',
            clusterIntraRest: payload?.cluster_intra_rest?.toString() || '',
            dropsetDrops: payload?.dropset_drops?.toString() || '',
            dropsetPercent: payload?.dropset_percent?.toString() || '',
          };
        });

      return {
        localId: uid(),
        exercise: te.exercises as unknown as Exercise,
        notes: te.notes || '',
        sets: loadedSets.length > 0 ? loadedSets : [buildEmptySet()],
      };
    });
};

const validateDraft = (
  name: string,
  exercises: DraftExercise[],
  t: (key: string, payload?: Record<string, unknown>) => string,
) => {
  if (!name.trim()) return t('create_routine.error_name_required');
  if (exercises.length === 0) return t('create_routine.error_at_least_one_exercise');

  for (const ex of exercises) {
    if (ex.sets.length === 0) {
      return t('create_routine.error_at_least_one_set', { name: ex.exercise.name });
    }

    for (const set of ex.sets) {
      if (set.intensity && parsePositiveFloat(set.intensity) === undefined) {
        return `Intensita non valida in ${ex.exercise.name} - set ${set.setType.toUpperCase()}`;
      }
      if (set.reps && parsePositiveInt(set.reps) === undefined) {
        return `Reps non valide in ${ex.exercise.name} - set ${set.setType.toUpperCase()}`;
      }
      if (set.restSeconds && parsePositiveInt(set.restSeconds) === undefined) {
        return `Recupero non valido in ${ex.exercise.name} - set ${set.setType.toUpperCase()}`;
      }
    }
  }

  return null;
};

// hook che gestisce lo stato della creazione della scheda
export function useWorkoutCreation() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<DraftExercise[]>([]);

  const addExercise = (exercise: Exercise) => {
    setExercises((prev) => {
      if (prev.some((x) => x.exercise.id === exercise.id)) return prev;
      return [
        ...prev,
        {
          localId: uid(),
          exercise,
          notes: '',
          sets: [buildEmptySet()],
        },
      ];
    });
  };

  const removeExercise = (localExerciseId: string) =>
    setExercises((prev) => prev.filter((e) => e.localId !== localExerciseId));

  const moveExercise = (localExerciseId: string, direction: 'up' | 'down') => {
    setExercises((prev) => {
      const currentIndex = prev.findIndex((e) => e.localId === localExerciseId);
      if (currentIndex === -1) return prev;

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;

      const next = [...prev];
      const [moved] = next.splice(currentIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const reorderExercises = (nextExercises: DraftExercise[]) => {
    setExercises(nextExercises);
  };

  const addSet = (localExerciseId: string) =>
    setExercises((prev) =>
      prev.map((e) =>
        e.localId === localExerciseId ? { ...e, sets: [...e.sets, buildEmptySet()] } : e,
      ),
    );

  const removeSet = (localExerciseId: string, localSetId: string) => {
    setExercises((prev) =>
      prev.map((e) => {
        if (e.localId !== localExerciseId) return e;
        const filtered = e.sets.filter((s) => s.localId !== localSetId);
        return {
          ...e,
          sets: filtered.length > 0 ? filtered : [buildEmptySet()],
        };
      }),
    );
  };

  const updateExerciseNotes = (localExerciseId: string, notes: string) =>
    setExercises((prev) => prev.map((e) => (e.localId === localExerciseId ? { ...e, notes } : e)));

  const updateSetField = (
    localExerciseId: string,
    localSetId: string,
    field: keyof DraftSet,
    value: string,
  ) => {
    setExercises((prev) =>
      prev.map((e) => {
        if (e.localId !== localExerciseId) return e;

        return {
          ...e,
          sets: e.sets.map((s) => (s.localId === localSetId ? { ...s, [field]: value } : s)),
        };
      }),
    );
  };

  const validate = () => validateDraft(name, exercises, t);

  // verifica se ci sono set di tipo premium per mostrare un avviso agli utenti non premium
  const hasPremiumSetTypes = useMemo(
    () => exercises.some((e) => e.sets.some((s) => PREMIUM_SET_TYPES.includes(s.setType))),
    [exercises],
  );

  const reset = () => {
    setName('');
    setDescription('');
    setExercises([]);
  };

  const loadTemplate = (template: WorkoutTemplate) => {
    setName(template.name || '');
    setDescription(template.description || '');
    setExercises(mapTemplateToDraftExercises(template));
  };

  // restituisce tutte le variabili e funzioni necessarie per gestire la creazione della scheda
  return {
    name,
    description,
    exercises,
    setName,
    setDescription,
    addExercise,
    removeExercise,
    moveExercise,
    reorderExercises,
    addSet,
    removeSet,
    updateSetField,
    updateExerciseNotes,
    validate,
    hasPremiumSetTypes,
    reset,
    loadTemplate,
  };
}
