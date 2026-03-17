import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Importiamo le rotte degli esercizi (già presente)
import exerciseRoutes from './routes/exerciseRoutes.js';
// ---- NUOVI IMPORT
import authRoutes from './routes/authRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ---- REGISTRAZIONE DELLE ROTTE
// Diciamo a Express: "Tutte le richieste che iniziano con /auth mandale ad authRoutes"
app.use('/auth', authRoutes);
// Le richieste per gli esercizi
app.use('/exercises', exerciseRoutes);
// Tutte le richieste che iniziano con /workouts mandale a workoutRoutes
app.use('/workouts', workoutRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
