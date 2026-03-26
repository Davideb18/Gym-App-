import { supabase } from './supabaseClient';
import { PerformedSet, Workout, WorkoutSession, WorkoutTemplate, WorkoutTemplateExercise, WorkoutTemplateSet } from '../../../shared/types';

export const WorkoutService = {
  
  // -- OTTENERE LE SCHEDE --
  getTemplates: async (profileId: string): Promise<WorkoutTemplate[]> => {
    const { data, error } = await supabase
      .from('workout_templates')
      // Con questa chiamata stiamo dicendo: "Voglio tutte le schede di questo utente (profileId),
      // e per ogni scheda voglio anche gli esercizi collegati (workout_template_exercises) 
      // e per ogni esercizio voglio anche le serie collegate (workout_template_sets) 
      // e i dettagli dell'esercizio (exercises)".
      .select('*, workout_template_exercises(*, workout_template_sets(*), exercises(*))') 
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as unknown as WorkoutTemplate[];
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
    // La dicitura "Omit" vuol dire: 
    // "Usa il tipo WorkoutTemplateSet, ma tralascia (nascondi) i campi 'id', 'created_at' etc, 
    // perché questi li creerà Supabase da solo dopo."
    sets: Omit<WorkoutTemplateSet, 'id' | 'template_exercise_id' | 'created_at' | 'updated_at'>[],
    notes?: string
  ) => {

    // Qui diciamo: Supabase, inseriscimi l'esercizio. 
    // Siccome in basso faremo ANCHE la chiamata per salvare i Set del figlio, ho 
    // rinominato la variabile `data` in `exerciseData`, per non confonderla con il
    // `data` che useremo dopo per i set! Lo stesso vale per `error` che per me
    // diventa `exerciseError`.
    const { data: exerciseData, error: exerciseError } = await supabase
      .from('workout_template_exercises')
      .insert([
        {
          template_id: templateId,
          exercise_id: exerciseId,
          exercise_order: order,
          notes: notes
        }
      ])
      .select()
      .single(); 
      // single() ci assicura che restituisce UN oggetto (exerciseData), non un array [exerciseData].

    // Se il cassetto ha un errore, butto via la scatola e fermo tutto il programma.
    if (exerciseError) throw exerciseError;
    if (!exerciseData) throw new Error("Errore strano: non ho ricevuto l'esercizio");
    
    // Controllo se dalla UI l'utente mi ha passato almeno 1 serie (o se ha lasciato vuoto).
    if (sets && sets.length > 0) {
      
      // Qui prendo l'array che mi ha passato l'utente. Faccio una "fotocopia" di ogni singolo
      // serie iterando (`.map`). Copio tutti i valori scelti (peso, reps: `...set`) e AGGIUNGO 
      // forzatamente l'ID di collegamento per il db (template_exercise_id)
      const setsToInsert = sets.map((set, index) => ({
        ...set,
        template_exercise_id: exerciseData.id,
        // Mi assicuro anche di forzare l'ordine in cui si trovano, per sicurezza
        set_number: index + 1 
      }));

      const { error: setsError } = await supabase
        .from('workout_template_sets')
        .insert(setsToInsert);
      if (setsError) throw setsError;
    }
    return exerciseData as WorkoutTemplateExercise;
  },

  // -- INIZIARE UNA SESSIONE (clonando la scheda in una sessione attiva) --
  startSession: async (profileId: string, TemplateId?: string) => {
    const {data, error} = await supabase
      .from('workout_sessions')
      .insert([
        { 
          profile_id: profileId, 
          template_id: TemplateId 
        }
      ])
      .select()
      .single();

      if( error ) throw error;
      return data as WorkoutSession;
  },

  // -- LOGGARE UNA SERIE E COLLEGARLA ALL'ESERCIZIO E ALLA SCHEDA --
  logPerformedSet: async (
    sessionId: string,
    exerciseId: string,
    setPayload: Omit<PerformedSet, 'id' | 'session_id' | 'exercise_id' | 'performed_at' | 'created_at'>,
  ) => {
    const { data, error } = await supabase
      .from('performed_sets')
      .upsert([
        {
          session_id: sessionId,
          exercise_id: exerciseId,
          ...setPayload
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data as PerformedSet;
  },

  // -- FINIRE LA SESSIONE (calcolando durata, volume totale, etc) --
  finishSession: async (sessionId: string, durationSeconds: number, totalVolume: number, notes?: string) => {
    const { data, error } = await supabase
      .from('workout_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        duration_seconds: durationSeconds,
        total_volume: totalVolume,
        notes: notes
      })
      .eq('id', sessionId) // Assicuriamoci di aggiornare la sessione giusta
      .select()
      .single();

    if (error) throw error;
    return data as WorkoutSession;
  }
};