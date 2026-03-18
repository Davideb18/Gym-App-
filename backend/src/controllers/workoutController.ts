// Importiamo il tipo Response per gestire le risposte da inviare all'app
import type { Response } from 'express';
// Importiamo l'istanza di Prisma per comunicare con il database PostgreSQL
import prisma from '../services/prisma.js';
// Importiamo il tipo AuthRequest che include l'userId salvato dal middleware
import type { AuthRequest } from '../middlewares/authMiddleware.js';

// ---- FUNZIONE PER CREARE UN ALLENAMENTO
const createWorkout = async (req: AuthRequest, res: Response) => {
  // Estraiamo i dati dal corpo della richiesta
  const { name, notes, sets } = req.body;
  const userId = req.userId;

  // Controllo di sicurezza: se l'utente non è autenticato, ci fermiamo
  if (!userId) {
    return res.status(401).json({ error: 'Utente non autenticato' });
  }

  try {
    // Creazione del workout con inserimento nidificato dei set
    const workout = await prisma.workout.create({
      data: {
        name,
        notes,
        userId: userId as string, // Forziamo il tipo a stringa per Prisma
        sets: {
          create: sets.map((set: any) => ({
            reps: parseInt(set.reps),
            weight: parseFloat(set.weight),
            rpe: set.rpe ? parseInt(set.rpe) : null,
            rir: set.rir ? parseInt(set.rir) : null,
            type: set.type || 'NORMAL',
            weightUnit: set.weightUnit || 'kg',
            isPremium: set.isPremium || false,
            exerciseId: set.exerciseId,
          })),
        },
      },
      include: {
        sets: true,
      },
    });

    res.status(201).json(workout);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Errore durante la creazione dell\'allenamento' });
  }
};

// --- FUNZIONE PER RECUPERARE TUTTI GLI ALLENAMENTI
const getWorkouts = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Utente non autenticato' });
  }

  try {
    const workouts = await prisma.workout.findMany({
      where: { userId: userId as string },
      include: {
        sets: {
          include: {
            exercise: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    res.json(workouts);
  } catch (error) {
    res.status(500).json({ error: 'Errore durante il recupero' });
  }
};

// --- FUNZIONE PER RECUPERARE UN SINGOLO ALLENAMENTO
const getWorkoutById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const workout = await prisma.workout.findFirst({
      where: { 
        id: id as string, 
        userId: userId as string 
      },
      include: {
        sets: {
          include: {
            exercise: true,
          },
        },
      },
    });

    if (!workout) {
      return res.status(404).json({ error: 'Allenamento non trovato' });
    }

    res.json(workout);
  } catch (error) {
    res.status(500).json({ error: 'Errore durante il recupero dell\'allenamento' });
  }
};

// --- FUNZIONE PER CANCELLARE UN ALLENAMENTO
const deleteWorkout = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;

  if (!userId || !id) {
    return res.status(400).json({ error: 'ID mancante o utente non valido' });
  }

  try {
    // 1. Cancelliamo prima le serie associate (per vincoli del database)
    await prisma.set.deleteMany({
      where: { workoutId: id as string },
    });

    // 2. Cancelliamo il workout solo se appartiene all'utente loggato
    await prisma.workout.delete({
      where: { 
        id: id as string, 
        userId: userId as string 
      },
    });

    res.json({ message: 'Allenamento eliminato con successo' });
  } catch (error) {
    res.status(500).json({ error: 'Errore durante l\'eliminazione' });
  }
};

// ---- FUNZIONE PER CREARE UNA SCHEDA (TEMPLATE)
const createTemplate = async (req: AuthRequest, res: Response) => {
  const { name, notes, exercises } = req.body;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Utente non autenticato' });
  }

  try {
    // Usiamo Prisma per creare tutto in un colpo solo (Nested Create)
    const template = await prisma.workoutTemplate.create({
      data: {
        name,
        notes,
        userId: userId as string,
        // Creiamo gli esercizi legati a questa scheda
        exercises: {
          create: exercises.map((ex: any, exIndex: number) => ({
            exerciseId: ex.exerciseId,
            order: exIndex, // Salviamo l'ordine dell'esercizio
            // E per ogni esercizio, creiamo le serie predefinite
            sets: {
              create: ex.sets.map((set: any, setIndex: number) => ({
                reps: set.reps ? parseInt(set.reps) : null,
                weight: set.weight ? parseFloat(set.weight) : null,
                rpe: set.rpe ? parseInt(set.rpe) : null,
                type: set.type || 'NORMAL',
                order: setIndex, // Salviamo l'ordine della serie
              })),
            },
          })),
        },
      },
      include: {
        exercises: {
          include: {
            sets: true,
          },
        },
      },
    });

    res.status(201).json(template);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Errore durante la creazione della scheda' });
  }
};

// --- FUNZIONE PER RECUPERARE TUTTE LE SCHEDE
const getTemplates = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Utente non autenticato' });
  }

  try {
    const templates = await prisma.workoutTemplate.findMany({
      where: { userId: userId as string },
      include: {
        exercises: {
          include: {
            exercise: true, // Prende nome e muscolo dell'esercizio
            sets: true,     // Prende le serie predefinite
          },
        },
      },
    });

    res.json(templates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante il recupero delle schede' });
  }
};



export { createWorkout, getWorkouts, getWorkoutById, deleteWorkout, createTemplate, getTemplates };
