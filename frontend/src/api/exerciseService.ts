import { supabase } from './supabaseClient';
import { Exercise } from '../../../shared/types';

export const ExerciseService = {
  // Questa funzione recupera la lista degli esercizi. Se l'utente non è premium, filtra quelli "premium only".
  getExercises: async (isPremium: boolean = false) => {
    // Costruiamo la query in modo incrementale così il filtro premium resta opzionale e leggibile.
    let query = supabase.from('exercises').select('*').order('name', { ascending: true });

    // SE NON SEI PREMIUM: Ti faccio vedere SOLO gli esercizi con is_premium_only = false
    // (Oppure puoi limitare il numero di risultati con .limit(20) )
    if (!isPremium) {
      // Gli utenti free vedono solo il catalogo base, senza dover cambiare la logica della UI.
      query = query.eq('is_premium_only', false);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Exercise[];
  },
};
