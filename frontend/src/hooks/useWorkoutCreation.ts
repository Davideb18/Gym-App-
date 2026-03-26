
import { useMemo, useState } from 'react';
import { Exercise, SetType } from '../../../shared/types';

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

// hook che gestisce lo stato della creazione della scheda
export function useWorkoutCreation() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<DraftExercise[]>([]);

  // aggiunge un esercizio alla scheda, se non è già presente
  const addExercise = (exercise: Exercise) => {
    setExercises((prev) => {
      // se l'esercizio è già presente, non aggiungerlo di nuovo
      if (prev.some((x) => x.exercise.id === exercise.id)) return prev;

      // altrimenti, aggiungilo con un set vuoto
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

  // rimuove un esercizio dalla scheda in base al suo id locale
  // prev é lo stato precedente degli esercizi, ossia l'array di esercizi prima della rimozione
  const removeExercise = (localExerciseId: string) => {
    // prev.filtrer((e) => e.localId !== localExerciseId) crea un nuovo array che contiene 
    // solo gli esercizi il cui id locale è diverso da localExerciseId, ovvero rimuove l'esercizio con l'id specificato
    setExercises((prev) => prev.filter((e) => e.localId !== localExerciseId));
  };

  // aggiunge un set a un esercizio specifico in base al suo id locale
  const addSet = (localExerciseId: string) => {
    setExercises((prev) =>
      prev.map((e) =>
        // se l'esercizio ha l'id locale corrispondente, aggiungi un set vuoto alla sua lista di set
        e.localId === localExerciseId
          ? { ...e, sets: [...e.sets, buildEmptySet()] }
          : e
      )
    );
  };

  // rimuove un set da un esercizio specifico in base ai suoi id locali
  const removeSet = (localExerciseId: string, localSetId: string) => {
    setExercises((prev) =>
      prev.map((e) => {
        // se l'esercizio non ha l'id locale corrispondente, restituiscilo senza modifiche
        if (e.localId !== localExerciseId) return e;

        // altrimenti, filtra i set dell'esercizio per rimuovere quello con l'id locale specificato
        const filtered = e.sets.filter((s) => s.localId !== localSetId);

        // se dopo la rimozione non ci sono più set, aggiungi un set vuoto per garantire che 
        // l'esercizio abbia sempre almeno un set
        return {
          ...e,
          sets: filtered.length > 0 ? filtered : [buildEmptySet()],
        };
      })
    );
  };

  // aggiorna un campo di un set specifico in un esercizio specifico in base ai loro id locali
  const updateExerciseNotes = (localExerciseId: string, notes: string) => {
    setExercises((prev) =>
      prev.map((e) => (e.localId === localExerciseId ? { ...e, notes } : e))
    );
  };

  // aggiorna un campo di un set specifico in un esercizio specifico in base ai loro id locali
  const updateSetField = (
    localExerciseId: string,
    localSetId: string,
    // field è il nome del campo da aggiornare (ad esempio 'reps' o 'intensity')
    // keyof DraftSet è un tipo che rappresenta le chiavi dell'interfaccia DraftSet, 
    // quindi field può essere solo una di quelle chiavi che sarebbero 'localId', 'setType', 'reps', 
    // 'intensity', 'restSeconds', 'clusterMiniSets', 'clusterIntraRest', 'dropsetDrops' o 'dropsetPercent'
    field: keyof DraftSet,
    value: string
  ) => {
    setExercises((prev) =>
      prev.map((e) => {
        if (e.localId !== localExerciseId) return e;

        return {
          ...e,
          sets: e.sets.map((s) =>
            s.localId === localSetId ? { ...s, [field]: value } : s
          ),
        };
      })
    );
  };

  // valida i dati della scheda prima di salvarla, restituendo un messaggio di errore 
  // se qualcosa non va o null se tutto è ok
  const validate = () => {
    // se il nome della scheda è vuoto o contiene solo spazi, restituisci un messaggio di errore
    if (!name.trim()) return 'Inserisci il nome della scheda';
    // se non ci sono esercizi nella scheda, restituisci un messaggio di errore
    if (exercises.length === 0) return 'Aggiungi almeno un esercizio';

    // per ogni esercizio, controlla se ha almeno un set 
    // Ora permettiamo che i campi reps e intensity siano vuoti!
    for (const ex of exercises) {
      if (ex.sets.length === 0) {
        return `Aggiungi almeno un set per ${ex.exercise.name}`;
      }
    }

    return null;
  };

  // verifica se ci sono set di tipo diverso da 'normal' per mostrare un avviso agli utenti non premium
  const hasPremiumSetTypes = useMemo(
    () => exercises.some((e) => e.sets.some((s) => s.setType !== 'normal')),
    [exercises]
  );

  // resetta tutti i campi della scheda ai valori di default
  const reset = () => {
    setName('');
    setDescription('');
    setExercises([]);
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
    addSet,
    removeSet,
    updateSetField,
    updateExerciseNotes,
    validate,
    hasPremiumSetTypes,
    reset,
  };
}