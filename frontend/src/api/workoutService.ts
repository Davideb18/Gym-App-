import { supabase } from './supabaseClient';
import {
  PerformedSet,
  WorkoutSession,
  WorkoutTemplate,
  WorkoutTemplateExercise,
  WorkoutTemplateSet,
} from '../../../shared/types';
import { DraftExercise } from '../hooks/useWorkoutCreation';
import { parsePositiveFloat, parsePositiveInt } from '../utils/numberUtils';

type WorkoutSetRow = {
  exercise_id: string;
  set_number: number;
  reps?: number | null;
  weight?: number | null;
};

type CompletedWorkoutSet = {
  is_completed: boolean;
  real_reps?: number | string | null;
  real_weight?: number | string | null;
  template_set_id?: string | null;
  set_number: number;
  set_type: WorkoutTemplateSet['set_type'];
};

type CompletedWorkoutExercise = {
  exercise_id: string;
  exercise_name: string;
  sets: CompletedWorkoutSet[];
};

type BestE1RMRow = {
  exercise_id: string;
  reps?: number | null;
  weight?: number | null;
};

type HistoryBestRow = {
  exercise_id: string;
  reps?: number | null;
  weight?: number | null;
};

export type ExerciseHistorySet = {
  id: string;
  set_number: number;
  weight?: number | null;
  reps?: number | null;
};

export type ExerciseHistorySession = {
  session_id: string;
  completed_at: string;
  notes: string;
  sets: ExerciseHistorySet[];
};

type ExerciseHistoryRow = {
  id: string;
  session_id: string;
  set_number: number;
  reps?: number | null;
  weight?: number | null;
  performed_at: string;
  workout_sessions?: {
    completed_at?: string | null;
    notes?: string | null;
  } | null;
};

export type RecentPerformedSet = {
  id: string;
  set_number?: number | null;
  set_type?: string | null;
  reps?: number | null;
  weight?: number | null;
  exercises?: {
    name?: string | null;
  } | null;
};

export type RecentWorkoutSession = {
  id: string;
  completed_at?: string | null;
  duration_seconds?: number | null;
  total_volume?: number | null;
  workout_templates?: {
    name?: string | null;
  } | null;
  performed_sets?: RecentPerformedSet[] | null;
};

