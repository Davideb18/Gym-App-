import type { Response } from 'express';
import prisma from '../services/prisma.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';

export const syncProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.userId; // Questo è il 'sub' che abbiamo estratto nel middleware!
  const { email, name } = req.body;

  if (!userId || !email) {
    return res.status(400).json({ error: 'Dati obbligatori mancanti' });
  }

  try {
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        name,
      },
      create: {
        id: userId,
        email,
        name,
      },
    });

    res.status(200).json(user);
  } catch (error) {
    console.error('Errore sincronizzazione: ', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
};
