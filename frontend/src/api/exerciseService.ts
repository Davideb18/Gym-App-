import { supabase } from './supabaseClient';
import { Exercise } from '../../../shared/types';

export const ExerciseService = {
  
  // Questa funzione recupera la lista degli esercizi. Se l'utente non è premium, filtra quelli "premium only".
  getExercises: async (isPremium: boolean = false) => {
    let query = supabase
      .from('exercises')
      .select('*')
      .order('name', { ascending: true });

    // SE NON SEI PREMIUM: Ti faccio vedere SOLO gli esercizi con is_premium_only = false
    // (Oppure puoi limitare il numero di risultati con .limit(20) )
    if (!isPremium) {
      query = query.eq('is_premium_only', false);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Exercise[];
  },

  // Esempio di funzione che useremo poi per MuscleWiki (chiamerà il server/db)
  syncFromMuscleWiki: async () => {
    // In futuro qui chiamerai RapidAPI o il tuo backend Edge Function
    // per scaricare un esercizio mancante e salvarlo su Supabase
    console.log("Sincronizzazione da MuscleWiki in arrivo...");
  }
};