import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { Exercise } from '../../shared/types.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rotta per creare un nuovo esercizio
app.post('/exercises', async (req, res) => {
  const { name, muscleGroup, equipment, description } = req.body as Exercise;

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
});

// Rotta per ottenere tutti gli esercizi
app.get('/exercises', async (req, res) => {
  const exercises = await prisma.exercise.findMany();
  res.json(exercises);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