export const WorkoutService = {
  getLastPerformanceByExercises: async (profileId: string, exerciseIds: string[]) => {
    if (!exerciseIds.length)
      return {} as Record<string, Record<number, { reps?: number; weight?: number }>>;

    const { data, error } = await supabase
      .from('performed_sets')
      .select(
        'exercise_id, set_number, reps, weight, performed_at, workout_sessions!inner(profile_id, status)',
      )
      .in('exercise_id', exerciseIds)
      .eq('workout_sessions.profile_id', profileId)
      .eq('workout_sessions.status', 'completed')
      .eq('is_completed', true)
      .order('performed_at', { ascending: false });

    if (error) throw error;

    const result: Record<string, Record<number, { reps?: number; weight?: number }>> = {};

    ((data || []) as WorkoutSetRow[]).forEach((row) => {
      const exId = row.exercise_id;
      const setNumber = Number(row.set_number) || 0;
      if (!exId || !setNumber) return;

      if (!result[exId]) result[exId] = {};
      if (result[exId][setNumber]) return;

      const reps = Number(row.reps);
      const weight = Number(row.weight);

      result[exId][setNumber] = {
        reps: Number.isFinite(reps) && reps > 0 ? reps : undefined,
        weight: Number.isFinite(weight) && weight > 0 ? weight : undefined,
      };
    });

    return result;
  },

  getBestE1RMByExercises: async (profileId: string, exerciseIds: string[]) => {
    if (!exerciseIds.length) return {} as Record<string, number>;

    const { data, error } = await supabase
      .from('performed_sets')
      .select('exercise_id, reps, weight, workout_sessions!inner(profile_id, status)')
      .in('exercise_id', exerciseIds)
      .eq('workout_sessions.profile_id', profileId)
      .eq('workout_sessions.status', 'completed')
      .eq('is_completed', true);

    if (error) throw error;

    const result: Record<string, number> = {};

    ((data || []) as BestE1RMRow[]).forEach((row) => {
      const exerciseId = row.exercise_id;
      const reps = Number(row.reps);
      const weight = Number(row.weight);
      if (
        !exerciseId ||
        !Number.isFinite(reps) ||
        !Number.isFinite(weight) ||
        reps <= 0 ||
        weight <= 0
      )
        return;

      const e1rm = weight * (1 + reps / 30);
      const prevBest = result[exerciseId] || 0;
      if (e1rm > prevBest) result[exerciseId] = e1rm;
    });

    return result;
  },

  getTemplates: async (profileId: string): Promise<WorkoutTemplate[]> => {
    const { data, error } = await supabase
      .from('workout_templates')
      .select('*, workout_template_exercises(*, workout_template_sets(*), exercises(*))')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as unknown as WorkoutTemplate[];
  },

  createTemplate: async (
    profileId: string,
    name: string,
    description?: string,
    isPremium: boolean = false,
  ) => {
    if (!isPremium) {
      const { count, error: countError } = await supabase
        .from('workout_templates')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profileId);

      if (countError) throw countError;
      if (count !== null && count >= 4) {
        throw new Error(
          'Limite Schede Raggiunto (4/4). Passa al piano Premium per creare schede infinite!',
        );
      }
    }

    const { data, error } = await supabase
      .from('workout_templates')
      .insert([{ profile_id: profileId, name, description }])
      .select()
      .single();

    if (error) throw error;
    return data as WorkoutTemplate;
  },

  addExerciseToTemplate: async (
    templateId: string,
    exerciseId: string,
    order: number,
    sets: Omit<WorkoutTemplateSet, 'id' | 'template_exercise_id' | 'created_at' | 'updated_at'>[],
    notes?: string,
  ) => {
    const { data: exerciseData, error: exerciseError } = await supabase
      .from('workout_template_exercises')
      .insert([
        {
          template_id: templateId,
          exercise_id: exerciseId,
          exercise_order: order,
          notes: notes,
        },
      ])
      .select()
      .single();
    if (exerciseError) throw exerciseError;
    if (!exerciseData) throw new Error("Errore strano: non ho ricevuto l'esercizio");

    if (sets && sets.length > 0) {
      const setsToInsert = sets.map((set, index) => ({
        ...set,
        template_exercise_id: exerciseData.id,
        set_number: index + 1,
      }));

      const { error: setsError } = await supabase
        .from('workout_template_sets')
        .insert(setsToInsert);
      if (setsError) throw setsError;
    }
    return exerciseData as WorkoutTemplateExercise;
  },

  saveCompleteWorkoutTemplate: async (
    profileId: string,
    name: string,
    description: string | undefined,
    exercises: DraftExercise[],
    isPremium: boolean = false,
  ) => {
    const template = await WorkoutService.createTemplate(profileId, name, description, isPremium);

    try {
      for (let i = 0; i < exercises.length; i++) {
        const draftEx = exercises[i];

        const setsToInsert = draftEx.sets.map((draftSet, index) => {
          const intensity_payload: Record<string, unknown> = {};
          if (draftSet.clusterMiniSets)
            intensity_payload.cluster_mini_sets = parsePositiveInt(draftSet.clusterMiniSets);
          if (draftSet.clusterIntraRest)
            intensity_payload.cluster_intra_rest = parsePositiveInt(draftSet.clusterIntraRest);
          if (draftSet.dropsetDrops)
            intensity_payload.dropset_drops = parsePositiveInt(draftSet.dropsetDrops);
          if (draftSet.dropsetPercent)
            intensity_payload.dropset_percent = parsePositiveInt(draftSet.dropsetPercent);

          const parsedReps = parsePositiveInt(draftSet.reps);
          const parsedWeight = parsePositiveFloat(draftSet.intensity);
          const premiumTypes = [
            'warmup',
            'failure',
            'backoff',
            'dropset',
            'cluster',
            'myo_reps',
            'rest_pause',
          ];

          return {
            target_reps_min: draftSet.reps && parsedReps ? parsedReps : null,
            target_reps_max: draftSet.reps && parsedReps ? parsedReps : null,
            target_weight: draftSet.intensity && parsedWeight ? parsedWeight : null,
            rest_seconds: parsePositiveInt(draftSet.restSeconds, 90) || 90,
            set_type: draftSet.setType,
            set_number: index + 1,
            is_premium_feature: premiumTypes.includes(draftSet.setType),
            intensity_payload: Object.keys(intensity_payload).length > 0 ? intensity_payload : null,
          };
        }) as Omit<
          WorkoutTemplateSet,
          'id' | 'template_exercise_id' | 'created_at' | 'updated_at'
        >[];

        await WorkoutService.addExerciseToTemplate(
          template.id,
          draftEx.exercise.id,
          i + 1, // order
          setsToInsert,
          draftEx.notes,
        );
      }
    } catch (error) {
      // ROLLBACK MANUALE: se fallisce qualcosa durante il salvataggio degli esercizi/serie,
      // cancelliamo il template "fantasma" che era stato creato all'inizio.
      await supabase.from('workout_templates').delete().eq('id', template.id);
      throw error;
    }

    return template;
  },

  updateCompleteWorkoutTemplate: async (
    templateId: string,
    name: string,
    description: string | undefined,
    exercises: DraftExercise[],
  ) => {
    const { error: updateError } = await supabase
      .from('workout_templates')
      .update({ name, description })
      .eq('id', templateId);

    if (updateError) throw updateError;

    const { error: deleteError } = await supabase
      .from('workout_template_exercises')
      .delete()
      .eq('template_id', templateId);

    if (deleteError) throw deleteError;

    for (let i = 0; i < exercises.length; i++) {
      const draftEx = exercises[i];

      const setsToInsert = draftEx.sets.map((draftSet, index) => {
        const intensity_payload: Record<string, unknown> = {};
        if (draftSet.clusterMiniSets)
          intensity_payload.cluster_mini_sets = parsePositiveInt(draftSet.clusterMiniSets);
        if (draftSet.clusterIntraRest)
          intensity_payload.cluster_intra_rest = parsePositiveInt(draftSet.clusterIntraRest);
        if (draftSet.dropsetDrops)
          intensity_payload.dropset_drops = parsePositiveInt(draftSet.dropsetDrops);
        if (draftSet.dropsetPercent)
          intensity_payload.dropset_percent = parsePositiveInt(draftSet.dropsetPercent);

        const parsedReps = parsePositiveInt(draftSet.reps);
        const parsedWeight = parsePositiveFloat(draftSet.intensity);
        const premiumTypes = [
          'warmup',
          'failure',
          'backoff',
          'dropset',
          'cluster',
          'myo_reps',
          'rest_pause',
        ];

        return {
          target_reps_min: draftSet.reps && parsedReps ? parsedReps : null,
          target_reps_max: draftSet.reps && parsedReps ? parsedReps : null,
          target_weight: draftSet.intensity && parsedWeight ? parsedWeight : null,
          rest_seconds: parsePositiveInt(draftSet.restSeconds, 90) || 90,
          set_type: draftSet.setType,
          set_number: index + 1,
          is_premium_feature: premiumTypes.includes(draftSet.setType),
          intensity_payload: Object.keys(intensity_payload).length > 0 ? intensity_payload : null,
        };
      }) as Omit<WorkoutTemplateSet, 'id' | 'template_exercise_id' | 'created_at' | 'updated_at'>[];

      await WorkoutService.addExerciseToTemplate(
        templateId,
        draftEx.exercise.id,
        i + 1,
        setsToInsert,
        draftEx.notes,
      );
    }
  },

  deleteTemplate: async (templateId: string, profileId: string) => {
    const { error } = await supabase
      .from('workout_templates')
      .delete()
      .eq('id', templateId)
      .eq('profile_id', profileId);

    if (error) throw error;
  },

  startSession: async (profileId: string, TemplateId?: string) => {
    const { data, error } = await supabase
      .from('workout_sessions')
      .insert([
        {
          profile_id: profileId,
          template_id: TemplateId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as WorkoutSession;
  },

  logPerformedSet: async (
    sessionId: string,
    exerciseId: string,
    setPayload: Omit<
      PerformedSet,
      'id' | 'session_id' | 'exercise_id' | 'performed_at' | 'created_at'
    >,
  ) => {
    const { data, error } = await supabase
      .from('performed_sets')
      .upsert([
        {
          session_id: sessionId,
          exercise_id: exerciseId,
          ...setPayload,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as PerformedSet;
  },

  finishSession: async (
    sessionId: string,
    durationSeconds: number,
    totalVolume: number,
    notes?: string,
  ) => {
    const { data, error } = await supabase
      .from('workout_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        duration_seconds: durationSeconds,
        total_volume: totalVolume,
        notes: notes,
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data as WorkoutSession;
  },

  saveCompletedSession: async (
    profileId: string,
    templateId: string | undefined,
    startTime: number,
    totalVolume: number,
    exercises: CompletedWorkoutExercise[],
  ) => {
    const e1rm = (weight: number, reps: number) => {
      if (!Number.isFinite(weight) || !Number.isFinite(reps) || weight <= 0 || reps <= 0) return 0;
      return weight * (1 + reps / 30);
    };

    const currentBestByExercise = new Map<
      string,
      { exerciseName: string; weight: number; reps: number; e1rm: number }
    >();
    exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (!set.is_completed) return;
        const reps = Number(set.real_reps);
        const weight = Number(set.real_weight);
        if (!Number.isFinite(reps) || !Number.isFinite(weight) || reps <= 0 || weight <= 0) return;
        const score = e1rm(weight, reps);
        const prev = currentBestByExercise.get(ex.exercise_id);
        if (!prev || score > prev.e1rm) {
          currentBestByExercise.set(ex.exercise_id, {
            exerciseName: ex.exercise_name,
            reps,
            weight,
            e1rm: score,
          });
        }
      });
    });

    const exerciseIds = Array.from(currentBestByExercise.keys());
    let historicalRows: HistoryBestRow[] = [];
    if (exerciseIds.length) {
      const { data: historyData, error: historyError } = await supabase
        .from('performed_sets')
        .select('exercise_id, reps, weight, workout_sessions!inner(profile_id, status)')
        .in('exercise_id', exerciseIds)
        .eq('workout_sessions.profile_id', profileId)
        .eq('workout_sessions.status', 'completed')
        .eq('is_completed', true);

      if (historyError) throw historyError;
      historicalRows = (historyData || []) as HistoryBestRow[];
    }

    const historicalBestByExercise = new Map<string, number>();
    historicalRows.forEach((row) => {
      const exId = row.exercise_id;
      const reps = Number(row.reps);
      const weight = Number(row.weight);
      const score = e1rm(weight, reps);
      if (!exId || score <= 0) return;
      const prev = historicalBestByExercise.get(exId) || 0;
      if (score > prev) historicalBestByExercise.set(exId, score);
    });

    const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
    const { data: sessionData, error: sessionError } = await supabase
      .from('workout_sessions')
      .insert([
        {
          profile_id: profileId,
          template_id: templateId || null,
          status: 'completed',
          started_at: new Date(startTime).toISOString(),
          completed_at: new Date().toISOString(),
          duration_seconds: durationSeconds,
          total_volume: totalVolume,
        },
      ])
      .select()
      .single();

    if (sessionError) throw sessionError;
    if (!sessionData) throw new Error('Errore durante la creazione della sessione');

    const setsToInsert: Array<Omit<PerformedSet, 'id' | 'created_at'>> = [];

    exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.is_completed) {
          const safeReps = Number(set.real_reps);
          const safeWeight = Number(set.real_weight);

          setsToInsert.push({
            session_id: sessionData.id,
            exercise_id: ex.exercise_id,
            template_set_id: set.template_set_id || null,
            set_number: set.set_number,
            set_type: set.set_type,
            reps: Number.isFinite(safeReps) && safeReps > 0 ? Math.round(safeReps) : null,
            weight: Number.isFinite(safeWeight) && safeWeight > 0 ? safeWeight : null,
            is_completed: true,
            performed_at: new Date().toISOString(),
          });
        }
      });
    });

    if (setsToInsert.length > 0) {
      const { error: setsError } = await supabase.from('performed_sets').insert(setsToInsert);

      if (setsError) {
        await supabase.from('workout_sessions').delete().eq('id', sessionData.id);
        throw setsError;
      }
    }

    const newPrs = Array.from(currentBestByExercise.entries())
      .filter(
        ([exerciseId, current]) => current.e1rm > (historicalBestByExercise.get(exerciseId) || 0),
      )
      .map(([, current]) => ({
        exerciseName: current.exerciseName,
        weight: current.weight,
        reps: current.reps,
        e1rm: current.e1rm,
      }));

    return {
      session: sessionData as WorkoutSession,
      newPrs,
    };
  },

  getExerciseHistory: async (exerciseId: string) => {
    const { data, error } = await supabase
      .from('performed_sets')
      .select('*, workout_sessions(completed_at, notes)')
      .eq('exercise_id', exerciseId)
      .eq('is_completed', true)
      .order('performed_at', { ascending: false })
      .limit(35);

    if (error) throw error;

    if (!data || data.length === 0) return [];

    const grouped = (data as ExerciseHistoryRow[]).reduce(
      (acc: Record<string, ExerciseHistorySession>, curr) => {
        const sid = curr.session_id;
        if (!acc[sid]) {
          acc[sid] = {
            session_id: sid,
            completed_at: curr.workout_sessions?.completed_at || curr.performed_at,
            notes: curr.workout_sessions?.notes || '',
            sets: [],
          };
        }
        acc[sid].sets.push(curr);
        return acc;
      },
      {},
    );

    Object.values(grouped).forEach((session) => {
      session.sets.sort((a, b) => a.set_number - b.set_number);
    });

    return Object.values(grouped).sort(
      (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime(),
    );
  },

  updateSessionNotes: async (sessionId: string, notes: string) => {
    const { error } = await supabase.from('workout_sessions').update({ notes }).eq('id', sessionId);
    if (error) throw error;
  },

  getExerciseBaseInfo: async (exerciseId: string) => {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', exerciseId)
      .single();
    if (error) throw error;
    return data;
  },

  // -- OTTENERE LE SESSIONI COMPLETATE --
  getRecentSessions: async (profileId: string): Promise<RecentWorkoutSession[]> => {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*, workout_templates(name), performed_sets(*, exercises(name))')
      .eq('profile_id', profileId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return (data || []) as RecentWorkoutSession[];
  },
};
