import { supabase } from './supabaseClient';
import { WorkoutTemplate, WorkoutTemplateExercise, PlannedSet } from '../../../shared/types';

export const WorkoutService = {
  
  // -- OTTENERE LE SCHEDE --
  getTemplates: async (profileId: string) => {
    const { data, error } = await supabase
      .from('workout_templates')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as WorkoutTemplate[];
  },

  // -- CREARE UNA SCHEDA CON LIMITI FREE (MAX 4) --
  createTemplate: async (profileId: string, name: string, description?: string, isPremium: boolean = false) => {
    // LOGICA DI BUSINESS: se è free, contiamo quante schede ha già creato
    if (!isPremium) {
      const { count, error: countError } = await supabase
        .from('workout_templates')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profileId);
        
      if (countError) throw countError;
      if (count !== null && count >= 4) {
        throw new Error("Limite Schede Raggiunto (4/4). Passa al piano Premium per creare schede infinite!");
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

  // -- AGGIUNGERE UN ESERCIZIO CON DROPSET / CLUSTER (Salvato nel JSON) --
  addExerciseToTemplate: async (
    templateId: string, 
    exerciseId: string, 
    order: number,
    plannedSets: PlannedSet[], // Qui arriverà il JSON da Typescript con tutte le tue tecniche!
    notes?: string
  ) => {
    const { data, error } = await supabase
      .from('workout_template_exercises')
      .insert([
        {
          template_id: templateId,
          exercise_id: exerciseId,
          exercise_order: order,
          planned_sets: plannedSets, // Magia: viene salvato come array JSON in Postgres
          notes: notes
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data as WorkoutTemplateExercise;
  }
};