import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// IL BACKEND ORA È RISERVATO SOLO AI FUTURI CALCOLI AI (Es. Pose Estimation)
// Tutto il CRUD normale (Login, Schede) è gestito dal Frontend direttamente su Supabase.

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), mode: 'AI-Ready' });
});

app.listen(port, () => {
  console.log(`AI Engine Server is running on port ${port}`);
});
