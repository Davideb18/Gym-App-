import type { Request, Response } from 'express';
import prisma from '../services/prisma.js';

export const createExercise = async (req: Request, res: Response) => {
  const { name, muscleGroup, equipment, description } = req.body;

  try {
    const newExercise = await prisma.exercise.create({
      data: {
        name,
        muscleGroup,
        equipment,
        description,
      },
    });
    res.status(201).json(newExercise);
  } catch (error) {
    res.status(400).json({ error: 'Errore durante la creazione dell\'esercizio' });
  }
};

export const getAllExercises = async (_req: Request, res: Response) => {
  try {
    const exercises = await prisma.exercise.findMany();
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ error: 'Errore durante il recupero degli esercizi' });
  }
};
