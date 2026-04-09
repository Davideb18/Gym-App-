import { supabase } from './supabaseClient';
import { PerformedSet, Workout, WorkoutSession, WorkoutTemplate, WorkoutTemplateExercise, WorkoutTemplateSet } from '../../../shared/types';
import { DraftExercise, DraftSet } from '../hooks/useWorkoutCreation';

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

  // -- SALVARE UN WORKOUT TEMPLATE COMPLETO (ALL-IN-ONE) --
  saveCompleteWorkoutTemplate: async (
    profileId: string,
    name: string,
    description: string | undefined,
    exercises: DraftExercise[],
    isPremium: boolean = false
  ) => {
    // 1. Crea il Template Base
    const template = await WorkoutService.createTemplate(profileId, name, description, isPremium);

    try {
      // 2. Per ogni esercizio nel draft, salvalo con i suoi set
      for (let i = 0; i < exercises.length; i++) {
         const draftEx = exercises[i];
         
         // Mappiamo i DraftSet verso il formato atteso dal DB
         const setsToInsert = draftEx.sets.map((draftSet, index) => {
           const intensity_payload: Record<string, unknown> = {};
           if (draftSet.clusterMiniSets) intensity_payload.cluster_mini_sets = parseInt(draftSet.clusterMiniSets, 10);
           if (draftSet.clusterIntraRest) intensity_payload.cluster_intra_rest = parseInt(draftSet.clusterIntraRest, 10);
           if (draftSet.dropsetDrops) intensity_payload.dropset_drops = parseInt(draftSet.dropsetDrops, 10);
           if (draftSet.dropsetPercent) intensity_payload.dropset_percent = parseInt(draftSet.dropsetPercent, 10);

           const parsedReps = parseInt(draftSet.reps, 10);
         const parsedWeight = parseFloat(draftSet.intensity);
         const premiumTypes = ['warmup', 'failure', 'backoff', 'dropset', 'cluster', 'myo_reps', 'rest_pause'];

         return {
           target_reps_min: draftSet.reps && parsedReps > 0 ? parsedReps : null,
           target_reps_max: draftSet.reps && parsedReps > 0 ? parsedReps : null,
           target_weight: draftSet.intensity && !isNaN(parsedWeight) ? parsedWeight : null,
           rest_seconds: parseInt(draftSet.restSeconds, 10) || 90,
             set_type: draftSet.setType,
             set_number: index + 1,
             is_premium_feature: premiumTypes.includes(draftSet.setType),
             intensity_payload: Object.keys(intensity_payload).length > 0 ? intensity_payload : null
           };
         }) as Omit<WorkoutTemplateSet, 'id' | 'template_exercise_id' | 'created_at' | 'updated_at'>[];

         await WorkoutService.addExerciseToTemplate(
           template.id, 
           draftEx.exercise.id, 
           i + 1, // order
           setsToInsert,
           draftEx.notes
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

  // -- AGGIORNARE UN WORKOUT TEMPLATE COMPLETO --
  updateCompleteWorkoutTemplate: async (
    templateId: string,
    name: string,
    description: string | undefined,
    exercises: DraftExercise[]
  ) => {
    // 1. Aggiorna la testata
    const { error: updateError } = await supabase
      .from('workout_templates')
      .update({ name, description })
      .eq('id', templateId);
      
    if (updateError) throw updateError;

    // 2. Elimina tutti i vecchi esercizi (le foreign key dovrebbero avere ON DELETE CASCADE per eliminare i set figli)
    const { error: deleteError } = await supabase
      .from('workout_template_exercises')
      .delete()
      .eq('template_id', templateId);

    if (deleteError) throw deleteError;

    // 3. Reinserisce la nuova struttura
    for (let i = 0; i < exercises.length; i++) {
       const draftEx = exercises[i];
       
       const setsToInsert = draftEx.sets.map((draftSet, index) => {
         const intensity_payload: Record<string, unknown> = {};
         if (draftSet.clusterMiniSets) intensity_payload.cluster_mini_sets = parseInt(draftSet.clusterMiniSets, 10);
         if (draftSet.clusterIntraRest) intensity_payload.cluster_intra_rest = parseInt(draftSet.clusterIntraRest, 10);
         if (draftSet.dropsetDrops) intensity_payload.dropset_drops = parseInt(draftSet.dropsetDrops, 10);
         if (draftSet.dropsetPercent) intensity_payload.dropset_percent = parseInt(draftSet.dropsetPercent, 10);

         const parsedReps = parseInt(draftSet.reps, 10);
         const parsedWeight = parseFloat(draftSet.intensity);
         const premiumTypes = ['warmup', 'failure', 'backoff', 'dropset', 'cluster', 'myo_reps', 'rest_pause'];

         return {
           target_reps_min: draftSet.reps && parsedReps > 0 ? parsedReps : null,
           target_reps_max: draftSet.reps && parsedReps > 0 ? parsedReps : null,
           target_weight: draftSet.intensity && !isNaN(parsedWeight) ? parsedWeight : null,
           rest_seconds: parseInt(draftSet.restSeconds, 10) || 90,
           set_type: draftSet.setType,
           set_number: index + 1,
           is_premium_feature: premiumTypes.includes(draftSet.setType),
           intensity_payload: Object.keys(intensity_payload).length > 0 ? intensity_payload : null
         };
       }) as Omit<WorkoutTemplateSet, 'id' | 'template_exercise_id' | 'created_at' | 'updated_at'>[];

       await WorkoutService.addExerciseToTemplate(
         templateId, 
         draftEx.exercise.id, 
         i + 1, 
         setsToInsert,
         draftEx.notes
       );
    }
  },

  // -- ELIMINARE UN WORKOUT TEMPLATE --
  deleteTemplate: async (templateId: string, profileId: string) => {
    const { error } = await supabase
      .from('workout_templates')
      .delete()
      .eq('id', templateId)
      .eq('profile_id', profileId);
    
    if (error) throw error;
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
  },

  // -- SALVARE UN'INTERA SESSIONE LIVE COMPLETATA --
  saveCompletedSession: async (
    profileId: string,
    templateId: string | undefined,
    startTime: number,
    totalVolume: number,
    exercises: any[]
  ) => {
    // 1. Create the session
    const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
    const { data: sessionData, error: sessionError } = await supabase
      .from('workout_sessions')
      .insert([{
        profile_id: profileId,
        template_id: templateId || null,
        status: 'completed',
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString(),
        duration_seconds: durationSeconds,
        total_volume: totalVolume
      }])
      .select()
      .single();

    if (sessionError) throw sessionError;
    if (!sessionData) throw new Error("Errore durante la creazione della sessione");

    // 2. Prepare the performed_sets payload
    const setsToInsert: any[] = [];
    
    exercises.forEach(ex => {
      ex.sets.forEach((set: any) => {
         // Salviamo solo le serie segnate come completate
        if (set.is_completed) {
          setsToInsert.push({
            session_id: sessionData.id,
            exercise_id: ex.exercise_id,
            template_set_id: set.template_set_id || null,
            set_number: set.set_number,
            set_type: set.set_type,
            reps: set.real_reps || null,
            weight: set.real_weight || null,
            is_completed: true,
            performed_at: new Date().toISOString(),
          });
        }
      });
    });

    if (setsToInsert.length > 0) {
      const { error: setsError } = await supabase
        .from('performed_sets')
        .insert(setsToInsert);
      
      if (setsError) {
        // Rollback
        await supabase.from('workout_sessions').delete().eq('id', sessionData.id);
        throw setsError;
      }
    }

    return sessionData as WorkoutSession;
  },

  // -- OTTENERE LO STORICO DI UN ESERCIZIO IN LINEA --
  getExerciseHistory: async (exerciseId: string) => {
    // Cerchiamo i set completati per questo esercizio
    const { data, error } = await supabase
      .from('performed_sets')
      .select('*, workout_sessions(completed_at, notes)')
      .eq('exercise_id', exerciseId)
      .eq('is_completed', true)
      .order('performed_at', { ascending: false })
      .limit(35);

    if (error) throw error;
    
    if (!data || data.length === 0) return [];

    // Raggruppa per session_id
    const grouped = data.reduce((acc: Record<string, any>, curr: any) => {
        const sid = curr.session_id;
        if(!acc[sid]) {
            acc[sid] = {
               session_id: sid,
               completed_at: curr.workout_sessions?.completed_at || curr.performed_at,
               notes: curr.workout_sessions?.notes || '',
               sets: []
            };
        }
        // Li ordiniamo temporalmente
        acc[sid].sets.push(curr);
        return acc;
    }, {});

    // Per ogni sessione riordiniamo i set in base al set_number
    Object.values(grouped).forEach((session: any) => {
       session.sets.sort((a: any, b: any) => a.set_number - b.set_number);
    });

    return Object.values(grouped).sort((a: any, b: any) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
  },

  // -- UPDATE NOTE DELLA SESSIONE --
  updateSessionNotes: async (sessionId: string, notes: string) => {
    const { error } = await supabase
      .from('workout_sessions')
      .update({ notes })
      .eq('id', sessionId);
    if (error) throw error;
  },

  // -- PRENDERE I DATI BASE DELL'ESERCIZIO --
  getExerciseBaseInfo: async (exerciseId: string) => {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', exerciseId)
      .single();
    if (error) throw error;
    return data;
  }
};